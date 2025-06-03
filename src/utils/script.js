// Spanish DGT Vocabulary Flashcards - Main Application Entry Point

// Global instance
let vocabApp;

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded, initializing app");

  // Initialize vocabulary app
  if (typeof window.DGTVocabulary !== "undefined") {
    window.vocabApp = new window.DGTVocabulary();
    console.log("DGTVocabulary app initialized");

    // Don't force quiz mode start - let it be triggered by user interaction
    // setTimeout(() => {
    //   if (window.vocabApp && window.vocabApp.currentMode === "quiz") {
    //     console.log("Starting quiz mode from script.js");
    //     // Make sure quiz mode div is visible
    //     const quizMode = document.getElementById("quizMode");
    //     const flashcardMode = document.getElementById("flashcardMode");
    //     if (quizMode) quizMode.style.display = "block";
    //     if (flashcardMode) flashcardMode.classList.add("hidden");

    //     // Start the quiz
    //     if (window.vocabApp.quizMode) {
    //       console.log("Calling quizMode.startQuiz()");
    //       window.vocabApp.quizMode.startQuiz();
    //     }
    //   }
    // }, 500); // Increased delay
  } else {
    console.error("DGTVocabulary class not found");
  }
});

// Global functions for UI interaction
function markCard(isKnown) {
  if (window.vocabApp && window.vocabApp.flashcardMode) {
    window.vocabApp.flashcardMode.markCard(isKnown);
  }
}

function flipCard() {
  if (window.vocabApp && window.vocabApp.flashcardMode) {
    window.vocabApp.flashcardMode.flipCard();
  }
}

function nextCard() {
  if (window.vocabApp && window.vocabApp.flashcardMode) {
    window.vocabApp.flashcardMode.nextCard();
  }
}

function previousCard() {
  if (window.vocabApp && window.vocabApp.flashcardMode) {
    window.vocabApp.flashcardMode.previousCard();
  }
}

// Toggle between showing all cards vs unknown only
function toggleShowAllCards() {
  if (window.vocabApp && window.vocabApp.flashcardMode) {
    window.vocabApp.flashcardMode.showingAllCards =
      !window.vocabApp.flashcardMode.showingAllCards;
    window.vocabApp.flashcardMode.updateToggleButton();

    // Update current cards based on new toggle state
    window.vocabApp.updateCurrentCards();
    window.vocabApp.updateStats();
    window.vocabApp.showCurrentCard();
  }
}
