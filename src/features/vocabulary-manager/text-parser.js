// Text Parser - Handles text analysis and word extraction for vocabulary expansion
class TextParser {
  constructor(vocabApp, showMessage) {
    this.vocabApp = vocabApp;
    this.showMessage = showMessage;
    this.setupEventListeners();
  }

  setupEventListeners() {
    const analyzeBtn = document.getElementById("analyzeTextBtn");
    if (!analyzeBtn) return;

    analyzeBtn.addEventListener("click", () => {
      this.analyzeText();
    });

    // Add event listener for the clear button
    const clearBtn = document.getElementById("clearVocabularyUpdates");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        this.clearVocabularyUpdates();
      });
    }
  }

  analyzeText() {
    const text = document.getElementById("textToAnalyze").value.trim();
    if (!text) {
      this.showMessage("Please enter some text to analyze", "error");
      return;
    }

    // Clean the text and extract words
    const words = this.extractWords(text);

    // Filter out words that already exist in the database
    const newWords = this.filterNewWords(words);

    if (newWords.length === 0) {
      this.showMessage(
        "No new words found in the text - all words already exist in your vocabulary",
        "info"
      );
      return;
    }

    // Add the words directly to vocabulary updates
    this.addWordsToVocabularyUpdates(newWords, text);
  }

  extractWords(text) {
    // Clean the text: remove punctuation and convert to lowercase
    const cleanText = text
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()¿¡"'?]/g, " ")
      .replace(/\s+/g, " ");

    // Split into words and filter out short words and common words
    const commonWords = new Set([
      "el",
      "la",
      "los",
      "las",
      "un",
      "una",
      "unos",
      "unas",
      "y",
      "o",
      "a",
      "de",
      "en",
      "con",
      "por",
      "para",
      "que",
      "se",
      "del",
      "al",
      "es",
      "son",
      "va",
      "e",
      "u",
      "esta",
      "está",
      "están",
      "este",
      "esta",
      "estos",
      "estas",
      "su",
      "sus",
      "mi",
      "tu",
      "su",
      "nuestro",
      "nuestra",
      "nuestros",
      "nuestras",
      "sin",
      "con",
      "como",
      "más",
      "todo",
      "todos",
    ]);

    const words = cleanText
      .split(" ")
      .filter((word) => word.length > 2) // Filter out very short words
      .filter((word) => !commonWords.has(word)) // Filter out common words
      .map((word) => this.guessWordProperties(word));

    return [...new Set(words.map((w) => JSON.stringify(w)))].map((w) =>
      JSON.parse(w)
    ); // Deduplicate
  }

  guessWordProperties(word) {
    // Logic to guess the word category based on patterns
    let category = "noun"; // Default

    // Check for verb endings
    if (word.endsWith("ar") || word.endsWith("er") || word.endsWith("ir")) {
      category = "verb";
    }
    // Check for common adjective endings
    else if (
      word.endsWith("ado") ||
      word.endsWith("ada") ||
      word.endsWith("oso") ||
      word.endsWith("osa") ||
      word.endsWith("ivo") ||
      word.endsWith("iva") ||
      word.endsWith("ico") ||
      word.endsWith("ica")
    ) {
      category = "adjective";
    }
    // Check for common adverb endings
    else if (word.endsWith("mente")) {
      category = "adverb";
    }

    return {
      word: word,
      category: category,
      id: Date.now() + Math.floor(Math.random() * 1000), // Generate a unique ID
    };
  }

  filterNewWords(words) {
    // Check against existing vocabulary - both from loaded vocabulary.js and any cards added in the session
    return words.filter((wordObj) => {
      const normalizedWord = wordObj.word.toLowerCase().trim();

      // Check if word already exists in the main vocabulary
      const existsInVocab = this.vocabApp.allCards.some(
        (card) => card.word.toLowerCase().trim() === normalizedWord
      );

      // Check if word already exists in vocabulary updates (for words added in current session)
      const existsInVocabularyUpdates =
        this.vocabApp.vocabularyUpdates &&
        this.vocabApp.vocabularyUpdates.some(
          (item) => item.word.toLowerCase().trim() === normalizedWord
        );

      return !existsInVocab && !existsInVocabularyUpdates;
    });
  }

  addWordsToVocabularyUpdates(words, originalText) {
    // Initialize vocabulary updates array if needed
    if (!this.vocabApp.vocabularyUpdates) {
      this.vocabApp.vocabularyUpdates = [];
    }

    let addedCount = 0;

    words.forEach((wordObj) => {
      // Check again if word already exists (for extra safety)
      const normalizedWord = wordObj.word.toLowerCase().trim();

      const alreadyExists =
        this.vocabApp.allCards.some(
          (card) => card.word.toLowerCase().trim() === normalizedWord
        ) ||
        this.vocabApp.vocabularyUpdates.some(
          (item) => item.word.toLowerCase().trim() === normalizedWord
        );

      if (alreadyExists) {
        return; // Skip this word
      }

      // Create a word entry for the vocabulary updates
      const newWord = {
        id: Date.now() + addedCount,
        word: wordObj.word,
        translation: "", // User needs to fill this in (English)
        perevod: "", // User needs to fill this in (Russian)
        category: wordObj.category,
        example: originalText, // Use the original text as example
      };

      // Add global topic if selected, otherwise use empty array
      const globalTopic = this.getSelectedGlobalTopic();
      if (globalTopic) {
        newWord.topic = globalTopic; // Set single topic field
        newWord.topics = [globalTopic]; // Set topics array for compatibility
      } else {
        newWord.topic = ""; // Empty string for topic field
        newWord.topics = []; // Empty array for "all topics" assignment
      }

      // Add to vocabulary updates
      this.vocabApp.vocabularyUpdates.push(newWord);
      addedCount++;
    });

    if (addedCount > 0) {
      // Save to localStorage
      localStorage.setItem(
        "dgt-vocab-vocabulary-updates",
        JSON.stringify(this.vocabApp.vocabularyUpdates)
      );

      // Show success message
      this.showMessage(
        `Added ${addedCount} words to vocabulary updates. Please provide translations below.`,
        "success"
      );

      // Reset the text input
      document.getElementById("textToAnalyze").value = "";

      // Trigger vocabulary updates table refresh (emit custom event)
      const event = new CustomEvent("vocabularyUpdatesChanged");
      document.dispatchEvent(event);

      // Make vocabulary updates visible if they were hidden
      const vocabularyUpdatesSection = document.querySelector(
        ".vocabulary-updates-subsection"
      );
      if (vocabularyUpdatesSection) {
        vocabularyUpdatesSection.classList.remove("hidden");
        // Scroll to the vocabulary updates section
        vocabularyUpdatesSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  }

  // Get the currently selected global topic from the UI
  getSelectedGlobalTopic() {
    const topicSelector = document.getElementById("globalTopicSelector");
    // Get the selected topic value, which may be empty
    const selectedTopic = topicSelector ? topicSelector.value : "";
    // Return the selected topic or empty string (which will result in empty topics array)
    return selectedTopic;
  }

  clearVocabularyUpdates() {
    if (confirm("Are you sure you want to clear all vocabulary updates?")) {
      this.vocabApp.vocabularyUpdates = [];
      localStorage.setItem("dgt-vocab-vocabulary-updates", JSON.stringify([]));

      // Trigger vocabulary updates table refresh (emit custom event)
      const event = new CustomEvent("vocabularyUpdatesChanged");
      document.dispatchEvent(event);

      this.showMessage("Vocabulary updates have been cleared", "success");
    }
  }
}

// Export for use in other modules
window.TextParser = TextParser;
