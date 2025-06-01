// Spanish DGT Vocabulary Flashcards - Main Application

class DGTVocabulary {
  constructor() {
    this.allCards = [];
    this.currentCards = [];
    this.currentIndex = 0;
    this.knownCardsSet = new Set();
    this.currentMode = "flashcard";
    this.isFlipped = false;
    this.quizScore = 0;
    this.quizTotal = 0;

    this.init();
  }

  // Initialization
  init() {
    this.loadFlashcards();
    this.setupEventListeners();
  }

  setupEventListeners() {
    document
      .getElementById("categoryFilter")
      .addEventListener("change", () => this.filterCards());

    document.getElementById("addWordForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.addNewWord();
    });
  }

  // Data Loading
  loadFlashcards() {
    try {
      // Use embedded vocabulary data
      if (typeof window.vocabularyData !== "undefined") {
        this.allCards = window.vocabularyData.map((card, index) => ({
          id: index,
          word: card.word || "",
          translation: card.translation || "",
          category: card.category || "",
          example: card.example || "",
        }));
      } else {
        // Fallback if vocabulary.js is not loaded
        console.error(
          "Vocabulary data not found. Make sure vocabulary.js is loaded."
        );
        document.getElementById("spanishWord").textContent =
          "Vocabulary data not found";
        return;
      }

      this.currentCards = [...this.allCards];
      this.shuffleArray(this.currentCards);

      // Populate category filter dropdown with actual categories from database
      this.populateCategoryFilter();

      this.updateStats();
      this.showCurrentCard();

      // Load progress from localStorage
      this.loadProgress();
    } catch (error) {
      console.error("Error loading flashcards:", error);
      document.getElementById("spanishWord").textContent =
        "Error loading cards";
    }
  }

  loadProgress() {
    const saved = localStorage.getItem("dgt-vocab-progress");
    if (saved) {
      this.knownCardsSet = new Set(JSON.parse(saved));
      this.updateStats();
    }
  }

  saveProgress() {
    localStorage.setItem(
      "dgt-vocab-progress",
      JSON.stringify([...this.knownCardsSet])
    );
  }

  // Utility Functions
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Card Management
  filterCards() {
    const category = document.getElementById("categoryFilter").value;
    this.currentCards =
      category === "all"
        ? [...this.allCards]
        : this.allCards.filter((card) => card.category === category);

    this.shuffleArray(this.currentCards);
    this.currentIndex = 0;
    this.updateStats();
    this.showCurrentCard();
  }

  // New method for drilling unknown cards
  drillUnknowns() {
    // Filter to include only cards that aren't in the knownCardsSet
    this.currentCards = this.allCards.filter(
      (card) => !this.knownCardsSet.has(card.id)
    );

    if (this.currentCards.length === 0) {
      alert("You don't have any unknown cards yet!");
      this.currentCards = [...this.allCards]; // Reset to all cards if none are unknown
    } else {
      // Provide feedback to user
      this.showMessage(
        `Drilling ${this.currentCards.length} unknown cards`,
        "success"
      );
      setTimeout(() => this.clearMessages(), 2000); // Clear after 2 seconds
    }

    this.shuffleArray(this.currentCards);
    this.currentIndex = 0;
    this.updateStats();
    this.showCurrentCard();
  }

  shuffleCards() {
    this.shuffleArray(this.currentCards);
    this.currentIndex = 0;
    this.showCurrentCard();
  }

  showCurrentCard() {
    if (this.currentCards.length === 0) {
      document.getElementById("spanishWord").textContent = "No cards available";
      return;
    }

    const card = this.currentCards[this.currentIndex];
    document.getElementById("spanishWord").textContent = card.word;
    document.getElementById("category").textContent = card.category;
    document.getElementById("translation").textContent = card.translation;
    document.getElementById("example").textContent = card.example;

    // Card flip is now reset in nextCard() before showing the new card
    this.updateStats();
  }

  flipCard() {
    const flashcard = document.getElementById("flashcard");
    flashcard.classList.toggle("flipped");
    this.isFlipped = !this.isFlipped;
  }

  markCard(known) {
    const card = this.currentCards[this.currentIndex];

    if (known) {
      this.knownCardsSet.add(card.id);
      this.saveProgress();

      // If card is not flipped, flip it to show translation
      if (!this.isFlipped) {
        this.flipCard();
      }

      // Wait 1.5 seconds before showing the next card when user knows the word
      setTimeout(() => {
        this.nextCard();
      }, 1500);
    } else {
      this.knownCardsSet.delete(card.id);
      this.saveProgress();

      // If card is not flipped, flip it to show translation
      if (!this.isFlipped) {
        this.flipCard();
      }

      // Wait 2 seconds before showing the next card
      setTimeout(() => {
        this.nextCard();
      }, 2000);
    }
  }

  nextCard() {
    // First reset the card to front side to avoid showing the next translation briefly
    if (this.isFlipped) {
      // Reset card flip before changing index
      document.getElementById("flashcard").classList.remove("flipped");
      this.isFlipped = false;
    }

    // Small delay to ensure the card is flipped back before changing content
    setTimeout(() => {
      this.currentIndex = (this.currentIndex + 1) % this.currentCards.length;
      this.showCurrentCard();
    }, 100);
  }

  updateStats() {
    const totalCards = this.allCards.length;
    const knownCards = this.knownCardsSet.size;
    const unknownCards = totalCards - knownCards;

    document.getElementById("totalCards").textContent =
      this.currentCards.length;
    document.getElementById("currentCard").textContent = this.currentIndex + 1;
    document.getElementById("knownCards").textContent = knownCards;
    document.getElementById("unknownCards").textContent = unknownCards;

    const progress =
      this.currentCards.length > 0
        ? (this.knownCardsSet.size / this.allCards.length) * 100
        : 0;
    document.getElementById("progressFill").style.width = progress + "%";
  }

  resetProgress() {
    if (confirm("Are you sure you want to reset all progress?")) {
      this.knownCardsSet.clear();
      localStorage.removeItem("dgt-vocab-progress");
      this.updateStats();
    }
  }

  // Text Parser Functionality
  initTextParser() {
    // Setup tab switching
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

    document.getElementById("analyzeTextBtn").addEventListener("click", () => {
      this.analyzeText();
    });

    document
      .getElementById("addSelectedWordsBtn")
      .addEventListener("click", () => {
        this.addSelectedWords();
      });
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
      this.showMessage("No new words found in the text", "info");
      return;
    }

    // Display the results
    this.showParsingResults(newWords);
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
    };
  }

  filterNewWords(words) {
    // Check against existing vocabulary
    return words.filter(
      (wordObj) =>
        !this.allCards.some(
          (card) => card.word.toLowerCase() === wordObj.word.toLowerCase()
        )
    );
  }

  showParsingResults(words) {
    const container = document.getElementById("extractedWords");
    container.innerHTML = "";

    if (words.length === 0) {
      container.innerHTML = "<p>No new words found.</p>";
      return;
    }

    words.forEach((wordObj) => {
      const wordItem = document.createElement("div");
      wordItem.className = "word-item";
      wordItem.innerHTML = `
        <label>
          <input type="checkbox" value="${wordObj.word}" data-category="${wordObj.category}" checked>
          <span class="spanish-word">${wordObj.word}</span>
          <span class="category">${wordObj.category}</span>
        </label>
      `;
      container.appendChild(wordItem);
    });

    document.getElementById("parsingResults").classList.remove("hidden");
  }

  addSelectedWords() {
    const checkboxes = document.querySelectorAll(
      '#extractedWords input[type="checkbox"]:checked'
    );
    if (checkboxes.length === 0) {
      this.showMessage("Please select at least one word to add", "error");
      return;
    }

    let addedCount = 0;

    checkboxes.forEach((checkbox) => {
      const word = checkbox.value;
      const category = checkbox.dataset.category;

      // Create a basic word entry
      const newCard = {
        id: this.allCards.length + addedCount,
        word: word,
        translation: "", // User needs to fill this in
        category: category,
        example: document.getElementById("textToAnalyze").value.trim(), // Use the original text as example
      };

      // Add to allCards
      this.allCards.push(newCard);
      addedCount++;
    });

    if (addedCount > 0) {
      // Save to localStorage
      localStorage.setItem("dgt-vocab-cards", JSON.stringify(this.allCards));

      // Show success message
      this.showMessage(
        `Added ${addedCount} words to your vocabulary. Please complete their translations.`,
        "success"
      );

      // Reset and hide the parsing results
      document.getElementById("textToAnalyze").value = "";
      document.getElementById("parsingResults").classList.add("hidden");

      // Update the filter dropdown with new categories
      this.populateCategoryFilter();

      // Return to the regular add word form but show the added words
      this.showVocabManagement();
    }
  }

  showVocabManagement() {
    // This would be a new feature to show and manage the vocabulary words
    // For now, just redirect to the flashcard mode
    this.setMode("flashcard");
  }

  // Mode Management
  setMode(mode) {
    this.currentMode = mode;

    // Update mode buttons
    document
      .querySelectorAll(".mode-btn")
      .forEach((btn) => btn.classList.remove("active"));
    event.target.classList.add("active");

    // Show/hide appropriate sections
    if (mode === "flashcard") {
      document.getElementById("flashcardMode").classList.remove("hidden");
      document.getElementById("quizMode").classList.add("hidden");
      document.getElementById("addWordMode").classList.add("hidden");
    } else if (mode === "quiz") {
      document.getElementById("flashcardMode").classList.add("hidden");
      document.getElementById("quizMode").classList.remove("hidden");
      document.getElementById("addWordMode").classList.add("hidden");
      this.startQuiz();
    } else if (mode === "add") {
      document.getElementById("flashcardMode").classList.add("hidden");
      document.getElementById("quizMode").classList.add("hidden");
      document.getElementById("addWordMode").classList.remove("hidden");
      this.populateCategoryDropdown();
      this.initTextParser(); // Initialize the text parser when entering add mode
    }
  }

  // Populate the category filter dropdown with actual categories
  populateCategoryFilter() {
    const categoryFilter = document.getElementById("categoryFilter");
    categoryFilter.innerHTML = ""; // Clear existing options

    // Always add "All Categories" option first
    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All Categories";
    categoryFilter.appendChild(allOption);

    // Get and add all unique categories from vocabulary
    this.getUniqueCategories().forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category.charAt(0).toUpperCase() + category.slice(1); // Capitalize first letter
      categoryFilter.appendChild(option);
    });
  }

  // Get unique categories from all cards
  getUniqueCategories() {
    const categories = new Set();
    this.allCards.forEach((card) => {
      if (card.category) {
        categories.add(card.category.toLowerCase());
      }
    });

    // Always include common categories if not already present
    ["noun", "verb", "adjective", "adverb", "other"].forEach((cat) => {
      categories.add(cat);
    });

    return Array.from(categories).sort();
  }

  // Populate the category dropdown in the add word form
  populateCategoryDropdown() {
    const categorySelect = document.getElementById("newCategory");
    categorySelect.innerHTML = ""; // Clear existing options

    // Add default option
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select category";
    categorySelect.appendChild(defaultOption);

    // Add categories from vocabulary
    this.getUniqueCategories().forEach((category) => {
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

  // Add New Word Functionality
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

    // Enhanced duplicate word check
    if (newWord) {
      const existingCard = this.allCards.find(
        (card) => card.word.toLowerCase() === newWord.toLowerCase()
      );

      if (existingCard) {
        this.showFieldError(
          "newSpanishWord",
          `This word already exists as "${existingCard.word}" (${existingCard.translation})`
        );
        hasErrors = true;

        // Show more detailed error message about the duplicate
        this.showMessage(
          `"${newWord}" already exists in your vocabulary as "${existingCard.word}" with translation "${existingCard.translation}" in category "${existingCard.category}".`,
          "error"
        );
      }
    }

    if (hasErrors) {
      if (!document.querySelector(".error-message")) {
        this.showMessage("Please fix the errors above.", "error");
      }
      return;
    }

    // Create new card object
    const newCard = {
      id: this.allCards.length,
      word: newWord,
      translation: newTranslation,
      category: newCategory.toLowerCase(),
      example: newExample,
    };

    // Add to allCards and currentCards
    this.allCards.push(newCard);
    this.currentCards.push(newCard);

    // Shuffle currentCards and show the new card
    this.shuffleArray(this.currentCards);
    this.currentIndex = 0;
    this.showCurrentCard();

    // Save to localStorage
    localStorage.setItem("dgt-vocab-cards", JSON.stringify(this.allCards));

    // Clear input fields
    document.getElementById("addWordForm").reset();

    // Show success message
    this.showMessage(`"${newWord}" has been added successfully!`, "success");

    // Update stats
    this.updateStats();

    // After 2 seconds, switch back to flashcard mode
    setTimeout(() => {
      this.setMode("flashcard");
    }, 2000);
  }

  cancelAddWord() {
    // Clear form and messages
    document.getElementById("addWordForm").reset();
    this.clearMessages();
    this.clearFieldErrors();
    this.setMode("flashcard");
  }

  // UI Helper Functions
  showMessage(text, type) {
    const messageContainer = document.getElementById("messageContainer");
    messageContainer.innerHTML = `<div class="${type}-message">${text}</div>`;

    // Ensure the message is visible
    messageContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  clearMessages() {
    document.getElementById("messageContainer").innerHTML = "";
  }

  showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    field.classList.add("error");
    field.placeholder = message;
  }

  clearFieldErrors() {
    document.querySelectorAll("input.error").forEach((field) => {
      field.classList.remove("error");
      // Restore original placeholders
      const placeholders = {
        newSpanishWord: "e.g., aparcamiento",
        newTranslation: "e.g., parking",
        newCategory: "e.g., noun, verb, adjective",
        newExample: "e.g., El aparcamiento está lleno.",
      };
      field.placeholder = placeholders[field.id] || "";
    });
  }

  // Quiz Functionality
  startQuiz() {
    if (this.currentCards.length < 4) {
      alert("Need at least 4 cards for quiz mode");
      return;
    }

    this.quizScore = 0;
    this.quizTotal = 0;
    this.nextQuizQuestion();
  }

  nextQuizQuestion() {
    if (this.currentCards.length < 4) return;

    const correctCard =
      this.currentCards[Math.floor(Math.random() * this.currentCards.length)];
    const options = [correctCard];

    // Add 3 random wrong options
    while (options.length < 4) {
      const randomCard =
        this.allCards[Math.floor(Math.random() * this.allCards.length)];
      if (
        !options.find((card) => card.translation === randomCard.translation)
      ) {
        options.push(randomCard);
      }
    }

    this.shuffleArray(options);

    document.getElementById(
      "quizQuestion"
    ).textContent = `What does "${correctCard.word}" mean?`;

    const optionsContainer = document.getElementById("quizOptions");
    optionsContainer.innerHTML = ""; // Clear existing options

    // Create and append each option
    options.forEach((option) => {
      const div = document.createElement("div");
      div.className = "quiz-option";
      div.textContent = option.translation;
      div.onclick = () =>
        this.selectQuizOption(div, option.id === correctCard.id);
      optionsContainer.appendChild(div);
    });

    document.getElementById("nextQuizBtn").style.display = "none";

    // Make sure the quiz options are visible
    optionsContainer.style.display = "flex";
    optionsContainer.style.flexDirection = "column";
    optionsContainer.style.gap = "10px";
  }

  selectQuizOption(element, isCorrect) {
    this.quizTotal++;

    // Disable all options
    document.querySelectorAll(".quiz-option").forEach((opt) => {
      opt.onclick = null;
      if (opt === element) {
        opt.classList.add(isCorrect ? "correct" : "wrong");
      }
    });

    if (isCorrect) {
      this.quizScore++;
    }

    document.getElementById("nextQuizBtn").style.display = "block";

    // Update question to show score
    document.getElementById("quizQuestion").textContent = `${
      isCorrect ? "Correct!" : "Wrong!"
    } Score: ${this.quizScore}/${this.quizTotal}`;
  }
}

// Global instance and functions for backward compatibility
let vocabApp;

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  vocabApp = new DGTVocabulary();
});

// Global functions for HTML onclick handlers
function flipCard() {
  vocabApp.flipCard();
}

function markCard(known) {
  vocabApp.markCard(known);
}

function setMode(mode) {
  vocabApp.setMode(mode);
}

function shuffleCards() {
  vocabApp.shuffleCards();
}

function resetProgress() {
  vocabApp.resetProgress();
}

function nextQuizQuestion() {
  vocabApp.nextQuizQuestion();
}

function cancelAddWord() {
  vocabApp.cancelAddWord();
}

// Add global function for HTML button
function drillUnknowns() {
  vocabApp.drillUnknowns();
}
