// Vocabulary Manager - for managing vocabulary words that need editing

class VocabularyManager {
  constructor(vocabApp) {
    this.vocabApp = vocabApp;
    this.githubIntegration = new GitHubIntegration(this);
    this.init();
  }

  init() {
    this.populateVocabTable(); // Focus on this functionality first

    // Only set up vocabulary updates if they exist
    if (document.getElementById("vocabularyUpdatesTableBody")) {
      this.setupVocabularyUpdatesHandling();
    }

    // Set up the add word form controls
    this.setupAddWordForm();

    // Set up text parser
    this.setupTextParser();

    // Set up current vocabulary filtering
    this.setupVocabFiltering();
  }

  setupVocabularyUpdatesHandling() {
    // Initialize vocabulary updates if the vocabApp has this property
    if (!this.vocabApp.vocabularyUpdates) {
      this.vocabApp.vocabularyUpdates = [];
    }

    this.populateVocabularyUpdatesTable();

    document
      .getElementById("saveVocabularyUpdates")
      .addEventListener("click", () => this.exportVocabularyUpdatesToCSV());

    document
      .getElementById("createMergeRequest")
      .addEventListener("click", () => this.createMergeRequest());
  }

  populateVocabularyUpdatesTable() {
    const tableBody = document.getElementById("vocabularyUpdatesTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    const vocabularyUpdates = this.vocabApp.vocabularyUpdates || [];

    if (vocabularyUpdates.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="5" class="empty-table-message">No vocabulary updates yet. Use the Text Parser or Add Single Word to add words for review.</td></tr>';
      return;
    }

    vocabularyUpdates.forEach((word) => {
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
        this.vocabApp.vocabularyUpdates =
          this.vocabApp.vocabularyUpdates.filter((word) => word.id !== id);
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

  saveVocabularyUpdatesChanges() {
    const rows = document.querySelectorAll(
      "#vocabularyUpdatesTableBody tr[data-id]"
    );

    rows.forEach((row) => {
      const id = parseInt(row.dataset.id);
      const translation = row.querySelector(".translation-input").value.trim();
      const category = row.querySelector(".category-select").value;
      const example = row.querySelector(".example-input").value.trim();

      const wordIndex = this.vocabApp.vocabularyUpdates.findIndex(
        (word) => word.id === id
      );
      if (wordIndex !== -1) {
        this.vocabApp.vocabularyUpdates[wordIndex].translation = translation;
        this.vocabApp.vocabularyUpdates[wordIndex].category = category;
        this.vocabApp.vocabularyUpdates[wordIndex].example = example;
      }
    });

    localStorage.setItem(
      "dgt-vocab-vocabulary-updates",
      JSON.stringify(this.vocabApp.vocabularyUpdates)
    );

    // Add vocabulary updates into the main vocabulary
    this.vocabApp.vocabularyUpdates.forEach((word) => {
      this.vocabApp.allCards.push({ ...word });
    });
    // Save updated vocabulary
    localStorage.setItem(
      "dgt-vocab-cards",
      JSON.stringify(this.vocabApp.allCards)
    );

    // Clear vocabulary updates
    this.vocabApp.vocabularyUpdates = [];
    localStorage.setItem("dgt-vocab-vocabulary-updates", JSON.stringify([]));

    // Refresh UI tables
    this.populateVocabularyUpdatesTable();
    this.populateVocabTable();

    // Hide vocabulary updates subsection
    const vocabularyUpdatesSubsection = document.querySelector(
      ".vocabulary-updates-subsection"
    );
    if (vocabularyUpdatesSubsection) {
      vocabularyUpdatesSubsection.classList.add("hidden");
    }

    // Notify user
    alert("Vocabulary updates saved and added to vocabulary successfully!");
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

    // Initialize vocabulary updates if needed
    if (!this.vocabApp.vocabularyUpdates) {
      this.vocabApp.vocabularyUpdates = [];
    }

    // Add to vocabulary updates for review instead of directly to main vocabulary
    this.vocabApp.vocabularyUpdates.push(newCard);

    // Save to localStorage
    localStorage.setItem(
      "dgt-vocab-vocabulary-updates",
      JSON.stringify(this.vocabApp.vocabularyUpdates)
    );

    // Clear input fields
    document.getElementById("addWordForm").reset();

    // Show success message
    this.showMessage(
      `"${newWord}" has been added to vocabulary updates for review!`,
      "success"
    );

    // Refresh the vocabulary updates table
    this.populateVocabularyUpdatesTable();

    // Make vocabulary updates section visible if it was hidden
    const vocabularyUpdatesSection = document.querySelector(
      ".vocabulary-updates-subsection"
    );
    if (vocabularyUpdatesSection) {
      vocabularyUpdatesSection.classList.remove("hidden");
      // Scroll to the vocabulary updates section
      vocabularyUpdatesSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  setupTextParser() {
    const analyzeBtn = document.getElementById("analyzeTextBtn");
    if (!analyzeBtn) return;

    analyzeBtn.addEventListener("click", () => {
      this.analyzeText();
    });

    // Add event listener for the clear button
    const clearBtn = document.getElementById("clearVocabularyUpdates");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        this.clearVocabularyUpdates();
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

    // Add the words directly to vocabulary updates
    this.addWordsToVocabularyUpdates(newWords, text);
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

      // Check if word already exists in vocabulary updates (for words added in current session)
      const existsInVocabularyUpdates =
        this.vocabApp.vocabularyUpdates &&
        this.vocabApp.vocabularyUpdates.some(
          (item) => item.word.toLowerCase().trim() === normalizedWord
        );

      return !existsInVocab && !existsInVocabularyUpdates;
    });
  }

  addWordsToVocabularyUpdates(words, originalText) {
    // Initialize vocabulary updates array if needed
    if (!this.vocabApp.vocabularyUpdates) {
      this.vocabApp.vocabularyUpdates = [];
    }

    let addedCount = 0;

    words.forEach((wordObj) => {
      // Check again if word already exists (for extra safety)
      const normalizedWord = wordObj.word.toLowerCase().trim();

      const alreadyExists =
        this.vocabApp.allCards.some(
          (card) => card.word.toLowerCase().trim() === normalizedWord
        ) ||
        this.vocabApp.vocabularyUpdates.some(
          (item) => item.word.toLowerCase().trim() === normalizedWord
        );

      if (alreadyExists) {
        return; // Skip this word
      }

      // Create a word entry for the vocabulary updates
      const newWord = {
        id: Date.now() + addedCount,
        word: wordObj.word,
        translation: "", // User needs to fill this in
        category: wordObj.category,
        example: originalText, // Use the original text as example
      };

      // Add to vocabulary updates
      this.vocabApp.vocabularyUpdates.push(newWord);
      addedCount++;
    });

    if (addedCount > 0) {
      // Save to localStorage
      localStorage.setItem(
        "dgt-vocab-vocabulary-updates",
        JSON.stringify(this.vocabApp.vocabularyUpdates)
      );

      // Show success message
      this.showMessage(
        `Added ${addedCount} words to vocabulary updates. Please provide translations below.`,
        "success"
      );

      // Reset the text input
      document.getElementById("textToAnalyze").value = "";

      // Show the added words in the vocabulary updates table
      this.populateVocabularyUpdatesTable();

      // Make vocabulary updates visible if they were hidden
      const vocabularyUpdatesSection = document.querySelector(
        ".vocabulary-updates-subsection"
      );
      if (vocabularyUpdatesSection) {
        vocabularyUpdatesSection.classList.remove("hidden");
        // Scroll to the vocabulary updates section
        vocabularyUpdatesSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  }

  clearVocabularyUpdates() {
    if (confirm("Are you sure you want to clear all vocabulary updates?")) {
      this.vocabApp.vocabularyUpdates = [];
      localStorage.setItem("dgt-vocab-vocabulary-updates", JSON.stringify([]));
      this.populateVocabularyUpdatesTable();
      this.showMessage("Vocabulary updates have been cleared", "success");
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

  exportVocabularyUpdatesToCSV() {
    // Before generating CSV, make one final check for duplicates
    const uniqueResults = [];
    const existingWords = new Set(
      this.vocabApp.allCards.map((card) => card.word.toLowerCase().trim())
    );

    this.vocabApp.vocabularyUpdates.forEach((word) => {
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

    // Clear vocabulary updates after successful export
    this.vocabApp.vocabularyUpdates = [];
    localStorage.setItem("dgt-vocab-vocabulary-updates", JSON.stringify([]));

    // Refresh the table to show empty state
    this.populateVocabularyUpdatesTable();

    // Notify user
    this.showMessage(
      "Vocabulary updates exported as CSV and JS files! Vocabulary updates have been cleared.",
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
    const url = window.URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = fileName;
    downloadLink.style.display = "none";

    // Add link to DOM
    document.body.appendChild(downloadLink);

    // Trigger click event to start download
    downloadLink.click();

    // Clean up
    document.body.removeChild(downloadLink);
    window.URL.revokeObjectURL(url);
  }

  // Create merge request functionality
  async createMergeRequest() {
    try {
      // Validate vocabulary updates first
      if (
        !this.vocabApp.vocabularyUpdates ||
        this.vocabApp.vocabularyUpdates.length === 0
      ) {
        this.showMessage(
          "No vocabulary updates to create a merge request for.",
          "error"
        );
        return;
      }

      this.showMessage("Creating merge request... Please wait.", "info");

      // Get the updated vocabulary updates from the UI FIRST
      this.updateVocabularyUpdatesFromUI();

      // Now validate that all words have translations (after getting them from UI)
      const incompleteWords = this.vocabApp.vocabularyUpdates.filter(
        (word) => !word.translation || word.translation.trim() === ""
      );

      if (incompleteWords.length > 0) {
        this.showMessage(
          `Please provide translations for all words before creating a merge request. ${incompleteWords.length} words are missing translations.`,
          "error"
        );
        return;
      }

      // Generate the updated vocabulary.js content
      const updatedVocabularyContent =
        await this.generateUpdatedVocabularyFile();

      // Create branch name with timestamp
      const timestamp = new Date()
        .toISOString()
        .split("T")[0]
        .replace(/-/g, "");
      const branchName = `vocab-update-${timestamp}-${Date.now()}`;

      // Always try GitHub integration first (will prompt for auth if needed)
      this.githubIntegration.showMergeRequestDialog(
        updatedVocabularyContent,
        branchName
      );
    } catch (error) {
      console.error("Error creating merge request:", error);
      this.showMessage(
        "Error creating merge request: " + error.message,
        "error"
      );
    }
  }

  // Update vocabulary updates from the current UI state
  updateVocabularyUpdatesFromUI() {
    const rows = document.querySelectorAll(
      "#vocabularyUpdatesTableBody tr[data-id]"
    );

    rows.forEach((row) => {
      const id = parseInt(row.dataset.id);
      const translation = row.querySelector(".translation-input").value.trim();
      const category = row.querySelector(".category-select").value;
      const example = row.querySelector(".example-input").value.trim();

      const wordIndex = this.vocabApp.vocabularyUpdates.findIndex(
        (word) => word.id === id
      );
      if (wordIndex !== -1) {
        this.vocabApp.vocabularyUpdates[wordIndex].translation = translation;
        this.vocabApp.vocabularyUpdates[wordIndex].category = category;
        this.vocabApp.vocabularyUpdates[wordIndex].example = example;
      }
    });
  }

  // Generate updated vocabulary.js file content
  async generateUpdatedVocabularyFile() {
    try {
      // Use the vocabulary data that's already loaded instead of fetching the file
      // This avoids the "Failed to fetch" error with local file:// URLs

      // Generate the header (standard vocabulary.js file structure)
      const header = `// Spanish DGT Driving Vocabulary Data
// This file contains all the vocabulary terms for the DGT flashcard application

`;
      const footer = ``;

      // Combine existing vocabulary with new words
      const allWords = [...this.vocabApp.allCards];

      // Filter out duplicates and add new words
      const existingWordSet = new Set(
        allWords.map((word) => word.word.toLowerCase().trim())
      );

      this.vocabApp.vocabularyUpdates.forEach((newWord) => {
        const normalizedWord = newWord.word.toLowerCase().trim();
        if (!existingWordSet.has(normalizedWord)) {
          allWords.push({
            word: newWord.word,
            translation: newWord.translation,
            category: newWord.category,
            example: newWord.example,
          });
        }
      });

      // Sort words alphabetically
      allWords.sort((a, b) => a.word.localeCompare(b.word));

      // Generate the new vocabulary array content
      let vocabularyContent = "window.vocabularyData = [\n";

      allWords.forEach((word, index) => {
        vocabularyContent += "  {\n";
        vocabularyContent += `    word: "${this.escapeJavaScriptString(
          word.word
        )}",\n`;
        vocabularyContent += `    translation: "${this.escapeJavaScriptString(
          word.translation
        )}",\n`;
        vocabularyContent += `    category: "${this.escapeJavaScriptString(
          word.category
        )}",\n`;
        vocabularyContent += `    example: "${this.escapeJavaScriptString(
          word.example
        )}",\n`;
        vocabularyContent += "  }";

        if (index < allWords.length - 1) {
          vocabularyContent += ",";
        }
        vocabularyContent += "\n";
      });

      vocabularyContent += "];";

      return header + vocabularyContent + footer;
    } catch (error) {
      throw new Error(
        `Failed to generate updated vocabulary file: ${error.message}`
      );
    }
  }

  // Escape strings for JavaScript
  escapeJavaScriptString(str) {
    if (!str) return "";
    return str
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t");
  }

  // Show merge request dialog
  showMergeRequestDialog(updatedContent, branchName) {
    // Create modal overlay
    const modalOverlay = document.createElement("div");
    modalOverlay.className = "merge-request-modal-overlay";
    modalOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Create modal content
    const modal = document.createElement("div");
    modal.className = "merge-request-modal";
    modal.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 2rem;
      max-width: 90%;
      max-height: 90%;
      overflow-y: auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;

    const newWordsCount = this.vocabApp.vocabularyUpdates.length;
    const totalWordsCount = this.vocabApp.allCards.length + newWordsCount;

    modal.innerHTML = `
      <h2>🔄 Create Merge Request</h2>
      <p>Ready to create a merge request with <strong>${newWordsCount} new words</strong>!</p>
      <p>Total vocabulary size will be: <strong>${totalWordsCount} words</strong></p>
      
      <div style="margin: 1.5rem 0;">
        <h3>📋 Summary of Changes:</h3>
        <ul style="max-height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 1rem; border-radius: 4px;">
          ${this.vocabApp.vocabularyUpdates
            .map(
              (word) =>
                `<li><strong>${word.word}</strong> → ${word.translation} <em>(${word.category})</em></li>`
            )
            .join("")}
        </ul>
      </div>

      <div style="margin: 1.5rem 0;">
        <label for="branchNameInput" style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Branch Name:</label>
        <input type="text" id="branchNameInput" value="${branchName}" 
               style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
      </div>

      <div style="margin: 1.5rem 0;">
        <label for="commitMessageInput" style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Commit Message:</label>
        <textarea id="commitMessageInput" rows="3" 
                  style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;"
                  placeholder="Add ${newWordsCount} new vocabulary words">Add ${newWordsCount} new vocabulary words

Added vocabulary from vocabulary updates:
${this.vocabApp.vocabularyUpdates
  .slice(0, 5)
  .map((word) => `- ${word.word} (${word.translation})`)
  .join("\n")}${
      newWordsCount > 5 ? `\n... and ${newWordsCount - 5} more words` : ""
    }</textarea>
      </div>

      <div style="margin: 1.5rem 0;">
        <h3>📝 Instructions:</h3>
        <ol>
          <li>Click "Download Updated Files" to get the new vocabulary.js file</li>
          <li>Create a new branch: <code>git checkout -b ${branchName}</code></li>
          <li>Replace your vocabulary.js file with the downloaded version</li>
          <li>Commit the changes: <code>git add vocabulary.js && git commit -m "Your commit message"</code></li>
          <li>Push the branch: <code>git push origin ${branchName}</code></li>
          <li>Create a pull request on your Git platform (GitHub, GitLab, etc.)</li>
        </ol>
      </div>

      <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
        <button id="downloadFilesBtn" class="primary-btn" style="background: #28a745; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer;">
          📥 Download Updated Files
        </button>
        <button id="copyGitCommandsBtn" class="secondary-btn" style="background: #6c757d; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer;">
          📋 Copy Git Commands
        </button>
        <button id="closeMergeRequestModal" class="secondary-btn" style="background: #6c757d; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer;">
          ❌ Close
        </button>
      </div>
    `;

    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);

    // Add event listeners
    document
      .getElementById("downloadFilesBtn")
      .addEventListener("click", () => {
        const branchName = document.getElementById("branchNameInput").value;
        this.downloadMergeRequestFiles(updatedContent, branchName);
      });

    document
      .getElementById("copyGitCommandsBtn")
      .addEventListener("click", () => {
        const branchName = document.getElementById("branchNameInput").value;
        const commitMessage =
          document.getElementById("commitMessageInput").value;
        this.copyGitCommands(branchName, commitMessage);
      });

    document
      .getElementById("closeMergeRequestModal")
      .addEventListener("click", () => {
        document.body.removeChild(modalOverlay);
      });

    // Close modal when clicking overlay
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        document.body.removeChild(modalOverlay);
      }
    });
  }

  // Download the updated files for the merge request
  downloadMergeRequestFiles(updatedContent, branchName) {
    // Download updated vocabulary.js
    const vocabBlob = new Blob([updatedContent], {
      type: "text/javascript;charset=utf-8;",
    });
    this.downloadFile(vocabBlob, "vocabulary.js");

    // Also generate a summary file
    const summaryContent = this.generateMergeRequestSummary(branchName);
    const summaryBlob = new Blob([summaryContent], {
      type: "text/plain;charset=utf-8;",
    });
    this.downloadFile(summaryBlob, "merge-request-summary.txt");

    this.showMessage(
      "Files downloaded! Follow the instructions to create your merge request.",
      "success"
    );
  }

  // Generate merge request summary
  generateMergeRequestSummary(branchName) {
    const newWordsCount = this.vocabApp.vocabularyUpdates.length;
    const totalWordsCount = this.vocabApp.allCards.length + newWordsCount;

    let summary = `🔄 VOCABULARY UPDATE MERGE REQUEST\n`;
    summary += `=====================================\n\n`;
    summary += `Branch: ${branchName}\n`;
    summary += `Date: ${new Date().toLocaleString()}\n`;
    summary += `New words added: ${newWordsCount}\n`;
    summary += `Total vocabulary size: ${totalWordsCount}\n\n`;

    summary += `📋 NEW WORDS ADDED:\n`;
    summary += `-------------------\n`;
    this.vocabApp.vocabularyUpdates.forEach((word, index) => {
      summary += `${index + 1}. ${word.word} → ${word.translation} (${
        word.category
      })\n`;
      if (word.example) {
        summary += `   Example: ${word.example}\n`;
      }
      summary += `\n`;
    });

    summary += `\n🔧 GIT COMMANDS TO EXECUTE:\n`;
    summary += `---------------------------\n`;
    summary += `git checkout -b ${branchName}\n`;
    summary += `# Replace vocabulary.js with the downloaded file\n`;
    summary += `git add vocabulary.js\n`;
    summary += `git commit -m "Add ${newWordsCount} new vocabulary words"\n`;
    summary += `git push origin ${branchName}\n`;
    summary += `# Then create a pull request on your Git platform\n`;

    return summary;
  }

  // Copy git commands to clipboard
  async copyGitCommands(branchName, commitMessage) {
    const commands = `git checkout -b ${branchName}
# Replace vocabulary.js with the downloaded file
git add vocabulary.js
git commit -m "${commitMessage.replace(/"/g, '\\"')}"
git push origin ${branchName}
# Then create a pull request on your Git platform`;

    try {
      await navigator.clipboard.writeText(commands);
      this.showMessage("Git commands copied to clipboard!", "success");
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      // Fallback: show the commands in a text area for manual copying
      this.showGitCommandsDialog(commands);
    }
  }

  // Show git commands dialog as fallback
  showGitCommandsDialog(commands) {
    const dialog = document.createElement("div");
    dialog.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      z-index: 1001;
      max-width: 80%;
    `;

    dialog.innerHTML = `
      <h3>📋 Git Commands</h3>
      <p>Copy these commands to execute in your terminal:</p>
      <textarea readonly style="width: 100%; height: 200px; font-family: monospace; padding: 1rem; border: 1px solid #ddd; border-radius: 4px;">${commands}</textarea>
      <div style="text-align: right; margin-top: 1rem;">
        <button onclick="this.parentElement.parentElement.remove()" style="background: #6c757d; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">Close</button>
      </div>
    `;

    document.body.appendChild(dialog);
    dialog.querySelector("textarea").select();
  }
}

// Code to initialize DGTVocabulary specifically for the vocabulary manager page
document.addEventListener("DOMContentLoaded", function () {
  // Only run the manager initialization if we're on the manager page
  if (!window.isVocabManagerPage) return;

  // The initialization will be handled by the script in vocabulary-manager.html
  console.log("Vocabulary Manager script loaded");
});

// Tab switching for word entry forms
document.addEventListener("DOMContentLoaded", function () {
  const regularFormBtn = document.getElementById("showRegularFormBtn");
  const textParserBtn = document.getElementById("showTextParserBtn");
  const regularAddForm = document.getElementById("regularAddForm");
  const textParserForm = document.getElementById("textParserForm");

  // Function to show the regular add form
  function showRegularForm() {
    regularAddForm.classList.add("active");
    regularAddForm.classList.remove("hidden");
    textParserForm.classList.add("hidden");
    regularFormBtn.classList.add("active");
    textParserBtn.classList.remove("active");
  }

  // Function to show the text parser form
  function showTextParserForm() {
    regularAddForm.classList.remove("active");
    regularAddForm.classList.add("hidden");
    textParserForm.classList.remove("hidden");
    regularFormBtn.classList.remove("active");
    textParserBtn.classList.add("active");
  }

  // Event listeners for the tab buttons
  if (regularFormBtn && textParserBtn) {
    regularFormBtn.addEventListener("click", showRegularForm);
    textParserBtn.addEventListener("click", showTextParserForm);
  }

  // Initialize based on the default setting
  if (textParserBtn?.classList.contains("active")) {
    showTextParserForm();
  } else if (regularFormBtn?.classList.contains("active")) {
    showRegularForm();
  }
});
