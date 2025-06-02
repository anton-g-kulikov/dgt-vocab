// Core DGTVocabulary class with essential functionality

class DGTVocabulary {
  constructor() {
    this.allCards = [];
    this.currentCards = [];
    this.currentIndex = 0;
    this.knownCardsSet = new Set();
    this.cardInteractionHistory = {}; // Add this to track interaction timestamps
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

      // Sort cards by last interaction time (oldest first)
      if (this.currentMode === "quiz") {
        this.sortCardsByLastInteraction();
      } else {
        this.shuffleArray(this.currentCards);
      }

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
    const historyData = localStorage.getItem("dgt-vocab-history");

    if (saved) {
      this.knownCardsSet = new Set(JSON.parse(saved));
    }

    if (historyData) {
      this.cardInteractionHistory = JSON.parse(historyData);
    }

    this.updateStats();
  }

  saveProgress() {
    localStorage.setItem(
      "dgt-vocab-progress",
      JSON.stringify([...this.knownCardsSet])
    );

    localStorage.setItem(
      "dgt-vocab-history",
      JSON.stringify(this.cardInteractionHistory)
    );
  }

  // Track interaction with a card
  trackCardInteraction(cardId) {
    this.cardInteractionHistory[cardId] = Date.now();
    this.saveProgress();
  }

  // Sort cards by last interaction time (oldest first) with some randomness
  sortCardsByLastInteraction() {
    // First sort by interaction time (oldest first)
    this.currentCards.sort((a, b) => {
      const timeA = this.cardInteractionHistory[a.id] || 0;
      const timeB = this.cardInteractionHistory[b.id] || 0;
      return timeA - timeB; // Oldest interactions first
    });

    // Then apply a weighted shuffle - cards that are older will tend to stay near
    // the front, but with some randomness to prevent rigid ordering
    this.weightedShuffle(this.currentCards);
  }

  // Weighted shuffle that keeps older cards (those sorted to the front)
  // mostly at the front, but introduces some controlled randomness
  weightedShuffle(array) {
    const length = array.length;
    if (length <= 1) return array;

    // Perform a partial shuffle that's biased toward keeping early elements early
    // and later elements later
    for (let i = 0; i < length; i++) {
      // Calculate a weighted random position that's more likely to be close to i
      // The further we are in the array, the more potential swap range
      const maxOffset = Math.floor(Math.sqrt(i + 1) * 2); // Square root creates a nice curve
      const offset = Math.floor(Math.random() * (maxOffset + 1));

      // Calculate swap position - more likely to be close to current position
      const j = Math.max(
        0,
        Math.min(
          length - 1,
          i - offset + Math.floor(Math.random() * (offset * 2 + 1))
        )
      );

      // Swap elements
      if (i !== j) {
        [array[i], array[j]] = [array[j], array[i]];
      }
    }

    return array;
  }

  // Reset the interaction tracking for all cards or specific cards
  resetCardInteractions(cardIds = null) {
    if (cardIds === null) {
      // Reset all interaction history
      this.cardInteractionHistory = {};
    } else {
      // Reset only specific cards
      cardIds.forEach((id) => {
        delete this.cardInteractionHistory[id];
      });
    }
    this.saveProgress();
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

      // After filtering, sort by interaction time regardless of mode
      // This ensures that both quiz and flashcard modes prioritize oldest cards
      this.sortCardsByLastInteraction();
    }
  }

  setMode(mode) {
    this.currentMode = mode;

    // Sort cards by interaction time when changing modes
    // This ensures we always prioritize oldest cards in both modes
    this.sortCardsByLastInteraction();

    if (window.UIHelpers) {
      window.UIHelpers.setMode(mode);
    }
  }
}

// Make DGTVocabulary available globally
window.DGTVocabulary = DGTVocabulary;
