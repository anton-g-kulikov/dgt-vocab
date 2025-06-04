// Merge Request Manager - Handles merge request creation and dialog
class MergeRequestManager {
  constructor(vocabApp, vocabularyUpdatesManager, showMessage) {
    this.vocabApp = vocabApp;
    this.vocabularyUpdatesManager = vocabularyUpdatesManager;
    this.showMessage = showMessage;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Add event listener to create merge request button
    const createMergeRequestBtn = document.getElementById("createMergeRequest");
    if (createMergeRequestBtn) {
      createMergeRequestBtn.addEventListener("click", () =>
        this.createMergeRequest()
      );
    }
  }

  // Create merge request functionality
  async createMergeRequest() {
    try {
      // Validate vocabulary updates first
      if (
        !this.vocabApp.vocabularyUpdates ||
        this.vocabApp.vocabularyUpdates.length === 0
      ) {
        this.showMessage(
          "No vocabulary updates to create a merge request for.",
          "error"
        );
        return;
      }

      this.showMessage("Creating merge request... Please wait.", "info");

      // Get the updated vocabulary updates from the UI FIRST
      this.vocabularyUpdatesManager.updateVocabularyUpdatesFromUI();

      // Now validate that all words have translations (after getting them from UI)
      const incompleteWords = this.vocabApp.vocabularyUpdates.filter(
        (word) => !word.translation || word.translation.trim() === ""
      );

      if (incompleteWords.length > 0) {
        this.showMessage(
          `Please provide translations for all words before creating a merge request. ${incompleteWords.length} words are missing translations.`,
          "error"
        );
        return;
      }

      // Generate the updated vocabulary.js content
      const updatedVocabularyContent =
        await this.generateUpdatedVocabularyFile();

      // Create branch name with timestamp
      const timestamp = new Date()
        .toISOString()
        .split("T")[0]
        .replace(/-/g, "");
      const branchName = `vocab-update-${timestamp}-${Date.now()}`;

      // Show merge request dialog
      this.showMergeRequestDialog(updatedVocabularyContent, branchName);
    } catch (error) {
      console.error("Error creating merge request:", error);
      this.showMessage(
        "Error creating merge request: " + error.message,
        "error"
      );
    }
  }

  // Generate updated vocabulary.js file content
  async generateUpdatedVocabularyFile() {
    try {
      // Generate the header (standard vocabulary.js file structure)
      const header = `// Spanish DGT Driving Vocabulary Data
// This file contains all the vocabulary terms for the DGT flashcard application

`;
      const footer = ``;

      // Combine existing vocabulary with new words
      const allWords = [...this.vocabApp.allCards];

      // Filter out duplicates and add new words
      const existingWordSet = new Set(
        allWords.map((word) => word.word.toLowerCase().trim())
      );

      this.vocabApp.vocabularyUpdates.forEach((newWord) => {
        const normalizedWord = newWord.word.toLowerCase().trim();
        if (!existingWordSet.has(normalizedWord)) {
          allWords.push({
            word: newWord.word,
            translation: newWord.translation,
            perevod: newWord.perevod || "",
            category: newWord.category,
            example: newWord.example,
          });
        }
      });

      // Sort words alphabetically
      allWords.sort((a, b) => a.word.localeCompare(b.word));

      // Generate the new vocabulary array content
      let vocabularyContent = "window.vocabularyData = [\n";

      allWords.forEach((word, index) => {
        vocabularyContent += "  {\n";
        vocabularyContent += `    word: "${this.escapeJavaScriptString(
          word.word
        )}",\n`;
        vocabularyContent += `    translation: "${this.escapeJavaScriptString(
          word.translation
        )}",\n`;
        vocabularyContent += `    perevod: "${this.escapeJavaScriptString(
          word.perevod || ""
        )}",\n`;
        vocabularyContent += `    category: "${this.escapeJavaScriptString(
          word.category
        )}",\n`;
        vocabularyContent += `    example: "${this.escapeJavaScriptString(
          word.example
        )}",\n`;
        vocabularyContent += "  }";

        if (index < allWords.length - 1) {
          vocabularyContent += ",";
        }
        vocabularyContent += "\n";
      });

      vocabularyContent += "];";

      return header + vocabularyContent + footer;
    } catch (error) {
      throw new Error(
        `Failed to generate updated vocabulary file: ${error.message}`
      );
    }
  }

  // Escape strings for JavaScript
  escapeJavaScriptString(str) {
    if (!str) return "";
    return str
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t");
  }

  // Show merge request dialog - simplified to only use GitHub integration
  showMergeRequestDialog(updatedContent, branchName) {
    // Directly trigger GitHub integration
    this.triggerGitHubIntegration(updatedContent, branchName);
  }

  // Trigger GitHub integration
  triggerGitHubIntegration(updatedContent, branchName) {
    // Check if GitHub integration is available via global vocabulary manager
    if (
      !window.vocabularyManager ||
      !window.vocabularyManager.githubIntegration
    ) {
      this.showMessage(
        "GitHub integration is not available. Please refresh the page and try again.",
        "error"
      );
      return;
    }

    // Trigger GitHub integration dialog
    window.vocabularyManager.githubIntegration.showMergeRequestDialog(
      updatedContent,
      branchName
    );
  }
}

// Export for use in other modules
window.MergeRequestManager = MergeRequestManager;
