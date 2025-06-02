// Quiz mode functionality

class QuizMode {
  constructor(vocabApp) {
    this.vocabApp = vocabApp;
    this.quizScore = 0;
    this.quizTotal = 0;
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

    // Get a random unknown card as the correct answer
    const correctCard =
      unknownCards[Math.floor(Math.random() * unknownCards.length)];
    const options = [correctCard];

    // Determine how many options to show based on available cards in current category
    const maxOptions = Math.min(4, this.vocabApp.currentCards.length);

    // Add wrong options from current category cards only
    while (options.length < maxOptions) {
      const randomCard =
        this.vocabApp.currentCards[
          Math.floor(Math.random() * this.vocabApp.currentCards.length)
        ];
      if (
        !options.find((card) => card.translation === randomCard.translation) &&
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
      frontFace.innerHTML = `<div class="quiz-option-text">${option.translation}</div>`;

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
    const isCorrect = selectedId === correctId;

    const selectedCard = this.vocabApp.allCards.find(
      (card) => card.id === selectedId
    );
    if (!selectedCard) return;

    const backFace = element.querySelector(".quiz-card-back");
    if (backFace) {
      if (isCorrect) {
        backFace.classList.add("correct");
        backFace.innerHTML = `
          <div class="quiz-result correct">✓ Correct!</div>
          <div class="quiz-card-word">${selectedCard.word}</div>
          <div class="quiz-card-translation">${selectedCard.translation}</div>
        `;

        this.vocabApp.knownCardsSet.add(correctId);
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
          card.style.pointerEvents = "none";
          if (card !== element) {
            card.classList.add("disabled");
          }
        });

        const quizQuestion = document.getElementById("quizQuestion");
        quizQuestion.textContent = `Correct!`;

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
        backFace.innerHTML = `
          <div class="quiz-result wrong">✗ Try Again</div>
          <div class="quiz-card-word">${selectedCard.word}</div>
          <div class="quiz-card-translation">${selectedCard.translation}</div>
        `;

        element.classList.add("flipped");
        element.style.pointerEvents = "none";
      }
    }

    element.classList.add("flipped");
  }
}

// Make QuizMode available globally
window.QuizMode = QuizMode;
