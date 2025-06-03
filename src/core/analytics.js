// Analytics tracking for the DGT Vocab app

window.Analytics = window.Analytics || {
  /**
   * Check if analytics is enabled
   */
  isEnabled() {
    // Add your logic to determine if analytics is enabled
    return true;
  },

  /**
   * Track topic selection
   * @param {string} topicId - The ID of the selected topic
   */
  trackTopicSelect(topicId) {
    if (!this.isEnabled()) return;

    try {
      console.log(`[Analytics] Topic selected: ${topicId}`);
      // Implement actual tracking logic here if needed
      // For example:
      // gtag('event', 'select_topic', {
      //   'topic_id': topicId,
      //   'topic_name': window.TopicUtils.getTopicName(topicId)
      // });
    } catch (err) {
      console.warn("Analytics error:", err);
    }
  },
};
