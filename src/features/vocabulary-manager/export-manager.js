// Export Manager - Handles CSV export functionality
class ExportManager {
  constructor(vocabApp, showMessage) {
    this.vocabApp = vocabApp;
    this.showMessage = showMessage;
  }

  exportVocabularyUpdates() {
    console.log("🔧 DEBUG: Export button clicked");

    // CRITICAL: Update vocabulary updates from UI before export
    // This ensures any pending changes (like perevod edits) are captured
    console.log(
      "🔧 DEBUG: Updating vocabulary updates from UI before export..."
    );
    if (
      window.vocabularyManager &&
      window.vocabularyManager.vocabularyUpdatesManager
    ) {
      window.vocabularyManager.vocabularyUpdatesManager.updateVocabularyUpdatesFromUI();
    }

    console.log(
      "🔧 DEBUG: Current vocabularyUpdates array after UI update:",
      JSON.stringify(this.vocabApp.vocabularyUpdates, null, 2)
    );

    // Before generating content, make one final check for duplicates
    const uniqueResults = [];
    const existingWords = new Set(
      this.vocabApp.allCards.map((card) => card.word.toLowerCase().trim())
    );

    // First, ensure all words have topics assigned
    let wordsWithoutTopics = 0;

    this.vocabApp.vocabularyUpdates.forEach((word) => {
      // Check if word has neither topics array nor topic string
      const hasNoTopics =
        (!word.topics ||
          !Array.isArray(word.topics) ||
          word.topics.length === 0) &&
        (!word.topic || word.topic.trim() === "");

      if (hasNoTopics) {
        word.topic = ""; // Empty string for topic field
        word.topics = []; // Empty array for "all topics" assignment
        wordsWithoutTopics++;
      }

      const normalizedWord = word.word.toLowerCase().trim();
      // Include edited words even if they already exist, since we're updating them
      if (!existingWords.has(normalizedWord) || word.isEdit === true) {
        uniqueResults.push(word);
      }
    });

    // Notify if topics were automatically assigned
    if (wordsWithoutTopics > 0) {
      this.showMessage(
        `Found ${wordsWithoutTopics} words without topic assignments. They'll be available in all topic categories.`,
        "info"
      );

      // Save the updates with topics
      localStorage.setItem(
        "dgt-vocab-vocabulary-updates",
        JSON.stringify(this.vocabApp.vocabularyUpdates)
      );
    }

    // Generate complete vocabulary.js file with all updates applied
    const completeVocabularyFile =
      this.generateCompleteVocabularyFile(uniqueResults);

    // Create blob for JavaScript file
    const jsBlob = new Blob([completeVocabularyFile], {
      type: "text/javascript;charset=utf-8;",
    });

    // Download JavaScript file
    this.downloadFile(jsBlob, "vocabulary.js");

    // Clear vocabulary updates after successful export
    this.vocabApp.vocabularyUpdates = [];
    localStorage.setItem("dgt-vocab-vocabulary-updates", JSON.stringify([]));

    // Trigger vocabulary updates table refresh
    const event = new CustomEvent("vocabularyUpdatesChanged");
    document.dispatchEvent(event);

    // Notify user
    const newWords = uniqueResults.filter((word) => !word.isEdit);
    const editedWords = uniqueResults.filter((word) => word.isEdit === true);
    let message = "Complete vocabulary.js file exported! ";
    if (newWords.length > 0 && editedWords.length > 0) {
      message += `Added ${newWords.length} new words and updated ${editedWords.length} existing words.`;
    } else if (newWords.length > 0) {
      message += `Added ${newWords.length} new words.`;
    } else if (editedWords.length > 0) {
      message += `Updated ${editedWords.length} existing words.`;
    }
    message +=
      " Simply replace your existing vocabulary.js file with the downloaded one.";

    this.showMessage(message, "success");
  }

  // Generate complete vocabulary.js file with all updates applied
  generateCompleteVocabularyFile(vocabularyUpdates) {
    console.log(
      "Generating complete vocabulary file with updates:",
      vocabularyUpdates.length
    );

    // Debug: Log all vocabulary updates with their perevod values
    console.log("🔧 DEBUG: Vocabulary updates being exported:");
    vocabularyUpdates.forEach((word, index) => {
      console.log(
        `  ${index + 1}. "${word.word}" - translation: "${
          word.translation
        }", perevod: "${word.perevod}", category: "${word.category}", isEdit: ${
          word.isEdit
        }`
      );
    });

    // Start with all existing vocabulary
    const allWords = [...this.vocabApp.allCards];
    console.log("Starting with existing vocabulary entries:", allWords.length);

    // Separate new words from edited words
    const newWords = vocabularyUpdates.filter((word) => !word.isEdit);
    const editedWords = vocabularyUpdates.filter(
      (word) => word.isEdit === true
    );

    console.log(
      `Processing: ${newWords.length} new words, ${editedWords.length} edited words`
    );

    // Apply edits to existing words
    editedWords.forEach((editedWord) => {
      const normalizedWord = editedWord.word.toLowerCase().trim();
      const existingWordIndex = allWords.findIndex(
        (word) => word.word.toLowerCase().trim() === normalizedWord
      );

      if (existingWordIndex !== -1) {
        console.log(`Updating existing word: ${editedWord.word}`);
        console.log(
          `🔧 DEBUG: Original perevod: "${allWords[existingWordIndex].perevod}", New perevod: "${editedWord.perevod}"`
        );

        // Update the existing word with new information
        allWords[existingWordIndex] = {
          word: editedWord.word,
          translation:
            editedWord.translation !== undefined &&
            editedWord.translation !== null
              ? editedWord.translation
              : allWords[existingWordIndex].translation,
          perevod:
            editedWord.perevod !== undefined && editedWord.perevod !== null
              ? editedWord.perevod
              : allWords[existingWordIndex].perevod,
          category: editedWord.category || allWords[existingWordIndex].category,
          topics:
            editedWord.topics && editedWord.topics.length > 0
              ? editedWord.topics
              : editedWord.topic
              ? [editedWord.topic]
              : [],
          example: editedWord.example || allWords[existingWordIndex].example,
        };

        console.log(
          `🔧 DEBUG: Final perevod for "${editedWord.word}": "${allWords[existingWordIndex].perevod}"`
        );
      } else {
        console.warn(
          `Could not find existing word to update: ${editedWord.word}`
        );
      }
    });

    // Add new words
    newWords.forEach((newWord) => {
      const normalizedWord = newWord.word.toLowerCase().trim();
      const wordExists = allWords.some(
        (word) => word.word.toLowerCase().trim() === normalizedWord
      );

      if (!wordExists) {
        console.log(`Adding new word: ${newWord.word}`);
        allWords.push({
          word: newWord.word,
          translation: newWord.translation || "",
          perevod: newWord.perevod || "",
          category: newWord.category || "",
          topics:
            newWord.topics && newWord.topics.length > 0
              ? newWord.topics
              : newWord.topic
              ? [newWord.topic]
              : [],
          example: newWord.example || "",
        });
      } else {
        console.warn(`Word already exists, skipping: ${newWord.word}`);
      }
    });

    // Sort words alphabetically
    allWords.sort((a, b) => a.word.localeCompare(b.word));
    console.log("Final vocabulary size:", allWords.length);

    // Generate the complete file content
    let fileContent = `// Spanish DGT Driving Vocabulary Data
// This file contains all the vocabulary terms for the DGT flashcard application
// UPDATED VERSION - Generated by DGT Vocabulary Manager on ${
      new Date().toISOString().split("T")[0]
    }

window.vocabularyData = [
`;

    allWords.forEach((word, index) => {
      fileContent += "  {\n";
      fileContent += `    word: "${this.escapeJavaScriptString(word.word)}",\n`;
      fileContent += `    translation: "${this.escapeJavaScriptString(
        word.translation
      )}",\n`;
      fileContent += `    perevod: "${this.escapeJavaScriptString(
        word.perevod
      )}",\n`;
      fileContent += `    category: "${this.escapeJavaScriptString(
        word.category
      )}",\n`;

      // Handle topics array
      if (word.topics && Array.isArray(word.topics) && word.topics.length > 0) {
        const topicsStr = word.topics
          .map((t) => `"${this.escapeJavaScriptString(t)}"`)
          .join(", ");
        fileContent += `    topics: [${topicsStr}],\n`;
      } else {
        fileContent += `    topics: [],\n`;
      }

      fileContent += `    example: "${this.escapeJavaScriptString(
        word.example
      )}",\n`;
      fileContent += "  }";

      // Add comma except for the last item
      if (index < allWords.length - 1) {
        fileContent += ",";
      }
      fileContent += "\n";
    });

    fileContent += "];\n";

    // Add summary comment at the end
    if (vocabularyUpdates.length > 0) {
      fileContent += `\n// UPDATED: ${new Date().toLocaleString()}\n`;
      fileContent += `// Total vocabulary entries: ${allWords.length}\n`;
      if (newWords.length > 0) {
        fileContent += `// New words added: ${newWords.length}\n`;
      }
      if (editedWords.length > 0) {
        fileContent += `// Words updated: ${editedWords.length}\n`;
      }
    }

    console.log("Generated complete vocabulary.js file successfully");
    return fileContent;
  }

  // Generate JavaScript content that matches vocabulary.js structure (legacy method)
  generateJavaScriptContent(vocabularyUpdates) {
    if (vocabularyUpdates.length === 0) {
      return "// No vocabulary entries to export\n";
    }

    // Separate new words from edited words
    const newWords = vocabularyUpdates.filter((word) => !word.isEdit);
    const editedWords = vocabularyUpdates.filter(
      (word) => word.isEdit === true
    );

    let jsContent = "";

    if (newWords.length > 0) {
      jsContent +=
        "// New vocabulary entries - copy and paste into vocabulary.js\n";
      jsContent +=
        "// Add these objects to the vocabularyData array before the closing bracket ]\n\n";

      newWords.forEach((word, index) => {
        jsContent += "  {\n";
        jsContent += `    word: "${this.escapeJavaScriptString(word.word)}",\n`;
        jsContent += `    translation: "${this.escapeJavaScriptString(
          word.translation || ""
        )}",\n`;
        jsContent += `    perevod: "${this.escapeJavaScriptString(
          word.perevod || ""
        )}",\n`;
        jsContent += `    category: "${this.escapeJavaScriptString(
          word.category || ""
        )}",\n`;
        // Add topics field as an array - check both topics (array) and topic (string)
        if (
          word.topics &&
          Array.isArray(word.topics) &&
          word.topics.length > 0
        ) {
          jsContent += `    topics: ${JSON.stringify(
            word.topics.map((t) => this.escapeJavaScriptString(t))
          )},\n`;
        } else if (word.topic) {
          jsContent += `    topics: ["${this.escapeJavaScriptString(
            word.topic
          )}"],\n`;
        } else {
          jsContent += `    topics: [],\n`;
        }
        jsContent += `    example: "${this.escapeJavaScriptString(
          word.example || ""
        )}",\n`;
        jsContent += "  },\n";
      });
      jsContent += "\n// Total new entries: " + newWords.length + "\n";
    }

    if (editedWords.length > 0) {
      if (newWords.length > 0) {
        jsContent += "\n" + "=".repeat(80) + "\n\n";
      }
      jsContent += "// Updated vocabulary entries (edited words)\n";
      jsContent +=
        "// Find these words in vocabulary.js and update their category/topic information\n\n";

      editedWords.forEach((word, index) => {
        jsContent += `// UPDATE: "${this.escapeJavaScriptString(word.word)}"\n`;
        jsContent += "  {\n";
        jsContent += `    word: "${this.escapeJavaScriptString(word.word)}",\n`;
        jsContent += `    translation: "${this.escapeJavaScriptString(
          word.translation || ""
        )}",\n`;
        jsContent += `    perevod: "${this.escapeJavaScriptString(
          word.perevod || ""
        )}",\n`;
        jsContent += `    category: "${this.escapeJavaScriptString(
          word.category || ""
        )}",\n`;
        // Add topics field as an array - check both topics (array) and topic (string)
        if (
          word.topics &&
          Array.isArray(word.topics) &&
          word.topics.length > 0
        ) {
          jsContent += `    topics: ${JSON.stringify(
            word.topics.map((t) => this.escapeJavaScriptString(t))
          )},\n`;
        } else if (word.topic) {
          jsContent += `    topics: ["${this.escapeJavaScriptString(
            word.topic
          )}"],\n`;
        } else {
          jsContent += `    topics: [],\n`;
        }
        jsContent += `    example: "${this.escapeJavaScriptString(
          word.example || ""
        )}",\n`;
        jsContent += "  },\n";
      });
      jsContent += "\n// Total updated entries: " + editedWords.length + "\n";
    }

    // Summary and instructions
    if (newWords.length > 0 && editedWords.length > 0) {
      jsContent += "\n// SUMMARY:\n";
      jsContent += `// - New entries: ${newWords.length}\n`;
      jsContent += `// - Updated entries: ${editedWords.length}\n`;
      jsContent += `// - Total changes: ${vocabularyUpdates.length}\n`;
    } else if (newWords.length > 0) {
      jsContent += "\n// Total new entries: " + newWords.length + "\n";
    } else if (editedWords.length > 0) {
      jsContent += "\n// Total updated entries: " + editedWords.length + "\n";
    }

    jsContent += "\n// Instructions:\n";
    jsContent += "// 1. Open src/core/vocabulary.js\n";
    if (newWords.length > 0) {
      jsContent +=
        "// 2. For NEW entries: Find the last entry in the vocabularyData array\n";
      jsContent +=
        "//    and paste the new objects before the closing bracket ]\n";
    }
    if (editedWords.length > 0) {
      jsContent +=
        "// 2. For UPDATED entries: Find each word in the vocabularyData array\n";
      jsContent +=
        "//    and replace the entire object with the updated version\n";
    }
    jsContent += "// 3. Make sure to keep proper comma placement\n";

    return jsContent;
  }

  // Helper function to escape JavaScript strings
  escapeJavaScriptString(str) {
    if (!str) return "";
    return str
      .replace(/\\/g, "\\\\") // Escape backslashes
      .replace(/"/g, '\\"') // Escape double quotes
      .replace(/'/g, "\\'") // Escape single quotes
      .replace(/\n/g, "\\n") // Escape newlines
      .replace(/\r/g, "\\r") // Escape carriage returns
      .replace(/\t/g, "\\t"); // Escape tabs
  }

  // Helper function to trigger download
  downloadFile(blob, fileName) {
    const url = window.URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = fileName;
    downloadLink.style.display = "none";

    // Add link to DOM
    document.body.appendChild(downloadLink);

    // Trigger click event to start download
    downloadLink.click();

    // Clean up
    document.body.removeChild(downloadLink);
    window.URL.revokeObjectURL(url);
  }
}

// Export for use in other modules
window.ExportManager = ExportManager;
