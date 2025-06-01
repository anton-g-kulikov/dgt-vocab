// Statistics and progress tracking functionality

class StatsManager {
  constructor(vocabApp) {
    this.vocabApp = vocabApp;
  }

  updateStats() {
    const category = this.vocabApp.selectedCategory || "all";

    // Get the original filtered cards (before removing known ones)
    let originalFilteredCards =
      category === "all"
        ? [...this.vocabApp.allCards]
        : this.vocabApp.allCards.filter((card) => card.category === category);

    // Calculate known cards in current category/filter
    const currentKnownCards = originalFilteredCards.filter((card) =>
      this.vocabApp.knownCardsSet.has(card.id)
    ).length;

    const originalTotalCurrentCards = originalFilteredCards.length;
    const currentUnknownCards = originalTotalCurrentCards - currentKnownCards;

    // Also calculate overall stats for display
    const totalAllCards = this.vocabApp.allCards.length;
    const allKnownCards = this.vocabApp.knownCardsSet.size;
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
        this.vocabApp.currentCards.length > 0
          ? this.vocabApp.currentIndex + 1
          : 0;
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
}

// Make StatsManager available globally
window.StatsManager = StatsManager;
