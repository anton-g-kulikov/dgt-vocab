// Current Vocabulary Manager - Handles the current vocabulary filtering and display
class CurrentVocabularyManager {
  constructor(vocabApp, showMessage) {
    this.vocabApp = vocabApp;
    this.showMessage = showMessage;
    this.isEditMode = false;

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
    // Populate filter dropdowns for vocabulary
    this.populateCategoryVocabFilter();
    this.populateTopicVocabFilter();

    // Add event listeners for filter inputs
    const wordFilter = document.getElementById("wordFilter");
    const categoryFilter = document.getElementById("categoryVocabFilter");
    const topicFilter = document.getElementById("topicVocabFilter");
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

    // Apply filter immediately for dropdowns (no need for debounce)
    if (categoryFilter) {
      categoryFilter.addEventListener("change", () => this.applyVocabFilters());
    }

    if (topicFilter) {
      topicFilter.addEventListener("change", () => this.applyVocabFilters());
    }

    // Clear filters button
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener("click", () => {
        if (wordFilter) wordFilter.value = "";
        if (categoryFilter) categoryFilter.value = "";
        if (topicFilter) topicFilter.value = "";
        this.applyVocabFilters();
      });
    }

    // Edit mode button
    const editModeBtn = document.getElementById("editMode");
    if (editModeBtn) {
      editModeBtn.addEventListener("click", () => {
        this.toggleEditMode();
      });
    }
  }

  applyVocabFilters() {
    const wordFilter = document
      .getElementById("wordFilter")
      .value.trim()
      .toLowerCase();
    const categoryFilter = document
      .getElementById("categoryVocabFilter")
      .value.toLowerCase();
    const topicFilter = document.getElementById("topicVocabFilter").value;

    // Create filter options object
    const filterOptions = {};
    if (wordFilter) filterOptions.word = wordFilter;
    if (categoryFilter) filterOptions.category = categoryFilter;
    if (topicFilter) filterOptions.topic = topicFilter;

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

  populateTopicVocabFilter() {
    const topicFilter = document.getElementById("topicVocabFilter");
    if (!topicFilter) return;

    topicFilter.innerHTML = ""; // Clear existing options

    // Add default "All Topics" option
    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = "All Topics";
    topicFilter.appendChild(allOption);

    // Add all topics from TopicUtils
    const topics = window.TopicUtils.getAllTopics();

    // Ensure we have the topics
    if (topics && topics.length > 0) {
      topics.forEach((topic) => {
        const option = document.createElement("option");
        option.value = topic.id;
        option.textContent = topic.name;
        topicFilter.appendChild(option);
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

    if (filterOptions.category) {
      filteredCards = filteredCards.filter(
        (card) =>
          (card.category || "").toLowerCase() ===
          filterOptions.category.toLowerCase()
      );
    }

    if (filterOptions.topic) {
      // Use TopicUtils to filter by topic
      filteredCards = window.TopicUtils.filterWordsByTopic(
        filteredCards,
        filterOptions.topic
      );
    }

    // Show a message when no cards match the filter
    if (filteredCards.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="6" class="empty-table-message">No words match your filters.</td></tr>';
    } else {
      // Update the table with the filtered cards
      filteredCards.forEach((card) => {
        const row = document.createElement("tr");
        row.dataset.id = card.id;

        // Format topics for display
        let topicDisplay = "";
        if (card.topics && card.topics.length > 0) {
          const topicNames = card.topics.map((topicId) =>
            window.TopicUtils.getTopicName(topicId)
          );
          topicDisplay = topicNames.join(", ");
        }

        row.innerHTML = `
          <td>${card.word}</td>
          <td>${card.translation || ""}</td>
          <td>${card.perevod || ""}</td>
          <td>${card.category || ""}</td>
          <td>${topicDisplay}</td>
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

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    const editModeBtn = document.getElementById("editMode");

    if (this.isEditMode) {
      editModeBtn.textContent = "Finish Edit";
      editModeBtn.classList.remove("secondary-btn");
      editModeBtn.classList.add("primary-btn");
      this.enableTableEditing();
      this.showMessage(
        "Edit mode enabled - modify categories and topics, then click 'Finish Edit'",
        "info"
      );
    } else {
      editModeBtn.textContent = "Edit Mode";
      editModeBtn.classList.remove("primary-btn");
      editModeBtn.classList.add("secondary-btn");
      this.collectEditedWords();
      this.disableTableEditing();
      this.showMessage(
        "Edit mode finished - changes added to Vocabulary Updates",
        "success"
      );
    }
  }

  enableTableEditing() {
    const tableBody = document.getElementById("vocabTableBody");
    if (!tableBody) return;

    // Store original values for comparison later
    this.originalValues = new Map();
    console.log("Enabling table editing and storing original values...");

    // Make table cells editable
    const rows = tableBody.querySelectorAll("tr[data-id]");
    rows.forEach((row) => {
      const cardId = row.dataset.id;
      const cells = row.querySelectorAll("td");

      // Store original values
      const originalCard = this.vocabApp.allCards.find(
        (card) => card.id.toString() === cardId
      );

      const originalData = {
        word: originalCard?.word || cells[0]?.textContent.trim() || "",
        category: cells[3]?.textContent.trim() || "",
        topics: cells[4]?.textContent.trim() || "",
      };

      this.originalValues.set(cardId, originalData);
      console.log(`Stored original values for card ${cardId}:`, originalData);

      cells.forEach((cell, colIndex) => {
        // Only make category (col 3) and topic (col 4) editable
        if (colIndex === 3) {
          // Category column
          this.makeCategoryEditable(cell);
        } else if (colIndex === 4) {
          // Topic column
          this.makeTopicEditable(cell);
        }
      });
    });

    console.log("Original values map:", this.originalValues);
  }

  disableTableEditing() {
    const tableBody = document.getElementById("vocabTableBody");
    if (!tableBody) return;

    // Remove dropdowns and restore original styling
    const selects = tableBody.querySelectorAll("select");
    selects.forEach((select) => {
      const cell = select.parentElement;
      const selectedText = select.options[select.selectedIndex]?.text || "";
      cell.innerHTML = selectedText;
      cell.style.backgroundColor = "";
    });
  }

  makeCategoryEditable(cell) {
    const currentCategory = cell.textContent.trim();
    const categories = this.vocabApp.getUniqueCategories();

    const select = document.createElement("select");
    select.className = "category-select edit-mode";

    // Add categories as options
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
      if (category.toLowerCase() === currentCategory.toLowerCase()) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    cell.innerHTML = "";
    cell.appendChild(select);
  }

  makeTopicEditable(cell) {
    const currentTopicText = cell.textContent.trim();
    const topics = window.TopicUtils.getAllTopics();

    const select = document.createElement("select");
    select.className = "topic-select edit-mode";

    // Add "No Topic" option
    const noTopicOption = document.createElement("option");
    noTopicOption.value = "";
    noTopicOption.textContent = "No Topic";
    if (!currentTopicText) {
      noTopicOption.selected = true;
    }
    select.appendChild(noTopicOption);

    // Add topics as options
    topics.forEach((topic) => {
      const option = document.createElement("option");
      option.value = topic.id;
      option.textContent = topic.name;
      if (currentTopicText.includes(topic.name)) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    cell.innerHTML = "";
    cell.appendChild(select);
  }

  collectEditedWords() {
    const tableBody = document.getElementById("vocabTableBody");
    if (!tableBody || !this.originalValues) {
      console.log("No table body or original values found");
      return;
    }

    console.log("Collecting edited words...");
    console.log("Original values:", this.originalValues);

    const editedWords = [];
    const rows = tableBody.querySelectorAll("tr[data-id]");
    console.log(`Found ${rows.length} rows to check`);

    rows.forEach((row, index) => {
      const cardId = row.dataset.id;
      const originalData = this.originalValues.get(cardId);
      if (!originalData) {
        console.log(`No original data for card ${cardId}`);
        return;
      }

      const categorySelect = row.querySelector(".category-select.edit-mode");
      const topicSelect = row.querySelector(".topic-select.edit-mode");

      if (!categorySelect || !topicSelect) {
        // Skip rows that don't have edit mode selects (they might not be in edit mode)
        return; // Skip this row and continue with the next one
      }

      const newCategory = categorySelect.value;
      const newTopicId = topicSelect.value;
      const newTopicName =
        topicSelect.options[topicSelect.selectedIndex]?.text || "";

      // Normalize category comparison
      const originalCategory = (originalData.category || "")
        .toLowerCase()
        .trim();
      const newCategoryNormalized = (newCategory || "").toLowerCase().trim();

      // Check if category or topic changed
      const categoryChanged = originalCategory !== newCategoryNormalized;

      // More robust topic change detection
      const originalTopicText = originalData.topics || "";
      const topicChanged =
        (newTopicId === "" && originalTopicText !== "") || // Removed topic
        (newTopicId !== "" && !originalTopicText.includes(newTopicName)) || // Added/changed topic
        (newTopicId !== "" &&
          originalTopicText !== "" &&
          !originalTopicText.includes(newTopicName)); // Changed topic

      console.log(`Word ${cardId} (${originalData.word || "unknown"}):`, {
        originalCategory,
        newCategory: newCategoryNormalized,
        categoryChanged,
        originalTopicText,
        newTopicName,
        topicChanged,
        hasChanges: categoryChanged || topicChanged,
      });

      if (categoryChanged || topicChanged) {
        // Find the original card
        const originalCard = this.vocabApp.allCards.find(
          (card) => card.id.toString() === cardId
        );
        if (originalCard) {
          // Create updated word for vocabulary updates
          const updatedWord = {
            id: Date.now() + Math.random(), // Generate unique ID
            word: originalCard.word,
            translation: originalCard.translation || "",
            perevod: originalCard.perevod || "",
            category: newCategory,
            topic: newTopicId,
            topics: newTopicId ? [newTopicId] : [],
            example: originalCard.example || "",
            isEdit: true, // Flag to indicate this is an edit
            originalId: originalCard.id, // Reference to original card
          };

          console.log(
            `Adding edited word: ${originalCard.word} (category: ${originalData.category} → ${newCategory}, topic: ${originalTopicText} → ${newTopicName})`
          );
          editedWords.push(updatedWord);
        }
      }
    });

    // Add edited words to vocabulary updates
    if (editedWords.length > 0) {
      this.vocabApp.vocabularyUpdates = this.vocabApp.vocabularyUpdates || [];
      this.vocabApp.vocabularyUpdates.push(...editedWords);

      // Save to localStorage
      localStorage.setItem(
        "dgt-vocab-vocabulary-updates",
        JSON.stringify(this.vocabApp.vocabularyUpdates)
      );

      // Trigger vocabulary updates table refresh
      const event = new CustomEvent("vocabularyUpdatesChanged");
      document.dispatchEvent(event);

      this.showMessage(
        `${editedWords.length} edited word(s) added to Vocabulary Updates`,
        "success"
      );

      // Show the vocabulary updates section if it's hidden
      const vocabularyUpdatesSection = document.querySelector(
        ".vocabulary-updates-subsection"
      );
      if (vocabularyUpdatesSection) {
        vocabularyUpdatesSection.classList.remove("hidden");
        vocabularyUpdatesSection.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      this.showMessage("No changes detected", "info");
    }

    // Clear stored original values
    this.originalValues = null;
  }
}

// Export for use in other modules
window.CurrentVocabularyManager = CurrentVocabularyManager;
