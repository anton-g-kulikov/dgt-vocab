// API Key Manager - Handles API key configuration modal
class ApiKeyManager {
  constructor(translationService, showMessage) {
    this.translationService = translationService;
    this.showMessage = showMessage;
    this.setupEventListeners();
  }

  setupEventListeners() {
    const configureBtn = document.getElementById("configureApiKeys");
    if (!configureBtn) {
      console.error("Configure button not found!");
      return;
    }

    // Show modal when configure button is clicked
    configureBtn.addEventListener("click", (e) => {
      e.preventDefault(); // Prevent any default behavior
      this.showApiKeyModal();
    });
  }

  // Show API key configuration modal
  showApiKeyModal() {
    // Create modal overlay
    const modalOverlay = document.createElement("div");
    modalOverlay.className = "api-key-modal-overlay";
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
    modal.className = "api-key-modal";
    modal.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 2rem;
      max-width: 600px;
      width: 90%;
      max-height: 90%;
      overflow-y: auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;

    // Get current API keys
    const googleKey = this.translationService.getApiKey("google") || "";
    const stats = this.translationService.getStats();

    // Google status
    const googleStatus = googleKey ? "✅ Configured" : "❌ Not configured";

    // Free services status
    const myMemoryStatus = stats.providers.mymemory?.available
      ? "✅ Available"
      : "❌ Unavailable";

    modal.innerHTML = `
      <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid #eee; padding-bottom: 1rem;">
        <h3 style="margin: 0;">🔑 Configure Translation API Keys</h3>
        <span class="close" id="closeApiKeyModalBtn" style="font-size: 1.5rem; cursor: pointer; color: #999;">&times;</span>
      </div>
      
      <div class="modal-body">
        <p style="margin-bottom: 1.5rem; color: #666;">
          Configure API keys for premium translation services to get better quality translations.
        </p>

        <div class="api-key-section" style="margin-bottom: 2rem; padding: 1rem; border: 1px solid #ddd; border-radius: 6px;">
          <h4 style="margin: 0 0 1rem 0;">🌟 Google Translate API (Recommended)</h4>
          <p class="api-info" style="margin: 0 0 1rem 0; font-size: 0.9rem; color: #666;">
            <strong>Free Tier:</strong> 500,000 characters/month<br />
            <strong>Setup:</strong>
            <a href="https://console.cloud.google.com/apis/api/translate.googleapis.com" target="_blank" style="color: #007cba;">Enable Google Translate API</a>
          </p>
          <div class="input-group" style="display: flex; gap: 0.5rem; align-items: center;">
            <label for="googleApiKeyInput" style="min-width: 120px; font-weight: bold;">Google API Key:</label>
            <input type="password" id="googleApiKeyInput" value="${googleKey}" placeholder="Enter your Google Translate API key" 
                   style="flex: 1; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;" />
            <button type="button" id="testGoogleKeyBtn" class="test-key-btn" 
                    style="padding: 0.5rem 1rem; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Test
            </button>
          </div>
        </div>

        <div class="api-key-section" style="margin-bottom: 2rem; padding: 1rem; border: 1px solid #ddd; border-radius: 6px;">
          <h4 style="margin: 0 0 1rem 0;">📊 Current Status</h4>
          <div id="currentApiStatusModal" class="provider-status">
            <span class="provider-item">🌟 Google: ${googleStatus}</span>
            <span class="provider-item">🆓 MyMemory: ${myMemoryStatus}</span>
          </div>
        </div>
      </div>
      
      <div class="modal-actions" style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #eee;">
        <button id="saveApiKeysBtn" class="primary-btn" style="background: #28a745; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer;">
          💾 Save API Keys
        </button>
        <button id="clearApiKeysBtn" class="secondary-btn" style="background: #dc3545; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer;">
          🗑️ Clear All Keys
        </button>
        <button id="cancelApiKeysBtn" class="secondary-btn" style="background: #6c757d; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer;">
          Cancel
        </button>
      </div>
    `;

    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);

    // Add event listeners
    document
      .getElementById("closeApiKeyModalBtn")
      .addEventListener("click", () => {
        document.body.removeChild(modalOverlay);
      });

    document
      .getElementById("cancelApiKeysBtn")
      .addEventListener("click", () => {
        document.body.removeChild(modalOverlay);
      });

    document.getElementById("saveApiKeysBtn").addEventListener("click", () => {
      this.saveApiKeysFromModal(modalOverlay);
    });

    document.getElementById("clearApiKeysBtn").addEventListener("click", () => {
      this.clearApiKeysFromModal(modalOverlay);
    });

    document
      .getElementById("testGoogleKeyBtn")
      .addEventListener("click", () => {
        this.testApiKeyFromModal("google");
      });

    // Close modal when clicking overlay
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        document.body.removeChild(modalOverlay);
      }
    });
  }

  // Save API keys from modal
  saveApiKeysFromModal(modalOverlay) {
    const googleKeyInput = document.getElementById("googleApiKeyInput");

    let changesMade = false;

    // Save Google API key
    if (googleKeyInput && googleKeyInput.value.trim()) {
      try {
        this.translationService.setApiKey(
          "google",
          googleKeyInput.value.trim()
        );
        changesMade = true;
      } catch (error) {
        console.error("Error saving Google API key:", error);
        this.showMessage(
          `Error saving Google API key: ${error.message}`,
          "error"
        );
      }
    }

    if (changesMade) {
      // Update provider status
      setTimeout(() => {
        // Emit event to update provider status
        const event = new CustomEvent("providerStatusChanged");
        document.dispatchEvent(event);
      }, 1000);

      this.showMessage("API keys saved successfully!", "success");
    } else {
      this.showMessage("No API keys to save.", "info");
    }

    // Close modal
    document.body.removeChild(modalOverlay);
  }

  // Clear all API keys from modal
  clearApiKeysFromModal(modalOverlay) {
    if (
      confirm(
        "Are you sure you want to clear all API keys? This will remove access to premium translation services."
      )
    ) {
      // Clear from translation service
      this.translationService.apiKeys = {};
      this.translationService.saveApiKeys();

      // Update provider status
      setTimeout(() => {
        // Emit event to update provider status
        const event = new CustomEvent("providerStatusChanged");
        document.dispatchEvent(event);
      }, 1000);

      this.showMessage("All API keys cleared.", "info");

      // Close modal
      document.body.removeChild(modalOverlay);
    }
  }

  // Test an API key from modal
  async testApiKeyFromModal(provider) {
    const testBtn = document.getElementById(
      `test${provider.charAt(0).toUpperCase() + provider.slice(1)}KeyBtn`
    );
    const keyInput = document.getElementById(`${provider}ApiKeyInput`);

    if (!testBtn || !keyInput) return;

    const apiKey = keyInput.value.trim();
    if (!apiKey) {
      this.showMessage(`Please enter a ${provider} API key first.`, "error");
      return;
    }

    // Disable test button
    testBtn.disabled = true;
    testBtn.textContent = "Testing...";

    try {
      // Temporarily set the API key for testing
      const originalKey = this.translationService.getApiKey(provider);
      this.translationService.setApiKey(provider, apiKey);

      // Test translation
      const testResult = await this.translationService.testProvider(
        provider,
        "hola",
        "en"
      );

      if (testResult) {
        testBtn.textContent = "✅ Success";
        testBtn.style.background = "#28a745";
        this.showMessage(
          `${provider} API key is working! Test translation: "${testResult}"`,
          "success"
        );
      } else {
        testBtn.textContent = "❌ Failed";
        testBtn.style.background = "#dc3545";
        this.showMessage(
          `${provider} API key test failed. Please check your key.`,
          "error"
        );

        // Restore original key if test failed
        if (originalKey) {
          this.translationService.setApiKey(provider, originalKey);
        }
      }
    } catch (error) {
      console.error(`Error testing ${provider} API key:`, error);
      testBtn.textContent = "❌ Error";
      testBtn.style.background = "#dc3545";
      this.showMessage(
        `Error testing ${provider} API key: ${error.message}`,
        "error"
      );
    }

    // Reset button after 3 seconds
    setTimeout(() => {
      testBtn.disabled = false;
      testBtn.textContent = "Test";
      testBtn.style.background = "";
    }, 3000);
  }
}

// Export for use in other modules
window.ApiKeyManager = ApiKeyManager;
