// Translation Manager - Handles translation operations and UI
class TranslationManager {
  constructor(
    vocabApp,
    translationService,
    vocabularyUpdatesManager,
    showMessage
  ) {
    this.vocabApp = vocabApp;
    this.translationService = translationService;
    this.vocabularyUpdatesManager = vocabularyUpdatesManager;
    this.showMessage = showMessage;
    this.setupEventListeners();

    // Make sure the translation status container is really hidden on initialization
    const statusContainer = document.getElementById(
      "translationStatusContainer"
    );
    if (statusContainer) {
      statusContainer.classList.add("hidden");
      statusContainer.style.display = "none";
    }
  }

  setupEventListeners() {
    // Add event listener for translate words button
    const translateButton = document.getElementById("translateWords");
    if (translateButton) {
      translateButton.addEventListener("click", () => this.translateAllWords());
    }
  }

  // Translation methods
  async translateAllWords() {
    // Hide completion container if visible
    const completionContainer = document.getElementById(
      "translationCompletionContainer"
    );
    if (completionContainer) {
      completionContainer.classList.add("hidden");
      completionContainer.style.display = "none";
    }

    const wordsToTranslate = this.vocabApp.vocabularyUpdates.filter(
      (word) =>
        !word.translation ||
        !word.perevod ||
        word.translation.trim() === "" ||
        word.perevod.trim() === ""
    );

    if (wordsToTranslate.length === 0) {
      // Show message in the translation status container instead of using the general message area
      const statusContainer = document.getElementById(
        "translationStatusContainer"
      );
      if (statusContainer) {
        statusContainer.innerHTML = `<div class="translation-info"><div class="info-message">All words already have translations!</div></div>`;
        statusContainer.classList.remove("hidden");
        statusContainer.style.display = "block";

        // Hide after a delay
        setTimeout(() => {
          statusContainer.classList.add("hidden");
          statusContainer.style.display = "none";
        }, 5000);
      } else {
        this.showMessage("All words already have translations!", "info");
      }
      return;
    }

    // Disable the translate button during translation
    const translateButton = document.getElementById("translateWords");
    if (translateButton) {
      translateButton.disabled = true;
      translateButton.textContent = "🔄 Translating...";
    }

    try {
      await this.translateWordsInBackground(wordsToTranslate);
    } finally {
      // Re-enable the translate button
      if (translateButton) {
        translateButton.disabled = false;
        translateButton.textContent = "🌐 Auto-Translate Words";
      }
    }
  }

  async translateWordsInBackground(wordsToTranslate) {
    let completedTranslations = 0;
    const totalWords = wordsToTranslate.length;

    // Hide translation completion container if it's visible
    const completionContainer = document.getElementById(
      "translationCompletionContainer"
    );
    if (completionContainer) {
      completionContainer.classList.add("hidden");
      completionContainer.style.display = "none";
    }

    // Show translation status container
    const statusContainer = document.getElementById(
      "translationStatusContainer"
    );
    if (statusContainer) {
      // Reset the container to show progress view
      statusContainer.innerHTML = `
        <div class="translation-info">
          <h4>🔄 Translation Progress</h4>
          <div class="progress-bar">
            <div id="translationProgress" class="progress-fill"></div>
          </div>
          <div id="translationStats" class="translation-stats">
            <span id="currentTranslation">Preparing...</span>
            <span id="translationCount">0/0</span>
          </div>
        </div>
      `;
      // Make absolutely sure the container is visible
      statusContainer.classList.remove("hidden");
      statusContainer.style.display = "block";
    }

    // Update progress message
    this.updateTranslationProgress(0, totalWords, "Starting translation...");

    for (const wordObj of wordsToTranslate) {
      try {
        // Update current word being translated
        this.updateTranslationProgress(
          completedTranslations,
          totalWords,
          `Translating: ${wordObj.word}`
        );

        // Translate to English and Russian simultaneously if needed
        const promises = [];

        if (!wordObj.translation || wordObj.translation.trim() === "") {
          promises.push(
            this.translationService.translateToEnglish(wordObj.word)
          );
        } else {
          promises.push(Promise.resolve(wordObj.translation));
        }

        if (!wordObj.perevod || wordObj.perevod.trim() === "") {
          promises.push(
            this.translationService.translateToRussian(wordObj.word)
          );
        } else {
          promises.push(Promise.resolve(wordObj.perevod));
        }

        const [englishTranslation, russianTranslation] = await Promise.all(
          promises
        );

        // Update the vocabulary updates array
        const wordIndex = this.vocabApp.vocabularyUpdates.findIndex(
          (word) => word.id === wordObj.id
        );

        if (wordIndex !== -1) {
          if (
            englishTranslation &&
            (!wordObj.translation || wordObj.translation.trim() === "")
          ) {
            this.vocabApp.vocabularyUpdates[wordIndex].translation =
              englishTranslation;
          }
          if (
            russianTranslation &&
            (!wordObj.perevod || wordObj.perevod.trim() === "")
          ) {
            this.vocabApp.vocabularyUpdates[wordIndex].perevod =
              russianTranslation;
          }

          // Save to localStorage
          localStorage.setItem(
            "dgt-vocab-vocabulary-updates",
            JSON.stringify(this.vocabApp.vocabularyUpdates)
          );

          // Update the UI table row
          this.vocabularyUpdatesManager.updateTranslationInTable(
            wordObj.id,
            this.vocabApp.vocabularyUpdates[wordIndex].translation,
            this.vocabApp.vocabularyUpdates[wordIndex].perevod
          );
        }

        completedTranslations++;

        // Update progress
        this.updateTranslationProgress(
          completedTranslations,
          totalWords,
          `Completed: ${wordObj.word}`
        );

        // Add a small delay to avoid overwhelming the API
        await this.translationService.delay(200);
      } catch (error) {
        console.error(`Error translating "${wordObj.word}":`, error);

        // Mark as failed in the UI
        const wordIndex = this.vocabApp.vocabularyUpdates.findIndex(
          (word) => word.id === wordObj.id
        );

        if (wordIndex !== -1) {
          if (
            !this.vocabApp.vocabularyUpdates[wordIndex].translation ||
            this.vocabApp.vocabularyUpdates[wordIndex].translation.trim() === ""
          ) {
            this.vocabApp.vocabularyUpdates[wordIndex].translation =
              "❌ Translation failed";
          }
          if (
            !this.vocabApp.vocabularyUpdates[wordIndex].perevod ||
            this.vocabApp.vocabularyUpdates[wordIndex].perevod.trim() === ""
          ) {
            this.vocabApp.vocabularyUpdates[wordIndex].perevod =
              "❌ Перевод не удался";
          }

          localStorage.setItem(
            "dgt-vocab-vocabulary-updates",
            JSON.stringify(this.vocabApp.vocabularyUpdates)
          );

          this.vocabularyUpdatesManager.updateTranslationInTable(
            wordObj.id,
            this.vocabApp.vocabularyUpdates[wordIndex].translation,
            this.vocabApp.vocabularyUpdates[wordIndex].perevod
          );
        }

        completedTranslations++;
      }
    }

    // Update translation status container to show success message
    const successCount = this.vocabApp.vocabularyUpdates.filter(
      (word) =>
        word.translation &&
        !word.translation.includes("❌") &&
        word.perevod &&
        !word.perevod.includes("❌")
    ).length;

    // Hide the progress container
    if (statusContainer) {
      statusContainer.classList.add("hidden");
      statusContainer.style.display = "none";
    }

    // Show the completion message in the dedicated container
    completionContainer = document.getElementById(
      "translationCompletionContainer"
    );
    if (completionContainer) {
      const successMessage =
        successCount === totalWords
          ? `✅ Translation completed successfully! All ${totalWords} words translated.`
          : `⚠️ Translation completed: ${successCount}/${totalWords} successful. Please manually add missing translations.`;

      const messageType = successCount === totalWords ? "success" : "info";

      // Update the completion message container
      const messageElement = document.getElementById(
        "translationCompletionMessage"
      );
      if (messageElement) {
        messageElement.innerHTML = `<div class="${messageType}-message">${successMessage}</div>`;
      }

      // Update the summary
      const summaryElement = document.getElementById("translationSummary");
      if (summaryElement) {
        summaryElement.textContent = `${successCount}/${totalWords} words translated successfully`;
      }

      // Show the completion container
      completionContainer.classList.remove("hidden");
      completionContainer.style.display = "block";
    }

    // Also show message in the main message container
    if (successCount === totalWords) {
      this.showMessage(
        `✅ Translation completed successfully! All ${totalWords} words translated.`,
        "success"
      );
    } else {
      this.showMessage(
        `⚠️ Translation completed: ${successCount}/${totalWords} successful. Please manually add missing translations.`,
        "info"
      );
    }
  }

  updateTranslationProgress(completed, total, currentWord) {
    const progressBar = document.getElementById("translationProgress");
    const currentTranslation = document.getElementById("currentTranslation");
    const translationCount = document.getElementById("translationCount");
    const statusContainer = document.getElementById(
      "translationStatusContainer"
    );

    // We don't manually remove the hidden class here anymore
    // The container's visibility is managed only in translateWordsInBackground

    if (progressBar) {
      const percentage = total > 0 ? (completed / total) * 100 : 0;
      progressBar.style.width = `${percentage}%`;
    }

    if (currentTranslation) {
      currentTranslation.textContent = currentWord;
    }

    if (translationCount) {
      translationCount.textContent = `${completed}/${total}`;
    }
  }

  // Update translation provider status display
  updateProviderStatus() {
    const statusContainer = document.getElementById("providerStatus");
    if (!statusContainer) return;

    setTimeout(async () => {
      try {
        const stats = this.translationService.getStats();
        const providerItems = Object.entries(stats.providers).map(
          ([key, provider]) => {
            const status = provider.available ? "✅" : "❌";
            const requests = provider.requestsInLastMinute;
            return `<span class="provider-item">${status} ${provider.name} (${requests} requests/min)</span>`;
          }
        );

        statusContainer.innerHTML =
          providerItems.length > 0
            ? providerItems.join(" ")
            : '<span class="provider-item">🔄 Checking services...</span>';
      } catch (error) {
        console.error("Error updating provider status:", error);
        statusContainer.innerHTML =
          '<span class="provider-item">⚠️ Status check failed</span>';
      }
    }, 1000); // Give translation service time to initialize
  }

  // Helper method to ensure translation container is properly hidden
  hideTranslationContainer() {
    const statusContainer = document.getElementById(
      "translationStatusContainer"
    );
    if (statusContainer) {
      statusContainer.classList.add("hidden");
      statusContainer.style.display = "none";
    }
  }

  // Export for use in other modules
}

// Export for use in other modules
window.TranslationManager = TranslationManager;

// Signal that TranslationManager is ready to use
document.dispatchEvent(new CustomEvent("translationManagerReady"));
