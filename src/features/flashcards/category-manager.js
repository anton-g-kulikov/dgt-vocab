// Category and topic filtering and management functionality

class CategoryManager {
  constructor(vocabApp) {
    this.vocabApp = vocabApp;
    this.populateCategoryFilter();

    // Delay topic population to ensure TopicUtils is loaded
    this.initializeTopics();
  }

  initializeTopics() {
    if (window.TopicUtils) {
      this.populateTopicFilter();
    } else {
      // Retry after a short delay
      console.log("TopicUtils not ready yet, retrying in 100ms...");
      setTimeout(() => this.initializeTopics(), 100);
    }
  }

  initCategories(vocabulary) {
    this.vocabulary = vocabulary;
    this.refreshCategories();
  }

  refreshCategories(topic = "all") {
    // Use the new function to get categories filtered by topic
    this.categories = this.getAvailableCategoriesForTopic(
      this.vocabulary,
      topic
    );

    // Clear existing category buttons
    this.categoryContainer.innerHTML = "";

    // Create "All Categories" button
    const allCategoryBtn = document.createElement("button");
    allCategoryBtn.textContent = "All Categories";
    allCategoryBtn.classList.add("category-btn");
    allCategoryBtn.dataset.category = "all";
    if (this.activeCategory === "all") {
      allCategoryBtn.classList.add("active");
    }
    this.categoryContainer.appendChild(allCategoryBtn);

    // Create buttons only for categories that exist in the selected topic
    this.categories.forEach((category) => {
      const btn = document.createElement("button");
      btn.textContent = category;
      btn.classList.add("category-btn");
      btn.dataset.category = category;
      if (this.activeCategory === category) {
        btn.classList.add("active");
      }
      this.categoryContainer.appendChild(btn);
    });

    // If the currently active category is not available in this topic selection,
    // reset to "all" categories
    if (
      this.activeCategory !== "all" &&
      !this.categories.includes(this.activeCategory)
    ) {
      this.setActiveCategory("all");
    }
  }

  populateCategoryFilter(selectedTopic = null) {
    const categoryButtonsContainer = document.getElementById("categoryButtons");
    if (!categoryButtonsContainer) return;

    categoryButtonsContainer.innerHTML = "";

    // Create "All Categories" button first
    const allButton = document.createElement("button");
    allButton.className = "category-btn active";
    allButton.textContent = "All Categories";
    allButton.dataset.category = "all";
    allButton.onclick = () => this.selectCategory("all", allButton);
    categoryButtonsContainer.appendChild(allButton);

    // Get categories that actually have words in them, filtered by selected topic
    const categoriesWithWords = this.getCategoriesWithWords(selectedTopic);

    categoriesWithWords.forEach((category) => {
      const button = document.createElement("button");
      button.className = "category-btn";
      button.textContent =
        category.charAt(0).toUpperCase() + category.slice(1) + "s"; // Pluralize category titles
      button.dataset.category = category;
      button.onclick = () => this.selectCategory(category, button);
      categoryButtonsContainer.appendChild(button);
    });
  }

  selectCategory(category, clickedButton) {
    // Remove active class from all category buttons
    document.querySelectorAll(".category-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    // Add active class to clicked button
    clickedButton.classList.add("active");

    // Track category selection
    if (window.Analytics) {
      window.Analytics.trackCategorySelect(category);
    }

    // Store the selected category
    this.vocabApp.selectedCategory = category;

    // Apply the filter
    this.filterCards();
  }

  updateTopicsForCategory(category) {
    // Get words for the selected category
    let categoryWords = this.vocabApp.allCards;
    if (category !== "all") {
      categoryWords = this.vocabApp.allCards.filter(
        (card) => card.category === category
      );
    }

    // Get topics available for this category
    const availableTopics = this.getTopicsForWords(categoryWords);

    // Update topic selector options
    this.updateTopicSelector(availableTopics);
  }

  getTopicsForWords(words) {
    const topicCounts = {};
    words.forEach((card) => {
      if (card.topics && card.topics.length > 0) {
        card.topics.forEach((topicId) => {
          topicCounts[topicId] = (topicCounts[topicId] || 0) + 1;
        });
      }
    });

    return Object.keys(topicCounts)
      .filter((topicId) => topicCounts[topicId] > 0)
      .sort();
  }

  populateTopicFilter() {
    const topicSelector = document.getElementById("topicSelector");
    if (!topicSelector) {
      console.log("Topic selector element not found!");
      return;
    }

    // Clear existing options except the "All Topics" option
    topicSelector.innerHTML = "";

    // Add "All Topics" option
    const defaultOption = document.createElement("option");
    defaultOption.value = "all";
    defaultOption.textContent = "All Topics";
    topicSelector.appendChild(defaultOption);

    // Get available topics - use the same approach as vocabulary manager
    if (window.TopicUtils) {
      console.log("TopicUtils found, getting all topics...");
      // Use getAllTopics to get all available topics, regardless of whether vocabulary has topics assigned
      const allTopics = window.TopicUtils.getAllTopics();
      console.log("Found topics:", allTopics);

      allTopics.forEach((topic) => {
        const option = document.createElement("option");
        option.value = topic.id;
        option.textContent = topic.name;
        topicSelector.appendChild(option);
        console.log(`Added topic: ${topic.id} - ${topic.name}`);
      });

      // Add event listener for topic selection (only add once)
      topicSelector.removeEventListener("change", this.topicChangeHandler);
      this.topicChangeHandler = (e) => {
        this.selectTopic(e.target.value);
      };
      topicSelector.addEventListener("change", this.topicChangeHandler);

      console.log(
        "Topic filter populated successfully with",
        allTopics.length,
        "topics"
      );
    } else {
      console.log("TopicUtils not found! Check if topics.js is loaded.");
    }
  }

  getTopicsWithWords() {
    const topicCounts = {};

    this.vocabApp.allCards.forEach((card) => {
      if (card.topics && card.topics.length > 0) {
        card.topics.forEach((topicId) => {
          topicCounts[topicId] = (topicCounts[topicId] || 0) + 1;
        });
      }
    });

    return Object.keys(topicCounts)
      .filter((topicId) => topicCounts[topicId] > 0)
      .sort();
  }

  getCategoriesWithWords(selectedTopic = null) {
    // Count words in each category, optionally filtered by topic
    const categoryCounts = {};

    this.vocabApp.allCards.forEach((card) => {
      // If a topic is selected, only count words that have that topic
      if (selectedTopic && selectedTopic !== "all") {
        if (!card.topics || !card.topics.includes(selectedTopic)) {
          return; // Skip this word if it doesn't have the selected topic
        }
      }

      const category = (card.category || "other").toLowerCase();
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    // Return only categories that have at least one word, sorted alphabetically
    return Object.keys(categoryCounts)
      .filter((category) => categoryCounts[category] > 0)
      .sort();
  }

  selectTopic(topicId) {
    this.currentTopic = topicId;

    // Update the main app's selected topic
    this.vocabApp.selectedTopic = topicId;

    // Only call analytics if it exists
    if (
      window.Analytics &&
      typeof window.Analytics.trackTopicSelect === "function"
    ) {
      window.Analytics.trackTopicSelect(topicId);
    }

    // Update the topic selector to reflect the selection
    const topicSelector = document.getElementById("topicSelector");
    if (topicSelector) {
      topicSelector.value = topicId;
    }

    // Update category buttons availability for the selected topic
    this.updateCategoriesForTopic(topicId);

    // Use the main app's filterByTopic method which handles everything
    this.vocabApp.filterByTopic(topicId);

    // Trigger event for topic selection
    const event = new CustomEvent("topicSelected", {
      detail: { topic: topicId },
    });
    document.dispatchEvent(event);

    return topicId;
  }

  updateCategoriesForTopic(topicId) {
    // Get words for the selected topic
    let topicWords = this.vocabApp.allCards;
    if (topicId !== "all") {
      topicWords = this.vocabApp.allCards.filter(
        (card) => card.topics && card.topics.includes(topicId)
      );
    }

    // Get categories available for this topic
    const availableCategories = this.getCategoriesForWords(topicWords);

    // Update category buttons to reflect availability
    this.updateCategoryButtons(availableCategories);
  }

  getCategoriesForWords(words) {
    const categoryCounts = {};
    words.forEach((card) => {
      const category = (card.category || "other").toLowerCase();
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    return Object.keys(categoryCounts)
      .filter((category) => categoryCounts[category] > 0)
      .sort();
  }

  updateCategoryButtons(availableCategories) {
    const categoryButtons = document.querySelectorAll(".category-btn");

    categoryButtons.forEach((button) => {
      const category = button.dataset.category;

      if (category === "all" || availableCategories.includes(category)) {
        button.style.opacity = "1";
        button.disabled = false;
        button.style.pointerEvents = "auto";
      } else {
        button.style.opacity = "0.3";
        button.disabled = true;
        button.style.pointerEvents = "none";
      }
    });

    // If current category is not available, reset to "all"
    if (
      this.vocabApp.selectedCategory !== "all" &&
      !availableCategories.includes(this.vocabApp.selectedCategory)
    ) {
      const allCategoryButton = document.querySelector(
        '.category-btn[data-category="all"]'
      );
      if (allCategoryButton) {
        this.selectCategory("all", allCategoryButton);
      }
    }
  }

  filterCards() {
    // Use the main app's updateCurrentCards method which properly applies all filters
    this.vocabApp.updateCurrentCards();

    // Update stats and display
    this.vocabApp.updateStats();

    // Update filter info display
    this.updateFilterInfo();

    // Refresh the current mode with filtered cards
    this.refreshCurrentMode();
  }

  getFilterText(category, topic) {
    let filterParts = [];

    if (category !== "all") {
      filterParts.push(`${category} category`);
    }

    if (topic !== "all" && window.TopicUtils) {
      filterParts.push(`${window.TopicUtils.getTopicName(topic)} topic`);
    }

    if (filterParts.length === 0) {
      return "";
    }

    return ` in ${filterParts.join(" and ")}`;
  }

  updateFilterInfo() {
    const categoryInfo = document.getElementById("categoryInfo");

    if (categoryInfo) {
      const selectedCategory = this.vocabApp.selectedCategory || "all";
      const selectedTopic = this.vocabApp.selectedTopic || "all";

      let infoText = "";

      if (selectedCategory === "all" && selectedTopic === "all") {
        infoText = "All Categories & Topics";
      } else if (selectedCategory === "all") {
        infoText = window.TopicUtils
          ? window.TopicUtils.getTopicName(selectedTopic)
          : "Topic Selected";
      } else if (selectedTopic === "all") {
        const categoryName =
          selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
        infoText = `${categoryName} Only`;
      } else {
        const categoryName =
          selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
        const topicName = window.TopicUtils
          ? window.TopicUtils.getTopicName(selectedTopic)
          : "Topic";
        infoText = `${categoryName} + ${topicName}`;
      }

      categoryInfo.textContent = infoText;
    }
  }

  refreshCurrentMode() {
    // Only restart modes if user is actively interacting, not during initialization
    if (this.vocabApp.currentMode === "quiz" && this.vocabApp.quizMode) {
      // Only start quiz if there's already a question showing (user was actively using it)
      const quizQuestion = document.getElementById("quizQuestion");
      if (
        quizQuestion &&
        quizQuestion.textContent &&
        quizQuestion.textContent.includes("What does")
      ) {
        this.vocabApp.quizMode.startQuiz();
      }
    } else if (
      this.vocabApp.currentMode === "flashcard" &&
      this.vocabApp.flashcardMode
    ) {
      this.vocabApp.showCurrentCard();
    }
  }
}

// Make CategoryManager available globally
window.CategoryManager = CategoryManager;
