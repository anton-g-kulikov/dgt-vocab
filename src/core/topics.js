// Topic definitions for DGT vocabulary learning

window.TOPICS = {
  topic01: "Definitions of road users",
  topic02: "Vehicles and basic mechanics",
  topic03: "License and points",
  topic04: "Roads and speed",
  topic05: "Headlights and lighting",
  topic06: "Documents",
  topic07: "Traffic regulations",
  topic08: "Special lanes",
  topic09: "Signs and rules",
  topic10: "Maneuvers",
  topic11: "Safety",
  topic12: "Emergencies",
  topic13: "Transportation of goods and children",
};

// Topic utilities
window.TopicUtils = {
  /**
   * Get all available topics as an array
   */
  getAllTopics() {
    return Object.keys(window.TOPICS).map((id) => ({
      id,
      name: window.TOPICS[id],
    }));
  },

  /**
   * Get topic name by ID
   */
  getTopicName(topicId) {
    return window.TOPICS[topicId] || "Unknown Topic";
  },

  /**
   * Check if a word has a specific topic
   */
  wordHasTopic(word, topicId) {
    return word.topics && word.topics.includes(topicId);
  },

  /**
   * Filter words by topic
   */
  filterWordsByTopic(words, topicId) {
    if (!topicId || topicId === "all") {
      return words;
    }
    return words.filter((word) => this.wordHasTopic(word, topicId));
  },

  /**
   * Get words that have no topics assigned
   */
  getWordsWithoutTopics(words) {
    return words.filter((word) => !word.topics || word.topics.length === 0);
  },

  /**
   * Add topic to a word
   */
  addTopicToWord(word, topicId) {
    if (!word.topics) {
      word.topics = [];
    }
    if (!word.topics.includes(topicId)) {
      word.topics.push(topicId);
    }
    return word;
  },

  /**
   * Remove topic from a word
   */
  removeTopicFromWord(word, topicId) {
    if (word.topics) {
      word.topics = word.topics.filter((id) => id !== topicId);
    }
    return word;
  },

  /**
   * Get available categories for a specific topic
   */
  getAvailableCategoriesForTopic(words, topicId) {
    if (!topicId || topicId === "all") {
      // Return all categories if no topic filter
      const categories = new Set();
      words.forEach((word) => {
        if (word.category) {
          categories.add(word.category.toLowerCase());
        }
      });
      return Array.from(categories).sort();
    }

    // Filter words by topic first
    const filteredWords = this.filterWordsByTopic(words, topicId);

    // Get unique categories from filtered words
    const categories = new Set();
    filteredWords.forEach((word) => {
      if (word.category) {
        categories.add(word.category.toLowerCase());
      }
    });

    return Array.from(categories).sort();
  },

  /**
   * Get word count for a specific topic-category combination
   */
  getWordCountByTopicAndCategory(words, topicId, category) {
    let filtered = words;

    // Filter by topic if specified
    if (topicId && topicId !== "all") {
      filtered = this.filterWordsByTopic(filtered, topicId);
    }

    // Filter by category if specified
    if (category && category !== "all") {
      filtered = filtered.filter(
        (word) =>
          word.category &&
          word.category.toLowerCase() === category.toLowerCase()
      );
    }

    return filtered.length;
  },
};
