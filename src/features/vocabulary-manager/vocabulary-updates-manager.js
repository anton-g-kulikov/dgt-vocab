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

    // Listen for global topic selector changes
    document.addEventListener("DOMContentLoaded", () => {
      const globalTopicSelector = document.getElementById(
        "globalTopicSelector"
      );
      if (globalTopicSelector) {
        globalTopicSelector.addEventListener("change", (e) => {
          this.assignGlobalTopicToAllWords(e.target.value);
        });
      }
    });

    // If DOM is already loaded, attach the listener immediately
    if (document.readyState === "loading") {
      // Document still loading, wait for DOMContentLoaded
    } else {
      // Document already loaded
      const globalTopicSelector = document.getElementById(
        "globalTopicSelector"
      );
      if (globalTopicSelector) {
        globalTopicSelector.addEventListener("change", (e) => {
          this.assignGlobalTopicToAllWords(e.target.value);
        });
      }
    }
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

    this.populateGlobalTopicSelector();
    this.populateVocabularyUpdatesTable();
  }

  populateVocabularyUpdatesTable() {
    const tableBody = document.getElementById("vocabularyUpdatesTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    const vocabularyUpdates = this.vocabApp.vocabularyUpdates || [];

    if (vocabularyUpdates.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="7" class="empty-table-message">No vocabulary updates yet. Use the Text Parser to add words for review.</td></tr>';
      return;
    }

    vocabularyUpdates.forEach((word) => {
      const row = document.createElement("tr");
      row.dataset.id = word.id;

      // Get the topic from either word.topic or word.topics[0]
      const wordTopic =
        word.topic ||
        (Array.isArray(word.topics) && word.topics.length > 0
          ? word.topics[0]
          : "");

      console.log(
        `Word: ${word.word}, Topic: ${wordTopic}, Topics Array:`,
        word.topics
      );

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
        <td>
          <select class="topic-select">
            ${this.getTopicOptions(wordTopic)}
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
        ".translation-input, .perevod-input, .category-select, .topic-select, .example-input"
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

  // Assign the selected topic to all words in the vocabulary updates table
  assignGlobalTopicToAllWords(topicValue) {
    console.log("Assigning global topic:", topicValue);

    // Don't do anything if there are no vocabulary updates
    if (
      !this.vocabApp.vocabularyUpdates ||
      this.vocabApp.vocabularyUpdates.length === 0
    ) {
      console.log("No vocabulary updates to update");
      return;
    }

    console.log(
      "Before update:",
      JSON.stringify(this.vocabApp.vocabularyUpdates[0])
    );

    // Update all words with the selected topic
    this.vocabApp.vocabularyUpdates.forEach((word) => {
      this.updateTopicDataStructure(word, topicValue);
    });

    console.log(
      "After update:",
      JSON.stringify(this.vocabApp.vocabularyUpdates[0])
    );

    // Save to localStorage
    localStorage.setItem(
      "dgt-vocab-vocabulary-updates",
      JSON.stringify(this.vocabApp.vocabularyUpdates)
    );

    // Refresh the table to reflect the changes
    this.populateVocabularyUpdatesTable();

    // Show a success message
    this.showMessage("Topic assigned to all words successfully!", "success");
  }

  // Get topic options similar to category options
  getTopicOptions(selectedTopic) {
    console.log("Getting topic options for:", selectedTopic);

    // Get topic list
    let topics = [];
    if (window.TopicUtils && window.TopicUtils.getAllTopics) {
      // getAllTopics returns objects with id and name, but we need simple id strings
      const topicObjects = window.TopicUtils.getAllTopics();
      topics = topicObjects.map((topic) => topic.id);
      console.log("Got topics from TopicUtils:", topics);
    } else {
      // Fallback to default topics
      topics = [
        "topic01",
        "topic02",
        "topic03",
        "topic04",
        "topic05",
        "topic06",
        "topic07",
        "topic08",
        "topic09",
        "topic10",
        "topic11",
        "topic12",
        "topic13",
      ];
      console.log("Using fallback topic IDs:", topics);
    }

    // Always include "safety" (topic11) if needed
    if (!topics.includes("topic11")) {
      topics.push("topic11");
    }

    console.log("Available topics:", topics);

    // Build the HTML for the topic options
    return (
      `<option value="" ${
        !selectedTopic ? "selected" : ""
      }>No Topic (Optional)</option>` +
      topics
        .map((topicId) => {
          // Get the human-readable topic name
          const topicName =
            window.TopicUtils && window.TopicUtils.getTopicName
              ? window.TopicUtils.getTopicName(topicId)
              : topicId;

          return `<option value="${topicId}" ${
            topicId === selectedTopic ? "selected" : ""
          }>
        ${topicName}
      </option>`;
        })
        .join("")
    );
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
      const topic = row.querySelector(".topic-select").value;
      const example = row.querySelector(".example-input").value.trim();

      const wordIndex = this.vocabApp.vocabularyUpdates.findIndex(
        (word) => word.id === id
      );
      if (wordIndex !== -1) {
        this.vocabApp.vocabularyUpdates[wordIndex].translation = translation;
        this.vocabApp.vocabularyUpdates[wordIndex].perevod = perevod;
        this.vocabApp.vocabularyUpdates[wordIndex].category = category;

        // Update topic using our helper method
        this.updateTopicDataStructure(
          this.vocabApp.vocabularyUpdates[wordIndex],
          topic
        );

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
      const topic = row.querySelector(".topic-select").value;
      const example = row.querySelector(".example-input").value.trim();

      const wordIndex = this.vocabApp.vocabularyUpdates.findIndex(
        (word) => word.id === id
      );
      if (wordIndex !== -1) {
        this.vocabApp.vocabularyUpdates[wordIndex].translation = translation;
        this.vocabApp.vocabularyUpdates[wordIndex].perevod = perevod;
        this.vocabApp.vocabularyUpdates[wordIndex].category = category;

        // Update topic using our helper method
        this.updateTopicDataStructure(
          this.vocabApp.vocabularyUpdates[wordIndex],
          topic
        );

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
  } // Populate the global topic selector with available topics
  populateGlobalTopicSelector() {
    console.log("Populating global topic selector");
    const globalTopicSelector = document.getElementById("globalTopicSelector");
    if (!globalTopicSelector) {
      console.log("Global topic selector not found");
      return;
    }

    // Clear existing options except the first one (No Topic)
    while (globalTopicSelector.options.length > 1) {
      globalTopicSelector.remove(1);
    }

    // Get topic list
    let topics = [];
    if (window.TopicUtils && window.TopicUtils.getAllTopics) {
      // Get topic objects from TopicUtils
      const topicObjects = window.TopicUtils.getAllTopics();
      console.log("Got topic objects from TopicUtils:", topicObjects);

      // Add topic options
      topicObjects.forEach((topicObj) => {
        const option = document.createElement("option");
        option.value = topicObj.id; // Use the topic ID as value
        option.textContent = topicObj.name; // Use the human-readable name for display
        globalTopicSelector.appendChild(option);
      });
    } else {
      // Fallback to default topics
      const defaultTopics = [
        { id: "topic01", name: "Definitions of road users" },
        { id: "topic02", name: "Vehicles and basic mechanics" },
        { id: "topic11", name: "Safety" },
        { id: "topic12", name: "Emergencies" },
      ];

      // Add topic options
      defaultTopics.forEach((topicObj) => {
        const option = document.createElement("option");
        option.value = topicObj.id;
        option.textContent = topicObj.name;
        globalTopicSelector.appendChild(option);
      });

      console.log("Using fallback topics");
    }

    console.log("Global topic selector populated");
  }

  // Helper method to ensure topic data is correctly stored in both formats
  updateTopicDataStructure(wordData, topicValue) {
    // Update the individual topic field (string)
    wordData.topic = topicValue;

    // Also update the topics array for compatibility with the vocabulary system
    if (topicValue) {
      wordData.topics = [topicValue]; // Set as array with the selected topic
      console.log(
        `Updated word with topic ${topicValue} and topics array:`,
        wordData.topics
      );
    } else {
      wordData.topics = []; // Empty array if no topic selected
      console.log(`Cleared topics for word`);
    }

    return wordData;
  }
}

// Export for use in other modules
window.VocabularyUpdatesManager = VocabularyUpdatesManager;
