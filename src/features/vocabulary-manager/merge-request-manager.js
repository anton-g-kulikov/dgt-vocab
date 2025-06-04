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

  // Show merge request dialog
  showMergeRequestDialog(updatedContent, branchName) {
    // Create modal overlay
    const modalOverlay = document.createElement("div");
    modalOverlay.className = "merge-request-modal-overlay";
    modalOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Create modal content
    const modal = document.createElement("div");
    modal.className = "merge-request-modal";
    modal.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 2rem;
      max-width: 90%;
      max-height: 90%;
      overflow-y: auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;

    const newWordsCount = this.vocabApp.vocabularyUpdates.length;
    const totalWordsCount = this.vocabApp.allCards.length + newWordsCount;

    modal.innerHTML = `
      <h2>🔄 Create Merge Request</h2>
      <p>Ready to create a merge request with <strong>${newWordsCount} new words</strong>!</p>
      <p>Total vocabulary size will be: <strong>${totalWordsCount} words</strong></p>
      
      <div style="margin: 1.5rem 0;">
        <h3>📋 Summary of Changes:</h3>
        <ul style="max-height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 1rem; border-radius: 4px;">
          ${this.vocabApp.vocabularyUpdates
            .map(
              (word) =>
                `<li><strong>${word.word}</strong> → ${word.translation} | ${
                  word.perevod || ""
                } <em>(${word.category})</em></li>`
            )
            .join("")}
        </ul>
      </div>

      <div style="margin: 1.5rem 0;">
        <label for="branchNameInput" style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Branch Name:</label>
        <input type="text" id="branchNameInput" value="${branchName}" 
               style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
      </div>

      <div style="margin: 1.5rem 0;">
        <label for="commitMessageInput" style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Commit Message:</label>
        <textarea id="commitMessageInput" rows="3" 
                  style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;"
                  placeholder="Add ${newWordsCount} new vocabulary words">Add ${newWordsCount} new vocabulary words

Added vocabulary from vocabulary updates:
${this.vocabApp.vocabularyUpdates
  .slice(0, 5)
  .map(
    (word) =>
      `- ${word.word} (${word.translation}${
        word.perevod ? " | " + word.perevod : ""
      })`
  )
  .join("\n")}${
      newWordsCount > 5 ? `\n... and ${newWordsCount - 5} more words` : ""
    }</textarea>
      </div>

      <div style="margin: 1.5rem 0;">
        <h3>🚀 Choose Your Workflow:</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0;">
          
          <!-- GitHub Automation Option -->
          <div style="border: 2px solid #28a745; border-radius: 8px; padding: 1.5rem; background: #f8fff8;">
            <h4 style="margin-top: 0; color: #28a745;">🤖 Automated GitHub PR</h4>
            <p style="color: #666; margin: 0.5rem 0;">One-click pull request creation with GitHub API</p>
            <button id="createGitHubPRBtn" class="primary-btn" style="background: #28a745; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; width: 100%; font-weight: bold;">
              🚀 Create GitHub PR
            </button>
            <small style="color: #666; display: block; margin-top: 0.5rem;">Requires GitHub token (one-time setup)</small>
          </div>

          <!-- Manual Option -->
          <div style="border: 2px solid #6c757d; border-radius: 8px; padding: 1.5rem; background: #f8f9fa;">
            <h4 style="margin-top: 0; color: #6c757d;">📥 Manual Download</h4>
            <p style="color: #666; margin: 0.5rem 0;">Download files and create PR manually</p>
            <button id="downloadFilesBtn" class="secondary-btn" style="background: #6c757d; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; width: 100%; font-weight: bold;">
              📥 Download Files
            </button>
            <small style="color: #666; display: block; margin-top: 0.5rem;">Traditional Git workflow</small>
          </div>
        </div>
      </div>

      <div id="manualInstructions" style="margin: 1.5rem 0; display: none;">
        <h3>📝 Manual Instructions:</h3>
        <ol>
          <li>Click "Download Files" to get the new vocabulary.js file</li>
          <li>Create a new branch: <code>git checkout -b ${branchName}</code></li>
          <li>Replace your src/core/vocabulary.js file with the downloaded version</li>
          <li>Commit the changes: <code>git add src/core/vocabulary.js && git commit -m "Your commit message"</code></li>
          <li>Push the branch: <code>git push origin ${branchName}</code></li>
          <li>Create a pull request on your Git platform (GitHub, GitLab, etc.)</li>
        </ol>
      </div>

      <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
        <button id="copyGitCommandsBtn" class="secondary-btn" style="background: #6c757d; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer;">
          📋 Copy Git Commands
        </button>
        </button>
        <button id="closeMergeRequestModal" class="secondary-btn" style="background: #6c757d; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer;">
          ❌ Close
        </button>
      </div>
    `;

    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);

    // Add event listeners
    document
      .getElementById("createGitHubPRBtn")
      .addEventListener("click", () => {
        // Close current modal and trigger GitHub integration
        document.body.removeChild(modalOverlay);
        this.triggerGitHubIntegration(updatedContent, branchName);
      });

    document
      .getElementById("downloadFilesBtn")
      .addEventListener("click", () => {
        const branchName = document.getElementById("branchNameInput").value;
        this.downloadMergeRequestFiles(updatedContent, branchName);
        // Show manual instructions
        const instructions = document.getElementById("manualInstructions");
        if (instructions) {
          instructions.style.display = "block";
        }
      });

    document
      .getElementById("copyGitCommandsBtn")
      .addEventListener("click", () => {
        const branchName = document.getElementById("branchNameInput").value;
        const commitMessage =
          document.getElementById("commitMessageInput").value;
        this.copyGitCommands(branchName, commitMessage);
      });

    document
      .getElementById("closeMergeRequestModal")
      .addEventListener("click", () => {
        document.body.removeChild(modalOverlay);
      });

    // Close modal when clicking overlay
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        document.body.removeChild(modalOverlay);
      }
    });
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

  // Download the updated files for the merge request
  downloadMergeRequestFiles(updatedContent, branchName) {
    // Download updated vocabulary.js
    const vocabBlob = new Blob([updatedContent], {
      type: "text/javascript;charset=utf-8;",
    });
    this.downloadFile(vocabBlob, "vocabulary.js");

    // Also generate a summary file
    const summaryContent = this.generateMergeRequestSummary(branchName);
    const summaryBlob = new Blob([summaryContent], {
      type: "text/plain;charset=utf-8;",
    });
    this.downloadFile(summaryBlob, "merge-request-summary.txt");

    this.showMessage(
      "Files downloaded! Follow the instructions to create your merge request.",
      "success"
    );
  }

  // Generate merge request summary
  generateMergeRequestSummary(branchName) {
    const newWordsCount = this.vocabApp.vocabularyUpdates.length;
    const totalWordsCount = this.vocabApp.allCards.length + newWordsCount;

    let summary = `🔄 VOCABULARY UPDATE MERGE REQUEST\n`;
    summary += `=====================================\n\n`;
    summary += `Branch: ${branchName}\n`;
    summary += `Date: ${new Date().toLocaleString()}\n`;
    summary += `New words added: ${newWordsCount}\n`;
    summary += `Total vocabulary size: ${totalWordsCount}\n\n`;

    summary += `📋 NEW WORDS ADDED:\n`;
    summary += `-------------------\n`;
    this.vocabApp.vocabularyUpdates.forEach((word, index) => {
      summary += `${index + 1}. ${word.word} → ${word.translation}\n`;
      summary += `   Russian: ${word.perevod || "(not provided)"}\n`;
      summary += `   Category: ${word.category}\n`;
      if (word.example) {
        summary += `   Example: ${word.example}\n`;
      }
      summary += `\n`;
    });

    summary += `\n🔧 GIT COMMANDS TO EXECUTE:\n`;
    summary += `---------------------------\n`;
    summary += `git checkout -b ${branchName}\n`;
    summary += `# Replace vocabulary.js with the downloaded file\n`;
    summary += `git add vocabulary.js\n`;
    summary += `git commit -m "Add ${newWordsCount} new vocabulary words"\n`;
    summary += `git push origin ${branchName}\n`;
    summary += `# Then create a pull request on your Git platform\n`;

    return summary;
  }

  // Copy git commands to clipboard
  async copyGitCommands(branchName, commitMessage) {
    const commands = `git checkout -b ${branchName}
# Replace src/core/vocabulary.js with the downloaded file
git add src/core/vocabulary.js
git commit -m "${commitMessage.replace(/"/g, '\\"')}"
git push origin ${branchName}
# Then create a pull request on your Git platform`;

    try {
      await navigator.clipboard.writeText(commands);
      this.showMessage("Git commands copied to clipboard!", "success");
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      // Fallback: show the commands in a text area for manual copying
      this.showGitCommandsDialog(commands);
    }
  }

  // Show git commands dialog as fallback
  showGitCommandsDialog(commands) {
    const dialog = document.createElement("div");
    dialog.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      z-index: 1001;
      max-width: 80%;
    `;

    dialog.innerHTML = `
      <h3>📋 Git Commands</h3>
      <p>Copy these commands to execute in your terminal:</p>
      <textarea readonly style="width: 100%; height: 200px; font-family: monospace; padding: 1rem; border: 1px solid #ddd; border-radius: 4px;">${commands}</textarea>
      <div style="text-align: right; margin-top: 1rem;">
        <button onclick="this.parentElement.parentElement.remove()" style="background: #6c757d; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">Close</button>
      </div>
    `;

    document.body.appendChild(dialog);
    dialog.querySelector("textarea").select();
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
window.MergeRequestManager = MergeRequestManager;
