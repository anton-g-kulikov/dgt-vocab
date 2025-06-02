// GitHub Integration Module for DGT Vocabulary Manager
// Handles automated pull request creation via GitHub API

class GitHubIntegration {
  constructor(vocabularyManager) {
    this.vocabManager = vocabularyManager;

    // Default repository settings - change these to your repository
    this.defaultOwner = "anton-g-kulikov"; // Replace with your GitHub username
    this.defaultRepo = "dgt-vocab"; // Replace with your repository name
  }

  // Check if user is authenticated with GitHub
  async isAuthenticated() {
    const token = localStorage.getItem("github_token");
    if (!token) return false;

    try {
      // Basic token validation
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!response.ok) {
        // Remove invalid token
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("github_token");
        }
        return false;
      }

      // Additional check: verify permissions for our repository
      const permissionCheck = await this.checkTokenPermissions(
        this.defaultSettings.owner,
        this.defaultSettings.repo,
        token
      );

      if (!permissionCheck.canAccess) {
        console.warn("Token lacks repository access:", permissionCheck.error);
        // Don't remove token here - might work for other repos
        return false;
      }

      if (!permissionCheck.permissions.push) {
        console.warn("Token lacks push permissions for creating branches");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking GitHub authentication:", error);
      return false;
    }
  }

  // Show GitHub-integrated merge request dialog
  async showMergeRequestDialog(updatedContent, branchName) {
    // Check authentication first
    const isAuth = await this.isAuthenticated();
    if (!isAuth) {
      // Show authentication prompt first
      this.showAuthenticationDialog(updatedContent, branchName);
      return;
    }

    const modalOverlay = document.createElement("div");
    modalOverlay.className = "github-merge-request-modal-overlay";
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

    const modal = document.createElement("div");
    modal.className = "github-merge-request-modal";
    modal.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 2rem;
      max-width: 90%;
      max-height: 90%;
      overflow-y: auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;

    const newWordsCount = this.vocabManager.vocabApp.vocabularyUpdates.length;
    const totalWordsCount =
      this.vocabManager.vocabApp.allCards.length + newWordsCount;

    // Get GitHub settings from localStorage or defaults
    const githubOwner =
      localStorage.getItem("github_owner") || this.defaultOwner;
    const githubRepo = localStorage.getItem("github_repo") || this.defaultRepo;

    modal.innerHTML = `
      <h2>🚀 Create GitHub Pull Request</h2>
      <p>Automatically create a pull request with <strong>${newWordsCount} new words</strong>!</p>
      <p>Total vocabulary size will be: <strong>${totalWordsCount} words</strong></p>
      <p style="color: #666; font-size: 0.9em; margin: 1rem 0;">Repository: <strong>${githubOwner}/${githubRepo}</strong></p>
      
      <div style="margin: 1.5rem 0;">
        <h3>📋 Summary of Changes:</h3>
        <ul style="max-height: 150px; overflow-y: auto; border: 1px solid #ddd; padding: 1rem; border-radius: 4px;">
          ${this.vocabManager.vocabApp.vocabularyUpdates
            .map(
              (word) =>
                `<li><strong>${word.word}</strong> → ${word.translation} <em>(${word.category})</em></li>`
            )
            .join("")}
        </ul>
      </div>

      <!-- Hidden repository fields with default values -->
      <input type="hidden" id="githubOwnerInput" value="${githubOwner}">
      <input type="hidden" id="githubRepoInput" value="${githubRepo}">

      <div style="margin: 1.5rem 0;">
        <label for="githubBranchNameInput" style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Branch Name:</label>
        <input type="text" id="githubBranchNameInput" value="${branchName}" 
               style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
      </div>

      <div style="margin: 1.5rem 0;">
        <label for="githubPRTitleInput" style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Pull Request Title:</label>
        <input type="text" id="githubPRTitleInput" value="Add ${newWordsCount} new vocabulary words" 
               style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
      </div>

      <div style="margin: 1.5rem 0;">
        <label for="githubPRDescriptionInput" style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Pull Request Description:</label>
        <textarea id="githubPRDescriptionInput" rows="4" 
                  style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;"
                  placeholder="Describe the changes...">Added ${newWordsCount} new vocabulary words from vocabulary updates:

${this.vocabManager.vocabApp.vocabularyUpdates
  .slice(0, 5)
  .map((word) => `- **${word.word}** (${word.translation}) - ${word.category}`)
  .join("\n")}${
      newWordsCount > 5 ? `\n- ... and ${newWordsCount - 5} more words` : ""
    }

This automated update maintains the vocabulary structure and adds new words to the appropriate categories.</textarea>
      </div>

      <div id="githubStatusMessage" style="margin: 1rem 0; padding: 1rem; border-radius: 4px; display: none;"></div>

      <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
        <button id="createGitHubPRBtn" class="primary-btn" style="background: #28a745; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer;">
          🚀 Create Pull Request
        </button>
        <button id="manualWorkflowBtn" class="secondary-btn" style="background: #6c757d; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer;">
          📁 Manual Workflow
        </button>
        <button id="closeGitHubMergeRequestModal" class="secondary-btn" style="background: #6c757d; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer;">
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
        this.createPullRequest(updatedContent, modalOverlay);
      });

    document
      .getElementById("manualWorkflowBtn")
      .addEventListener("click", () => {
        document.body.removeChild(modalOverlay);
        this.vocabManager.showMergeRequestDialog(updatedContent, branchName);
      });

    document
      .getElementById("closeGitHubMergeRequestModal")
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

  // Create GitHub pull request automatically
  async createPullRequest(updatedContent, modalOverlay) {
    const statusDiv = document.getElementById("githubStatusMessage");
    const createBtn = document.getElementById("createGitHubPRBtn");

    try {
      // Get form values
      const owner = document.getElementById("githubOwnerInput").value.trim();
      const repo = document.getElementById("githubRepoInput").value.trim();
      const branchName = document
        .getElementById("githubBranchNameInput")
        .value.trim();
      const prTitle = document
        .getElementById("githubPRTitleInput")
        .value.trim();
      const prDescription = document
        .getElementById("githubPRDescriptionInput")
        .value.trim();

      // Validate required fields
      if (!owner || !repo || !branchName || !prTitle) {
        this.showStatus(
          "Please fill in all required fields.",
          "error",
          statusDiv
        );
        return;
      }

      // Store GitHub settings for future use
      localStorage.setItem("github_owner", owner);
      localStorage.setItem("github_repo", repo);

      // Get GitHub token (should be available since we authenticated upfront)
      const token = localStorage.getItem("github_token");
      if (!token) {
        this.showStatus(
          "Authentication token missing. Please refresh and try again.",
          "error",
          statusDiv
        );
        return;
      }

      // Disable create button and show progress
      createBtn.disabled = true;
      createBtn.textContent = "🔄 Creating...";
      this.showStatus("Creating pull request...", "info", statusDiv);

      // Step 1: Get default branch SHA
      this.showStatus(
        "🔍 Getting repository information...",
        "info",
        statusDiv
      );
      const defaultBranch = await this.getDefaultBranch(owner, repo, token);
      const defaultBranchSha = await this.getBranchSha(
        owner,
        repo,
        defaultBranch,
        token
      );

      // Step 2: Create new branch
      this.showStatus("🌿 Creating new branch...", "info", statusDiv);
      await this.createBranch(owner, repo, branchName, defaultBranchSha, token);

      // Step 3: Get current vocabulary.js file SHA (if it exists)
      this.showStatus("📄 Updating vocabulary file...", "info", statusDiv);
      const currentFileSha = await this.getFileSha(
        owner,
        repo,
        "vocabulary.js",
        token
      );

      // Step 4: Update vocabulary.js file
      await this.updateFile(
        owner,
        repo,
        "vocabulary.js",
        updatedContent,
        `Add ${this.vocabManager.vocabApp.vocabularyUpdates.length} new vocabulary words`,
        branchName,
        currentFileSha,
        token
      );

      // Step 5: Create pull request
      this.showStatus("🚀 Creating pull request...", "info", statusDiv);
      const pullRequest = await this.createPullRequestAPI(
        owner,
        repo,
        branchName,
        defaultBranch,
        prTitle,
        prDescription,
        token
      );

      // Success!
      this.showStatus(
        `✅ Pull request created successfully!<br>
        <strong>PR #${pullRequest.number}:</strong> <a href="${pullRequest.html_url}" target="_blank" style="color: #0366d6; text-decoration: underline;">${prTitle}</a><br>
        <small style="color: #666;">
          <strong>Branch:</strong> ${branchName}<br>
          <strong>Repository:</strong> ${owner}/${repo}<br>
          <strong>Files Updated:</strong> vocabulary.js<br>
          <strong>Words Added:</strong> ${this.vocabManager.vocabApp.vocabularyUpdates.length}
        </small>`,
        "success",
        statusDiv
      );

      createBtn.textContent = "✅ Pull Request Created";
      createBtn.style.background = "#28a745";

      // Clear vocabulary updates after successful PR creation
      this.vocabManager.vocabApp.vocabularyUpdates = [];
      localStorage.setItem("dgt-vocab-vocabulary-updates", JSON.stringify([]));

      // Refresh the vocabulary updates table in the main UI
      this.vocabManager.populateVocabularyUpdatesTable();

      // Show success message in main UI
      this.vocabManager.showMessage(
        `GitHub pull request created successfully! <a href="${pullRequest.html_url}" target="_blank" style="color: #0366d6;">View PR #${pullRequest.number}</a> Vocabulary updates have been cleared.`,
        "success"
      );
    } catch (error) {
      console.error("Error creating GitHub pull request:", error);

      let errorMessage = "Failed to create pull request: ";

      if (error.message.includes("401")) {
        errorMessage +=
          "Authentication failed. Your GitHub token may have expired or been revoked.";
        localStorage.removeItem("github_token"); // Remove invalid token
      } else if (error.message.includes("403")) {
        if (error.message.includes("push")) {
          errorMessage +=
            "Permission denied for creating branches. Please check your token has 'Contents: Write' permission.";
        } else {
          errorMessage +=
            "Permission denied. Please check your GitHub token permissions.";
        }
      } else if (error.message.includes("404")) {
        errorMessage +=
          "Repository not found or access denied. Please verify the repository exists and your token has access.";
      } else if (error.message.includes("422")) {
        if (error.message.includes("branch")) {
          errorMessage += `Branch '${branchName}' already exists. Try refreshing the page to generate a new branch name.`;
        } else {
          errorMessage +=
            "Validation error. The data provided may be invalid or incomplete.";
        }
      } else if (error.message.includes("rate limit")) {
        errorMessage +=
          "GitHub API rate limit exceeded. Please wait a few minutes and try again.";
      } else if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        errorMessage +=
          "Network error. Please check your internet connection and try again.";
      } else {
        errorMessage += error.message;
      }

      // Add helpful tips
      errorMessage +=
        "<br><br><small style='color: #666;'><strong>Troubleshooting:</strong><br>";
      errorMessage += "• Try using the manual workflow instead<br>";
      errorMessage += "• Check your GitHub token permissions<br>";
      errorMessage += "• Verify you have access to the repository</small>";

      this.showStatus(errorMessage, "error", statusDiv);
      createBtn.disabled = false;
      createBtn.textContent = "🚀 Create Pull Request";
    }
  }

  // Show status message in GitHub modal
  showStatus(message, type, statusDiv) {
    statusDiv.style.display = "block";
    statusDiv.innerHTML = message;

    switch (type) {
      case "success":
        statusDiv.style.background = "#d4edda";
        statusDiv.style.color = "#155724";
        statusDiv.style.border = "1px solid #c3e6cb";
        break;
      case "error":
        statusDiv.style.background = "#f8d7da";
        statusDiv.style.color = "#721c24";
        statusDiv.style.border = "1px solid #f5c6cb";
        break;
      case "info":
        statusDiv.style.background = "#d1ecf1";
        statusDiv.style.color = "#0c5460";
        statusDiv.style.border = "1px solid #bee5eb";
        break;
    }
  }

  // Show authentication dialog when user is not authenticated
  showAuthenticationDialog(updatedContent, branchName) {
    const modalOverlay = document.createElement("div");
    modalOverlay.className = "github-auth-modal-overlay";
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

    const modal = document.createElement("div");
    modal.className = "github-auth-modal";
    modal.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 2rem;
      max-width: 600px;
      max-height: 90%;
      overflow-y: auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;

    modal.innerHTML = `
      <h2>🚀 Choose Your Workflow</h2>
      <p>You have <strong>two options</strong> for creating merge requests with your vocabulary updates:</p>
      
      <div style="margin: 1.5rem 0; padding: 1.5rem; background: #e7f3ff; border-radius: 8px; border-left: 4px solid #0366d6;">
        <h3 style="margin-top: 0; color: #0366d6;">🤖 Option 1: Automated GitHub Integration</h3>
        <p style="margin-bottom: 1rem;">Authenticate with GitHub to automatically create pull requests. This requires a Personal Access Token.</p>
        
        <details style="margin-top: 1rem;">
          <summary style="cursor: pointer; font-weight: bold; color: #0366d6;">🔑 How to get a GitHub Personal Access Token:</summary>
          <div style="margin-top: 1rem; padding-left: 1rem;">
            <ol style="margin: 0.5rem 0; padding-left: 1.5rem;">
              <li>Go to <a href="https://github.com/settings/tokens" target="_blank" style="color: #0366d6; text-decoration: underline;">GitHub Settings → Personal Access Tokens → Tokens (classic)</a></li>
              <li>Click <strong>"Generate new token (classic)"</strong></li>
              <li>Give it a descriptive name like <code style="background: #f1f3f4; padding: 2px 4px; border-radius: 3px;">DGT Vocab Manager</code></li>
              <li>Set an expiration date (recommended: 90 days or 1 year)</li>
              <li>Select the following scopes:
                <ul style="margin: 0.5rem 0;">
                  <li>✅ <code style="background: #f1f3f4; padding: 2px 4px; border-radius: 3px;">repo</code> (for private repositories)</li>
                  <li>✅ <code style="background: #f1f3f4; padding: 2px 4px; border-radius: 3px;">public_repo</code> (for public repositories)</li>
                </ul>
              </li>
              <li>Click <strong>"Generate token"</strong></li>
              <li>⚠️ <strong>Important:</strong> Copy the token immediately - you won't see it again!</li>
            </ol>
          </div>
        </details>
      </div>

      <div style="margin: 1.5rem 0; padding: 1.5rem; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
        <h3 style="margin-top: 0; color: #856404;">📁 Option 2: Manual Workflow</h3>
        <p style="margin-bottom: 0;">Generate downloadable files and manual instructions. <strong>No GitHub authentication required!</strong></p>
      </div>

      <div style="margin: 1.5rem 0;">
        <h4 style="margin-bottom: 0.5rem;">🔐 GitHub Token (for automated workflow only):</h4>
        <input type="password" id="githubTokenInput" placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" 
               style="width: 100%; padding: 0.75rem; border: 2px solid #ddd; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 14px;">
        <small style="color: #666; margin-top: 0.5rem; display: block;">Your token will be stored securely in your browser's local storage.</small>
      </div>

      <div id="authStatusMessage" style="margin: 1rem 0; padding: 1rem; border-radius: 4px; display: none;"></div>

      <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 2rem;">
        <button id="authenticateBtn" class="primary-btn" style="background: #28a745; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; font-weight: bold;">
          🔐 Authenticate & Continue
        </button>
        <button id="useManualWorkflowBtn" class="secondary-btn" style="background: #ffc107; color: #212529; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; font-weight: bold;">
          📁 Use Manual Workflow Instead
        </button>
        <button id="cancelAuthBtn" class="secondary-btn" style="background: #6c757d; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer;">
          ❌ Cancel
        </button>
      </div>
    `;

    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);

    // Add event listeners
    document
      .getElementById("authenticateBtn")
      .addEventListener("click", async () => {
        const token = document.getElementById("githubTokenInput").value.trim();
        const statusDiv = document.getElementById("authStatusMessage");
        const authenticateBtn = document.getElementById("authenticateBtn");

        if (!token) {
          this.showStatus(
            "Please enter your GitHub token.",
            "error",
            statusDiv
          );
          return;
        }

        // Validate token format (accept both classic and fine-grained tokens)
        const isClassicToken = token.match(/^ghp_[a-zA-Z0-9]{36}$/);
        const isFineGrainedToken = token.match(/^github_pat_[a-zA-Z0-9_]+$/);

        if (!isClassicToken && !isFineGrainedToken) {
          this.showStatus(
            "Invalid token format. GitHub tokens should start with 'ghp_' (classic) or 'github_pat_' (fine-grained).",
            "error",
            statusDiv
          );
          return;
        }

        // Disable button and show progress
        authenticateBtn.disabled = true;
        authenticateBtn.textContent = "🔄 Verifying...";
        this.showStatus("Verifying your GitHub token...", "info", statusDiv);

        try {
          // Step 1: Basic token verification
          const response = await fetch("https://api.github.com/user", {
            headers: {
              Authorization: `token ${token}`,
              Accept: "application/vnd.github.v3+json",
            },
          });

          if (!response.ok) {
            let errorMessage = "❌ Invalid GitHub token. ";
            if (response.status === 401) {
              errorMessage += "The token is invalid or has expired.";
            } else if (response.status === 403) {
              errorMessage +=
                "The token has been revoked or lacks basic permissions.";
            } else {
              errorMessage += `Error: ${response.status} ${response.statusText}`;
            }

            this.showStatus(errorMessage, "error", statusDiv);
            authenticateBtn.disabled = false;
            authenticateBtn.textContent = "🔐 Authenticate & Continue";
            return;
          }

          const userData = await response.json();

          // Step 2: Check repository permissions
          this.showStatus(
            "✅ Token valid! Checking repository permissions...",
            "info",
            statusDiv
          );

          const permissionCheck = await this.checkTokenPermissions(
            this.defaultSettings.owner,
            this.defaultSettings.repo,
            token
          );

          if (!permissionCheck.canAccess) {
            this.showStatus(
              `❌ Repository access denied: ${permissionCheck.error}`,
              "error",
              statusDiv
            );
            authenticateBtn.disabled = false;
            authenticateBtn.textContent = "🔐 Authenticate & Continue";
            return;
          }

          // Step 3: Verify required permissions
          const permissions = permissionCheck.permissions;
          const missingPermissions = [];

          if (!permissions.push) {
            missingPermissions.push("Push (required for creating branches)");
          }
          if (!permissions.pull) {
            missingPermissions.push("Pull (required for reading repository)");
          }

          if (missingPermissions.length > 0) {
            const tokenType = permissionCheck.tokenType;
            let fixInstructions = "";

            if (tokenType === "classic") {
              fixInstructions =
                "For classic tokens, ensure you have the 'repo' scope selected.";
            } else if (tokenType === "fine-grained") {
              fixInstructions =
                "For fine-grained tokens, ensure you have 'Contents: Write' and 'Metadata: Read' permissions.";
            }

            this.showStatus(
              `❌ Insufficient permissions. Missing: ${missingPermissions.join(
                ", "
              )}. ${fixInstructions}`,
              "error",
              statusDiv
            );
            authenticateBtn.disabled = false;
            authenticateBtn.textContent = "🔐 Authenticate & Continue";
            return;
          }

          // Step 4: Success - store token and proceed
          localStorage.setItem("github_token", token);

          // Display success with permission details
          const permissionsList = [
            permissions.pull ? "✅ Read repository" : "❌ Read repository",
            permissions.push
              ? "✅ Create branches & commits"
              : "❌ Create branches & commits",
            permissions.admin
              ? "✅ Admin access"
              : "ℹ️ No admin access (not required)",
          ].join("<br>");

          this.showStatus(
            `✅ Successfully authenticated as <strong>${
              userData.login
            }</strong>!<br>
            <small style="color: #666;">
              <strong>Token Type:</strong> ${
                permissionCheck.tokenType === "classic"
                  ? "Classic Personal Access Token"
                  : permissionCheck.tokenType === "fine-grained"
                  ? "Fine-grained Personal Access Token"
                  : "Unknown"
              }<br>
              <strong>Repository:</strong> ${
                permissionCheck.repositoryInfo.fullName
              }<br>
              <strong>Permissions:</strong><br>${permissionsList}
            </small>`,
            "success",
            statusDiv
          );

          // Close auth modal and proceed with GitHub workflow
          setTimeout(() => {
            document.body.removeChild(modalOverlay);
            this.showMergeRequestDialog(updatedContent, branchName);
          }, 1500);
        } catch (error) {
          console.error("Error validating GitHub token:", error);
          this.showStatus(
            `❌ Error validating token: ${error.message}. Please check your internet connection and try again.`,
            "error",
            statusDiv
          );
          authenticateBtn.disabled = false;
          authenticateBtn.textContent = "🔐 Authenticate & Continue";
        }
      });

    document
      .getElementById("useManualWorkflowBtn")
      .addEventListener("click", () => {
        document.body.removeChild(modalOverlay);
        this.vocabManager.showMergeRequestDialog(updatedContent, branchName);
      });

    document.getElementById("cancelAuthBtn").addEventListener("click", () => {
      document.body.removeChild(modalOverlay);
    });

    // Close modal when clicking overlay
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        document.body.removeChild(modalOverlay);
      }
    });
  }

  // Check token permissions for the repository
  async checkTokenPermissions(owner, repo, token) {
    try {
      // First, check if we can access the repository
      const repoResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
        {
          headers: {
            Authorization: `token ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (!repoResponse.ok) {
        if (repoResponse.status === 404) {
          return {
            canAccess: false,
            error:
              "Repository not found or token doesn't have access to this repository",
          };
        } else if (repoResponse.status === 401) {
          return {
            canAccess: false,
            error: "Token is invalid or expired",
          };
        } else {
          return {
            canAccess: false,
            error: `Cannot access repository: ${repoResponse.status} ${repoResponse.statusText}`,
          };
        }
      }

      const repoData = await repoResponse.json();

      // Check specific permissions
      const permissions = repoData.permissions || {};

      return {
        canAccess: true,
        permissions: {
          pull: permissions.pull || false,
          push: permissions.push || false,
          admin: permissions.admin || false,
          maintain: permissions.maintain || false,
          triage: permissions.triage || false,
        },
        tokenType: token.startsWith("ghp_")
          ? "classic"
          : token.startsWith("github_pat_")
          ? "fine-grained"
          : "unknown",
        repositoryInfo: {
          name: repoData.name,
          fullName: repoData.full_name,
          private: repoData.private,
          defaultBranch: repoData.default_branch,
        },
      };
    } catch (error) {
      return {
        canAccess: false,
        error: `Error checking permissions: ${error.message}`,
      };
    }
  }

  // GitHub API helper methods
  async getDefaultBranch(owner, repo, token) {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get repository info: ${response.status}`);
    }

    const repoData = await response.json();
    return repoData.default_branch;
  }

  async getBranchSha(owner, repo, branch, token) {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get branch SHA: ${response.status}`);
    }

    const branchData = await response.json();
    return branchData.object.sha;
  }

  async createBranch(owner, repo, branchName, sha, token) {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ref: `refs/heads/${branchName}`,
          sha: sha,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      let parsedError = null;
      try {
        parsedError = JSON.parse(errorData);
      } catch (e) {
        // Error data is not JSON
      }

      console.error("GitHub API Error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorData,
        parsedError: parsedError,
        url: `https://api.github.com/repos/${owner}/${repo}/git/refs`,
        tokenType: token.startsWith("ghp_")
          ? "Classic Personal Access Token"
          : token.startsWith("github_pat_")
          ? "Fine-grained Personal Access Token"
          : "Unknown token type",
      });

      if (response.status === 403) {
        const isClassicToken = token.startsWith("ghp_");
        const isFineGrainedToken = token.startsWith("github_pat_");

        let permissionGuide = "";
        if (isClassicToken) {
          permissionGuide = `
For Classic Personal Access Tokens:
• Go to GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
• Ensure your token has the 'repo' scope (full control of private repositories)
• For public repositories, the 'public_repo' scope is sufficient`;
        } else if (isFineGrainedToken) {
          permissionGuide = `
For Fine-grained Personal Access Tokens:
• Go to GitHub.com → Settings → Developer settings → Personal access tokens → Fine-grained tokens
• Edit your token and ensure it has access to the ${owner}/${repo} repository
• Under Repository permissions, set:
  - Contents: Write
  - Metadata: Read
  - Pull requests: Write (for creating PRs later)`;
        } else {
          permissionGuide = `
Please check your token format:
• Classic tokens start with 'ghp_'
• Fine-grained tokens start with 'github_pat_'
• Ensure your token has the necessary permissions for the ${owner}/${repo} repository`;
        }

        const errorMessage = parsedError?.message || "Insufficient permissions";
        throw new Error(`Failed to create branch (403 Forbidden): ${errorMessage}

${permissionGuide}

Debug Info:
• Repository: ${owner}/${repo}
• Token Type: ${
          isClassicToken
            ? "Classic"
            : isFineGrainedToken
            ? "Fine-grained"
            : "Unknown"
        }
• Branch: ${branchName}

If you continue to have issues, try:
1. Creating a new token with the correct permissions
2. Using the manual workflow instead`);
      } else if (response.status === 422) {
        const errorMessage = parsedError?.message || "Validation error";
        throw new Error(
          `Failed to create branch (422 Unprocessable): ${errorMessage}. Branch '${branchName}' may already exist. Try a different branch name.`
        );
      } else if (response.status === 401) {
        throw new Error(
          `Failed to create branch (401 Unauthorized): Your GitHub token is invalid or has expired. Please generate a new token.`
        );
      } else {
        const errorMessage = parsedError?.message || response.statusText;
        throw new Error(
          `Failed to create branch (${response.status}): ${errorMessage}`
        );
      }
    }

    return await response.json();
  }

  async getFileSha(owner, repo, filePath, token) {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
        {
          headers: {
            Authorization: `token ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (response.ok) {
        const fileData = await response.json();
        return fileData.sha;
      } else if (response.status === 404) {
        return null; // File doesn't exist
      } else {
        throw new Error(`Failed to get file SHA: ${response.status}`);
      }
    } catch (error) {
      if (error.message.includes("404")) {
        return null; // File doesn't exist
      }
      throw error;
    }
  }

  async updateFile(
    owner,
    repo,
    filePath,
    content,
    message,
    branch,
    sha,
    token
  ) {
    const body = {
      message: message,
      content: btoa(unescape(encodeURIComponent(content))), // Base64 encode UTF-8
      branch: branch,
    };

    if (sha) {
      body.sha = sha; // Required for updating existing files
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update file: ${response.status}`);
    }

    return await response.json();
  }

  async createPullRequestAPI(
    owner,
    repo,
    headBranch,
    baseBranch,
    title,
    body,
    token
  ) {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title,
          body: body,
          head: headBranch,
          base: baseBranch,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create pull request: ${response.status}`);
    }

    return await response.json();
  }
}
