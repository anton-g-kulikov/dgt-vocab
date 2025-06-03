// Flashcard mode functionality

class FlashcardMode {
  constructor(vocabApp) {
    this.vocabApp = vocabApp;
    this.isFlipped = false;
    this.showingAllCards = false; // Track current mode - starts with unknown only
  }

  showCurrentCard() {
    if (this.vocabApp.currentCards.length === 0) {
      const spanishWordElement = document.getElementById("spanishWord");
      if (spanishWordElement) {
        spanishWordElement.textContent = "No cards available";
      }
      return;
    }

    const card = this.vocabApp.currentCards[this.vocabApp.currentIndex];

    // Track the interaction with this card
    this.vocabApp.trackCardInteraction(card.id);

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

    if (spanishWordElement) {
      spanishWordElement.textContent = card.word;
      // Reset any custom styling that might have been applied
      spanishWordElement.style.fontSize = "";
      spanishWordElement.style.color = "";
    }

    if (categoryElement) {
      categoryElement.textContent = card.category;
      // Reset any custom styling
      categoryElement.style.background = "";
    }

    if (translationElement) {
      this.updateTranslation(card);
    }

    if (exampleElement)
      exampleElement.textContent = card.example || "No example available";

    // Update stats
    this.vocabApp.updateStats();
  }

  flipCard() {
    const flashcard = document.getElementById("flashcard");
    if (flashcard) {
      flashcard.classList.toggle("flipped");
      this.isFlipped = !this.isFlipped;

      // If the card is being flipped to show the back, make sure translation is updated
      if (this.isFlipped) {
        const card = this.vocabApp.currentCards[this.vocabApp.currentIndex];
        this.updateTranslation(card);
      }
    }
  }

  markCard(known) {
    const card = this.vocabApp.currentCards[this.vocabApp.currentIndex];

    // Always track interaction when explicitly marking a card
    this.vocabApp.trackCardInteraction(card.id);

    // Track analytics
    if (window.Analytics) {
      const knownCount = this.vocabApp.knownCardsSet.size;
      const totalInCategory =
        this.vocabApp.selectedCategory === "all"
          ? this.vocabApp.allCards.length
          : this.vocabApp.allCards.filter(
              (c) => c.category === this.vocabApp.selectedCategory
            ).length;
      window.Analytics.trackCardInteraction(
        known ? "Known" : "Unknown",
        this.vocabApp.selectedCategory,
        knownCount
      );
    }

    if (known) {
      this.vocabApp.knownCardsSet.add(card.id);
      this.vocabApp.saveProgress();

      // If card is not flipped, flip it to show translation
      if (!this.isFlipped) {
        this.flipCard();
      }

      // Remove this card from current cards since it's now known
      this.vocabApp.currentCards.splice(this.vocabApp.currentIndex, 1);

      // Check if we've run out of unknown cards
      if (this.vocabApp.currentCards.length === 0) {
        const category = this.vocabApp.selectedCategory || "all";
        const categoryText =
          category === "all" ? "" : ` in ${category} category`;

        setTimeout(() => {
          this.showSuccessCard(categoryText);
        }, 1500);
        return;
      }

      // Adjust index if we're at the end
      if (this.vocabApp.currentIndex >= this.vocabApp.currentCards.length) {
        this.vocabApp.currentIndex = 0;
      }

      // Wait 1.5 seconds, then reset card to front and show next card
      setTimeout(() => {
        const flashcard = document.getElementById("flashcard");
        if (flashcard && this.isFlipped) {
          flashcard.classList.remove("flipped");
          this.isFlipped = false;
        }

        setTimeout(() => {
          this.vocabApp.updateStats();
          this.showCurrentCard();
        }, 100);
      }, 1500);
    } else {
      this.vocabApp.knownCardsSet.delete(card.id);
      this.vocabApp.saveProgress();

      // If card is not flipped, flip it to show translation
      if (!this.isFlipped) {
        this.flipCard();
      }

      // Wait 2 seconds, then reset card to front and show next card
      setTimeout(() => {
        const flashcard = document.getElementById("flashcard");
        if (flashcard && this.isFlipped) {
          flashcard.classList.remove("flipped");
          this.isFlipped = false;
        }

        setTimeout(() => {
          this.nextCard();
        }, 100);
      }, 2000);
    }
  }

  nextCard() {
    // First reset the card to front side to avoid showing the next translation briefly
    if (this.isFlipped) {
      document.getElementById("flashcard").classList.remove("flipped");
      this.isFlipped = false;
    }

    // Small delay to ensure the card is flipped back before changing content
    setTimeout(() => {
      this.vocabApp.currentIndex =
        (this.vocabApp.currentIndex + 1) % this.vocabApp.currentCards.length;
      this.showCurrentCard();
    }, 100);
  }

  refreshDisplay() {
    // Sort by interaction time rather than shuffling
    this.vocabApp.sortCardsByLastInteraction();
    this.vocabApp.currentIndex = 0;

    // Ensure card is reset to front side before showing new content
    const flashcard = document.getElementById("flashcard");
    if (flashcard && flashcard.classList.contains("flipped")) {
      flashcard.classList.remove("flipped");
      this.isFlipped = false;
    }

    this.vocabApp.updateStats();
    this.showCurrentCard();

    // Update category info display
    if (this.vocabApp.categoryManager) {
      this.vocabApp.categoryManager.updateCategoryInfo();
    }
  }

  // Replace shuffleCards method with a method that sorts by interaction time
  shuffleCards() {
    // Instead of shuffling, sort by interaction time
    this.vocabApp.sortCardsByLastInteraction();
    this.vocabApp.currentIndex = 0;
    this.showCurrentCard();
  }

  showSuccessCard(categoryText) {
    const spanishWordElement = document.getElementById("spanishWord");
    const categoryElement = document.getElementById("category");
    const translationElement = document.getElementById("translation");
    const exampleElement = document.getElementById("example");

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
        <div style="text-align: center; font-style: normal; color: #27ae60; padding: 20px;">
          <p>Switch to another category or change display mode to continue learning.</p>
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
    this.vocabApp.updateStats();
  }

  toggleShowAllCards() {
    if (this.showingAllCards) {
      // Currently showing all cards, switch to unknown only
      this.showUnknownOnly();
    } else {
      // Currently showing unknown only, switch to all cards
      this.showAllCards();
    }
  }

  showUnknownOnly() {
    const category = this.vocabApp.selectedCategory || "all";
    this.showingAllCards = false;

    // Filter to show only unknown cards
    let filteredCards =
      category === "all"
        ? [...this.vocabApp.allCards]
        : this.vocabApp.allCards.filter((card) => card.category === category);

    this.vocabApp.currentCards = filteredCards.filter(
      (card) => !this.vocabApp.knownCardsSet.has(card.id)
    );

    // Update button text and style
    this.updateToggleButton();

    // Show message
    if (window.UIHelpers) {
      window.UIHelpers.showMessage("Showing only unknown cards", "info");
      setTimeout(() => window.UIHelpers.clearMessages(), 2000);
    }

    this.refreshDisplay();
  }

  showAllCards() {
    const category = this.vocabApp.selectedCategory || "all";
    this.showingAllCards = true;

    // Show all cards in the current category (including known ones)
    this.vocabApp.currentCards =
      category === "all"
        ? [...this.vocabApp.allCards]
        : this.vocabApp.allCards.filter((card) => card.category === category);

    // Update button text and style
    this.updateToggleButton();

    // Show message
    if (window.UIHelpers) {
      window.UIHelpers.showMessage(
        "Showing all cards (including known cards)",
        "info"
      );
      setTimeout(() => window.UIHelpers.clearMessages(), 2000);
    }

    this.refreshDisplay();
  }

  updateToggleButton() {
    const showAllToggle = document.getElementById("showAllToggle");
    if (showAllToggle) {
      if (this.showingAllCards) {
        showAllToggle.classList.add("all-cards");
      } else {
        showAllToggle.classList.remove("all-cards");
      }
    }
  }

  // Method to update translation based on language preference
  updateTranslation(card) {
    const translationElement = document.getElementById("translation");
    if (translationElement) {
      if (this.vocabApp.currentLanguage === "en") {
        translationElement.textContent = card.translation || "";
      } else {
        // Get the Russian translation
        translationElement.textContent = card.perevod || card.translation || "";
      }
    }
  }
}

// Make FlashcardMode available globally
window.FlashcardMode = FlashcardMode;
