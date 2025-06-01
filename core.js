// Core DGTVocabulary class with essential functionality

class DGTVocabulary {
  constructor() {
    this.allCards = [];
    this.currentCards = [];
    this.currentIndex = 0;
    this.knownCardsSet = new Set();
    this.currentMode = "flashcard";
    this.selectedCategory = "all";

    this.init();
  }

  // Initialization
  init() {
    this.loadFlashcards();

    // Only set up event listeners if we're on the main page
    if (!window.isVocabManagerPage) {
      this.setupEventListeners();
    }
  }

  setupEventListeners() {
    // Event listeners are minimal here, most are handled in specific modules
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
        console.error(
          "Vocabulary data not found. Make sure vocabulary.js is loaded."
        );
        document.getElementById("spanishWord").textContent =
          "Vocabulary data not found";
        return;
      }

      // Initialize other modules first
      if (window.CategoryManager) {
        this.categoryManager = new window.CategoryManager(this);
      }
      if (window.StatsManager) {
        this.statsManager = new window.StatsManager(this);
      }
      if (window.FlashcardMode) {
        this.flashcardMode = new window.FlashcardMode(this);
      }
      if (window.QuizMode) {
        this.quizMode = new window.QuizMode(this);
      }

      // Load progress first
      this.loadProgress();

      // Start with unknown cards only (default mode) - after loading progress
      this.currentCards = this.allCards.filter(
        (card) => !this.knownCardsSet.has(card.id)
      );
      this.shuffleArray(this.currentCards);

      // Initialize the toggle button state
      if (this.flashcardMode) {
        this.flashcardMode.updateToggleButton();
      }

      this.updateStats();
      this.showCurrentCard();
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

  // Get unique categories from all cards
  getUniqueCategories() {
    const categories = new Set();
    this.allCards.forEach((card) => {
      if (card.category) {
        categories.add(card.category.toLowerCase());
      }
    });

    // Only return categories that actually exist in the data
    // Don't add default categories if they don't have any words
    return Array.from(categories).sort();
  }

  resetProgress() {
    if (confirm("Are you sure you want to reset all progress?")) {
      this.knownCardsSet.clear();
      localStorage.removeItem("dgt-vocab-progress");
      this.updateStats();
    }
  }

  // Delegate methods to modules
  updateStats() {
    if (this.statsManager) {
      this.statsManager.updateStats();
    }
  }

  showCurrentCard() {
    if (this.flashcardMode) {
      this.flashcardMode.showCurrentCard();
    }
  }

  filterCards() {
    if (this.categoryManager) {
      this.categoryManager.filterCards();
    }
  }

  setMode(mode) {
    this.currentMode = mode;
    if (window.UIHelpers) {
      window.UIHelpers.setMode(mode);
    }
  }
}

// Make DGTVocabulary available globally
window.DGTVocabulary = DGTVocabulary;
