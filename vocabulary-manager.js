// Vocabulary Manager - for managing vocabulary words that need editing

class VocabularyManager {
  constructor(vocabApp) {
    this.vocabApp = vocabApp;
    this.init();
  }

  init() {
    this.populateVocabTable(); // Focus on this functionality first

    // Only set up parsing results if they exist
    if (document.getElementById("parsingResultsTableBody")) {
      this.setupParsingResultsHandling();
    }

    // Set up the add word form controls
    this.setupAddWordForm();

    // Set up text parser
    this.setupTextParser();

    // Set up current vocabulary filtering
    this.setupVocabFiltering();
  }

  setupParsingResultsHandling() {
    // Initialize parsing results if the vocabApp has this property
    if (!this.vocabApp.parsingResults) {
      this.vocabApp.parsingResults = [];
    }

    this.populateParsingResultsTable();

    document
      .getElementById("saveParsingResultsChanges")
      .addEventListener("click", () => this.exportParsingResultsToCSV());
  }

  populateParsingResultsTable() {
    const tableBody = document.getElementById("parsingResultsTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    const parsingResults = this.vocabApp.parsingResults || [];

    if (parsingResults.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="5" class="empty-table-message">No parsing results yet. Use the Text Parser to extract words.</td></tr>';
      return;
    }

    parsingResults.forEach((word) => {
      const row = document.createElement("tr");
      row.dataset.id = word.id;

      row.innerHTML = `
        <td>${word.word}</td>
        <td><input type="text" class="translation-input" value="${
          word.translation || ""
        }"></td>
        <td>
          <select class="category-select">
            ${this.getCategoryOptions(word.category)}
          </select>
        </td>
        <td><input type="text" class="example-input" value="${
          word.example || ""
        }"></td>
        <td><button class="delete-btn" data-id="${word.id}">Delete</button></td>
      `;

      tableBody.appendChild(row);
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = parseInt(e.target.dataset.id);
        this.vocabApp.parsingResults = this.vocabApp.parsingResults.filter(
          (word) => word.id !== id
        );
        e.target.closest("tr").remove();
      });
    });
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
        '<tr><td colspan="4" class="empty-table-message">No words match your filters.</td></tr>';
    } else {
      // Update the table with the filtered cards
      filteredCards.forEach((card) => {
        const row = document.createElement("tr");
        row.dataset.id = card.id;

        row.innerHTML = `
          <td>${card.word}</td>
          <td>${card.translation || ""}</td>
          <td>${card.category || ""}</td>
          <td><textarea class="example-input" readonly>${
            card.example || ""
          }</textarea></td>
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

  getCategoryOptions(selectedCategory) {
    // Default categories if getUniqueCategories doesn't exist
    const categories = this.vocabApp.getUniqueCategories
      ? this.vocabApp.getUniqueCategories()
      : ["noun", "verb", "adjective", "adverb", "other"];

    return categories
      .map(
        (cat) =>
          `<option value="${cat}" ${cat === selectedCategory ? "selected" : ""}>
        ${cat.charAt(0).toUpperCase() + cat.slice(1)}
      </option>`
      )
      .join("");
  }

  saveParsingResultsChanges() {
    const rows = document.querySelectorAll(
      "#parsingResultsTableBody tr[data-id]"
    );

    rows.forEach((row) => {
      const id = parseInt(row.dataset.id);
      const translation = row.querySelector(".translation-input").value.trim();
      const category = row.querySelector(".category-select").value;
      const example = row.querySelector(".example-input").value.trim();

      const wordIndex = this.vocabApp.parsingResults.findIndex(
        (word) => word.id === id
      );
      if (wordIndex !== -1) {
        this.vocabApp.parsingResults[wordIndex].translation = translation;
        this.vocabApp.parsingResults[wordIndex].category = category;
        this.vocabApp.parsingResults[wordIndex].example = example;
      }
    });

    localStorage.setItem(
      "dgt-vocab-parsing-results",
      JSON.stringify(this.vocabApp.parsingResults)
    );

    // Add parsed words into the main vocabulary
    this.vocabApp.parsingResults.forEach((word) => {
      this.vocabApp.allCards.push({ ...word });
    });
    // Save updated vocabulary
    localStorage.setItem(
      "dgt-vocab-cards",
      JSON.stringify(this.vocabApp.allCards)
    );

    // Clear parsing results
    this.vocabApp.parsingResults = [];
    localStorage.setItem("dgt-vocab-parsing-results", JSON.stringify([]));

    // Refresh UI tables
    this.populateParsingResultsTable();
    this.populateVocabTable();

    // Hide parsing results section
    document.getElementById("parsingResults").classList.add("hidden");

    // Notify user
    alert("Parsing results saved and added to vocabulary successfully!");
  }

  setupAddWordForm() {
    const addWordForm = document.getElementById("addWordForm");
    if (!addWordForm) return;

    // Make sure no error classes are applied initially
    this.clearFieldErrors();

    // Populate category dropdown
    this.populateCategoryDropdown();

    // Handle form submission
    addWordForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.addNewWord();
    });

    // Handle cancel button
    document.getElementById("cancelAddBtn").addEventListener("click", () => {
      addWordForm.reset();
      this.clearMessages();
      this.clearFieldErrors();
    });

    // Add focus out event on Spanish word to check for duplicates
    const spanishWordInput = document.getElementById("newSpanishWord");
    if (spanishWordInput) {
      spanishWordInput.addEventListener("blur", () => {
        const word = spanishWordInput.value.trim();
        if (word) {
          this.checkIfWordExists(word);
        }
      });
    }

    // Setup tab switching between single word and text parser
    this.setupFormTabSwitching();
  }

  setupFormTabSwitching() {
    document
      .getElementById("showRegularFormBtn")
      .addEventListener("click", () => {
        document.getElementById("showRegularFormBtn").classList.add("active");
        document.getElementById("showTextParserBtn").classList.remove("active");
        document.getElementById("regularAddForm").classList.remove("hidden");
        document.getElementById("textParserForm").classList.add("hidden");
      });

    document
      .getElementById("showTextParserBtn")
      .addEventListener("click", () => {
        document.getElementById("showTextParserBtn").classList.add("active");
        document
          .getElementById("showRegularFormBtn")
          .classList.remove("active");
        document.getElementById("textParserForm").classList.remove("hidden");
        document.getElementById("regularAddForm").classList.add("hidden");
      });

    // Make sure the Parse Text tab is shown by default
    document.getElementById("showTextParserBtn").click();
  }

  populateCategoryDropdown() {
    const categorySelect = document.getElementById("newCategory");
    if (!categorySelect) return;

    categorySelect.innerHTML = ""; // Clear existing options

    // Add default option
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select category";
    categorySelect.appendChild(defaultOption);

    // Add categories from vocabulary
    this.vocabApp.getUniqueCategories().forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category.charAt(0).toUpperCase() + category.slice(1); // Capitalize first letter
      categorySelect.appendChild(option);
    });

    // Add "Add new category" option
    const newCategoryOption = document.createElement("option");
    newCategoryOption.value = "new";
    newCategoryOption.textContent = "-- Add new category --";
    categorySelect.appendChild(newCategoryOption);

    // Add event listener to handle "Add new category" selection
    categorySelect.addEventListener("change", () => {
      if (categorySelect.value === "new") {
        const newCategory = prompt("Enter new category name:");
        if (newCategory && newCategory.trim()) {
          const trimmedCategory = newCategory.trim().toLowerCase();

          // Check if this category already exists in the dropdown
          let exists = false;
          for (let i = 0; i < categorySelect.options.length; i++) {
            if (categorySelect.options[i].value === trimmedCategory) {
              categorySelect.value = trimmedCategory;
              exists = true;
              break;
            }
          }

          // If it doesn't exist, add it
          if (!exists) {
            const option = document.createElement("option");
            option.value = trimmedCategory;
            option.textContent =
              trimmedCategory.charAt(0).toUpperCase() +
              trimmedCategory.slice(1);
            categorySelect.insertBefore(option, newCategoryOption);
            categorySelect.value = trimmedCategory;
          }
        } else {
          categorySelect.value = ""; // Reset to default if empty input
        }
      }
    });
  }

  checkIfWordExists(word) {
    // Clear any previous error for this field
    const field = document.getElementById("newSpanishWord");
    field.classList.remove("error");

    // Clear previous messages
    this.clearMessages();

    // Check if word exists in vocabulary
    const normalizedWord = word.toLowerCase().trim();
    const existingCard = this.vocabApp.allCards.find(
      (card) => card.word.toLowerCase().trim() === normalizedWord
    );

    if (existingCard) {
      // Show error message
      field.classList.add("error");
      this.showMessage(
        `"${word}" already exists in your vocabulary as "${existingCard.word}" with translation "${existingCard.translation}" in category "${existingCard.category}".`,
        "error"
      );
      return true;
    }

    return false;
  }

  addNewWord() {
    const newWord = document.getElementById("newSpanishWord").value.trim();
    const newTranslation = document
      .getElementById("newTranslation")
      .value.trim();
    const newCategory = document.getElementById("newCategory").value || "other";
    const newExample = document.getElementById("newExample").value.trim();

    // Clear previous messages and error styles
    this.clearMessages();
    this.clearFieldErrors();

    // Validation
    let hasErrors = false;

    if (!newWord) {
      this.showFieldError("newSpanishWord", "Spanish word is required");
      hasErrors = true;
    }

    if (!newTranslation) {
      this.showFieldError("newTranslation", "Translation is required");
      hasErrors = true;
    }

    // Check for duplicate word
    if (newWord && this.checkIfWordExists(newWord)) {
      hasErrors = true;
    }

    if (hasErrors) {
      this.showMessage("Please fix the errors above.", "error");
      return;
    }

    // Create new card object
    const newCard = {
      id: Date.now(), // Use timestamp as ID
      word: newWord,
      translation: newTranslation,
      category: newCategory.toLowerCase(),
      example: newExample,
    };

    // Add to allCards
    this.vocabApp.allCards.push(newCard);

    // Save to localStorage
    localStorage.setItem(
      "dgt-vocab-cards",
      JSON.stringify(this.vocabApp.allCards)
    );

    // Clear input fields
    document.getElementById("addWordForm").reset();

    // Show success message
    this.showMessage(`"${newWord}" has been added successfully!`, "success");

    // Refresh the vocabulary table
    this.populateVocabTable();
  }

  setupTextParser() {
    const analyzeBtn = document.getElementById("analyzeTextBtn");
    if (!analyzeBtn) return;

    analyzeBtn.addEventListener("click", () => {
      this.analyzeText();
    });

    // Add event listener for the clear button
    const clearBtn = document.getElementById("clearParsingResults");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        this.clearParsingResults();
      });
    }
  }

  analyzeText() {
    const text = document.getElementById("textToAnalyze").value.trim();
    if (!text) {
      this.showMessage("Please enter some text to analyze", "error");
      return;
    }

    // Clean the text and extract words
    const words = this.extractWords(text);

    // Filter out words that already exist in the database
    const newWords = this.filterNewWords(words);

    if (newWords.length === 0) {
      this.showMessage(
        "No new words found in the text - all words already exist in your vocabulary",
        "info"
      );
      return;
    }

    // Add the words directly to parsing results
    this.addWordsToParsingResults(newWords, text);
  }

  extractWords(text) {
    // Clean the text: remove punctuation and convert to lowercase
    const cleanText = text
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()¿¡"']/g, " ")
      .replace(/\s+/g, " ");

    // Split into words and filter out short words and common words
    const commonWords = new Set([
      "el",
      "la",
      "los",
      "las",
      "un",
      "una",
      "unos",
      "unas",
      "y",
      "o",
      "a",
      "de",
      "en",
      "con",
      "por",
      "para",
      "que",
      "se",
      "del",
      "al",
      "es",
      "son",
      "va",
      "e",
      "u",
    ]);

    const words = cleanText
      .split(" ")
      .filter((word) => word.length > 2) // Filter out very short words
      .filter((word) => !commonWords.has(word)) // Filter out common words
      .map((word) => this.guessWordProperties(word));

    return [...new Set(words.map((w) => JSON.stringify(w)))].map((w) =>
      JSON.parse(w)
    ); // Deduplicate
  }

  guessWordProperties(word) {
    // Logic to guess the word category based on patterns
    let category = "noun"; // Default

    // Check for verb endings
    if (word.endsWith("ar") || word.endsWith("er") || word.endsWith("ir")) {
      category = "verb";
    }
    // Check for common adjective endings
    else if (
      word.endsWith("ado") ||
      word.endsWith("ada") ||
      word.endsWith("oso") ||
      word.endsWith("osa") ||
      word.endsWith("ivo") ||
      word.endsWith("iva") ||
      word.endsWith("ico") ||
      word.endsWith("ica")
    ) {
      category = "adjective";
    }
    // Check for common adverb endings
    else if (word.endsWith("mente")) {
      category = "adverb";
    }

    return {
      word: word,
      category: category,
      id: Date.now() + Math.floor(Math.random() * 1000), // Generate a unique ID
    };
  }

  filterNewWords(words) {
    // Check against existing vocabulary - both from loaded vocabulary.js and any cards added in the session
    return words.filter((wordObj) => {
      const normalizedWord = wordObj.word.toLowerCase().trim();

      // Check if word already exists in the main vocabulary
      const existsInVocab = this.vocabApp.allCards.some(
        (card) => card.word.toLowerCase().trim() === normalizedWord
      );

      // Check if word already exists in parsing results (for words added in current session)
      const existsInParsingResults =
        this.vocabApp.parsingResults &&
        this.vocabApp.parsingResults.some(
          (item) => item.word.toLowerCase().trim() === normalizedWord
        );

      return !existsInVocab && !existsInParsingResults;
    });
  }

  addWordsToParsingResults(words, originalText) {
    // Initialize parsing results array if needed
    if (!this.vocabApp.parsingResults) {
      this.vocabApp.parsingResults = [];
    }

    let addedCount = 0;

    words.forEach((wordObj) => {
      // Check again if word already exists (for extra safety)
      const normalizedWord = wordObj.word.toLowerCase().trim();

      const alreadyExists =
        this.vocabApp.allCards.some(
          (card) => card.word.toLowerCase().trim() === normalizedWord
        ) ||
        this.vocabApp.parsingResults.some(
          (item) => item.word.toLowerCase().trim() === normalizedWord
        );

      if (alreadyExists) {
        return; // Skip this word
      }

      // Create a word entry for the parsing results
      const newWord = {
        id: Date.now() + addedCount,
        word: wordObj.word,
        translation: "", // User needs to fill this in
        category: wordObj.category,
        example: originalText, // Use the original text as example
      };

      // Add to parsing results
      this.vocabApp.parsingResults.push(newWord);
      addedCount++;
    });

    if (addedCount > 0) {
      // Save to localStorage
      localStorage.setItem(
        "dgt-vocab-parsing-results",
        JSON.stringify(this.vocabApp.parsingResults)
      );

      // Show success message
      this.showMessage(
        `Added ${addedCount} words to parsing results. Please provide translations below.`,
        "success"
      );

      // Reset the text input
      document.getElementById("textToAnalyze").value = "";

      // Show the added words in the parsing results table
      this.populateParsingResultsTable();

      // Make parsing results visible if they were hidden
      const parsingResultsSection = document.querySelector(
        ".parsing-results-section"
      );
      if (parsingResultsSection) {
        parsingResultsSection.classList.remove("hidden");
      }

      // Scroll to the parsing results section
      parsingResultsSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  clearParsingResults() {
    if (confirm("Are you sure you want to clear all parsing results?")) {
      this.vocabApp.parsingResults = [];
      localStorage.setItem("dgt-vocab-parsing-results", JSON.stringify([]));
      this.populateParsingResultsTable();
      this.showMessage("Parsing results have been cleared", "success");
    }
  }

  showMessage(text, type) {
    const messageContainer = document.getElementById("messageContainer");
    if (messageContainer) {
      messageContainer.innerHTML = `<div class="${type}-message">${text}</div>`;
      messageContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else {
      alert(text);
    }
  }

  clearMessages() {
    const messageContainer = document.getElementById("messageContainer");
    if (messageContainer) {
      messageContainer.innerHTML = "";
    }
  }

  showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (field) {
      field.classList.add("error");
      field.placeholder = message;
    }
  }

  clearFieldErrors() {
    document.querySelectorAll("input.error").forEach((field) => {
      field.classList.remove("error");
      // Restore original placeholders
      const placeholders = {
        newSpanishWord: "e.g., aparcamiento",
        newTranslation: "e.g., parking",
        newExample: "e.g., El aparcamiento está lleno.",
      };

      if (
        field.placeholder.includes("required") ||
        field.placeholder.includes("exists")
      ) {
        field.placeholder = placeholders[field.id] || "";
      }
    });

    // Also explicitly clear error class from specific form input fields
    const formFields = [
      "newSpanishWord",
      "newTranslation",
      "newCategory",
      "newExample",
    ];
    formFields.forEach((id) => {
      const field = document.getElementById(id);
      if (field) field.classList.remove("error");
    });
  }

  exportParsingResultsToCSV() {
    // Before generating CSV, make one final check for duplicates
    const uniqueResults = [];
    const existingWords = new Set(
      this.vocabApp.allCards.map((card) => card.word.toLowerCase().trim())
    );

    this.vocabApp.parsingResults.forEach((word) => {
      const normalizedWord = word.word.toLowerCase().trim();
      if (!existingWords.has(normalizedWord)) {
        uniqueResults.push(word);
      }
    });

    // Use uniqueResults for CSV generation
    let csvContent = "word,translation,category,example\n";

    uniqueResults.forEach((word) => {
      // Format each field properly for CSV
      const formattedWord = this.formatCSVField(word.word);
      const formattedTranslation = this.formatCSVField(word.translation);
      const formattedCategory = this.formatCSVField(word.category);
      const formattedExample = this.formatCSVField(word.example);

      csvContent += `${formattedWord},${formattedTranslation},${formattedCategory},${formattedExample}\n`;
    });

    // Generate JavaScript format for vocabulary.js
    let jsContent = "// Format ready to paste into vocabulary.js\n\n";

    uniqueResults.forEach((word) => {
      jsContent += `  {\n`;
      jsContent += `    word: "${word.word}",\n`;
      jsContent += `    translation: "${word.translation}",\n`;
      jsContent += `    category: "${word.category}",\n`;
      jsContent += `    example: "${word.example.replace(/"/g, '\\"')}",\n`;
      jsContent += `  },\n`;
    });

    // Create a Blob with the CSV content
    const csvBlob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    // Create a separate Blob for JavaScript format
    const jsBlob = new Blob([jsContent], { type: "text/plain;charset=utf-8;" });

    // Create download links
    this.downloadFile(csvBlob, "vocabulary_export.csv");
    this.downloadFile(jsBlob, "vocabulary_export.js");

    // Notify user
    this.showMessage(
      "Parsing results exported as CSV and JS files!",
      "success"
    );
  }

  // Helper function to format CSV fields (handle commas, quotes, etc.)
  formatCSVField(value) {
    if (value === null || value === undefined) {
      return '""';
    }

    const stringValue = String(value);
    // If the field contains quotes, commas, or newlines, wrap it in quotes and escape quotes
    if (
      stringValue.includes('"') ||
      stringValue.includes(",") ||
      stringValue.includes("\n")
    ) {
      return '"' + stringValue.replace(/"/g, '""') + '"';
    }
    return '"' + stringValue + '"';
  }

  // Helper function to trigger download
  downloadFile(blob, fileName) {
    // Create a URL for the blob
    const url = window.URL.createObjectURL(blob);

    // Create a temporary link element
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = fileName;

    // Append to the document
    document.body.appendChild(downloadLink);

    // Trigger click event to start download
    downloadLink.click();

    // Clean up
    document.body.removeChild(downloadLink);
    window.URL.revokeObjectURL(url);
  }
}

// Code to initialize DGTVocabulary specifically for the vocabulary manager page
document.addEventListener("DOMContentLoaded", function () {
  // Only run the manager initialization if we're on the manager page
  if (!window.isVocabManagerPage) return;

  // The initialization will be handled by the script in vocabulary-manager.html
  console.log("Vocabulary Manager script loaded");
});
