let quotes = [
  { text: "Be yourself; everyone else is already taken.", category: "Life" },
  { text: "The purpose of our lives is to be happy.", category: "Motivation" }
];

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

  textInput.value = "";
  categoryInput.value = "";
}

document.getElementById("newQuote").addEventListener("click", showRandomQuote);
window.onload = updateCategoryOptions;
