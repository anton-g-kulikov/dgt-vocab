// Stats management for the DGT Vocab app

class StatsManager {
  constructor(vocabApp) {
    this.vocabApp = vocabApp;
  }

  updateStats() {
    // Get filtered cards based on current topic and category selection
    const filteredCards = this.vocabApp.applyFilters();

    // Update total cards count based on filtered cards
    const totalCards = filteredCards.length;

    // Count known cards within the filtered set
    const knownCards = filteredCards.filter((card) =>
      this.vocabApp.knownCardsSet.has(card.id)
    ).length;

    // Count unknown cards within the filtered set
    const unknownCards = totalCards - knownCards;

    // Calculate current position based on current cards (not filtered cards)
    const currentCards = this.vocabApp.currentCards.length;
    const currentPosition = Math.min(
      this.vocabApp.currentIndex + 1,
      currentCards
    );

    // Update the display elements using the correct IDs from the HTML
    const totalCardsElement = document.getElementById("totalCards");
    const currentCardElement = document.getElementById("currentCard");
    const knownCardsElement = document.getElementById("knownCards");
    const unknownCardsElement = document.getElementById("unknownCards");
    const progressFillElement = document.getElementById("progressFill");

    if (totalCardsElement) {
      totalCardsElement.textContent = totalCards;
    }

    if (currentCardElement) {
      if (currentCards > 0) {
        currentCardElement.textContent = currentPosition;
      } else {
        currentCardElement.textContent = 0;
      }
    }

    if (knownCardsElement) {
      knownCardsElement.textContent = knownCards;
    }

    if (unknownCardsElement) {
      unknownCardsElement.textContent = unknownCards;
    }

    // Update progress bar based on filtered cards
    if (progressFillElement) {
      const progress = totalCards > 0 ? (knownCards / totalCards) * 100 : 0;
      progressFillElement.style.width = progress + "%";
    }

    // Update filter info to show current topic and category
    this.updateFilterDisplay();

    console.log(
      `Stats updated: ${totalCards} total filtered, ${currentCards} current, ${knownCards} known, ${unknownCards} unknown`
    );
  }

  updateFilterDisplay() {
    const categoryInfo = document.getElementById("categoryInfo");
    if (!categoryInfo) return;

    const selectedCategory = this.vocabApp.selectedCategory || "all";
    const selectedTopic = this.vocabApp.selectedTopic || "all";

    let infoText = "";

    if (selectedCategory === "all" && selectedTopic === "all") {
      infoText = "All Categories & Topics";
    } else if (selectedCategory === "all") {
      infoText = window.TopicUtils
        ? window.TopicUtils.getTopicName(selectedTopic)
        : "Topic Selected";
    } else if (selectedTopic === "all") {
      const categoryName =
        selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
      infoText = `${categoryName} Only`;
    } else {
      const categoryName =
        selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
      const topicName = window.TopicUtils
        ? window.TopicUtils.getTopicName(selectedTopic)
        : "Topic";
      infoText = `${categoryName} + ${topicName}`;
    }

    categoryInfo.textContent = infoText;
  }
}

// Make StatsManager available globally
window.StatsManager = StatsManager;
