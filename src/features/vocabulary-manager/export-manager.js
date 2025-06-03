// Export Manager - Handles CSV export functionality
class ExportManager {
  constructor(vocabApp, showMessage) {
    this.vocabApp = vocabApp;
    this.showMessage = showMessage;
  }

  exportVocabularyUpdates() {
    // Before generating content, make one final check for duplicates
    const uniqueResults = [];
    const existingWords = new Set(
      this.vocabApp.allCards.map((card) => card.word.toLowerCase().trim())
    );

    this.vocabApp.vocabularyUpdates.forEach((word) => {
      const normalizedWord = word.word.toLowerCase().trim();
      if (!existingWords.has(normalizedWord)) {
        uniqueResults.push(word);
      }
    });

    // Generate JavaScript content that matches vocabulary.js structure
    const jsContent = this.generateJavaScriptContent(uniqueResults);

    // Create blob for JavaScript file
    const jsBlob = new Blob([jsContent], {
      type: "text/javascript;charset=utf-8;",
    });

    // Download JavaScript file
    this.downloadFile(jsBlob, "vocabulary_export.js");

    // Clear vocabulary updates after successful export
    this.vocabApp.vocabularyUpdates = [];
    localStorage.setItem("dgt-vocab-vocabulary-updates", JSON.stringify([]));

    // Trigger vocabulary updates table refresh
    const event = new CustomEvent("vocabularyUpdatesChanged");
    document.dispatchEvent(event);

    // Notify user
    this.showMessage(
      "Vocabulary exported as JavaScript file! Ready to copy-paste into vocabulary.js",
      "success"
    );
  }

  // Generate JavaScript content that matches vocabulary.js structure
  generateJavaScriptContent(vocabularyUpdates) {
    if (vocabularyUpdates.length === 0) {
      return "// No new vocabulary entries to export\n";
    }

    let jsContent =
      "// New vocabulary entries - copy and paste into vocabulary.js\n";
    jsContent +=
      "// Add these objects to the vocabularyData array before the closing bracket ]\n\n";

    vocabularyUpdates.forEach((word, index) => {
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
      if (word.topics && Array.isArray(word.topics) && word.topics.length > 0) {
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

    jsContent += "\n// Total new entries: " + vocabularyUpdates.length + "\n";
    jsContent += "// Instructions:\n";
    jsContent += "// 1. Open src/core/vocabulary.js\n";
    jsContent += "// 2. Find the last entry in the vocabularyData array\n";
    jsContent +=
      "// 3. Copy the objects above and paste them before the closing bracket ]\n";
    jsContent +=
      "// 4. Make sure to keep the comma after the last existing entry\n";

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
