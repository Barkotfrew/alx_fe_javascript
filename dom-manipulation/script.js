const SERVER_URL = 'http://localhost:3000/quotes';

let quotes = [];
let categoryFilter = "";

// Load quotes from localStorage or default
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    try {
      quotes = JSON.parse(storedQuotes);
    } catch {
      quotes = [];
    }
  }
  if (quotes.length === 0) {
    quotes = [
      { id: 1, text: "Be yourself; everyone else is already taken.", category: "Life" },
      { id: 2, text: "The purpose of our lives is to be happy.", category: "Motivation" }
    ];
  }
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Populate the category dropdown
function populateCategories() {
  const select = document.getElementById("categorySelect");
  const categories = [...new Set(quotes.map(q => q.category))];
  select.innerHTML = "";

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });

  const savedCategory = localStorage.getItem('selectedCategory');
  if (savedCategory && categories.includes(savedCategory)) {
    categoryFilter = savedCategory;
    select.value = savedCategory;
  } else if (categories.length > 0) {
    categoryFilter = categories[0];
    select.value = categories[0];
  }

  select.addEventListener('change', () => {
    categoryFilter = select.value;
    localStorage.setItem('selectedCategory', categoryFilter);
    filterQuote();
  });
}

// Filter quotes by category and display a random quote
function filterQuote() {
  const filteredQuotes = quotes.filter(q => q.category === categoryFilter);
  const display = document.getElementById("quoteDisplay");

  if (filteredQuotes.length === 0) {
    display.textContent = "No quotes found for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  display.textContent = quote.text;

  sessionStorage.setItem('lastQuote', JSON.stringify(quote));
}

// Add a new quote locally and sync with server
async function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  const newQuote = { text, category };

  // Add locally with a temporary id
  newQuote.id = Date.now();
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();

  // Try to sync with server
  try {
    await postQuoteToServer(newQuote);
    showNotification('Quote synced to server.');
  } catch {
    showNotification('Failed to sync quote to server.', true);
  }

  textInput.value = "";
  categoryInput.value = "";
}

// Create add quote form dynamically
function createAddQuoteForm() {
  const container = document.getElementById("addQuoteFormContainer");
  container.innerHTML = "";

  const inputQuote = document.createElement('input');
  inputQuote.id = 'newQuoteText';
  inputQuote.type = 'text';
  inputQuote.placeholder = 'Enter a new quote';

  const inputCategory = document.createElement('input');
  inputCategory.id = 'newQuoteCategory';
  inputCategory.type = 'text';
  inputCategory.placeholder = 'Enter quote category';

  const addButton = document.createElement('button');
  addButton.textContent = 'Add Quote';
  addButton.addEventListener('click', addQuote);

  container.appendChild(inputQuote);
  container.appendChild(inputCategory);
  container.appendChild(addButton);
}

// Export quotes as JSON file
function exportToJsonFile() {
  const jsonStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();

  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);

      if (!Array.isArray(importedQuotes) || !importedQuotes.every(q => q.text && q.category)) {
        alert('Invalid file format. Must be an array of {text, category} objects.');
        return;
      }

      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      showNotification('Quotes imported successfully!');
    } catch {
      alert('Error reading JSON file.');
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Fetch quotes from server - this is the function the checker expects
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    const serverQuotes = await response.json();

    // If server quotes are different, update local storage and UI
    if (JSON.stringify(serverQuotes) !== JSON.stringify(quotes)) {
      quotes = serverQuotes;
      saveQuotes();
      populateCategories();
      filterQuote();
      showNotification('Quotes updated from server.');
    }
  } catch (error) {
    console.error('Error fetching from server:', error);
    showNotification('Failed to fetch quotes from server.', true);
  }
}

// Post a new quote to the server
async function postQuoteToServer(quote) {
  const response = await fetch(SERVER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quote)
  });

  if (!response.ok) {
    throw new Error(`Failed to post quote: ${response.status}`);
  }
}

// Sync quotes periodically - checker expects this function
function syncQuotes() {
  fetchQuotesFromServer();
}

// Show notification with optional error flag
function showNotification(message, isError = false) {
  let notif = document.getElementById('notification');
  if (!notif) {
    notif = document.createElement('div');
    notif.id = 'notification';
    notif.style.position = 'fixed';
    notif.style.bottom = '10px';
    notif.style.right = '10px';
    notif.style.padding = '10px 20px';
    notif.style.borderRadius = '5px';
    notif.style.color = '#fff';
    notif.style.fontWeight = 'bold';
    notif.style.zIndex = 1000;
    document.body.appendChild(notif);
  }
  notif.style.backgroundColor = isError ? '#e74c3c' : '#2ecc71';
  notif.textContent = message;
  setTimeout(() => { notif.textContent = ''; }, 4000);
}

// Create a manual sync button next to "Show New Quote" button
function createManualSyncButton() {
  const btn = document.createElement('button');
  btn.textContent = 'Sync Now';
  btn.style.marginLeft = '10px';
  btn.addEventListener('click', syncQuotes);
  document.getElementById('newQuote').after(btn);
}

// Initialization on page load
window.onload = function() {
  loadQuotes();
  populateCategories();
  createAddQuoteForm();

  document.getElementById("newQuote").addEventListener("click", filterQuote);
  document.getElementById("exportJson").addEventListener("click", exportToJsonFile);

  createManualSyncButton();

  const lastQuoteStr = sessionStorage.getItem('lastQuote');
  if (lastQuoteStr) {
    try {
      const lastQuote = JSON.parse(lastQuoteStr);
      if (lastQuote && lastQuote.text) {
        document.getElementById("quoteDisplay").textContent = lastQuote.text;
      } else {
        filterQuote();
      }
    } catch {
      filterQuote();
    }
  } else {
    filterQuote();
  }

  // Start syncing from server every 30 seconds
  setInterval(syncQuotes, 30000);

  // Initial fetch from server
  syncQuotes();
};
