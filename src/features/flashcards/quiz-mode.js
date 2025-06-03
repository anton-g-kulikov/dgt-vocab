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
    const category = this.vocabApp.selectedCategory || "all";

    // Get all unknown cards from the full set that match the current category
    let allUnknownCards = this.vocabApp.allCards.filter(
      (card) =>
        !this.vocabApp.knownCardsSet.has(card.id) &&
        (category === "all" || card.category === category)
    );

    // Check if we have enough unknown cards to start the quiz
    if (allUnknownCards.length < 2) {
      const isFiltered = category !== "all";
      const message = isFiltered
        ? `Need at least 2 unknown cards for quiz mode. Current category has only ${allUnknownCards.length} unknown cards.`
        : "Need at least 2 unknown cards for quiz mode";
      alert(message);
      return;
    }

    // Load all unknown cards into current cards
    this.vocabApp.currentCards = [...allUnknownCards];

    // Sort cards by last interaction time
    this.vocabApp.sortCardsByLastInteraction();

    this.quizScore = 0;
    this.quizTotal = 0;
    this.nextQuizQuestion();
  }

  nextQuizQuestion() {
    if (this.vocabApp.currentCards.length < 2) {
      // If we don't have enough cards in the current set but have cards marked as unknown,
      // let's reload them from the full set to continue the quiz
      const category = this.vocabApp.selectedCategory || "all";

      // Get all unknown cards from the full set that match the current category
      let allUnknownCards = this.vocabApp.allCards.filter(
        (card) =>
          !this.vocabApp.knownCardsSet.has(card.id) &&
          (category === "all" || card.category === category)
      );

      // If we have enough unknown cards across all cards, refresh the current cards
      if (allUnknownCards.length >= 2) {
        this.vocabApp.currentCards = [...allUnknownCards];
        // Sort by interaction time to prioritize oldest interactions
        this.vocabApp.sortCardsByLastInteraction();
      } else {
        return; // Not enough cards even after refreshing
      }
    }

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
    // Maximum of 4 options, but can be fewer if not enough cards are available
    const maxOptions = Math.min(4, this.vocabApp.currentCards.length);

    // Get available wrong options excluding the correct card
    const availableWrongOptions = this.vocabApp.currentCards.filter(
      (card) => card.id !== correctCard.id
    );

    // Shuffle available wrong options to get random selection
    this.vocabApp.shuffleArray(availableWrongOptions);

    // Add wrong options from current category cards only
    const translationField =
      this.vocabApp.currentLanguage === "en" ? "translation" : "perevod";
    let attempts = 0;
    const maxAttempts = availableWrongOptions.length * 2; // Prevent infinite loops

    for (
      let i = 0;
      i < availableWrongOptions.length &&
      options.length < maxOptions &&
      attempts < maxAttempts;
      i++
    ) {
      attempts++;
      const candidateCard = availableWrongOptions[i];

      // Check if this card has a unique translation compared to already selected options
      const hasUniqueTranslation = !options.find(
        (card) => card[translationField] === candidateCard[translationField]
      );

      if (hasUniqueTranslation) {
        options.push(candidateCard);
      }
    }

    // If we still don't have enough unique options and there are more cards available,
    // try to find any cards with different IDs (even if translations might be similar)
    if (
      options.length < maxOptions &&
      availableWrongOptions.length >= maxOptions - 1
    ) {
      for (
        let i = 0;
        i < availableWrongOptions.length && options.length < maxOptions;
        i++
      ) {
        const candidateCard = availableWrongOptions[i];

        // Just check for unique ID (avoid duplicate cards)
        const hasUniqueId = !options.find(
          (card) => card.id === candidateCard.id
        );

        if (hasUniqueId) {
          options.push(candidateCard);
        }
      }
    }

    this.vocabApp.shuffleArray(options);

    // Final validation: ensure we have at least 2 options for a valid quiz
    if (options.length < 2) {
      const quizQuestion = document.getElementById("quizQuestion");
      const optionsContainer = document.getElementById("quizOptions");

      if (quizQuestion) {
        quizQuestion.textContent =
          "Not enough unique cards available for quiz mode";
      }

      if (optionsContainer) {
        optionsContainer.innerHTML = `
          <div style="text-align: center; padding: 40px; font-size: 1.1rem; color: #dc3545;">
            <p>⚠️ Insufficient unique cards for quiz</p>
            <p>Switch to flashcard mode or add more vocabulary.</p>
          </div>
        `;
      }
      return;
    }

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

      // Ensure we have valid text to display (fallback protection)
      const displayText =
        translationText && translationText.trim()
          ? translationText.trim()
          : option.word || "Unknown";

      frontFace.innerHTML = `<div class="quiz-option-text">${displayText}</div>`;

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
          <div class="quiz-card-translation">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            <span>${translationText}</span>
          </div>
          <div class="quiz-card-word mobile-hidden">${selectedCard.word}</div>
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
          // Remove from unknown set if it was there
          this.vocabApp.unknownCardsSet.delete(correctId);
        }
        this.vocabApp.saveProgress();

        // Remove this card from the current cards to avoid seeing it again in this quiz session
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
          <div class="quiz-card-translation">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
            <span>${translationText}</span>
          </div>
          <div class="quiz-card-word">${selectedCard.word}</div>
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
