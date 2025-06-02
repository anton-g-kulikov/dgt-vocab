// Quiz mode functionality

class QuizMode {
  constructor(vocabApp) {
    this.vocabApp = vocabApp;
    this.quizScore = 0;
    this.quizTotal = 0;
    // Ensure sets exist
    this.vocabApp.knownCardsSet = this.vocabApp.knownCardsSet || new Set();
    this.vocabApp.unknownCardsSet = this.vocabApp.unknownCardsSet || new Set();
  }

  startQuiz() {
    if (this.vocabApp.currentCards.length < 2) {
      const category = this.vocabApp.selectedCategory || "all";
      const isFiltered = category !== "all";
      const message = isFiltered
        ? `Need at least 2 cards for quiz mode. Current category has only ${this.vocabApp.currentCards.length} cards.`
        : "Need at least 2 cards for quiz mode";
      alert(message);
      return;
    }

    // Sort cards by last interaction time
    this.vocabApp.sortCardsByLastInteraction();

    this.quizScore = 0;
    this.quizTotal = 0;
    this.nextQuizQuestion();
  }

  nextQuizQuestion() {
    if (this.vocabApp.currentCards.length < 2) return;

    // Get unknown cards only for quiz questions
    const unknownCards = this.vocabApp.currentCards.filter(
      (card) => !this.vocabApp.knownCardsSet.has(card.id)
    );

    // If no unknown cards remain, show completion message
    if (unknownCards.length === 0) {
      const category = this.vocabApp.selectedCategory || "all";
      const categoryText = category === "all" ? "" : ` in ${category} category`;

      const quizQuestion = document.getElementById("quizQuestion");
      quizQuestion.textContent = `🎉 Congratulations! You know all cards${categoryText}!`;

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

    // If only one unknown card remains, finish the quiz
    if (unknownCards.length === 1) {
      const category = this.vocabApp.selectedCategory || "all";
      const categoryText = category === "all" ? "" : ` in ${category} category`;

      const quizQuestion = document.getElementById("quizQuestion");
      quizQuestion.textContent = `🎉 Almost there! Only one card left${categoryText}!`;

      const optionsContainer = document.getElementById("quizOptions");
      if (optionsContainer) {
        optionsContainer.innerHTML = `
          <div style="text-align: center; padding: 40px; font-size: 1.2rem; color: #28a745;">
            <p>🏆 Quiz Complete!</p>
            <p>Switch to flashcard mode to review the last card.</p>
          </div>
        `;
      }
      return;
    }

    // Get the oldest interacted unknown card as the correct answer
    const correctCard = unknownCards[0]; // Since we've sorted by interaction time

    // Track this interaction
    this.vocabApp.trackCardInteraction(correctCard.id);

    const options = [correctCard];

    // Determine how many options to show based on available cards in current category
    const maxOptions = Math.min(4, this.vocabApp.currentCards.length);

    // Add wrong options from current category cards only
    while (options.length < maxOptions) {
      const randomCard =
        this.vocabApp.currentCards[
          Math.floor(Math.random() * this.vocabApp.currentCards.length)
        ];
      // Compare translations based on current language preference
      const translationField =
        this.vocabApp.currentLanguage === "en" ? "translation" : "perevod";

      if (
        !options.find(
          (card) => card[translationField] === randomCard[translationField]
        ) &&
        randomCard.id !== correctCard.id
      ) {
        options.push(randomCard);
      }
    }

    this.vocabApp.shuffleArray(options);

    // Update question text
    const quizQuestion = document.getElementById("quizQuestion");
    const spanishWord = correctCard.word;

    // Highlight the Spanish word with a span
    quizQuestion.innerHTML = `What does "<span class="spanish-highlight">${spanishWord}</span>" mean?`;

    // Get options container
    const optionsContainer = document.getElementById("quizOptions");
    if (!optionsContainer) return;

    // Clear existing options
    optionsContainer.innerHTML = "";

    // Create and append each option as a flippable card
    options.forEach((option, index) => {
      const cardContainer = document.createElement("div");
      cardContainer.className = "quiz-card-container";

      const card = document.createElement("div");
      card.className = "quiz-card";
      card.id = `quiz-card-${index}`;

      card.dataset.optionId = option.id;
      card.dataset.correctId = correctCard.id;

      const frontFace = document.createElement("div");
      frontFace.className = "quiz-card-face quiz-card-front";

      // Use translation based on current language preference
      const translationText =
        this.vocabApp.currentLanguage === "en"
          ? option.translation
          : option.perevod || option.translation;

      frontFace.innerHTML = `<div class="quiz-option-text">${translationText}</div>`;

      const backFace = document.createElement("div");
      backFace.className = "quiz-card-face quiz-card-back";

      card.onclick = (e) => {
        if (card.classList.contains("flipped")) {
          e.stopPropagation();
          return;
        }
        this.selectQuizOption(card);
      };

      card.appendChild(frontFace);
      card.appendChild(backFace);
      cardContainer.appendChild(card);
      optionsContainer.appendChild(cardContainer);
    });

    const nextBtn = document.getElementById("nextQuizBtn");
    if (nextBtn) {
      nextBtn.style.display = "none";
    }
  }

  selectQuizOption(element) {
    const selectedId = parseInt(element.dataset.optionId);
    const correctId = parseInt(element.dataset.correctId);

    // Track interaction with both selected and correct cards
    this.vocabApp.trackCardInteraction(selectedId);
    this.vocabApp.trackCardInteraction(correctId);

    const isCorrect = selectedId === correctId;

    // Track quiz answer with counts
    if (window.Analytics) {
      const knownCount = this.vocabApp.knownCardsSet.size;
      const remainingCards = this.vocabApp.currentCards.length;
      window.Analytics.trackQuizInteraction(
        isCorrect ? "Correct Answer" : "Wrong Answer",
        knownCount
      );
    }

    const selectedCard = this.vocabApp.allCards.find(
      (card) => card.id === selectedId
    );
    const correctCard = this.vocabApp.allCards.find(
      (card) => card.id === correctId
    );
    if (!selectedCard || !correctCard) return;

    // Ensure sets exist before using them
    if (!this.vocabApp.knownCardsSet) this.vocabApp.knownCardsSet = new Set();
    if (!this.vocabApp.unknownCardsSet)
      this.vocabApp.unknownCardsSet = new Set();

    const backFace = element.querySelector(".quiz-card-back");
    if (backFace) {
      if (isCorrect) {
        backFace.classList.add("correct");
        // Use translation based on current language preference
        const translationText =
          this.vocabApp.currentLanguage === "en"
            ? selectedCard.translation
            : selectedCard.perevod || selectedCard.translation;

        backFace.innerHTML = `
          <div class="quiz-card-translation">${translationText}</div>
          <div class="quiz-card-word mobile-hidden"><span class="result-icon">✓</span> ${selectedCard.word}</div>
        `;

        // Even if correct answer is selected, if there were wrong attempts
        // add the correct word to unknown list
        const anyWrongAttempts = document.querySelector(
          ".quiz-card.flipped.wrong"
        );
        if (anyWrongAttempts) {
          this.vocabApp.unknownCardsSet.add(correctId);
        } else {
          this.vocabApp.knownCardsSet.add(correctId);
        }
        this.vocabApp.saveProgress();

        this.vocabApp.currentCards = this.vocabApp.currentCards.filter(
          (card) => card.id !== correctId
        );

        this.vocabApp.updateStats();

        // Check if only one unknown card remains after this correct answer
        const remainingUnknownCards = this.vocabApp.currentCards.filter(
          (card) => !this.vocabApp.knownCardsSet.has(card.id)
        );

        document.querySelectorAll(".quiz-card").forEach((card) => {
          // Only disable and flip the correct card
          if (card === element) {
            card.classList.add("flipped");
            card.style.pointerEvents = "none";
          }
        });

        // Keep the original question displayed even after a correct answer
        // const quizQuestion = document.getElementById("quizQuestion");
        // quizQuestion.textContent = `Correct!`;

        setTimeout(() => {
          // If only one unknown card remains, switch to flashcard mode
          if (remainingUnknownCards.length <= 1) {
            const category = this.vocabApp.selectedCategory || "all";
            const categoryText =
              category === "all" ? "" : ` in ${category} category`;

            if (remainingUnknownCards.length === 0) {
              // All cards are known - show completion
              this.nextQuizQuestion();
            } else {
              // One card remains - switch to flashcard mode
              const quizQuestion = document.getElementById("quizQuestion");
              quizQuestion.textContent = `🎉 Almost done! Switching to flashcard mode for the last card${categoryText}`;

              const optionsContainer = document.getElementById("quizOptions");
              if (optionsContainer) {
                optionsContainer.innerHTML = `
                  <div style="text-align: center; padding: 40px; font-size: 1.2rem; color: #28a745;">
                    <p>🏆 Great job! One card remaining.</p>
                    <p>Switching to flashcard mode...</p>
                  </div>
                `;
              }

              // Switch to flashcard mode after a short delay
              setTimeout(() => {
                if (window.UIHelpers) {
                  window.UIHelpers.setMode("flashcard");
                  // Update mode buttons
                  document
                    .querySelectorAll(".mode-btn")
                    .forEach((btn) => btn.classList.remove("active"));
                  document
                    .querySelector(".mode-btn[onclick*='flashcard']")
                    ?.classList.add("active");
                }
              }, 2000);
            }
          } else {
            // Continue with next quiz question
            this.nextQuizQuestion();
          }
        }, 2000);
      } else {
        backFace.classList.add("wrong");
        element.classList.add("wrong");
        // Use translation based on current language preference
        const translationText =
          this.vocabApp.currentLanguage === "en"
            ? selectedCard.translation
            : selectedCard.perevod || selectedCard.translation;

        backFace.innerHTML = `
          <div class="quiz-card-translation">${translationText}</div>
          <div class="quiz-card-word"><span class="result-icon">✗</span> ${selectedCard.word}</div>
        `;

        this.vocabApp.unknownCardsSet.add(correctId);
        this.vocabApp.unknownCardsSet.add(selectedId);
        this.vocabApp.saveProgress();

        element.classList.add("flipped");
        element.style.pointerEvents = "none";
      }
    }

    element.classList.add("flipped");
  }
}

// Make QuizMode available globally
window.QuizMode = QuizMode;
