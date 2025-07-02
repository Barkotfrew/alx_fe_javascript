// Quotes array with text and category
let quotes = [
  { text: "Be yourself; everyone else is already taken.", category: "Life" },
  { text: "The purpose of our lives is to be happy.", category: "Motivation" }
];

// Update category dropdown
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

// Show a random quote based on selected category and update DOM
function showRandomQuote() {
  const selectedCategory = document.getElementById("categorySelect").value;
  const filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  if (filteredQuotes.length === 0) {
    document.getElementById("quoteDisplay").textContent = "No quotes found for this category.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  document.getElementById("quoteDisplay").textContent = filteredQuotes[randomIndex].text;
}

// Add a new quote to quotes array and update the dropdown DOM
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
  updateCategoryOptions();

  // Clear inputs after adding
  textInput.value = "";
  categoryInput.value = "";
}

// Attach event listener on "Show New Quote" button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Initialize categories on window load
window.onload = updateCategoryOptions;
