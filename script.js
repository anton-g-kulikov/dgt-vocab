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

    // Only set up event listeners if we're on the main page
    if (!window.isVocabManagerPage) {
      this.setupEventListeners();
    }
  }

  setupEventListeners() {
    // Category filter will be handled by dynamically created buttons
    // Removed categoryFilter event listener as it's now handled by buttons
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
    // Use the stored selected category instead of reading from dropdown
    const category = this.selectedCategory || "all";

    // First apply category filter
    let filteredCards =
      category === "all"
        ? [...this.allCards]
        : this.allCards.filter((card) => card.category === category);

    // Then filter out known cards to show only unknown cards
    this.currentCards = filteredCards.filter(
      (card) => !this.knownCardsSet.has(card.id)
    );

    // If no unknown cards remain, show success card and reset to all cards in category
    if (this.currentCards.length === 0) {
      const categoryText = category === "all" ? "" : ` in ${category} category`;

      // Show success card instead of alert
      this.showSuccessCard(categoryText);

      // Reset to show all cards in the category (including known ones) after showing success
      setTimeout(() => {
        this.currentCards = filteredCards;
        this.shuffleArray(this.currentCards);
        this.currentIndex = 0;
        this.updateStats();
        this.showCurrentCard();
        this.updateCategoryInfo();
        this.refreshCurrentMode();
      }, 5000); // Wait 5 seconds before auto-resetting
      return;
    }

    // Always shuffle cards when changing categories
    this.shuffleArray(this.currentCards);
    this.currentIndex = 0;
    this.updateStats();
    this.showCurrentCard();

    // Update category info display
    this.updateCategoryInfo();

    // Refresh the current mode to restart with filtered cards
    this.refreshCurrentMode();
  }

  // New method to update category information display
  updateCategoryInfo() {
    const categoryInfo = document.getElementById("categoryInfo");
    
    if (categoryInfo) {
      const selectedCategory = this.selectedCategory || "all";
      if (selectedCategory === "all") {
        categoryInfo.textContent = "All Categories";
      } else {
        const categoryName =
          selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
        categoryInfo.textContent = `${categoryName} Only`;
      }
    }
  }

  // New method to refresh the current mode
  refreshCurrentMode() {
    if (this.currentMode === "quiz") {
      // Restart quiz with filtered cards
      this.startQuiz();
    } else if (this.currentMode === "flashcard") {
      // Just show the current card (already handled in filterCards)
      this.showCurrentCard();
    }
  }

  shuffleCards() {
    this.shuffleArray(this.currentCards);
    this.currentIndex = 0;
    this.showCurrentCard();
  }

  showCurrentCard() {
    if (this.currentCards.length === 0) {
      const spanishWordElement = document.getElementById("spanishWord");
      if (spanishWordElement) {
        spanishWordElement.textContent = "No cards available";
      }
      return;
    }

    const card = this.currentCards[this.currentIndex];

    // Always ensure the card is showing the front (Spanish) side
    const flashcard = document.getElementById("flashcard");
    if (flashcard && flashcard.classList.contains("flipped")) {
      flashcard.classList.remove("flipped");
      this.isFlipped = false;
    }

    // Add null checks for all DOM elements
    const spanishWordElement = document.getElementById("spanishWord");
    const categoryElement = document.getElementById("category");
    const translationElement = document.getElementById("translation");
    const exampleElement = document.getElementById("example");

    if (spanishWordElement) spanishWordElement.textContent = card.word;
    if (categoryElement) categoryElement.textContent = card.category;
    if (translationElement) translationElement.textContent = card.translation;
    if (exampleElement)
      exampleElement.textContent = card.example || "No example available";

    // Update stats
    this.updateStats();
  }

  flipCard() {
    const flashcard = document.getElementById("flashcard");
    if (flashcard) {
      flashcard.classList.toggle("flipped");
      this.isFlipped = !this.isFlipped;
    }
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

      // Remove this card from current cards since it's now known
      this.currentCards.splice(this.currentIndex, 1);

      // Check if we've run out of unknown cards
      if (this.currentCards.length === 0) {
        // Show completion message and reset
        const categoryFilter = document.getElementById("categoryFilter");
        const category = categoryFilter ? categoryFilter.value : "all";
        const categoryText =
          category === "all" ? "" : ` in ${category} category`;

        setTimeout(() => {
          this.showSuccessCard(categoryText);
        }, 1500);
        return;
      }

      // Adjust index if we're at the end
      if (this.currentIndex >= this.currentCards.length) {
        this.currentIndex = 0;
      }

      // Wait 1.5 seconds, then reset card to front and show next card
      setTimeout(() => {
        // Reset card to front side before showing new content
        const flashcard = document.getElementById("flashcard");
        if (flashcard && this.isFlipped) {
          flashcard.classList.remove("flipped");
          this.isFlipped = false;
        }

        // Small delay to ensure visual transition, then show new card
        setTimeout(() => {
          this.updateStats();
          this.showCurrentCard();
        }, 100);
      }, 1500);
    } else {
      this.knownCardsSet.delete(card.id);
      this.saveProgress();

      // If card is not flipped, flip it to show translation
      if (!this.isFlipped) {
        this.flipCard();
      }

      // Wait 2 seconds, then reset card to front and show next card
      setTimeout(() => {
        // Reset card to front side before moving to next card
        const flashcard = document.getElementById("flashcard");
        if (flashcard && this.isFlipped) {
          flashcard.classList.remove("flipped");
          this.isFlipped = false;
        }

        // Small delay to ensure visual transition, then show next card
        setTimeout(() => {
          this.nextCard();
        }, 100);
      }, 2000);
    }
  }

  // Add method to show success card
  showSuccessCard(categoryText) {
    const spanishWordElement = document.getElementById("spanishWord");
    const categoryElement = document.getElementById("category");
    const translationElement = document.getElementById("translation");
    const exampleElement = document.getElementById("example");
    const cardHint = document.querySelector(".card-hint");

    // Reset card to front side if flipped
    const flashcard = document.getElementById("flashcard");
    if (flashcard && flashcard.classList.contains("flipped")) {
      flashcard.classList.remove("flipped");
      this.isFlipped = false;
    }

    // Update front side with success message
    if (spanishWordElement) {
      spanishWordElement.textContent = "¡Felicidades!";
      spanishWordElement.style.fontSize = "2.2em";
      spanishWordElement.style.color = "#27ae60";
    }

    if (categoryElement) {
      categoryElement.textContent = "Success";
      categoryElement.style.background = "#27ae60";
    }

    if (cardHint) {
      cardHint.textContent = "Click to see your achievement";
    }

    // Update back side with detailed success message
    if (translationElement) {
      translationElement.innerHTML = `
        <div style="text-align: center;">
          <div style="font-size: 2em; margin-bottom: 15px;">🎉</div>
          <div style="font-size: 1.2em; margin-bottom: 10px;">Congratulations!</div>
          <div style="font-size: 1em;">You've learned all cards${categoryText}!</div>
        </div>
      `;
    }

    if (exampleElement) {
      exampleElement.innerHTML = `
        <div style="text-align: center; font-style: normal;">
          <button onclick="window.vocabApp.filterCards()" style="
            background: #3498db; 
            color: white; 
            border: none; 
            padding: 10px 20px; 
            border-radius: 5px; 
            cursor: pointer; 
            margin: 5px;
            font-size: 14px;
          ">Show All Cards Again</button>
          <button onclick="window.vocabApp.resetProgress()" style="
            background: #e67e22; 
            color: white; 
            border: none; 
            padding: 10px 20px; 
            border-radius: 5px; 
            cursor: pointer; 
            margin: 5px;
            font-size: 14px;
          ">Reset All Progress</button>
        </div>
      `;
    }

    // Auto-flip to show the achievement after 2 seconds
    setTimeout(() => {
      if (!this.isFlipped) {
        this.flipCard();
      }
    }, 2000);

    // Update stats
    this.updateStats();
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
    // Calculate stats based on current filtered cards, not all cards
    const totalCurrentCards = this.currentCards.length;

    // For current cards display, we need to account for removed known cards
    const category = this.selectedCategory || "all";

    // Get the original filtered cards (before removing known ones)
    let originalFilteredCards =
      category === "all"
        ? [...this.allCards]
        : this.allCards.filter((card) => card.category === category);

    // Calculate known cards in current category/filter
    const currentKnownCards = originalFilteredCards.filter((card) =>
      this.knownCardsSet.has(card.id)
    ).length;

    const originalTotalCurrentCards = originalFilteredCards.length;
    const currentUnknownCards = originalTotalCurrentCards - currentKnownCards;

    // Also calculate overall stats for display
    const totalAllCards = this.allCards.length;
    const allKnownCards = this.knownCardsSet.size;
    const allUnknownCards = totalAllCards - allKnownCards;

    // Add null checks for all DOM elements
    const totalCardsElement = document.getElementById("totalCards");
    const currentCardElement = document.getElementById("currentCard");
    const knownCardsElement = document.getElementById("knownCards");
    const unknownCardsElement = document.getElementById("unknownCards");
    const progressFillElement = document.getElementById("progressFill");

    // Update display based on whether we're filtering or showing all
    const isFiltered = category !== "all";

    if (totalCardsElement) {
      // Show original total (including known cards) for the current filter
      totalCardsElement.textContent = isFiltered
        ? originalTotalCurrentCards
        : totalAllCards;
    }

    if (currentCardElement) {
      // Show current position in the remaining unknown cards
      currentCardElement.textContent =
        this.currentCards.length > 0 ? this.currentIndex + 1 : 0;
    }

    if (knownCardsElement) {
      // Show filtered known count if filtering, otherwise show total
      knownCardsElement.textContent = isFiltered
        ? currentKnownCards
        : allKnownCards;
    }

    if (unknownCardsElement) {
      // Show filtered unknown count if filtering, otherwise show total
      unknownCardsElement.textContent = isFiltered
        ? currentUnknownCards
        : allUnknownCards;
    }

    // Progress bar should reflect current category progress when filtered
    let progress;
    if (isFiltered) {
      // Show progress for current category
      progress =
        originalTotalCurrentCards > 0
          ? (currentKnownCards / originalTotalCurrentCards) * 100
          : 0;
    } else {
      // Show overall progress when showing all categories
      progress = totalAllCards > 0 ? (allKnownCards / totalAllCards) * 100 : 0;
    }

    if (progressFillElement) {
      progressFillElement.style.width = progress + "%";
    }
  }

  resetProgress() {
    if (confirm("Are you sure you want to reset all progress?")) {
      this.knownCardsSet.clear();
      localStorage.removeItem("dgt-vocab-progress");
      this.updateStats();
    }
  }

  // Mode Management
  setMode(mode) {
    this.currentMode = mode;

    try {
      // Update mode buttons - with error handling
      const modeButtons = document.querySelectorAll(".mode-btn");
      if (modeButtons && modeButtons.length) {
        modeButtons.forEach((btn) => btn.classList.remove("active"));

        // Try to find the active button safely
        const activeButton = document.querySelector(
          `.mode-btn[onclick*="setMode('${mode}')"]`
        );
        if (activeButton) {
          activeButton.classList.add("active");
        }
      }

      // Show/hide appropriate sections - with null checks
      const flashcardMode = document.getElementById("flashcardMode");
      const quizMode = document.getElementById("quizMode");

      if (mode === "flashcard") {
        if (flashcardMode) flashcardMode.style.display = "block";
        if (quizMode) quizMode.style.display = "none";
      } else if (mode === "quiz") {
        if (flashcardMode) flashcardMode.style.display = "none";
        if (quizMode) quizMode.style.display = "block";
        this.startQuiz();
      }
    } catch (error) {
      console.error("Error in setMode:", error);
    }
  }

  // Populate the category filter dropdown with actual categories
  populateCategoryFilter() {
    const categoryButtonsContainer = document.getElementById("categoryButtons");
    if (!categoryButtonsContainer) return;

    categoryButtonsContainer.innerHTML = ""; // Clear existing buttons

    // Create "All Categories" button first
    const allButton = document.createElement("button");
    allButton.className = "category-btn active"; // Start with "All" active
    allButton.textContent = "All Categories";
    allButton.dataset.category = "all";
    allButton.onclick = () => this.selectCategory("all", allButton);
    categoryButtonsContainer.appendChild(allButton);

    // Get and add all unique categories from vocabulary
    this.getUniqueCategories().forEach((category) => {
      const button = document.createElement("button");
      button.className = "category-btn";
      button.textContent = category.charAt(0).toUpperCase() + category.slice(1); // Capitalize first letter
      button.dataset.category = category;
      button.onclick = () => this.selectCategory(category, button);
      categoryButtonsContainer.appendChild(button);
    });
  }

  // New method to handle category selection
  selectCategory(category, clickedButton) {
    // Remove active class from all category buttons
    document.querySelectorAll(".category-btn").forEach(btn => {
      btn.classList.remove("active");
    });

    // Add active class to clicked button
    clickedButton.classList.add("active");

    // Store the selected category for filterCards method
    this.selectedCategory = category;

    // Apply the filter
    this.filterCards();
  }

  // Card Management
  filterCards() {
    // Use the stored selected category instead of reading from dropdown
    const category = this.selectedCategory || "all";

    // First apply category filter
    let filteredCards =
      category === "all"
        ? [...this.allCards]
        : this.allCards.filter((card) => card.category === category);

    // Then filter out known cards to show only unknown cards
    this.currentCards = filteredCards.filter(
      (card) => !this.knownCardsSet.has(card.id)
    );

    // If no unknown cards remain, show success card and reset to all cards in category
    if (this.currentCards.length === 0) {
      const categoryText = category === "all" ? "" : ` in ${category} category`;

      // Show success card instead of alert
      this.showSuccessCard(categoryText);

      // Reset to show all cards in the category (including known ones) after showing success
      setTimeout(() => {
        this.currentCards = filteredCards;
        this.shuffleArray(this.currentCards);
        this.currentIndex = 0;
        this.updateStats();
        this.showCurrentCard();
        this.updateCategoryInfo();
        this.refreshCurrentMode();
      }, 5000); // Wait 5 seconds before auto-resetting
      return;
    }

    // Always shuffle cards when changing categories
    this.shuffleArray(this.currentCards);
    this.currentIndex = 0;
    this.updateStats();
    this.showCurrentCard();

    // Update category info display
    this.updateCategoryInfo();

    // Refresh the current mode to restart with filtered cards
    this.refreshCurrentMode();
  }

  // New method to update category information display
  updateCategoryInfo() {
    const categoryInfo = document.getElementById("categoryInfo");
    
    if (categoryInfo) {
      const selectedCategory = this.selectedCategory || "all";
      if (selectedCategory === "all") {
        categoryInfo.textContent = "All Categories";
      } else {
        const categoryName =
          selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
        categoryInfo.textContent = `${categoryName} Only`;
      }
    }
  }

  // New method to refresh the current mode
  refreshCurrentMode() {
    if (this.currentMode === "quiz") {
      // Restart quiz with filtered cards
      this.startQuiz();
    } else if (this.currentMode === "flashcard") {
      // Just show the current card (already handled in filterCards)
      this.showCurrentCard();
    }
  }

  shuffleCards() {
    this.shuffleArray(this.currentCards);
    this.currentIndex = 0;
    this.showCurrentCard();
  }

  showCurrentCard() {
    if (this.currentCards.length === 0) {
      const spanishWordElement = document.getElementById("spanishWord");
      if (spanishWordElement) {
        spanishWordElement.textContent = "No cards available";
      }
      return;
    }

    const card = this.currentCards[this.currentIndex];

    // Always ensure the card is showing the front (Spanish) side
    const flashcard = document.getElementById("flashcard");
    if (flashcard && flashcard.classList.contains("flipped")) {
      flashcard.classList.remove("flipped");
      this.isFlipped = false;
    }

    // Add null checks for all DOM elements
    const spanishWordElement = document.getElementById("spanishWord");
    const categoryElement = document.getElementById("category");
    const translationElement = document.getElementById("translation");
    const exampleElement = document.getElementById("example");

    if (spanishWordElement) spanishWordElement.textContent = card.word;
    if (categoryElement) categoryElement.textContent = card.category;
    if (translationElement) translationElement.textContent = card.translation;
    if (exampleElement)
      exampleElement.textContent = card.example || "No example available";

    // Update stats
    this.updateStats();
  }

  flipCard() {
    const flashcard = document.getElementById("flashcard");
    if (flashcard) {
      flashcard.classList.toggle("flipped");
      this.isFlipped = !this.isFlipped;
    }
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

      // Remove this card from current cards since it's now known
      this.currentCards.splice(this.currentIndex, 1);

      // Check if we've run out of unknown cards
      if (this.currentCards.length === 0) {
        // Show completion message and reset
        const categoryFilter = document.getElementById("categoryFilter");
        const category = categoryFilter ? categoryFilter.value : "all";
        const categoryText =
          category === "all" ? "" : ` in ${category} category`;

        setTimeout(() => {
          this.showSuccessCard(categoryText);
        }, 1500);
        return;
      }

      // Adjust index if we're at the end
      if (this.currentIndex >= this.currentCards.length) {
        this.currentIndex = 0;
      }

      // Wait 1.5 seconds, then reset card to front and show next card
      setTimeout(() => {
        // Reset card to front side before showing new content
        const flashcard = document.getElementById("flashcard");
        if (flashcard && this.isFlipped) {
          flashcard.classList.remove("flipped");
          this.isFlipped = false;
        }

        // Small delay to ensure visual transition, then show new card
        setTimeout(() => {
          this.updateStats();
          this.showCurrentCard();
        }, 100);
      }, 1500);
    } else {
      this.knownCardsSet.delete(card.id);
      this.saveProgress();

      // If card is not flipped, flip it to show translation
      if (!this.isFlipped) {
        this.flipCard();
      }

      // Wait 2 seconds, then reset card to front and show next card
      setTimeout(() => {
        // Reset card to front side before moving to next card
        const flashcard = document.getElementById("flashcard");
        if (flashcard && this.isFlipped) {
          flashcard.classList.remove("flipped");
          this.isFlipped = false;
        }

        // Small delay to ensure visual transition, then show next card
        setTimeout(() => {
          this.nextCard();
        }, 100);
      }, 2000);
    }
  }

  // Add method to show success card
  showSuccessCard(categoryText) {
    const spanishWordElement = document.getElementById("spanishWord");
    const categoryElement = document.getElementById("category");
    const translationElement = document.getElementById("translation");
    const exampleElement = document.getElementById("example");
    const cardHint = document.querySelector(".card-hint");

    // Reset card to front side if flipped
    const flashcard = document.getElementById("flashcard");
    if (flashcard && flashcard.classList.contains("flipped")) {
      flashcard.classList.remove("flipped");
      this.isFlipped = false;
    }

    // Update front side with success message
    if (spanishWordElement) {
      spanishWordElement.textContent = "¡Felicidades!";
      spanishWordElement.style.fontSize = "2.2em";
      spanishWordElement.style.color = "#27ae60";
    }

    if (categoryElement) {
      categoryElement.textContent = "Success";
      categoryElement.style.background = "#27ae60";
    }

    if (cardHint) {
      cardHint.textContent = "Click to see your achievement";
    }

    // Update back side with detailed success message
    if (translationElement) {
      translationElement.innerHTML = `
        <div style="text-align: center;">
          <div style="font-size: 2em; margin-bottom: 15px;">🎉</div>
          <div style="font-size: 1.2em; margin-bottom: 10px;">Congratulations!</div>
          <div style="font-size: 1em;">You've learned all cards${categoryText}!</div>
        </div>
      `;
    }

    if (exampleElement) {
      exampleElement.innerHTML = `
        <div style="text-align: center; font-style: normal;">
          <button onclick="window.vocabApp.filterCards()" style="
            background: #3498db; 
            color: white; 
            border: none; 
            padding: 10px 20px; 
            border-radius: 5px; 
            cursor: pointer; 
            margin: 5px;
            font-size: 14px;
          ">Show All Cards Again</button>
          <button onclick="window.vocabApp.resetProgress()" style="
            background: #e67e22; 
            color: white; 
            border: none; 
            padding: 10px 20px; 
            border-radius: 5px; 
            cursor: pointer; 
            margin: 5px;
            font-size: 14px;
          ">Reset All Progress</button>
        </div>
      `;
    }

    // Auto-flip to show the achievement after 2 seconds
    setTimeout(() => {
      if (!this.isFlipped) {
        this.flipCard();
      }
    }, 2000);

    // Update stats
    this.updateStats();
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
    // Calculate stats based on current filtered cards, not all cards
    const totalCurrentCards = this.currentCards.length;

    // For current cards display, we need to account for removed known cards
    const category = this.selectedCategory || "all";

    // Get the original filtered cards (before removing known ones)
    let originalFilteredCards =
      category === "all"
        ? [...this.allCards]
        : this.allCards.filter((card) => card.category === category);

    // Calculate known cards in current category/filter
    const currentKnownCards = originalFilteredCards.filter((card) =>
      this.knownCardsSet.has(card.id)
    ).length;

    const originalTotalCurrentCards = originalFilteredCards.length;
    const currentUnknownCards = originalTotalCurrentCards - currentKnownCards;

    // Also calculate overall stats for display
    const totalAllCards = this.allCards.length;
    const allKnownCards = this.knownCardsSet.size;
    const allUnknownCards = totalAllCards - allKnownCards;

    // Add null checks for all DOM elements
    const totalCardsElement = document.getElementById("totalCards");
    const currentCardElement = document.getElementById("currentCard");
    const knownCardsElement = document.getElementById("knownCards");
    const unknownCardsElement = document.getElementById("unknownCards");
    const progressFillElement = document.getElementById("progressFill");

    // Update display based on whether we're filtering or showing all
    const isFiltered = category !== "all";

    if (totalCardsElement) {
      // Show original total (including known cards) for the current filter
      totalCardsElement.textContent = isFiltered
        ? originalTotalCurrentCards
        : totalAllCards;
    }

    if (currentCardElement) {
      // Show current position in the remaining unknown cards
      currentCardElement.textContent =
        this.currentCards.length > 0 ? this.currentIndex + 1 : 0;
    }

    if (knownCardsElement) {
      // Show filtered known count if filtering, otherwise show total
      knownCardsElement.textContent = isFiltered
        ? currentKnownCards
        : allKnownCards;
    }

    if (unknownCardsElement) {
      // Show filtered unknown count if filtering, otherwise show total
      unknownCardsElement.textContent = isFiltered
        ? currentUnknownCards
        : allUnknownCards;
    }

    // Progress bar should reflect current category progress when filtered
    let progress;
    if (isFiltered) {
      // Show progress for current category
      progress =
        originalTotalCurrentCards > 0
          ? (currentKnownCards / originalTotalCurrentCards) * 100
          : 0;
    } else {
      // Show overall progress when showing all categories
      progress = totalAllCards > 0 ? (allKnownCards / totalAllCards) * 100 : 0;
    }

    if (progressFillElement) {
      progressFillElement.style.width = progress + "%";
    }
  }

  resetProgress() {
    if (confirm("Are you sure you want to reset all progress?")) {
      this.knownCardsSet.clear();
      localStorage.removeItem("dgt-vocab-progress");
      this.updateStats();
    }
  }

  // Mode Management
  setMode(mode) {
    this.currentMode = mode;

    try {
      // Update mode buttons - with error handling
      const modeButtons = document.querySelectorAll(".mode-btn");
      if (modeButtons && modeButtons.length) {
        modeButtons.forEach((btn) => btn.classList.remove("active"));

        // Try to find the active button safely
        const activeButton = document.querySelector(
          `.mode-btn[onclick*="setMode('${mode}')"]`
        );
        if (activeButton) {
          activeButton.classList.add("active");
        }
      }

      // Show/hide appropriate sections - with null checks
      const flashcardMode = document.getElementById("flashcardMode");
      const quizMode = document.getElementById("quizMode");

      if (mode === "flashcard") {
        if (flashcardMode) flashcardMode.style.display = "block";
        if (quizMode) quizMode.style.display = "none";
      } else if (mode === "quiz") {
        if (flashcardMode) flashcardMode.style.display = "none";
        if (quizMode) quizMode.style.display = "block";
        this.startQuiz();
      }
    } catch (error) {
      console.error("Error in setMode:", error);
    }
  }

  // Populate the category filter dropdown with actual categories
  populateCategoryFilter() {
    const categoryButtonsContainer = document.getElementById("categoryButtons");
    if (!categoryButtonsContainer) return;

    categoryButtonsContainer.innerHTML = ""; // Clear existing buttons

    // Create "All Categories" button first
    const allButton = document.createElement("button");
    allButton.className = "category-btn active"; // Start with "All" active
    allButton.textContent = "All Categories";
    allButton.dataset.category = "all";
    allButton.onclick = () => this.selectCategory("all", allButton);
    categoryButtonsContainer.appendChild(allButton);

    // Get and add all unique categories from vocabulary
    this.getUniqueCategories().forEach((category) => {
      const button = document.createElement("button");
      button.className = "category-btn";
      button.textContent = category.charAt(0).toUpperCase() + category.slice(1); // Capitalize first letter
      button.dataset.category = category;
      button.onclick = () => this.selectCategory(category, button);
      categoryButtonsContainer.appendChild(button);
    });
  }

  // New method to handle category selection
  selectCategory(category, clickedButton) {
    // Remove active class from all category buttons
    document.querySelectorAll(".category-btn").forEach(btn => {
      btn.classList.remove("active");
    });

    // Add active class to clicked button
    clickedButton.classList.add("active");

    // Store the selected category for filterCards method
    this.selectedCategory = category;

    // Apply the filter
    this.filterCards();
  }

  // Card Management
  filterCards() {
    // Use the stored selected category instead of reading from dropdown
    const category = this.selectedCategory || "all";

    // First apply category filter
    let filteredCards =
      category === "all"
        ? [...this.allCards]
        : this.allCards.filter((card) => card.category === category);

    // Then filter out known cards to show only unknown cards
    this.currentCards = filteredCards.filter(
      (card) => !this.knownCardsSet.has(card.id)
    );

    // If no unknown cards remain, show success card and reset to all cards in category
    if (this.currentCards.length === 0) {
      const categoryText = category === "all" ? "" : ` in ${category} category`;

      // Show success card instead of alert
      this.showSuccessCard(categoryText);

      // Reset to show all cards in the category (including known ones) after showing success
      setTimeout(() => {
        this.currentCards = filteredCards;
        this.shuffleArray(this.currentCards);
        this.currentIndex = 0;
        this.updateStats();
        this.showCurrentCard();
        this.updateCategoryInfo();
        this.refreshCurrentMode();
      }, 5000); // Wait 5 seconds before auto-resetting
      return;
    }

    // Always shuffle cards when changing categories
    this.shuffleArray(this.currentCards);
    this.currentIndex = 0;
    this.updateStats();
    this.showCurrentCard();

    // Update category info display
    this.updateCategoryInfo();

    // Refresh the current mode to restart with filtered cards
    this.refreshCurrentMode();
  }

  // New method to update category information display
  updateCategoryInfo() {
    const categoryInfo = document.getElementById("categoryInfo");
    
    if (categoryInfo) {
      const selectedCategory = this.selectedCategory || "all";
      if (selectedCategory === "all") {
        categoryInfo.textContent = "All Categories";
      } else {
        const categoryName =
          selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
        categoryInfo.textContent = `${categoryName} Only`;
      }
    }
  }

  // New method to refresh the current mode
  refreshCurrentMode() {
    if (this.currentMode === "quiz") {
      // Restart quiz with filtered cards
      this.startQuiz();
    } else if (this.currentMode === "flashcard") {
      // Just show the current card (already handled in filterCards)
      this.showCurrentCard();
    }
  }

  shuffleCards() {
    this.shuffleArray(this.currentCards);
    this.currentIndex = 0;
    this.showCurrentCard();
  }

  showCurrentCard() {
    if (this.currentCards.length === 0) {
      const spanishWordElement = document.getElementById("spanishWord");
      if (spanishWordElement) {
        spanishWordElement.textContent = "No cards available";
      }
      return;
    }

    const card = this.currentCards[this.currentIndex];

    // Always ensure the card is showing the front (Spanish) side
    const flashcard = document.getElementById("flashcard");
    if (flashcard && flashcard.classList.contains("flipped")) {
      flashcard.classList.remove("flipped");
      this.isFlipped = false;
    }

    // Add null checks for all DOM elements
    const spanishWordElement = document.getElementById("spanishWord");
    const categoryElement = document.getElementById("category");
    const translationElement = document.getElementById("translation");
    const exampleElement = document.getElementById("example");

    if (spanishWordElement) spanishWordElement.textContent = card.word;
    if (categoryElement) categoryElement.textContent = card.category;
    if (translationElement) translationElement.textContent = card.translation;
    if (exampleElement)
      exampleElement.textContent = card.example || "No example available";

    // Update stats
    this.updateStats();
  }

  flipCard() {
    const flashcard = document.getElementById("flashcard");
    if (flashcard) {
      flashcard.classList.toggle("flipped");
      this.isFlipped = !this.isFlipped;
    }
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

      // Remove this card from current cards since it's now known
      this.currentCards.splice(this.currentIndex, 1);

      // Check if we've run out of unknown cards
      if (this.currentCards.length === 0) {
        // Show completion message and reset
        const categoryFilter = document.getElementById("categoryFilter");
        const category = categoryFilter ? categoryFilter.value : "all";
        const categoryText =
          category === "all" ? "" : ` in ${category} category`;

        setTimeout(() => {
          this.showSuccessCard(categoryText);
        }, 1500);
        return;
      }

      // Adjust index if we're at the end
      if (this.currentIndex >= this.currentCards.length) {
        this.currentIndex = 0;
      }

      // Wait 1.5 seconds, then reset card to front and show next card
      setTimeout(() => {
        // Reset card to front side before showing new content
        const flashcard = document.getElementById("flashcard");
        if (flashcard && this.isFlipped) {
          flashcard.classList.remove("flipped");
          this.isFlipped = false;
        }

        // Small delay to ensure visual transition, then show new card
        setTimeout(() => {
          this.updateStats();
          this.showCurrentCard();
        }, 100);
      }, 1500);
    } else {
      this.knownCardsSet.delete(card.id);
      this.saveProgress();

      // If card is not flipped, flip it to show translation
      if (!this.isFlipped) {
        this.flipCard();
      }

      // Wait 2 seconds, then reset card to front and show next card
      setTimeout(() => {
        // Reset card to front side before moving to next card
        const flashcard = document.getElementById("flashcard");
        if (flashcard && this.isFlipped) {
          flashcard.classList.remove("flipped");
          this.isFlipped = false;
        }

        // Small delay to ensure visual transition, then show next card
        setTimeout(() => {
          this.nextCard();
        }, 100);
      }, 2000);
    }
  }

  // Add method to show success card
  showSuccessCard(categoryText) {
    const spanishWordElement = document.getElementById("spanishWord");
    const categoryElement = document.getElementById("category");
    const translationElement = document.getElementById("translation");
    const exampleElement = document.getElementById("example");
    const cardHint = document.querySelector(".card-hint");

    // Reset card to front side if flipped
    const flashcard = document.getElementById("flashcard");
    if (flashcard && flashcard.classList.contains("flipped")) {
      flashcard.classList.remove("flipped");
      this.isFlipped = false;
    }

    // Update front side with success message
    if (spanishWordElement) {
      spanishWordElement.textContent = "¡Felicidades!";
      spanishWordElement.style.fontSize = "2.2em";
      spanishWordElement.style.color = "#27ae60";
    }

    if (categoryElement) {
      categoryElement.textContent = "Success";
      categoryElement.style.background = "#27ae60";
    }

    if (cardHint) {
      cardHint.textContent = "Click to see your achievement";
    }

    // Update back side with detailed success message
    if (translationElement) {
      translationElement.innerHTML = `
        <div style="text-align: center;">
          <div style="font-size: 2em; margin-bottom: 15px;">🎉</div>
          <div style="font-size: 1.2em; margin-bottom: 10px;">Congratulations!</div>
          <div style="font-size: 1em;">You've learned all cards${categoryText}!</div>
        </div>
      `;
    }

    if (exampleElement) {
      exampleElement.innerHTML = `
        <div style="text-align: center; font-style: normal;">
          <button onclick="window.vocabApp.filterCards()" style="
            background: #3498db; 
            color: white; 
            border: none; 
            padding: 10px 20px; 
            border-radius: 5px; 
            cursor: pointer; 
            margin: 5px;
            font-size: 14px;
          ">Show All Cards Again</button>
          <button onclick="window.vocabApp.resetProgress()" style="
            background: #e67e22; 
            color: white; 
            border: none; 
            padding: 10px 20px; 
            border-radius: 5px; 
            cursor: pointer; 
            margin: 5px;
            font-size: 14px;
          ">Reset All Progress</button>
        </div>
      `;
    }

    // Auto-flip to show the achievement after 2 seconds
    setTimeout(() => {
      if (!this.isFlipped) {
        this.flipCard();
      }
    }, 2000);

    // Update stats
    this.updateStats();
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
    // Calculate stats based on current filtered cards, not all cards
    const totalCurrentCards = this.currentCards.length;

    // For current cards display, we need to account for removed known cards
    const category = this.selectedCategory || "all";

    // Get the original filtered cards (before removing known ones)
    let originalFilteredCards =
      category === "all"
        ? [...this.allCards]
        : this.allCards.filter((card) => card.category === category);

    // Calculate known cards in current category/filter
    const currentKnownCards = originalFilteredCards.filter((card) =>
      this.knownCardsSet.has(card.id)
    ).length;

    const originalTotalCurrentCards = originalFilteredCards.length;
    const currentUnknownCards = originalTotalCurrentCards - currentKnownCards;

    // Also calculate overall stats for display
    const totalAllCards = this.allCards.length;
    const allKnownCards = this.knownCardsSet.size;
    const allUnknownCards = totalAllCards - allKnownCards;

    // Add null checks for all DOM elements
    const totalCardsElement = document.getElementById("totalCards");
    const currentCardElement = document.getElementById("currentCard");
    const knownCardsElement = document.getElementById("knownCards");
    const unknownCardsElement = document.getElementById("unknownCards");
    const progressFillElement = document.getElementById("progressFill");

    // Update display based on whether we're filtering or showing all
    const isFiltered = category !== "all";

    if (totalCardsElement) {
      // Show original total (including known cards) for the current filter
      totalCardsElement.textContent = isFiltered
        ? originalTotalCurrentCards
        : totalAllCards;
    }

    if (currentCardElement) {
      // Show current position in the remaining unknown cards
      currentCardElement.textContent =
        this.currentCards.length > 0 ? this.currentIndex + 1 : 0;
    }

    if (knownCardsElement) {
      // Show filtered known count if filtering, otherwise show total
      knownCardsElement.textContent = isFiltered
        ? currentKnownCards
        : allKnownCards;
    }

    if (unknownCardsElement) {
      // Show filtered unknown count if filtering, otherwise show total
      unknownCardsElement.textContent = isFiltered
        ? currentUnknownCards
        : allUnknownCards;
    }

    // Progress bar should reflect current category progress when filtered
    let progress;
    if (isFiltered) {
      // Show progress for current category
      progress =
        originalTotalCurrentCards > 0
          ? (currentKnownCards / originalTotalCurrentCards) * 100
          : 0;
    } else {
      // Show overall progress when showing all categories
      progress = totalAllCards > 0 ? (allKnownCards / totalAllCards) * 100 : 0;
    }

    if (progressFillElement) {
      progressFillElement.style.width = progress + "%";
    }
  }

  resetProgress() {
    if (confirm("Are you sure you want to reset all progress?")) {
      this.knownCardsSet.clear();
      localStorage.removeItem("dgt-vocab-progress");
      this.updateStats();
    }
  }

  // Mode Management
  setMode(mode) {
    this.currentMode = mode;

    try {
      // Update mode buttons - with error handling
      const modeButtons = document.querySelectorAll(".mode-btn");
      if (modeButtons && modeButtons.length) {
        modeButtons.forEach((btn) => btn.classList.remove("active"));

        // Try to find the active button safely
        const activeButton = document.querySelector(
          `.mode-btn[onclick*="setMode('${mode}')"]`
        );
        if (activeButton) {
          activeButton.classList.add("active");
        }
      }

      // Show/hide appropriate sections - with null checks
      const flashcardMode = document.getElementById("flashcardMode");
      const quizMode = document.getElementById("quizMode");

      if (mode === "flashcard") {
        if (flashcardMode) flashcardMode.style.display = "block";
        if (quizMode) quizMode.style.display = "none";
      } else if (mode === "quiz") {
        if (flashcardMode) flashcardMode.style.display = "none";
        if (quizMode) quizMode.style.display = "block";
        this.startQuiz();
      }
    } catch (error) {
      console.error("Error in setMode:", error);
    }
  }

  // Populate the category filter dropdown with actual categories
  populateCategoryFilter() {
    const categoryButtonsContainer = document.getElementById("categoryButtons");
    if (!categoryButtonsContainer) return;

    categoryButtonsContainer.innerHTML = ""; // Clear existing buttons

    // Create "All Categories" button first
    const allButton = document.createElement("button");
    allButton.className = "category-btn active"; // Start with "All" active
    allButton.textContent = "All Categories";
    allButton.dataset.category = "all";
    allButton.onclick = () => this.selectCategory("all", allButton);
    categoryButtonsContainer.appendChild(allButton);

    // Get and add all unique categories from vocabulary
    this.getUniqueCategories().forEach((category) => {
      const button = document.createElement("button");
      button.className = "category-btn";
      button.textContent = category.charAt(0).toUpperCase() + category.slice(1); // Capitalize first letter
      button.dataset.category = category;
      button.onclick = () => this.selectCategory(category, button);
      categoryButtonsContainer.appendChild(button);
    });
  }

  // New method to handle category selection
  selectCategory(category, clickedButton) {
    // Remove active class from all category buttons
    document.querySelectorAll(".category-btn").forEach(btn => {
      btn.classList.remove("active");
    });

    // Add active class to clicked button
    clickedButton.classList.add("active");

    // Store the selected category for filterCards method
    this.selectedCategory = category;

    // Apply the filter
    this.filterCards();
  }

  // Card Management
  filterCards() {
    // Use the stored selected category instead of reading from dropdown
    const category = this.selectedCategory || "all";

    // First apply category filter
    let filteredCards =
      category === "all"
        ? [...this.allCards]
        : this.allCards.filter((card) => card.category === category);

    // Then filter out known cards to show only unknown cards
    this.currentCards = filteredCards.filter(
      (card) => !this.knownCardsSet.has(card.id)
    );

    // If no unknown cards remain, show success card and reset to all cards in category
    if (this.currentCards.length === 0) {
      const categoryText = category === "all" ? "" : ` in ${category} category`;

      // Show success card instead of alert
      this.showSuccessCard(categoryText);

      // Reset to show all cards in the category (including known ones) after showing success
      setTimeout(() => {
        this.currentCards = filteredCards;
        this.shuffleArray(this.currentCards);
        this.currentIndex = 0;
        this.updateStats();
        this.showCurrentCard();
        this.updateCategoryInfo();
        this.refreshCurrentMode();
      }, 5000); // Wait 5 seconds before auto-resetting
      return;
    }

    // Always shuffle cards when changing categories
    this.shuffleArray(this.currentCards);
    this.currentIndex = 0;
    this.updateStats();
    this.showCurrentCard();

    // Update category info display
    this.updateCategoryInfo();

    // Refresh the current mode to restart with filtered cards
    this.refreshCurrentMode();
  }

  // New method to update category information display
  updateCategoryInfo() {
    const categoryInfo = document.getElementById("categoryInfo");
    
    if (categoryInfo) {
      const selectedCategory = this.selectedCategory || "all";
      if (selectedCategory === "all") {
        categoryInfo.textContent = "All Categories";
      } else {
        const categoryName =
          selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
        categoryInfo.textContent = `${categoryName} Only`;
      }
    }
  }

  // New method to refresh the current mode
  refreshCurrentMode() {
    if (this.currentMode === "quiz") {
      // Restart quiz with filtered cards
      this.startQuiz();
    } else if (this.currentMode === "flashcard") {
      // Just show the current card (already handled in filterCards)
      this.showCurrentCard();
    }
  }

  shuffleCards() {
    this.shuffleArray(this.currentCards);
    this.currentIndex = 0;
    this.showCurrentCard();
  }

  showCurrentCard() {
    if (this.currentCards.length === 0) {
      const spanishWordElement = document.getElementById("spanishWord");
      if (spanishWordElement) {
        spanishWordElement.textContent = "No cards available";
      }
      return;
    }

    const card = this.currentCards[this.currentIndex];

    // Always ensure the card is showing the front (Spanish) side
    const flashcard = document.getElementById("flashcard");
    if (flashcard && flashcard.classList.contains("flipped")) {
      flashcard.classList.remove("flipped");
      this.isFlipped = false;
    }

    // Add null checks for all DOM elements
    const spanishWordElement = document.getElementById("spanishWord");
    const categoryElement = document.getElementById("category");
    const translationElement = document.getElementById("translation");
    const exampleElement = document.getElementById("example");

    if (spanishWordElement) spanishWordElement.textContent = card.word;
    if (categoryElement) categoryElement.textContent = card.category;
    if (translationElement) translationElement.textContent = card.translation;
    if (exampleElement)
      exampleElement.textContent = card.example || "No example available";

    // Update stats
    this.updateStats();
  }

  flipCard() {
    const flashcard = document.getElementById("flashcard");
    if (flashcard) {
      flashcard.classList.toggle("flipped");
      this.isFlipped = !this.isFlipped;
    }
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

      // Remove this card from current cards since it's now known
      this.currentCards.splice(this.currentIndex, 1);

      // Check if we've run out of unknown cards
      if (this.currentCards.length === 0) {
        // Show completion message and reset
        const categoryFilter = document.getElementById("categoryFilter");
        const category = categoryFilter ? categoryFilter.value : "all";
        const categoryText =
          category === "all" ? "" : ` in ${category} category`;

        setTimeout(() => {
          this.showSuccessCard(categoryText);
        }, 1500);
        return;
      }

      // Adjust index if we're at the end
      if (this.currentIndex >= this.currentCards.length) {
        this.currentIndex = 0;
      }

      // Wait 1.5 seconds, then reset card to front and show next card
      setTimeout(() => {
        // Reset card to front side before showing new content
        const flashcard = document.getElementById("flashcard");
        if (flashcard && this.isFlipped) {
          flashcard.classList.remove("flipped");
          this.isFlipped = false;
        }

        // Small delay to ensure visual transition, then show new card
        setTimeout(() => {
          this.updateStats();
          this.showCurrentCard();
        }, 100);
      }, 1500);
    } else {
      this.knownCardsSet.delete(card.id);
      this.saveProgress();

      // If card is not flipped, flip it to show translation
      if (!this.isFlipped) {
        this.flipCard();
      }

      // Wait 2 seconds, then reset card to front and show next card
      setTimeout(() => {
        // Reset card to front side before moving to next card
        const flashcard = document.getElementById("flashcard");
        if (flashcard && this.isFlipped) {
          flashcard.classList.remove("flipped");
          this.isFlipped = false;
        }

        // Small delay to ensure visual transition, then show next card
        setTimeout(() => {
          this.nextCard();
        }, 100);
      }, 2000);
    }
  }

  // Add method to show success card
  showSuccessCard(categoryText) {
    const spanishWordElement = document.getElementById("spanishWord");
    const categoryElement = document.getElementById("category");
    const translationElement = document.getElementById("translation");
    const exampleElement = document.getElementById("example");
    const cardHint = document.querySelector(".card-hint");

    // Reset card to front side if flipped
    const flashcard = document.getElementById("flashcard");
    if (flashcard && flashcard.classList.contains("flipped")) {
      flashcard.classList.remove("flipped");
      this.isFlipped = false;
    }

    // Update front side with success message
    if (spanishWordElement) {
      spanishWordElement.textContent = "¡Felicidades!";
      spanishWordElement.style.fontSize = "2.2em";
      spanishWordElement.style.color = "#27ae60";
    }

    if (categoryElement) {
      categoryElement.textContent = "Success";
      categoryElement.style.background = "#27ae60";
    }

    if (cardHint) {
      cardHint.textContent = "Click to see your achievement";
    }

    // Update back side with detailed success message
    if (translationElement) {
      translationElement.innerHTML = `
        <div style="text-align: center;">
          <div style="font-size: 2em; margin-bottom: 15px;">🎉</div>
          <div style="font-size: 1.2em; margin-bottom: 10px;">Congratulations!</div>
          <div style="font-size: 1em;">You've learned all cards${categoryText}!</div>
        </div>
      `;
    }

    if (exampleElement) {
      exampleElement.innerHTML = `
        <div style="text-align: center; font-style: normal;">
          <button onclick="window.vocabApp.filterCards()" style="
            background: #3498db; 
            color: white; 
            border: none; 
            padding: 10px 20px; 
            border-radius: 5px; 
            cursor: pointer; 
            margin: 5px;
            font-size: 14px;
          ">Show All Cards Again</button>
          <button onclick="window.vocabApp.resetProgress()" style="
            background: #e67e22; 
            color: white; 
            border: none; 
            padding: 10px 20px; 
            border-radius: 5px; 
            cursor: pointer; 
            margin: 5px;
            font-size: 14px;
          ">Reset All Progress</button>
        </div>
      `;
    }

    // Auto-flip to show the achievement after 2 seconds
    setTimeout(() => {
      if (!this.isFlipped) {
        this.flipCard();
      }
    }, 2000);

    // Update stats
    this.updateStats();
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
    // Calculate stats based on current filtered cards, not all cards
    const totalCurrentCards = this.currentCards.length;

    // For current cards display, we need to account for removed known cards
    const category = this.selectedCategory || "all";

    // Get the original filtered cards (before removing known ones)
    let originalFilteredCards =
      category === "all"
        ? [...this.allCards]
        : this.allCards.filter((card) => card.category === category);

    // Calculate known cards in current category/filter
    const currentKnownCards = originalFilteredCards.filter((card) =>
      this.knownCardsSet.has(card.id)
    ).length;

    const originalTotalCurrentCards = originalFilteredCards.length;
    const currentUnknownCards = originalTotalCurrentCards - currentKnownCards;

    // Also calculate overall stats for display
    const totalAllCards = this.allCards.length;
    const allKnownCards = this.knownCardsSet.size;
    const allUnknownCards = totalAllCards - allKnownCards;

    // Add null checks for all DOM elements
    const totalCardsElement = document.getElementById("totalCards");
    const currentCardElement = document.getElementById("currentCard");
    const knownCardsElement = document.getElementById("knownCards");
    const unknownCardsElement = document.getElementById("unknownCards");
    const progressFillElement = document.getElementById("progressFill");

    // Update display based on whether we're filtering or showing all
    const isFiltered = category !== "all";

    if (totalCardsElement) {
      // Show original total (including known cards) for the current filter
      totalCardsElement.textContent = isFiltered
        ? originalTotalCurrentCards
        : totalAllCards;
    }

    if (currentCardElement) {
      // Show current position in the remaining unknown cards
      currentCardElement.textContent =
        this.currentCards.length > 0 ? this.currentIndex + 1 : 0;
    }

    if (knownCardsElement) {
      // Show filtered known count if filtering, otherwise show total
      knownCardsElement.textContent = isFiltered
        ? currentKnownCards
        : allKnownCards;
    }

    if (unknownCardsElement) {
      // Show filtered unknown count if filtering, otherwise show total
      unknownCardsElement.textContent = isFiltered
        ? currentUnknownCards
        : allUnknownCards;
    }

    // Progress bar should reflect current category progress when filtered
    let progress;
    if (isFiltered) {
      // Show progress for current category
      progress =
        originalTotalCurrentCards > 0
          ? (currentKnownCards / originalTotalCurrentCards) * 100
          : 0;
    } else {
      // Show overall progress when showing all categories
      progress = totalAllCards > 0 ? (allKnownCards / totalAllCards) * 100 : 0;
    }

    if (progressFillElement) {
      progressFillElement.style.width = progress + "%";
    }
  }

  resetProgress() {
    if (confirm("Are you sure you want to reset all progress?")) {
      this.knownCardsSet.clear();
      localStorage.removeItem("dgt-vocab-progress");
      this.updateStats();
    }
  }

  // Mode Management
  setMode(mode) {
    this.currentMode = mode;

    try {
      // Update mode buttons - with error handling
      const modeButtons = document.querySelectorAll(".mode-btn");
      if (modeButtons && modeButtons.length) {
        modeButtons.forEach((btn) => btn.classList.remove("active"));

        // Try to find the active button safely
        const activeButton = document.querySelector(
          `.mode-btn[onclick*="setMode('${mode}')"]`
        );
        if (activeButton) {
          activeButton.classList.add("active");
        }
      }

      // Show/hide appropriate sections - with null checks
      const flashcardMode = document.getElementById("flashcardMode");
      const quizMode = document.getElementById("quizMode");

      if (mode === "flashcard") {
        if (flashcardMode) flashcardMode.style.display = "block";
        if (quizMode) quizMode.style.display = "none";
      } else if (mode === "quiz") {
        if (flashcardMode) flashcardMode.style.display = "none";
        if (quizMode) quizMode.style.display = "block";
        this.startQuiz();
      }
    } catch (error) {
      console.error("Error in setMode:", error);
    }
  }

  // Populate the category filter dropdown with actual categories
  populateCategoryFilter() {
    const categoryButtonsContainer = document.getElementById("categoryButtons");
    if (!categoryButtonsContainer) return;

    categoryButtonsContainer.innerHTML = ""; // Clear existing buttons

    // Create "All Categories" button first
    const allButton = document.createElement("button");
    allButton.className = "category-btn active"; // Start with "All" active
    allButton.textContent = "All Categories";
    allButton.dataset.category = "all";
    allButton.onclick = () => this.selectCategory("all", allButton);
    categoryButtonsContainer.appendChild(allButton);

    // Get and add all unique categories from vocabulary
    this.getUniqueCategories().forEach((category) => {
      const button = document.createElement("button");
      button.className = "category-btn";
      button.textContent = category.charAt(0).toUpperCase() + category.slice(1); // Capitalize first letter
      button.dataset.category = category;
      button.onclick = () => this.selectCategory(category, button);
      categoryButtonsContainer.appendChild(button);
    });
  }

  // New method to handle category selection
  selectCategory(category, clickedButton) {
    // Remove active class from all category buttons
    document.querySelectorAll(".category-btn").forEach(btn => {
      btn.classList.remove("active");
    });

    // Add active class to clicked button
    clickedButton.classList.add("active");

    // Store the selected category for filterCards method
    this.selectedCategory = category;

    // Apply the filter
    this.filterCards();
  }

  // Card Management
  filterCards() {
    // Use the stored selected category instead of reading from dropdown
    const category = this.selectedCategory || "all";

    // First apply category filter
    let filteredCards =
      category === "all"
        ? [...this.allCards]
        : this.allCards.filter((card) => card.category === category);

    // Then filter out known cards to show only unknown cards
    this.currentCards = filteredCards.filter(
      (card) => !this.knownCardsSet.has(card.id)
    );

    // If no unknown cards remain, show success card and reset to all cards in category
    if (this.currentCards.length === 0) {
      const categoryText = category === "all" ? "" : ` in ${category} category`;

      // Show success card instead of alert
      this.showSuccessCard(categoryText);

      // Reset to show all cards in the category (including known ones) after showing success
      setTimeout(() => {
        this.currentCards = filteredCards;
        this.shuffleArray(this.currentCards);
        this.currentIndex = 0;
        this.updateStats();
        this.showCurrentCard();
        this.updateCategoryInfo();
        this.refreshCurrentMode();
      }, 5000); // Wait 5 seconds before auto-resetting
      return;
    }

    // Always shuffle cards when changing categories
    this.shuffleArray(this.currentCards);
    this.currentIndex = 0;
    this.updateStats();
    this.showCurrentCard();

    // Update category info display
    this.updateCategoryInfo();

    // Refresh the current mode to restart with filtered cards
    this.refreshCurrentMode();
  }

  // New method to update category information display
  updateCategoryInfo() {
    const categoryInfo = document.getElementById("categoryInfo");
    
    if (categoryInfo) {
      const selectedCategory = this.selectedCategory || "all";
      if (selectedCategory === "all") {
        categoryInfo.textContent = "All Categories";
      } else {
        const categoryName =
          selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
        categoryInfo.textContent = `${categoryName} Only`;
      }
    }
  }

  // New method to refresh the current mode
  refreshCurrentMode() {
    if (this.currentMode === "quiz") {
      // Restart quiz with filtered cards
      this.startQuiz();
    } else if (this.currentMode === "flashcard") {
      // Just show the current card (already handled in filterCards)
      this.showCurrentCard();
    }
  }

  shuffleCards() {
    this.shuffleArray(this.currentCards);
    this.currentIndex = 0;
    this.showCurrentCard();
  }

  showCurrentCard() {
    if (this.currentCards.length === 0) {
      const spanishWordElement = document.getElementById("spanishWord");
      if (spanishWordElement) {
        spanishWordElement.textContent = "No cards available";
      }
      return;
    }

    const card = this.currentCards[this.currentIndex];

    // Always ensure the card is showing the front (Spanish) side
    const flashcard = document.getElementById("flashcard");
    if (flashcard && flashcard.classList.contains("flipped")) {
      flashcard.classList.remove("flipped");
      this.isFlipped = false;
    }

    // Add null checks for all DOM elements
    const spanishWordElement = document.getElementById("spanishWord");
    const categoryElement = document.getElementById("category");
    const translationElement = document.getElementById("translation");
    const exampleElement = document.getElementById("example");

    if (spanishWordElement) spanishWordElement.textContent = card.word;
    if (categoryElement) categoryElement.textContent = card.category;
    if (translationElement) translationElement.textContent = card.translation;
    if (exampleElement)
      exampleElement.textContent = card.example || "No example available";

    // Update stats
    this.updateStats();
  }

  flipCard() {
    const flashcard = document.getElementById("flashcard");
    if (flashcard) {
      flashcard.classList.toggle("flipped");
      this.isFlipped = !this.isFlipped;
    }
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

      // Remove this card from current cards since it's now known
      this.currentCards.splice(this.currentIndex, 1);

      // Check if we've run out of unknown cards
      if (this.currentCards.length === 0) {
        // Show completion message and reset
        const categoryFilter = document.getElementById("categoryFilter");
        const category = categoryFilter ? categoryFilter.value : "all";
        const categoryText =
          category === "all" ? "" : ` in ${category} category`;

        setTimeout(() => {
          this.showSuccessCard(categoryText);
        }, 1500);
        return;
      }

      // Adjust index if we're at the end
      if (this.currentIndex >= this.currentCards.length) {
        this.currentIndex = 0;
      }

      // Wait 1.5 seconds, then reset card to front and show next card
      setTimeout(() => {
        // Reset card to front side before showing new content
        const flashcard = document.getElementById("flashcard");
        if (flashcard && this.isFlipped) {
          flashcard.classList.remove("flipped");
          this.isFlipped = false;
        }

        // Small delay to ensure visual transition, then show new card
        setTimeout(() => {
          this.updateStats();
          this.showCurrentCard();
        }, 100);
      }, 1500);
    } else {
      this.knownCardsSet.delete(card.id);
      this.saveProgress();

      // If card is not flipped, flip it to show translation
      if (!this.isFlipped) {
        this.flipCard();
      }

      // Wait 2 seconds, then reset card to front and show next card
      setTimeout(() => {
        // Reset card to front side before moving to next card
        const flashcard = document.getElementById("flashcard");
        if (flashcard && this.isFlipped) {
          flashcard.classList.remove("flipped");
          this.isFlipped = false;
        }

        // Small delay to ensure visual transition, then show next card
        setTimeout(() => {
          this.nextCard();
        }, 100);
      }, 2000);
    }
  }

  // Add method to show success card
  showSuccessCard(categoryText) {
    const spanishWordElement = document.getElementById("spanishWord");
    const categoryElement = document.getElementById("category");
    const translationElement = document.getElementById("translation");
    const exampleElement = document.getElementById("example");
    const cardHint = document.querySelector(".card-hint");

    // Reset card to front side if flipped
    const flashcard = document.getElementById("flashcard");
    if (flashcard && flashcard.classList.contains("flipped")) {
      flashcard.classList.remove("flipped");
      this.isFlipped = false;
    }

    // Update front side with success message
    if (spanishWordElement) {
      spanishWordElement.textContent = "¡Felicidades!";
      spanishWordElement.style.fontSize = "2.2em";
      spanishWordElement.style.color = "#27ae60";
    }

    if (categoryElement) {
      categoryElement.textContent = "Success";
      categoryElement.style.background = "#27ae60";
    }

    if (cardHint) {
      cardHint.textContent = "Click to see your achievement";
    }

    // Update back side with detailed success message
    if (translationElement) {
      translationElement.innerHTML = `
        <div style="text-align: center;">
          <div style="font-size: 2em; margin-bottom: 15px;">🎉</div>
          <div style="font-size: 1.2em; margin-bottom: 10px;">Congratulations!</div>
          <div style="font-size: 1em;">You've learned all cards${categoryText}!</div>
        </div>
      `;
    }

    if (exampleElement) {
      exampleElement.innerHTML = `
        <div style="text-align: center; font-style: normal;">
          <button onclick="window.vocabApp.filterCards()" style="
            background: #3498db; 
            color: white; 
            border: none; 
            padding: 10px 20px; 
            border-radius:  5px; 
            cursor: pointer; 
            margin: 5px;
            font-size: 14px;
          ">Show All Cards Again</button>
          <button onclick="window.vocabApp.resetProgress()" style="
            background: #e67e22; 
            color: white; 
            border: none; 
            padding: 10px 20px; 
            border-radius: 5px; 
            cursor: pointer; 
            margin: 5px;
            font-size: 14px;
          ">Reset All Progress</button>
        </div>
      `;
    }

    // Auto-flip to show the achievement after 2 seconds
    setTimeout(() => {
      if (!this.isFlipped) {
        this.flipCard();
      }
    }, 2000);

    // Update stats
    this.updateStats();
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
    // Calculate stats based on current filtered cards, not all cards
    const totalCurrentCards = this.currentCards.length;

    // For current cards display, we need to account for removed known cards
    const category = this.selectedCategory || "all";

    // Get the original filtered cards (before removing known ones)
    let originalFilteredCards =
      category === "all"
        ? [...this.allCards]
        : this.allCards.filter((card) => card.category === category);

    // Calculate known cards in current category/filter
    const currentKnownCards = originalFilteredCards.filter((card) =>
      this.knownCardsSet.has(card.id)
    ).length;

    const originalTotalCurrentCards = originalFilteredCards.length;
    const currentUnknownCards = originalTotalCurrentCards - currentKnownCards;

    // Also calculate overall stats for display
    const totalAllCards = this.allCards.length;
    const allKnownCards = this.knownCardsSet.size;
    const allUnknownCards = totalAllCards - allKnownCards;

    // Add null checks for all DOM elements
    const totalCardsElement = document.getElementById("totalCards");
    const currentCardElement = document.getElementById("currentCard");
    const knownCardsElement = document.getElementById("knownCards");
    const unknownCardsElement = document.getElementById("unknownCards");
    const progressFillElement = document.getElementById("progressFill");

    // Update display based on whether we're filtering or showing all
    const isFiltered = category !== "all";

    if (totalCardsElement) {
      // Show original total (including known cards) for the current filter
      totalCardsElement.textContent = isFiltered
        ? originalTotalCurrentCards
        : totalAllCards;
    }

    if (currentCardElement) {
      // Show current position in the remaining unknown cards
      currentCardElement.textContent =
        this.currentCards.length > 0 ? this.currentIndex + 1 : 0;
    }

    if (knownCardsElement) {
      // Show filtered known count if filtering, otherwise show total
      knownCardsElement.textContent = isFiltered
        ? currentKnownCards
        : allKnownCards;
    }

    if (unknownCardsElement) {
      // Show filtered unknown count if filtering, otherwise show total
      unknownCardsElement.textContent = isFiltered
        ? currentUnknownCards
        : allUnknownCards;
    }

    // Progress bar should reflect current category progress when filtered
    let progress;
    if (isFiltered) {
      // Show progress for current category
      progress =
        originalTotalCurrentCards > 0
          ? (currentKnownCards / originalTotalCurrentCards) * 100
          : 0;
    } else {
      // Show overall progress when showing all categories
      progress = totalAllCards > 0 ? (allKnownCards / totalAllCards) * 100 : 0;
    }

    if (progressFillElement) {
      progressFillElement.style.width = progress + "%";
    }
  }

  resetProgress() {
    if (confirm("Are you sure you want to reset all progress?")) {
      this.knownCardsSet.clear();
      localStorage.removeItem("dgt-vocab-progress");
      this.updateStats();
    }
  }

  // Mode Management
  setMode(mode) {
    this.currentMode = mode;

    try {
      // Update mode buttons - with error handling
      const modeButtons = document.querySelectorAll(".mode-btn");
      if (modeButtons && modeButtons.length) {
        modeButtons.forEach((btn) => btn.classList.remove("active"));

        // Try to find the active button safely
        const activeButton = document.querySelector(
          `.mode-btn[onclick*="setMode('${mode}')"]`
        );
        if (activeButton) {
          activeButton.classList.add("active");
        }
      }

      // Show/hide appropriate sections - with null checks
      const flashcardMode = document.getElementById("flashcardMode");
      const quizMode = document.getElementById("quizMode");

      if (mode === "flashcard") {
        if (flashcardMode) flashcardMode.style.display = "block";
        if (quizMode) quizMode.style.display = "none";
      } else if (mode === "quiz") {
        if (flashcardMode) flashcardMode.style.display = "none";
        if (quizMode) quizMode.style.display = "block";
        this.startQuiz();
      }
    } catch (error) {
      console.error("Error in setMode:", error);
    }
  }

  // Populate the category filter dropdown with actual categories
  populateCategoryFilter() {
    const categoryButtonsContainer = document.getElementById("categoryButtons");
    if (!categoryButtonsContainer) return;

    categoryButtonsContainer.innerHTML = ""; // Clear existing buttons

    // Create "All Categories" button first
    const allButton = document.createElement("button");
    allButton.className = "category-btn active"; // Start with "All" active
    allButton.textContent = "All Categories";
    allButton.dataset.category = "all";
    allButton.onclick = () => this.selectCategory("all", allButton);
    categoryButtonsContainer.appendChild(allButton);

    // Get and add all unique categories from vocabulary
    this.getUniqueCategories().forEach((category) => {
      const button = document.createElement("button");
      button.className = "category-btn";
      button.textContent = category.charAt(0).toUpperCase() + category.slice(1); // Capitalize first letter
      button.dataset.category = category;
      button.onclick = () => this.selectCategory(category, button);
      categoryButtonsContainer.appendChild(button);
    });
  }

  // New method to handle category selection
  selectCategory(category, clickedButton) {
    // Remove active class from all category buttons
    document.querySelectorAll(".category-btn").forEach(btn => {
      btn.classList.remove("active");
    });

    // Add active class to clicked button
    clickedButton.classList.add("active");

    // Store the selected category for filterCards method
    this.selectedCategory = category;

    // Apply the filter
    this.filterCards();
  }

  // Card Management
  filterCards() {
    // Use the stored selected category instead of reading from dropdown
    const category = this.selectedCategory || "all";

    // First apply category filter
    let filteredCards =
      category === "all"
        ? [...this.allCards]
        : this.allCards.filter((card) => card.category === category);

    // Then filter out known cards to show only unknown cards
    this.currentCards = filteredCards.filter(
      (card) => !this.knownCardsSet.has(card.id)
    );

    // If no unknown cards remain, show success card and reset to all cards in category
    if (this.currentCards.length === 0) {
      const categoryText = category === "all" ? "" : ` in ${category} category`;

      // Show success card instead of alert
      this.showSuccessCard(categoryText);

      // Reset to show all cards in the category (including known ones) after showing success
      setTimeout(() => {
        this.currentCards = filteredCards;
        this.shuffleArray(this.currentCards);
        this.currentIndex = 0;
        this.updateStats();
        this.showCurrentCard();
        this.updateCategoryInfo();
        this.refreshCurrentMode();
      }, 5000); // Wait 5 seconds before auto-resetting
      return;
    }

    // Always shuffle cards when changing categories
    this.shuffleArray(this.currentCards);
    this.currentIndex = 0;
    this.updateStats();
    this.showCurrentCard();

    // Update category info display
    this.updateCategoryInfo();

    // Refresh the current mode to restart with filtered cards
    this.refreshCurrentMode();
  }

  // New method to update category information display
  updateCategoryInfo() {
    const categoryInfo = document.getElementById("categoryInfo");
    
    if (categoryInfo) {
      const selectedCategory = this.selectedCategory || "all";
      if (selectedCategory === "all") {
        categoryInfo.textContent = "All Categories";
      } else {
        const categoryName =
          selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
        categoryInfo.textContent = `${categoryName} Only`;
      }
    }
  }

  // New method to refresh the current mode
  refreshCurrentMode() {
    if (this.currentMode === "quiz") {
      // Restart quiz with filtered cards
      this.startQuiz();
    } else if (this.currentMode === "flashcard") {
      // Just show the current card (already handled in filterCards)
      this.showCurrentCard();
    }
  }

  shuffleCards() {
    this.shuffleArray(this.currentCards);
    this.currentIndex = 0;
    this.showCurrentCard();
  }

  showCurrentCard() {
    if (this.currentCards.length === 0) {
      const spanishWordElement = document.getElementById("spanishWord");
      if (spanishWordElement) {
        spanishWordElement.textContent = "No cards available";
      }
      return;
    }

    const card = this.currentCards[this.currentIndex];

    // Always ensure the card is showing the front (Spanish) side
    const flashcard = document.getElementById("flashcard");
    if (flashcard && flashcard.classList.contains("flipped")) {
      flashcard.classList.remove("flipped");
      this.isFlipped = false;
    }

    // Add null checks for all DOM elements
    const spanishWordElement = document.getElementById("spanishWord");
    const categoryElement = document.getElementById("category");
    const translationElement = document.getElementById("translation");
    const exampleElement = document.getElementById("example");

    if (spanishWordElement) spanishWordElement.textContent = card.word;
    if (categoryElement) categoryElement.textContent = card.category;
    if (translationElement) translationElement.textContent = card.translation;
    if (exampleElement)
      exampleElement.textContent = card.example || "No example available";

    // Update stats
    this.updateStats();
  }

  flipCard() {
    const flashcard = document.getElementById("flashcard");
    if (flashcard) {
      flashcard.classList.toggle("flipped");
      this.isFlipped = !this.isFlipped;
    }
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

      // Remove this card from current cards since it's now known
      this.currentCards.splice(this.currentIndex, 1);

      // Check if we've run out of unknown cards
      if (this.currentCards.length === 0) {
        // Show completion message and reset
        const categoryFilter = document.getElementById("categoryFilter");
        const category = categoryFilter ? categoryFilter.value : "all";
        const categoryText =
          category === "all" ? "" : ` in ${category} category`;

        setTimeout(() => {
          this.showSuccessCard(categoryText);
        }, 1500);
        return;
      }

      // Adjust index if we're at the end
      if (this.currentIndex >= this.currentCards.length) {
        this.currentIndex = 0;
      }

      // Wait 1.5 seconds, then reset card to front and show next card
      setTimeout(() => {
        // Reset card to front side before showing new content
        const flashcard = document.getElementById("flashcard");
        if (flashcard && this.isFlipped) {
          flashcard.classList.remove("flipped");
          this.isFlipped = false;
        }

        // Small delay to ensure visual transition, then show new card
        setTimeout(() => {
          this.updateStats();
          this.showCurrentCard();
        }, 100);
      }, 1500);
    } else {
      this.knownCardsSet.delete(card.id);
      this.saveProgress();

      // If card is not flipped, flip it to show translation
      if (!this.isFlipped) {
        this.flipCard();
      }

      // Wait 2 seconds, then reset card to front and show next card
      setTimeout(() => {
        // Reset card to front side before moving to next card
        const flashcard = document.getElementById("flashcard");
        if (flashcard && this.isFlipped) {
          flashcard.classList.remove("flipped");
          this.isFlipped = false;
        }

        // Small delay to ensure visual transition, then show next card
        setTimeout(() => {
          this.nextCard();
        }, 100);
      }, 2000);
    }
  }

  // Add method to show success card
  showSuccessCard(categoryText) {
    const spanishWordElement = document.getElementById("spanishWord");
    const categoryElement = document.getElementById("category");
    const translationElement = document.getElementById("translation");
    const exampleElement = document.getElementById("example");
    const cardHint = document.querySelector(".card-hint");

    // Reset card to front side if flipped
    const flashcard = document.getElementById("flashcard");
    if (flashcard && flashcard.classList.contains("flipped")) {
      flashcard.classList.remove("flipped");
      this.isFlipped = false;
    }

    // Update front side with success message
    if (spanishWordElement) {
      spanishWordElement.textContent = "¡Felicidades!";
      spanishWordElement.style.fontSize = "2.2em";
      spanishWordElement.style.color = "#27ae60";
    }

    if (categoryElement) {
      categoryElement.textContent = "Success";
      categoryElement.style.background = "#27ae60";
    }

    if (cardHint) {
      cardHint.textContent = "Click to see your achievement";
    }

    // Update back side with detailed success message
    if (translationElement) {
      translationElement.innerHTML = `
        <div style="text-align: center;">
          <div style="font-size: 2em; margin-bottom: 15px;">🎉</div>
          <div style="font-size: 1.2em; margin-bottom: 10px;">Congratulations!</div>
          <div style="font-size: 1em;">You've learned all cards${categoryText}!</div>
        </div>
      `;
    }

    if (exampleElement) {
      exampleElement.innerHTML = `
        <div style="text-align: center; font-style: normal;">
          <button onclick="window.vocabApp.filterCards()" style="
            background: #3498db; 
            color: white; 
            border: none; 
            padding: 10px 20px; 
            border-radius: 5px; 
            cursor: pointer; 
            margin: 5px;
            font-size: 14px;
          ">Show All Cards Again</button>
          <button onclick="window.vocabApp.resetProgress()" style="
            background: #e67e22; 
            color: white; 
            border: none; 
            padding: 10px 20px; 
            border-radius: 5px; 
            cursor: pointer; 
            margin: 5px;
            font-size: 14px;
          ">Reset All Progress</button>
        </div>
      `;
    }

    // Auto-flip to show the achievement after 2 seconds
    setTimeout(() => {
      if (!this.isFlipped) {
        this.flipCard();
      }
    }, 2000);

    // Update stats
    this.updateStats();
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
    // Calculate stats based on current filtered cards, not all cards
    const totalCurrentCards = this.currentCards.length;

    // For current cards display, we need to account for removed known cards
    const category = this.selectedCategory || "all";

    // Get the original filtered cards (before removing known ones)
    let originalFilteredCards =
      category === "all"
        ? [...this.allCards]
        : this.allCards.filter((card) => card.category === category);

    // Calculate known cards in current category/filter
    const currentKnownCards = originalFilteredCards.filter((card) =>
      this.knownCardsSet.has(card.id)
    ).length;

    const originalTotalCurrentCards = originalFilteredCards.length;
    const currentUnknownCards = originalTotalCurrentCards - currentKnownCards;

    // Also calculate overall stats for display
    const totalAllCards = this.allCards.length;
    const allKnownCards = this.knownCardsSet.size;
    const allUnknownCards = totalAllCards - allKnownCards;

    // Add null checks for all DOM elements
    const totalCardsElement = document.getElementById("totalCards");
    const currentCardElement = document.getElementById("currentCard");
    const knownCardsElement = document.getElementById("knownCards");
    const unknownCardsElement = document.getElementById("unknownCards");
    const progressFillElement = document.getElementById("progressFill");

    // Update display based on whether we're filtering or showing all
    const isFiltered = category !== "all";

    if (totalCardsElement) {
      // Show original total (including known cards) for the current filter
      totalCardsElement.textContent = isFiltered
        ? originalTotalCurrentCards
        : totalAllCards;
    }

    if (currentCardElement) {
      // Show current position in the remaining unknown cards
      currentCardElement.textContent =
        this.currentCards.length > 0 ? this.currentIndex + 1 : 0;
    }

    if (knownCardsElement) {
      // Show filtered known count if filtering, otherwise show total
      knownCardsElement.textContent = isFiltered
        ? currentKnownCards
        : allKnownCards;
    }

    if (unknownCardsElement) {
      // Show filtered unknown count if filtering, otherwise show total
      unknownCardsElement.textContent = isFiltered
        ? currentUnknownCards
        : allUnknownCards;
    }

    // Progress bar should reflect current category progress when filtered
    let progress;
    if (isFiltered) {
      // Show progress for current category
      progress =
        originalTotalCurrentCards > 0
          ? (currentKnownCards / originalTotalCurrentCards) * 100
          : 0;
    } else {
      // Show overall progress when showing all categories
      progress = totalAllCards > 0 ? (allKnownCards / totalAllCards) * 100 : 0;
    }

    if (progressFillElement) {
      progressFillElement.style.width = progress + "%";
    }
  }

  resetProgress() {
    if (confirm("Are you sure you want to reset all progress?")) {
      this.knownCardsSet.clear();
      localStorage.removeItem("dgt-vocab-progress");
      this.updateStats();
    }
  }

  // Mode Management
  setMode(mode) {
    this.currentMode = mode;

    try {
      // Update mode buttons - with error handling
      const modeButtons = document.querySelectorAll(".mode-btn");
      if (modeButtons && modeButtons.length) {
        modeButtons.forEach((btn) => btn.classList.remove("active"));

        // Try to find the active button safely
        const activeButton = document.querySelector(
          `.mode-btn[onclick*="setMode('${mode}')"]`
        );
        if (activeButton) {
          activeButton.classList.add("active");
        }
      }

      // Show/hide appropriate sections - with null checks
      const flashcardMode = document.getElementById("flashcardMode");
      const quizMode = document.getElementById("quizMode");

      if (mode === "flashcard") {
        if (flashcardMode) flashcardMode.style.display = "block";
        if (quizMode) quizMode.style.display = "none";
      } else if (mode === "quiz") {
        if (flashcardMode) flashcardMode.style.display = "none";
        if (quizMode) quizMode.style.display = "block";
        this.startQuiz();
      }
    } catch (error) {
      console.error("Error in setMode:", error);
    }
  }

  // Populate the category filter dropdown with actual categories
  populateCategoryFilter() {
    const categoryButtonsContainer = document.getElementById("categoryButtons");
    if (!categoryButtonsContainer) return;

    categoryButtonsContainer.innerHTML = ""; // Clear existing buttons

    // Create "All Categories" button first
    const allButton = document.createElement("button");
    allButton.className = "category-btn active"; // Start with "All" active
    allButton.textContent = "All Categories";
    allButton.dataset.category = "all";
    allButton.onclick = () => this.selectCategory("all", allButton);
    categoryButtonsContainer.appendChild(allButton);

    // Get and add all unique categories from vocabulary
    this.getUniqueCategories().forEach((category) => {
      const button = document.createElement("button");
      button.className = "category-btn";
      button.textContent = category.charAt(0).toUpperCase() + category.slice(1); // Capitalize first letter
      button.dataset.category = category;
      button.onclick = () => this.selectCategory(category, button);
      categoryButtonsContainer.appendChild(button);
    });
  }

  // New method to handle category selection
  selectCategory(category, clickedButton) {
    // Remove active class from all category buttons
    document.querySelectorAll(".category-btn").forEach(btn => {
      btn.classList.remove("active");
    });

    // Add active class to clicked button
    clickedButton.classList.add("active");

    // Store the selected category for filterCards method
    this.selectedCategory = category;

    // Apply the filter
    this.filterCards();
  }

  // Card Management
  filterCards() {
    // Use the stored selected category instead of reading from dropdown
    const category = this.selectedCategory || "all";

    // First apply category filter
    let filteredCards =
      category === "all"
        ? [...this.allCards]
        : this.allCards.filter((card) => card.category === category);

    // Then filter out known cards to show only unknown cards
    this.currentCards = filteredCards.filter(
      (card) => !this.knownCardsSet.has(card.id)
    );

    // If no unknown cards remain, show success card and reset to all cards in category
    if (this.currentCards.length === 0) {
      const categoryText = category === "all" ? "" : ` in ${category} category`;

      // Show success card instead of alert
      this.showSuccessCard(categoryText);

      // Reset to show all cards in the category (including known ones) after showing success
      setTimeout(() => {
        this.currentCards = filteredCards;
        this.shuffleArray(this.currentCards);
        this.currentIndex = 0;
        this.updateStats();
        this.showCurrentCard();
        this.updateCategoryInfo();
        this.refreshCurrentMode();
      }, 5000); // Wait 5 seconds before auto-resetting
      return;
    }

    // Always shuffle cards when changing categories
    this.shuffleArray(this.currentCards);
    this.currentIndex = 0;
    this.updateStats();
    this.showCurrentCard();

    // Update category info display
    this.updateCategoryInfo();

    // Refresh the current mode to restart with filtered cards
    this.refreshCurrentMode();
  }

  // New method to update category information display
  updateCategoryInfo() {
    const categoryInfo = document.getElementById("categoryInfo");
    
    if (categoryInfo) {
      const selectedCategory = this.selectedCategory || "all";
      if (selectedCategory === "all") {
        categoryInfo.textContent = "All Categories";
      } else {
        const categoryName =
          selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
        categoryInfo.textContent = `${categoryName} Only`;
      }
    }
  }

  // New method to refresh the current mode
  refreshCurrentMode() {
    if (this.currentMode === "quiz") {
      // Restart quiz with filtered cards
      this.startQuiz();
    } else if (this.currentMode === "flashcard") {
      // Just show the current card (already handled in filterCards)
      this.showCurrentCard();
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

    // Always include common categories if not already present
    ["noun", "verb", "adjective", "adverb", "other"].forEach((cat) => {
      categories.add(cat);
    });

    return Array.from(categories).sort();
  }

  // UI Helper Functions
  showMessage(text, type) {
    const messageContainer = document.getElementById("messageContainer");
    if (messageContainer) {
      messageContainer.innerHTML = `<div class="${type}-message">${text}</div>`;
      // Ensure the message is visible
      messageContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  clearMessages() {
    const messageContainer = document.getElementById("messageContainer");
    if (messageContainer) {
      messageContainer.innerHTML = "";
    }
  }

  // Simplified version without references to add word form fields
  clearFieldErrors() {
    document.querySelectorAll("input.error").forEach((field) => {
      field.classList.remove("error");
      // Removed references to add word form placeholders
    });
  }

  // Quiz Functionality
  startQuiz() {
    if (this.currentCards.length < 4) {
      const categoryFilter = document.getElementById("categoryFilter");
      const isFiltered = categoryFilter && categoryFilter.value !== "all";
      const message = isFiltered
        ? `Need at least 4 cards for quiz mode. Current category has only ${this.currentCards.length} cards.`
        : "Need at least 4 cards for quiz mode";
      alert(message);
      return;
    }

    this.quizScore = 0;
    this.quizTotal = 0;
    this.nextQuizQuestion();
  }

  nextQuizQuestion() {
    if (this.currentCards.length < 4) return;

    // Get unknown cards only for quiz questions
    const unknownCards = this.currentCards.filter(
      (card) => !this.knownCardsSet.has(card.id)
    );

    // If no unknown cards remain, show completion message
    if (unknownCards.length === 0) {
      const categoryFilter = document.getElementById("categoryFilter");
      const category = categoryFilter ? categoryFilter.value : "all";
      const categoryText = category === "all" ? "" : ` in ${category} category`;

      const quizQuestion = document.getElementById("quizQuestion");
      quizQuestion.textContent = `🎉 Congratulations! You know all cards${categoryText}!`;

      // Clear quiz options
      const optionsContainer = document.getElementById("quizOptions");
      if (optionsContainer) {
        optionsContainer.innerHTML = `
          <div style="text-align: center; padding: 40px; font-size: 1.2rem; color: #28a745;">
            <p>🏆 Quiz Complete!</p>
            <p>Switch to flashcard mode or change category to continue learning.</p>
          </div>
        `;
      }
      return;
    }

    // Get a random unknown card as the correct answer
    const correctCard =
      unknownCards[Math.floor(Math.random() * unknownCards.length)];
    const options = [correctCard];

    // Add 3 random wrong options from ALL cards (not just unknown ones)
    // This ensures we always have enough options even with small category filters
    while (options.length < 4) {
      const randomCard =
        this.allCards[Math.floor(Math.random() * this.allCards.length)];
      if (
        !options.find((card) => card.translation === randomCard.translation) &&
        randomCard.id !== correctCard.id
      ) {
        options.push(randomCard);
      }
    }

    this.shuffleArray(options);

    // Update question text
    const quizQuestion = document.getElementById("quizQuestion");
    quizQuestion.textContent = `What does "${correctCard.word}" mean?`;

    // Get options container
    const optionsContainer = document.getElementById("quizOptions");

    if (!optionsContainer) return;

    // Clear existing options
    optionsContainer.innerHTML = "";

    // Create and append each option as a flippable card
    options.forEach((option, index) => {
      // Create card container
      const cardContainer = document.createElement("div");
      cardContainer.className = "quiz-card-container";

      // Create flippable card
      const card = document.createElement("div");
      card.className = "quiz-card";
      card.id = `quiz-card-${index}`;

      // Store data attributes
      card.dataset.optionId = option.id;
      card.dataset.correctId = correctCard.id;

      // Create front face (shows the option translation)
      const frontFace = document.createElement("div");
      frontFace.className = "quiz-card-face quiz-card-front";
      frontFace.innerHTML = `<div class="quiz-option-text">${option.translation}</div>`;

      // Create back face (shows the word for this translation)
      const backFace = document.createElement("div");
      backFace.className = "quiz-card-face quiz-card-back";

      // Add click handler
      card.onclick = (e) => {
        // Prevent event from bubbling if we clicked on a flipped card
        if (card.classList.contains("flipped")) {
          e.stopPropagation();
          return;
        }
        this.selectQuizOption(card);
      };

      // Assemble the card
      card.appendChild(frontFace);
      card.appendChild(backFace);
      cardContainer.appendChild(card);

      // Add to options container
      optionsContainer.appendChild(cardContainer);
    });

    // Hide next button as we won't need it anymore
    const nextBtn = document.getElementById("nextQuizBtn");
    if (nextBtn) {
      nextBtn.style.display = "none";
    }
  }

  selectQuizOption(element) {
    // Get the IDs from data attributes
    const selectedId = parseInt(element.dataset.optionId);
    const correctId = parseInt(element.dataset.correctId);
    const isCorrect = selectedId === correctId;

    // Find the selected card's option data
    const selectedCard = this.allCards.find((card) => card.id === selectedId);
    if (!selectedCard) return;

    // Update the back face of the clicked card
    const backFace = element.querySelector(".quiz-card-back");
    if (backFace) {
      if (isCorrect) {
        // For correct answer
        backFace.classList.add("correct");
        backFace.innerHTML = `
          <div class="quiz-result correct">✓ Correct!</div>
          <div class="quiz-card-word">${selectedCard.word}</div>
          <div class="quiz-card-translation">${selectedCard.translation}</div>
        `;

        // Add card to known set if correct
        this.knownCardsSet.add(correctId);
        this.saveProgress();

        // Remove the card from current cards since it's now known
        this.currentCards = this.currentCards.filter(
          (card) => card.id !== correctId
        );

        // Update stats instead of showing score
        this.updateStats();

        // Disable all cards after correct answer is found
        document.querySelectorAll(".quiz-card").forEach((card) => {
          card.style.pointerEvents = "none";
          if (card !== element) {
            card.classList.add("disabled");
          }
        });

        // Update the question area without showing score
        const quizQuestion = document.getElementById("quizQuestion");
        quizQuestion.textContent = `Correct!`;

        // Move to next question automatically after a delay
        setTimeout(() => {
          this.nextQuizQuestion();
        }, 2000);
      } else {
        // For incorrect answer
        backFace.classList.add("wrong");
        backFace.innerHTML = `
          <div class="quiz-result wrong">✗ Try Again</div>
          <div class="quiz-card-word">${selectedCard.word}</div>
          <div class="quiz-card-translation">${selectedCard.translation}</div>
        `;

        // Flip the card and leave it flipped (wrong cards stay flipped)
        element.classList.add("flipped");
        element.style.pointerEvents = "none"; // Disable this card so it can't be clicked again
      }
    }

    // Flip the card
    element.classList.add("flipped");
  }

  // Add method to show all cards (including known ones)
  showAllCards() {
    const category = this.selectedCategory || "all";

    // Reset to show all cards in the current category (including known ones)
    this.currentCards =
      category === "all"
        ? [...this.allCards]
        : this.allCards.filter((card) => card.category === category);

    // Always shuffle when showing all cards
    this.shuffleArray(this.currentCards);
    this.currentIndex = 0;

    // Ensure card is reset to front side before showing new content
    const flashcard = document.getElementById("flashcard");
    if (flashcard && flashcard.classList.contains("flipped")) {
      flashcard.classList.remove("flipped");
      this.isFlipped = false;
    }

    this.updateStats();
    this.showCurrentCard();

    // Update category info display
    this.updateCategoryInfo();

    // Refresh the current mode
    this.refreshCurrentMode();

    // Show message
    this.showMessage("Showing all cards (including known cards)", "info");
    setTimeout(() => this.clearMessages(), 2000);
  }
} // End of DGTVocabulary class

// Global instance and functions for backward compatibility
let vocabApp;

// Spanish DGT Vocabulary Flashcards - UI Functions

// Global function to flip cards
function flipCard() {
  if (window.vocabApp) {
    window.vocabApp.flipCard();
  }
}

// Functions that need to be globally accessible for HTML onclick attributes
function resetProgress() {
  if (window.vocabApp) {
    window.vocabApp.resetProgress();
  }
}

function markCard(known) {
  if (window.vocabApp) {
    window.vocabApp.markCard(known);
  }
}

function setMode(mode, event) {
  try {
    if (window.vocabApp) {
      window.vocabApp.setMode(mode);

      // If event is provided, update active state directly
      if (event && event.target) {
        const modeButtons = document.querySelectorAll(".mode-btn");
        if (modeButtons && modeButtons.length) {
          modeButtons.forEach((btn) => btn.classList.remove("active"));
          event.target.classList.add("active");
        }
      }
    }
  } catch (error) {
    console.error("Error in setMode global function:", error);
  }
}

function nextQuizQuestion() {
  if (window.vocabApp) {
    window.vocabApp.nextQuizQuestion();
  }
}

// Add global refresh function
function refreshCurrentMode() {
  if (window.vocabApp) {
    window.vocabApp.refreshCurrentMode();
  }
}

// Add global function for showing all cards
function showAllCards() {
  if (window.vocabApp) {
    window.vocabApp.showAllCards();
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Only initialize the main functionality if we're on the main page
  if (window.isVocabManagerPage) {
    console.log("On vocabulary manager page, not initializing main app");
    return;
  }

  // Check if we're on a page that needs the DGTVocabulary functionality
  const flashcardElement = document.getElementById("flashcard");
  if (flashcardElement) {
    window.vocabApp = new DGTVocabulary();
    console.log("DGTVocabulary initialized with flashcard element found");
  } else {
    console.log(
      "Flashcard element not found, skipping DGTVocabulary initialization"
    );
  }
});