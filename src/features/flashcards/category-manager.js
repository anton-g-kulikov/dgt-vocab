// Category filtering and management functionality

class CategoryManager {
  constructor(vocabApp) {
    this.vocabApp = vocabApp;
    this.populateCategoryFilter();
  }

  populateCategoryFilter() {
    const categoryButtonsContainer = document.getElementById("categoryButtons");
    if (!categoryButtonsContainer) return;

    categoryButtonsContainer.innerHTML = "";

    // Create "All Categories" button first
    const allButton = document.createElement("button");
    allButton.className = "category-btn active";
    allButton.textContent = "All Categories";
    allButton.dataset.category = "all";
    allButton.onclick = () => this.selectCategory("all", allButton);
    categoryButtonsContainer.appendChild(allButton);

    // Get categories that actually have words in them
    const categoriesWithWords = this.getCategoriesWithWords();

    categoriesWithWords.forEach((category) => {
      const button = document.createElement("button");
      button.className = "category-btn";
      button.textContent =
        category.charAt(0).toUpperCase() + category.slice(1) + "s"; // Pluralize category titles
      button.dataset.category = category;
      button.onclick = () => this.selectCategory(category, button);
      categoryButtonsContainer.appendChild(button);
    });
  }

  getCategoriesWithWords() {
    // Count words in each category
    const categoryCounts = {};

    this.vocabApp.allCards.forEach((card) => {
      const category = (card.category || "other").toLowerCase();
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    // Return only categories that have at least one word, sorted alphabetically
    return Object.keys(categoryCounts)
      .filter((category) => categoryCounts[category] > 0)
      .sort();
  }

  selectCategory(category, clickedButton) {
    // Remove active class from all category buttons
    document.querySelectorAll(".category-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    // Add active class to clicked button
    clickedButton.classList.add("active");

    // Store the selected category
    this.vocabApp.selectedCategory = category;

    // Apply the filter
    this.filterCards();
  }

  filterCards() {
    const category = this.vocabApp.selectedCategory || "all";

    // First apply category filter
    let filteredCards =
      category === "all"
        ? [...this.vocabApp.allCards]
        : this.vocabApp.allCards.filter((card) => card.category === category);

    // Reset flashcard to front side when switching categories
    const flashcard = document.getElementById("flashcard");
    if (flashcard && flashcard.classList.contains("flipped")) {
      flashcard.classList.remove("flipped");
      if (this.vocabApp.flashcardMode) {
        this.vocabApp.flashcardMode.isFlipped = false;
      }
    }

    // Apply filtering based on current toggle state
    if (
      this.vocabApp.flashcardMode &&
      this.vocabApp.flashcardMode.showingAllCards
    ) {
      // Show all cards in category
      this.vocabApp.currentCards = filteredCards;
    } else {
      // Show only unknown cards (default mode)
      this.vocabApp.currentCards = filteredCards.filter(
        (card) => !this.vocabApp.knownCardsSet.has(card.id)
      );
    }

    // Update the toggle button to reflect current state
    if (this.vocabApp.flashcardMode) {
      this.vocabApp.flashcardMode.updateToggleButton();
    }

    // If no unknown cards remain and we're in unknown-only mode, show success card
    if (
      this.vocabApp.currentCards.length === 0 &&
      (!this.vocabApp.flashcardMode ||
        !this.vocabApp.flashcardMode.showingAllCards)
    ) {
      const categoryText = category === "all" ? "" : ` in ${category} category`;

      if (this.vocabApp.flashcardMode) {
        this.vocabApp.flashcardMode.showSuccessCard(categoryText);
      }

      // Reset to show all cards in the category after showing success
      setTimeout(() => {
        this.vocabApp.currentCards = filteredCards;
        if (this.vocabApp.flashcardMode) {
          this.vocabApp.flashcardMode.showingAllCards = true;
          this.vocabApp.flashcardMode.updateToggleButton();
        }
        this.vocabApp.shuffleArray(this.vocabApp.currentCards);
        this.vocabApp.currentIndex = 0;
        this.vocabApp.updateStats();
        this.vocabApp.showCurrentCard();
        this.updateCategoryInfo();
        this.refreshCurrentMode();
      }, 5000);
      return;
    }

    // Always shuffle cards when changing categories
    this.vocabApp.shuffleArray(this.vocabApp.currentCards);
    this.vocabApp.currentIndex = 0;
    this.vocabApp.updateStats();
    this.vocabApp.showCurrentCard();

    // Update category info display
    this.updateCategoryInfo();

    // Refresh the current mode
    this.refreshCurrentMode();
  }

  updateCategoryInfo() {
    const categoryInfo = document.getElementById("categoryInfo");

    if (categoryInfo) {
      const selectedCategory = this.vocabApp.selectedCategory || "all";
      if (selectedCategory === "all") {
        categoryInfo.textContent = "All Categories";
      } else {
        const categoryName =
          selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
        categoryInfo.textContent = `${categoryName} Only`;
      }
    }
  }

  refreshCurrentMode() {
    if (this.vocabApp.currentMode === "quiz") {
      if (this.vocabApp.quizMode) {
        this.vocabApp.quizMode.startQuiz();
      }
    } else if (this.vocabApp.currentMode === "flashcard") {
      this.vocabApp.showCurrentCard();
    }
  }
}

// Make CategoryManager available globally
window.CategoryManager = CategoryManager;
