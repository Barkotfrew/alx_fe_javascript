let quotes = [];
let categoryFilter = "";

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

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

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
  populateCategories();

  textInput.value = "";
  categoryInput.value = "";
}

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
      alert('Quotes imported successfully!');
    } catch {
      alert('Error reading JSON file.');
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

window.onload = function() {
  loadQuotes();
  populateCategories();
  createAddQuoteForm();

  document.getElementById("newQuote").addEventListener("click", filterQuote);
  document.getElementById("exportJson").addEventListener("click", exportToJsonFile);

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
};

