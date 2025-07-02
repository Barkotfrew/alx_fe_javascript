let quotes = [];

// Load quotes from localStorage or use default quotes
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
      { text: "Be yourself; everyone else is already taken.", category: "Life" },
      { text: "The purpose of our lives is to be happy.", category: "Motivation" }
    ];
  }
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Save last viewed quote to sessionStorage
function saveLastViewedQuote(quote) {
  sessionStorage.setItem('lastQuote', JSON.stringify(quote));
}

// Load last viewed quote from sessionStorage and display it
function loadLastViewedQuote() {
  const lastQuoteStr = sessionStorage.getItem('lastQuote');
  if (lastQuoteStr) {
    try {
      const lastQuote = JSON.parse(lastQuoteStr);
      if (lastQuote && lastQuote.text) {
        document.getElementById("quoteDisplay").textContent = lastQuote.text;
        return true;
      }
    } catch {}
  }
  return false;
}

// Update category dropdown options dynamically
function updateCategoryOptions() {
  const select = document.getElementById("categorySelect");
  const categories = [...new Set(quotes.map(q => q.category))];
  select.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
}

// Display a random quote from selected category
function showRandomQuote() {
  const selectedCategory = document.getElementById("categorySelect").value;
  const filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  if (filteredQuotes.length === 0) {
    document.getElementById("quoteDisplay").textContent = "No quotes found for this category.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  document.getElementById("quoteDisplay").textContent = quote.text;

  // Save last viewed quote in sessionStorage
  saveLastViewedQuote(quote);
}

// Add new quote from form inputs
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  updateCategoryOptions();

  textInput.value = "";
  categoryInput.value = "";
}

// Dynamically create the add-quote form
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

// Export quotes to JSON file
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

// Import quotes from JSON file uploaded by user
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
      updateCategoryOptions();
      alert('Quotes imported successfully!');
    } catch {
      alert('Error reading JSON file.');
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Initialize app on page load
window.onload = function() {
  loadQuotes();
  updateCategoryOptions();
  createAddQuoteForm();

  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  document.getElementById("exportJson").addEventListener("click", exportToJsonFile);

  if (!loadLastViewedQuote()) {
    showRandomQuote();
  }
};
