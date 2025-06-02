// UI utility functions and global functions for HTML onclick

class UIHelpers {
  static showMessage(text, type) {
    const messageContainer = document.getElementById("messageContainer");
    if (messageContainer) {
      messageContainer.innerHTML = `<div class="${type}-message">${text}</div>`;
      messageContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  static clearMessages() {
    const messageContainer = document.getElementById("messageContainer");
    if (messageContainer) {
      messageContainer.innerHTML = "";
    }
  }

  static setMode(mode) {
    if (!window.vocabApp) return;

    window.vocabApp.currentMode = mode;

    try {
      // Update mode buttons
      const modeButtons = document.querySelectorAll(".mode-btn");
      if (modeButtons && modeButtons.length) {
        modeButtons.forEach((btn) => btn.classList.remove("active"));

        const activeButton = document.querySelector(
          `.mode-btn[onclick*="setMode('${mode}')"]`
        );
        if (activeButton) {
          activeButton.classList.add("active");
        }
      }

      // Show/hide appropriate sections
      const flashcardMode = document.getElementById("flashcardMode");
      const quizMode = document.getElementById("quizMode");

      if (mode === "flashcard") {
        if (flashcardMode) flashcardMode.style.display = "block";
        if (quizMode) quizMode.style.display = "none";
      } else if (mode === "quiz") {
        if (flashcardMode) flashcardMode.style.display = "none";
        if (quizMode) quizMode.style.display = "block";
        if (window.vocabApp.quizMode) {
          window.vocabApp.quizMode.startQuiz();
        }
      }
    } catch (error) {
      console.error("Error in setMode:", error);
    }
  }
}

// Global functions for HTML onclick attributes
function flipCard() {
  if (window.vocabApp && window.vocabApp.flashcardMode) {
    window.vocabApp.flashcardMode.flipCard();
  }
}

function resetProgress() {
  if (window.vocabApp) {
    window.vocabApp.resetProgress();
  }
}

function markCard(known) {
  if (window.vocabApp && window.vocabApp.flashcardMode) {
    window.vocabApp.flashcardMode.markCard(known);
  }
}

function setMode(mode, event) {
  UIHelpers.setMode(mode);

  // Track mode switch
  if (window.Analytics) {
    window.Analytics.trackModeSwitch(mode);
  }

  if (event && event.target) {
    const modeButtons = document.querySelectorAll(".mode-btn");
    if (modeButtons && modeButtons.length) {
      modeButtons.forEach((btn) => btn.classList.remove("active"));
      event.target.classList.add("active");
    }
  }
}

function nextQuizQuestion() {
  if (window.vocabApp && window.vocabApp.quizMode) {
    window.vocabApp.quizMode.nextQuizQuestion();
  }
}

function toggleShowAllCards() {
  if (window.vocabApp && window.vocabApp.flashcardMode) {
    window.vocabApp.flashcardMode.toggleShowAllCards();
  }
}

// Make UIHelpers available globally
window.UIHelpers = UIHelpers;
