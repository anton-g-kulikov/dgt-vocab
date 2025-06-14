// Pull Request Manager - Handles pull request creation and dialog
class PullRequestManager {
  constructor(vocabApp, vocabularyUpdatesManager, showMessage) {
    this.vocabApp = vocabApp;
    this.vocabularyUpdatesManager = vocabularyUpdatesManager;
    this.showMessage = showMessage;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Add event listener to create pull request button
    const createPullRequestBtn = document.getElementById("createPullRequest");
    if (createPullRequestBtn) {
      createPullRequestBtn.addEventListener("click", () =>
        this.createPullRequest()
      );
    }
  }

  // Create pull request functionality
  async createPullRequest() {
    try {
      // Validate vocabulary updates first
      if (
        !this.vocabApp.vocabularyUpdates ||
        this.vocabApp.vocabularyUpdates.length === 0
      ) {
        this.showMessage(
          "No vocabulary updates to create a pull request for.",
          "error"
        );
        return;
      }

      this.showMessage("Creating pull request... Please wait.", "info");

      // Get the updated vocabulary updates from the UI FIRST
      this.vocabularyUpdatesManager.updateVocabularyUpdatesFromUI();

      // Now validate that all words have translations (after getting them from UI)
      const incompleteWords = this.vocabApp.vocabularyUpdates.filter(
        (word) => !word.translation || word.translation.trim() === ""
      );

      if (incompleteWords.length > 0) {
        this.showMessage(
          `Please provide translations for all words before creating a pull request. ${incompleteWords.length} words are missing translations.`,
          "error"
        );
        return;
      }

      // Validate that all words have topics
      const wordsWithoutTopics = this.vocabApp.vocabularyUpdates.filter(
        (word) => {
          // Check if word has neither topics array nor topic string
          const hasNoTopics =
            (!word.topics ||
              !Array.isArray(word.topics) ||
              word.topics.length === 0) &&
            (!word.topic || word.topic.trim() === "");
          return hasNoTopics;
        }
      );

      if (wordsWithoutTopics.length > 0) {
        // Assign empty topic arrays to enable "all topics" assignment
        this.showMessage(
          `Found ${wordsWithoutTopics.length} words without topic assignments. They'll be available in all topic categories.`,
          "info"
        );

        wordsWithoutTopics.forEach((word) => {
          word.topic = ""; // Empty string for single topic field
          word.topics = []; // Empty array for topics field
        });

        // Update UI to reflect these changes
        this.vocabularyUpdatesManager.populateVocabularyUpdatesTable();

        // Save the updates with topics
        localStorage.setItem(
          "dgt-vocab-vocabulary-updates",
          JSON.stringify(this.vocabApp.vocabularyUpdates)
        );
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

      // Show pull request dialog
      this.showPullRequestDialog(updatedVocabularyContent, branchName);
    } catch (error) {
      console.error("Error creating pull request:", error);
      this.showMessage(
        "Error creating pull request: " + error.message,
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

        // For edited words, we need to update the existing word instead of adding a new one
        if (newWord.isEdit === true) {
          // Find and update the existing word
          const existingWordIndex = allWords.findIndex(
            (word) => word.word.toLowerCase().trim() === normalizedWord
          );
          if (existingWordIndex !== -1) {
            // Update the existing word with new category/topic information
            allWords[existingWordIndex].category = newWord.category;

            // Update topics
            if (
              newWord.topics &&
              Array.isArray(newWord.topics) &&
              newWord.topics.length > 0
            ) {
              allWords[existingWordIndex].topics = [...newWord.topics];
            }
            // If only the topic string exists (backward compatibility)
            else if (
              newWord.topic &&
              typeof newWord.topic === "string" &&
              newWord.topic.trim() !== ""
            ) {
              allWords[existingWordIndex].topics = [newWord.topic];
            }
            // Use empty array for "all topics" assignment
            else {
              allWords[existingWordIndex].topics = [];
            }

            // Also update other fields if they exist
            if (newWord.translation) {
              allWords[existingWordIndex].translation = newWord.translation;
            }
            if (newWord.perevod) {
              allWords[existingWordIndex].perevod = newWord.perevod;
            }
            if (newWord.example) {
              allWords[existingWordIndex].example = newWord.example;
            }
          }
        }
        // For new words (not edits), add them if they don't already exist
        else if (!existingWordSet.has(normalizedWord)) {
          const wordToAdd = {
            word: newWord.word,
            translation: newWord.translation,
            perevod: newWord.perevod || "",
            category: newWord.category,
            example: newWord.example,
          };

          // Include topics from the word
          if (
            newWord.topics &&
            Array.isArray(newWord.topics) &&
            newWord.topics.length > 0
          ) {
            wordToAdd.topics = [...newWord.topics];
          }
          // If only the topic string exists (backward compatibility)
          else if (
            newWord.topic &&
            typeof newWord.topic === "string" &&
            newWord.topic.trim() !== ""
          ) {
            wordToAdd.topics = [newWord.topic];
          }
          // Use empty array for "all topics" assignment
          else {
            wordToAdd.topics = [];
          }

          allWords.push(wordToAdd);
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

        // Add topics array if it exists and has entries
        if (
          word.topics &&
          Array.isArray(word.topics) &&
          word.topics.length > 0
        ) {
          const topicsStr = word.topics
            .map((t) => `"${this.escapeJavaScriptString(t)}"`)
            .join(", ");
          vocabularyContent += `    topics: [${topicsStr}],\n`;
        }
        // If only the topic string exists (backward compatibility)
        else if (
          word.topic &&
          typeof word.topic === "string" &&
          word.topic.trim() !== ""
        ) {
          vocabularyContent += `    topics: ["${this.escapeJavaScriptString(
            word.topic
          )}"],\n`;
        }
        // Empty topics array for "all topics" assignment
        else {
          vocabularyContent += `    topics: [],\n`;
        }

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

  // Show pull request dialog - simplified to only use GitHub integration
  showPullRequestDialog(updatedContent, branchName) {
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
    window.vocabularyManager.githubIntegration.showPullRequestDialog(
      updatedContent,
      branchName
    );
  }
}

// Export for use in other modules
window.PullRequestManager = PullRequestManager;
