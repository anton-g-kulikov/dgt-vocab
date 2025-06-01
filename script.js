// Spanish DGT Vocabulary Flashcards - Main Application Entry Point

// Global instance
let vocabApp;

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
