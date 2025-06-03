// Vocabulary Manager - Main orchestrator for managing vocabulary words

class VocabularyManager {
  constructor(vocabApp) {
    this.vocabApp = vocabApp;
    this.githubIntegration = new GitHubIntegration(this);

    // Make GitHub integration globally accessible for inter-component communication
    window.vocabularyManager = this;

    // Initialize translation service
    this.translationService = new TranslationService();

    // Check if TranslationManager is already available
    if (window.TranslationManager) {
      this.finishInitialization();
    } else {
      // Wait for TranslationManager to be ready before continuing
      document.addEventListener(
        "translationManagerReady",
        () => {
          this.finishInitialization();
        },
        { once: true }
      );
    }
  }

  finishInitialization() {
    // Initialize component managers
    this.initializeComponents();

    // Set up main event listeners
    this.setupMainEventListeners();

    // Update provider status display after initialization
    this.updateProviderStatus();
  }

  initializeComponents() {
    // Initialize all component managers
    this.textParser = new TextParser(
      this.vocabApp,
      this.showMessage.bind(this)
    );
    this.vocabularyUpdatesManager = new VocabularyUpdatesManager(
      this.vocabApp,
      this.showMessage.bind(this)
    );
    this.currentVocabularyManager = new CurrentVocabularyManager(
      this.vocabApp,
      this.showMessage.bind(this)
    );
    this.exportManager = new ExportManager(
      this.vocabApp,
      this.showMessage.bind(this)
    );
    // Use window.TranslationManager to ensure we're accessing the globally exported class
    this.translationManager = new window.TranslationManager(
      this.vocabApp,
      this.translationService,
      this.vocabularyUpdatesManager,
      this.showMessage.bind(this)
    );
    this.apiKeyManager = new ApiKeyManager(
      this.translationService,
      this.showMessage.bind(this)
    );
    this.mergeRequestManager = new MergeRequestManager(
      this.vocabApp,
      this.vocabularyUpdatesManager,
      this.showMessage.bind(this)
    );
  }

  setupMainEventListeners() {
    // Add event listener for export to CSV button
    const exportButton = document.getElementById("exportVocabularyToCSV");
    if (exportButton) {
      exportButton.addEventListener("click", () =>
        this.exportManager.exportVocabularyUpdates()
      );
    }

    // Listen for provider status changes
    document.addEventListener("providerStatusChanged", () => {
      this.updateProviderStatus();
    });

    // Initialize topic selector
    this.initializeTopicSelector();
  }

  initializeTopicSelector() {
    const topicSelector = document.getElementById("globalTopicSelector");

    // Wait for TopicUtils to be available if it's not loaded yet
    if (!window.TopicUtils) {
      console.warn("TopicUtils not available yet, retrying...");
      setTimeout(() => this.initializeTopicSelector(), 100);
      return;
    }

    if (topicSelector) {
      // Clear existing options (keep the default "No Topic" option)
      const defaultOption = topicSelector.querySelector('option[value=""]');
      topicSelector.innerHTML = "";
      if (defaultOption) {
        topicSelector.appendChild(defaultOption);
      } else {
        const noTopicOption = document.createElement("option");
        noTopicOption.value = "";
        noTopicOption.textContent = "No Topic (Optional)";
        topicSelector.appendChild(noTopicOption);
      }

      // Add all available topics
      try {
        const topics = window.TopicUtils.getAllTopics();
        topics.forEach((topic) => {
          const option = document.createElement("option");
          option.value = topic.id;
          option.textContent = topic.name;
          topicSelector.appendChild(option);
        });
        console.log("Topic selector initialized with", topics.length, "topics");
      } catch (error) {
        console.error("Error populating topic selector:", error);
      }
    }
  }

  // Get the currently selected global topic
  getSelectedGlobalTopic() {
    const topicSelector = document.getElementById("globalTopicSelector");
    return topicSelector ? topicSelector.value : "";
  }

  // Utility method to show messages
  showMessage(text, type) {
    const messageContainer = document.getElementById("messageContainer");
    if (messageContainer) {
      messageContainer.innerHTML = `<div class="${type}-message">${text}</div>`;
      messageContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else {
      alert(text);
    }
  }

  clearMessages() {
    const messageContainer = document.getElementById("messageContainer");
    if (messageContainer) {
      messageContainer.innerHTML = "";
    }
  }

  // Update translation provider status display
  updateProviderStatus() {
    this.translationManager.updateProviderStatus();
  }

  // Legacy methods for backwards compatibility with GitHubIntegration
  updateVocabularyUpdatesFromUI() {
    return this.vocabularyUpdatesManager.updateVocabularyUpdatesFromUI();
  }

  populateVocabularyUpdatesTable() {
    return this.vocabularyUpdatesManager.populateVocabularyUpdatesTable();
  }

  generateUpdatedVocabularyFile() {
    return this.mergeRequestManager.generateUpdatedVocabularyFile();
  }

  escapeJavaScriptString(str) {
    return this.mergeRequestManager.escapeJavaScriptString(str);
  }

  showMergeRequestDialog(updatedContent, branchName) {
    return this.mergeRequestManager.showMergeRequestDialog(
      updatedContent,
      branchName
    );
  }

  downloadMergeRequestFiles(updatedContent, branchName) {
    return this.mergeRequestManager.downloadMergeRequestFiles(
      updatedContent,
      branchName
    );
  }

  generateMergeRequestSummary(branchName) {
    return this.mergeRequestManager.generateMergeRequestSummary(branchName);
  }

  copyGitCommands(branchName, commitMessage) {
    return this.mergeRequestManager.copyGitCommands(branchName, commitMessage);
  }

  showGitCommandsDialog(commands) {
    return this.mergeRequestManager.showGitCommandsDialog(commands);
  }

  downloadFile(blob, fileName) {
    return this.mergeRequestManager.downloadFile(blob, fileName);
  }
}

// Code to initialize DGTVocabulary specifically for the vocabulary manager page
document.addEventListener("DOMContentLoaded", function () {
  // Only run the manager initialization if we're on the manager page
  if (!window.isVocabManagerPage) return;

  // The initialization will be handled by the script in vocabulary-manager.html
  console.log("Vocabulary Manager script loaded");
});
