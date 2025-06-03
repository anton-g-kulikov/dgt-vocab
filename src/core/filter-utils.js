/**
 * Filter utilities for vocabulary management
 */

/**
 * Returns vocabulary filtered by both topic and category
 * @param {Array} vocabulary - The vocabulary array
 * @param {Object} options - Filter options
 * @param {string} options.topic - Topic to filter by
 * @param {string} options.category - Category to filter by
 * @returns {Array} - Filtered vocabulary
 */
function filterVocabularyByTopicAndCategory(vocabulary, { topic, category }) {
  let filtered = [...vocabulary];

  // First filter by topic if specified
  if (topic && topic !== "all") {
    filtered = filtered.filter(
      (word) =>
        word.topics && Array.isArray(word.topics) && word.topics.includes(topic)
    );
  }

  // Then filter by category if specified
  if (category && category !== "all") {
    filtered = filtered.filter((word) => word.category === category);
  }

  return filtered;
}

/**
 * Gets count of vocabulary items by categories that match the given topic
 * @param {Array} vocabulary - The vocabulary array
 * @param {string} topic - Topic to filter by
 * @returns {Object} - Object with category counts
 */
function getCategoryCountsByTopic(vocabulary, topic) {
  const counts = { all: 0 };

  // Filter vocabulary by topic if specified
  let filtered = vocabulary;
  if (topic && topic !== "all") {
    filtered = vocabulary.filter(
      (word) =>
        word.topics && Array.isArray(word.topics) && word.topics.includes(topic)
    );
  }

  // Count by category
  filtered.forEach((word) => {
    counts.all += 1;
    const category = word.category || "uncategorized";
    counts[category] = (counts[category] || 0) + 1;
  });

  return counts;
}

// Export the functions
export { filterVocabularyByTopicAndCategory, getCategoryCountsByTopic };
