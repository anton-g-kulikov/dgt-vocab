// Vocabulary Updates Manager - Handles the vocabulary updates table and operations
class VocabularyUpdatesManager {
  constructor(vocabApp, showMessage) {
    this.vocabApp = vocabApp;
    this.showMessage = showMessage;
    this.setupEventListeners();
    this.initializeVocabularyUpdates();
  }

  setupEventListeners() {
    // Listen for vocabulary updates changes
    document.addEventListener("vocabularyUpdatesChanged", () => {
      this.populateVocabularyUpdatesTable();
    });
  }

  initializeVocabularyUpdates() {
    // Initialize vocabulary updates from localStorage or create empty array
    try {
      const savedUpdates = localStorage.getItem("dgt-vocab-vocabulary-updates");
      this.vocabApp.vocabularyUpdates = savedUpdates
        ? JSON.parse(savedUpdates)
        : [];
    } catch (error) {
      console.error(
        "Error loading vocabulary updates from localStorage:",
        error
      );
      this.vocabApp.vocabularyUpdates = [];
    }

    this.populateVocabularyUpdatesTable();
  }

  populateVocabularyUpdatesTable() {
    const tableBody = document.getElementById("vocabularyUpdatesTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    const vocabularyUpdates = this.vocabApp.vocabularyUpdates || [];

    if (vocabularyUpdates.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="6" class="empty-table-message">No vocabulary updates yet. Use the Text Parser to add words for review.</td></tr>';
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
        <td><input type="text" class="perevod-input" value="${
          word.perevod || ""
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

    // Add event listeners for deleting words
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = parseInt(e.target.dataset.id);
        this.vocabApp.vocabularyUpdates =
          this.vocabApp.vocabularyUpdates.filter((word) => word.id !== id);
        e.target.closest("tr").remove();

        // Save to localStorage after deletion
        localStorage.setItem(
          "dgt-vocab-vocabulary-updates",
          JSON.stringify(this.vocabApp.vocabularyUpdates)
        );
      });
    });

    // Add auto-save for inputs (with debounce)
    let saveTimeout;
    const debounceSave = () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => this.updateVocabularyUpdatesFromUI(), 500);
    };

    // Add event listeners for inputs and selects
    document
      .querySelectorAll(
        ".translation-input, .perevod-input, .category-select, .example-input"
      )
      .forEach((element) => {
        element.addEventListener("input", debounceSave);
        element.addEventListener("change", debounceSave);
      });
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

  // Update vocabulary updates from the current UI state
  updateVocabularyUpdatesFromUI() {
    const rows = document.querySelectorAll(
      "#vocabularyUpdatesTableBody tr[data-id]"
    );

    rows.forEach((row) => {
      const id = parseInt(row.dataset.id);
      const translation = row.querySelector(".translation-input").value.trim();
      const perevod = row.querySelector(".perevod-input").value.trim();
      const category = row.querySelector(".category-select").value;
      const example = row.querySelector(".example-input").value.trim();

      const wordIndex = this.vocabApp.vocabularyUpdates.findIndex(
        (word) => word.id === id
      );
      if (wordIndex !== -1) {
        this.vocabApp.vocabularyUpdates[wordIndex].translation = translation;
        this.vocabApp.vocabularyUpdates[wordIndex].perevod = perevod;
        this.vocabApp.vocabularyUpdates[wordIndex].category = category;
        this.vocabApp.vocabularyUpdates[wordIndex].example = example;
      }
    });

    // Save updated vocabulary updates to localStorage
    localStorage.setItem(
      "dgt-vocab-vocabulary-updates",
      JSON.stringify(this.vocabApp.vocabularyUpdates)
    );
  }

  // Update a specific row in the vocabulary updates table
  updateTranslationInTable(wordId, englishTranslation, russianTranslation) {
    const row = document.querySelector(
      `#vocabularyUpdatesTableBody tr[data-id="${wordId}"]`
    );
    if (!row) return;

    const translationInput = row.querySelector(".translation-input");
    const perevodInput = row.querySelector(".perevod-input");

    if (translationInput && englishTranslation) {
      translationInput.value = englishTranslation;
      // Add visual feedback for successful translation
      if (!englishTranslation.includes("❌")) {
        translationInput.style.backgroundColor = "#e8f5e8";
        setTimeout(() => {
          translationInput.style.backgroundColor = "";
        }, 2000);
      } else {
        translationInput.style.backgroundColor = "#ffe8e8";
      }
    }

    if (perevodInput && russianTranslation) {
      perevodInput.value = russianTranslation;
      // Add visual feedback for successful translation
      if (!russianTranslation.includes("❌")) {
        perevodInput.style.backgroundColor = "#e8f5e8";
        setTimeout(() => {
          perevodInput.style.backgroundColor = "";
        }, 2000);
      } else {
        perevodInput.style.backgroundColor = "#ffe8e8";
      }
    }
  }

  saveVocabularyUpdatesChanges() {
    const rows = document.querySelectorAll(
      "#vocabularyUpdatesTableBody tr[data-id]"
    );

    rows.forEach((row) => {
      const id = parseInt(row.dataset.id);
      const translation = row.querySelector(".translation-input").value.trim();
      const perevod = row.querySelector(".perevod-input").value.trim();
      const category = row.querySelector(".category-select").value;
      const example = row.querySelector(".example-input").value.trim();

      const wordIndex = this.vocabApp.vocabularyUpdates.findIndex(
        (word) => word.id === id
      );
      if (wordIndex !== -1) {
        this.vocabApp.vocabularyUpdates[wordIndex].translation = translation;
        this.vocabApp.vocabularyUpdates[wordIndex].perevod = perevod;
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

    // Trigger current vocabulary table refresh
    const event = new CustomEvent("currentVocabularyChanged");
    document.dispatchEvent(event);

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
}

// Export for use in other modules
window.VocabularyUpdatesManager = VocabularyUpdatesManager;
