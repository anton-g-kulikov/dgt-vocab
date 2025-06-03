// Current Vocabulary Manager - Handles the current vocabulary filtering and display
class CurrentVocabularyManager {
  constructor(vocabApp, showMessage) {
    this.vocabApp = vocabApp;
    this.showMessage = showMessage;

    // Wait a bit to ensure DOM is ready
    setTimeout(() => {
      this.setupEventListeners();
      this.populateVocabTable();
    }, 50);
  }

  setupEventListeners() {
    // Listen for current vocabulary changes
    document.addEventListener("currentVocabularyChanged", () => {
      this.populateVocabTable();
    });

    // Set up vocabulary filtering
    this.setupVocabFiltering();
  }

  setupVocabFiltering() {
    // Populate category filter dropdown for vocabulary
    this.populateCategoryVocabFilter();

    // Add event listeners for filter inputs
    const wordFilter = document.getElementById("wordFilter");
    const translationFilter = document.getElementById("translationFilter");
    const categoryFilter = document.getElementById("categoryVocabFilter");
    const clearFiltersBtn = document.getElementById("clearFilters");

    // Set up a debounce function for text inputs
    let filterTimeout;
    const debounceFilter = () => {
      clearTimeout(filterTimeout);
      filterTimeout = setTimeout(() => this.applyVocabFilters(), 300);
    };

    // Apply filters on input/change with debounce for text inputs
    if (wordFilter) {
      wordFilter.addEventListener("input", debounceFilter);
    }

    if (translationFilter) {
      translationFilter.addEventListener("input", debounceFilter);
    }

    // Apply filter immediately for category select (no need for debounce)
    if (categoryFilter) {
      categoryFilter.addEventListener("change", () => this.applyVocabFilters());
    }

    // Clear filters button
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener("click", () => {
        if (wordFilter) wordFilter.value = "";
        if (translationFilter) translationFilter.value = "";
        if (categoryFilter) categoryFilter.value = "";
        this.applyVocabFilters();
      });
    }
  }

  applyVocabFilters() {
    const wordFilter = document
      .getElementById("wordFilter")
      .value.trim()
      .toLowerCase();
    const translationFilter = document
      .getElementById("translationFilter")
      .value.trim()
      .toLowerCase();
    const categoryFilter = document
      .getElementById("categoryVocabFilter")
      .value.toLowerCase();

    // Create filter options object
    const filterOptions = {};
    if (wordFilter) filterOptions.word = wordFilter;
    if (translationFilter) filterOptions.translation = translationFilter;
    if (categoryFilter) filterOptions.category = categoryFilter;

    // Apply filters to the table
    this.populateVocabTable(filterOptions);
  }

  populateCategoryVocabFilter() {
    const categoryFilter = document.getElementById("categoryVocabFilter");
    if (!categoryFilter) return;

    categoryFilter.innerHTML = ""; // Clear existing options

    // Add default "All Categories" option
    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = "All Categories";
    categoryFilter.appendChild(allOption);

    // Add all categories from vocabulary
    const categories = this.vocabApp.getUniqueCategories();

    // Ensure we have the categories
    if (categories && categories.length > 0) {
      categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent =
          category.charAt(0).toUpperCase() + category.slice(1); // Capitalize first letter
        categoryFilter.appendChild(option);
      });
    }
  }

  populateVocabTable(filterOptions = {}) {
    const tableBody = document.getElementById("vocabTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    // Apply filters if provided
    let filteredCards = [...this.vocabApp.allCards];

    if (filterOptions.word) {
      const wordFilter = filterOptions.word.toLowerCase();
      filteredCards = filteredCards.filter((card) =>
        card.word.toLowerCase().includes(wordFilter)
      );
    }

    if (filterOptions.translation) {
      const translationFilter = filterOptions.translation.toLowerCase();
      filteredCards = filteredCards.filter((card) =>
        (card.translation || "").toLowerCase().includes(translationFilter)
      );
    }

    if (filterOptions.category) {
      filteredCards = filteredCards.filter(
        (card) =>
          (card.category || "").toLowerCase() ===
          filterOptions.category.toLowerCase()
      );
    }

    // Show a message when no cards match the filter
    if (filteredCards.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="5" class="empty-table-message">No words match your filters.</td></tr>';
    } else {
      // Update the table with the filtered cards
      filteredCards.forEach((card) => {
        const row = document.createElement("tr");
        row.dataset.id = card.id;

        row.innerHTML = `
          <td>${card.word}</td>
          <td>${card.translation || ""}</td>
          <td>${card.perevod || ""}</td>
          <td>${card.category || ""}</td>
          <td class="example">${card.example || ""}</td>
        `;

        tableBody.appendChild(row);
      });
    }

    // Update a counter to show number of matches
    const resultCount = filteredCards.length;
    const totalCount = this.vocabApp.allCards.length;

    // Find or create the result count element
    let resultCountElement = document.getElementById("filterResultCount");
    if (!resultCountElement) {
      resultCountElement = document.createElement("div");
      resultCountElement.id = "filterResultCount";
      resultCountElement.className = "filter-result-count";
      const filterControls = document.querySelector(".filter-controls");
      if (filterControls) {
        filterControls.parentNode.insertBefore(
          resultCountElement,
          filterControls.nextSibling
        );
      }
    }

    // Update the count with appropriate wording based on filters
    if (Object.keys(filterOptions).length > 0) {
      resultCountElement.textContent = `Showing ${resultCount} of ${totalCount} words`;
    } else {
      resultCountElement.textContent = `Showing all ${totalCount} words`;
    }
  }
}

// Export for use in other modules
window.CurrentVocabularyManager = CurrentVocabularyManager;
