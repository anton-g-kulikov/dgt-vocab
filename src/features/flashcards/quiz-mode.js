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
    console.log("Starting quiz mode...");

    // Ensure we have properly filtered current cards
    this.vocabApp.updateCurrentCards();

    // Get unknown cards from the filtered set
    const unknownCards = this.vocabApp.currentCards.filter(
      (card) => !this.vocabApp.knownCardsSet.has(card.id)
    );

    // Check if we have enough unknown cards to start the quiz
    if (unknownCards.length < 2) {
      const selectedTopic = this.vocabApp.selectedTopic || "all";
      const selectedCategory = this.vocabApp.selectedCategory || "all";

      let filterText = "current filter";
      if (selectedTopic !== "all" && selectedCategory !== "all") {
        const topicName = window.TopicUtils
          ? window.TopicUtils.getTopicName(selectedTopic)
          : selectedTopic;
        filterText = `${selectedCategory} category + ${topicName} topic`;
      } else if (selectedTopic !== "all") {
        const topicName = window.TopicUtils
          ? window.TopicUtils.getTopicName(selectedTopic)
          : selectedTopic;
        filterText = `${topicName} topic`;
      } else if (selectedCategory !== "all") {
        filterText = `${selectedCategory} category`;
      }

      // Show error in quiz interface with flashcard design
      const quizQuestion = document.getElementById("quizQuestion");
      const quizOptions = document.getElementById("quizOptions");
      if (quizQuestion) {
        quizQuestion.textContent = "";
      }
      if (quizOptions) {
        quizOptions.innerHTML = `
          <div class="flashcard-container" style="max-width: 500px; margin: 0 auto;">
            <div class="flashcard">
              <div class="card-face card-front" style="background: var(--color-warning); color: white;">
                <div class="spanish-word">Need at least 2 unknown cards for quiz mode.</div>
              </div>
              <div class="card-face card-back">
                <div class="translation">${filterText} has only ${unknownCards.length} unknown cards.</div>
                <div class="example">Try changing the topic or category filter, or learn some cards in flashcard mode first.</div>
              </div>
            </div>
          </div>
        `;

        // Make the error card flippable
        const errorCard = quizOptions.querySelector(".flashcard");
        if (errorCard) {
          errorCard.onclick = () => {
            errorCard.classList.toggle("flipped");
          };

          // Auto-flip after 2 seconds to show the suggestion
          setTimeout(() => {
            errorCard.classList.add("flipped");
          }, 2000);
        }
      }
      return;
    }

    // Use the filtered unknown cards
    this.vocabApp.currentCards = [...unknownCards];

    // Sort cards by last interaction time to prioritize older cards
    this.vocabApp.sortCardsByLastInteraction();

    this.quizScore = 0;
    this.quizTotal = 0;
    this.nextQuizQuestion();
  }

  nextQuizQuestion() {
    // Get unknown cards only for quiz questions from current filtered set
    const unknownCards = this.vocabApp.currentCards.filter(
      (card) => !this.vocabApp.knownCardsSet.has(card.id)
    );

    // If no unknown cards remain, show completion message
    if (unknownCards.length === 0) {
      this.showQuizCompletionCard();
      return;
    }

    // If only one unknown card remains, show transition message and switch to flashcard mode
    if (unknownCards.length === 1) {
      this.showLastCardTransition(unknownCards[0]);
      return;
    }

    // Select correct card with weighted randomization
    // Prioritize cards that haven't been interacted with recently (first 50% of sorted array)
    // but add some randomness to avoid predictable patterns
    const priorityPoolSize = Math.ceil(unknownCards.length * 0.5);
    const priorityPool = unknownCards.slice(0, priorityPoolSize);
    const correctCard =
      priorityPool[Math.floor(Math.random() * priorityPool.length)];

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
        quizQuestion.textContent = "";
      }

      if (optionsContainer) {
        optionsContainer.innerHTML = `
          <div class="flashcard-container" style="max-width: 500px; margin: 0 auto;">
            <div class="flashcard">
              <div class="card-face card-front" style="background: var(--color-warning); color: white;">
                <div class="category-badge" style="background: rgba(255,255,255,0.2); color: white;">⚠️ Insufficient unique cards for quiz</div>
                <div class="spanish-word">Not enough unique cards available</div>
              </div>
              <div class="card-face card-back">
                <div class="translation">Switch to flashcard mode or add more vocabulary.</div>
                <div class="example">Try changing filters or learning more cards first.</div>
              </div>
            </div>
          </div>
        `;

        // Make the error card flippable
        const errorCard = optionsContainer.querySelector(".flashcard");
        if (errorCard) {
          errorCard.onclick = () => {
            errorCard.classList.toggle("flipped");
          };

          setTimeout(() => {
            errorCard.classList.add("flipped");
          }, 2000);
        }
      }
      return;
    }

    // Set the quiz question text - this was missing!
    const quizQuestion = document.getElementById("quizQuestion");
    if (quizQuestion) {
      // Clear existing content
      quizQuestion.innerHTML = "";

      // Create question text with Spanish word properly styled
      const questionText = document.createTextNode('What does "');
      quizQuestion.appendChild(questionText);

      // Create span for the Spanish word with appropriate class
      const spanishWordSpan = document.createElement("span");
      spanishWordSpan.className = "spanish-word spanish-highlight";
      // Also set inline styles as fallback to ensure visibility
      spanishWordSpan.style.color = "#dc8f64"; // Direct color as fallback
      spanishWordSpan.style.fontWeight = "600";
      spanishWordSpan.style.fontFamily = '"DM Serif Display", serif';
      spanishWordSpan.textContent = correctCard.word;
      quizQuestion.appendChild(spanishWordSpan);

      // Add the rest of the question
      const endText = document.createTextNode('" mean?');
      quizQuestion.appendChild(endText);

      // Debug log to help troubleshoot
      console.log("Quiz question set:", {
        word: correctCard.word,
        className: spanishWordSpan.className,
        computedStyle: window.getComputedStyle(spanishWordSpan).color,
      });
    }

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
            if (remainingUnknownCards.length === 1) {
              // Show transition and switch to flashcard mode
              this.showLastCardTransition(remainingUnknownCards[0]);
            } else {
              // All cards are completed
              this.showQuizCompletionCard();
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

  showQuizCompletionCard() {
    const selectedTopic = this.vocabApp.selectedTopic || "all";
    const selectedCategory = this.vocabApp.selectedCategory || "all";

    let filterText = "";
    if (selectedTopic !== "all" && selectedCategory !== "all") {
      const topicName = window.TopicUtils
        ? window.TopicUtils.getTopicName(selectedTopic)
        : selectedTopic;
      filterText = ` in ${selectedCategory} category + ${topicName} topic`;
    } else if (selectedTopic !== "all") {
      const topicName = window.TopicUtils
        ? window.TopicUtils.getTopicName(selectedTopic)
        : selectedTopic;
      filterText = ` for ${topicName} topic`;
    } else if (selectedCategory !== "all") {
      filterText = ` in ${selectedCategory} category`;
    }

    // Clear question text
    const quizQuestion = document.getElementById("quizQuestion");
    if (quizQuestion) {
      quizQuestion.textContent = "";
    }

    // Create a beautiful flashcard-style completion message
    const quizOptions = document.getElementById("quizOptions");
    if (quizOptions) {
      quizOptions.innerHTML = `
        <div class="flashcard-container" style="max-width: 500px; margin: 0 auto;">
          <div class="flashcard completion-card">
            <div class="card-face card-front" style="background: var(--color-success); color: white;">
              <div class="category-badge" style="background: rgba(255,255,255,0.2); color: white;">🎉 Quiz Complete!</div>
              <div class="spanish-word">¡Felicidades!</div>
            </div>
            <div class="card-face card-back">
              <div class="translation">You know all cards${filterText}!</div>
              <div class="example">Switch to flashcard mode or change filters to continue learning.</div>
            </div>
          </div>
        </div>
      `;

      // Make the completion card flippable
      const completionCard = quizOptions.querySelector(".flashcard");
      if (completionCard) {
        completionCard.onclick = () => {
          completionCard.classList.toggle("flipped");
        };

        // Auto-flip after 2 seconds to show the message
        setTimeout(() => {
          completionCard.classList.add("flipped");
        }, 2000);
      }
    }
  }

  showLastCardTransition(lastCard) {
    // Clear question text
    const quizQuestion = document.getElementById("quizQuestion");
    if (quizQuestion) {
      quizQuestion.textContent = "";
    }

    // Create a beautiful flashcard-style transition message
    const quizOptions = document.getElementById("quizOptions");
    if (quizOptions) {
      quizOptions.innerHTML = `
        <div class="flashcard-container" style="max-width: 500px; margin: 0 auto;">
          <div class="flashcard transition-card">
            <div class="card-face card-front" style="background: var(--color-accent); color: white;">
              <div class="category-badge" style="background: rgba(255,255,255,0.2); color: white;">🎉 Almost done!</div>
              <div class="spanish-word">One card remaining</div>
            </div>
            <div class="card-face card-back">
              <div class="translation">Switching to flashcard mode...</div>
              <div class="example">Perfect for reviewing the last word: "${lastCard.word}"</div>
            </div>
          </div>
        </div>
      `;

      // Make the transition card flippable
      const transitionCard = quizOptions.querySelector(".flashcard");
      if (transitionCard) {
        transitionCard.onclick = () => {
          transitionCard.classList.toggle("flipped");
        };

        // Auto-flip after 1 second
        setTimeout(() => {
          transitionCard.classList.add("flipped");
        }, 1000);
      }
    }

    // Switch to flashcard mode after showing the message
    setTimeout(() => {
      // Set the current cards to just the last unknown card
      this.vocabApp.currentCards = [lastCard];
      this.vocabApp.currentIndex = 0;

      // Switch to flashcard mode
      if (window.setMode) {
        window.setMode("flashcard");
      }

      // Update the mode buttons
      document
        .querySelectorAll(".mode-btn")
        .forEach((btn) => btn.classList.remove("active"));
      const flashcardBtn = document.querySelector(
        ".mode-btn[onclick*='flashcard']"
      );
      if (flashcardBtn) {
        flashcardBtn.classList.add("active");
      }

      // Show the actual flashcard
      if (this.vocabApp.flashcardMode) {
        this.vocabApp.flashcardMode.showCurrentCard();
      }
    }, 3000);
  }
}

// Make QuizMode available globally
window.QuizMode = QuizMode;
