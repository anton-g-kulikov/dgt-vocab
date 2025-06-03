// Translation Service - Automatic translation for vocabulary words
// Supports multiple translation providers with fallback options

class TranslationService {
  constructor() {
    this.providers = {
      // Premium providers (require API keys)
      google: {
        name: "Google Translate",
        url: "https://translation.googleapis.com/language/translate/v2",
        free: false,
        rateLimit: 100, // requests per minute
        available: false,
        requiresAuth: true,
        priority: 1, // Higher priority
      },
      // Free providers (no API key required)
      mymemory: {
        name: "MyMemory",
        url: "https://api.mymemory.translated.net/get",
        free: true,
        rateLimit: 100, // requests per day for anonymous
        available: true,
        requiresAuth: false,
        priority: 2,
      },
    };

    this.apiKeys = this.loadApiKeys();
    this.requestCounts = {};
    this.cache = this.loadCache();
    this.normalizeExistingCache(); // Convert existing cache entries to lowercase
    this.initializeProviders();
    console.log(
      "TranslationService initialized with enhanced provider support"
    );
  }

  // Load API keys from localStorage
  loadApiKeys() {
    try {
      const saved = localStorage.getItem("dgt-vocab-translation-api-keys");
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error("Error loading API keys:", error);
      return {};
    }
  }

  // Save API keys to localStorage
  saveApiKeys() {
    try {
      localStorage.setItem(
        "dgt-vocab-translation-api-keys",
        JSON.stringify(this.apiKeys)
      );
    } catch (error) {
      console.error("Error saving API keys:", error);
    }
  }

  // Set API key for a provider
  setApiKey(provider, apiKey) {
    if (!this.providers[provider]) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    this.apiKeys[provider] = apiKey;
    this.saveApiKeys();

    // Re-test provider availability
    this.testProvider(provider, "hola", "en").then((result) => {
      this.providers[provider].available = result !== null;
      console.log(
        `${this.providers[provider].name} availability: ${this.providers[provider].available}`
      );
    });
  }

  // Get API key for a provider
  getApiKey(provider) {
    return this.apiKeys[provider] || null;
  }

  // Initialize and test provider availability
  async initializeProviders() {
    for (const [key, provider] of Object.entries(this.providers)) {
      try {
        // Skip premium providers without API keys
        if (provider.requiresAuth && !this.getApiKey(key)) {
          provider.available = false;
          console.log(`${provider.name} requires API key - skipping test`);
          continue;
        }

        // Test with a simple word
        const testResult = await this.testProvider(key, "hola", "en");
        provider.available = testResult !== null;
        console.log(`${provider.name} availability: ${provider.available}`);
      } catch (error) {
        console.warn(
          `Translation provider ${provider.name} is not available:`,
          error
        );
        provider.available = false;
      }
    }
  }

  // Test if a provider is working
  async testProvider(providerKey, text, targetLang) {
    try {
      const result = await this.translateWithProvider(
        providerKey,
        text,
        "es",
        targetLang
      );
      // The result should already be lowercase from the provider methods
      return result && result !== text.toLowerCase() ? result : null;
    } catch (error) {
      return null;
    }
  }

  // Load translation cache from localStorage
  loadCache() {
    try {
      const cached = localStorage.getItem("dgt-vocab-translation-cache");
      return cached ? JSON.parse(cached) : {};
    } catch (error) {
      console.error("Error loading translation cache:", error);
      return {};
    }
  }

  // Save translation cache to localStorage
  saveCache() {
    try {
      localStorage.setItem(
        "dgt-vocab-translation-cache",
        JSON.stringify(this.cache)
      );
    } catch (error) {
      console.error("Error saving translation cache:", error);
    }
  }

  // Generate cache key
  getCacheKey(text, sourceLang, targetLang) {
    return `${sourceLang}-${targetLang}-${text.toLowerCase().trim()}`;
  }

  // Check if translation is cached
  getCachedTranslation(text, sourceLang, targetLang) {
    const key = this.getCacheKey(text, sourceLang, targetLang);
    const cachedTranslation = this.cache[key] || null;
    // Ensure cached translations are also returned in lowercase
    return cachedTranslation ? cachedTranslation.toLowerCase() : null;
  }

  // Cache translation result
  cacheTranslation(text, sourceLang, targetLang, translation) {
    const key = this.getCacheKey(text, sourceLang, targetLang);
    this.cache[key] = translation;
    this.saveCache();
  }

  // Check rate limits
  canMakeRequest(providerKey) {
    const provider = this.providers[providerKey];
    if (!provider || !provider.available) return false;

    const now = Date.now();
    const timeWindow = 60000; // 1 minute

    if (!this.requestCounts[providerKey]) {
      this.requestCounts[providerKey] = [];
    }

    // Clean old requests
    this.requestCounts[providerKey] = this.requestCounts[providerKey].filter(
      (timestamp) => now - timestamp < timeWindow
    );

    return this.requestCounts[providerKey].length < provider.rateLimit;
  }

  // Record request for rate limiting
  recordRequest(providerKey) {
    if (!this.requestCounts[providerKey]) {
      this.requestCounts[providerKey] = [];
    }
    this.requestCounts[providerKey].push(Date.now());
  }

  // Translate with Google Translate
  async translateWithGoogle(text, sourceLang, targetLang) {
    const apiKey = this.getApiKey("google");
    if (!apiKey) {
      throw new Error("Google Translate API key not configured");
    }

    const url = `${this.providers.google.url}?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: "text",
      }),
    });

    if (!response.ok) {
      throw new Error(`Google Translate API error: ${response.status}`);
    }

    const result = await response.json();

    if (
      result.data &&
      result.data.translations &&
      result.data.translations.length > 0
    ) {
      const translatedText = result.data.translations[0].translatedText || null;
      return translatedText ? translatedText.toLowerCase() : null;
    }

    throw new Error("Google Translate: Invalid response format");
  }

  // Translate with MyMemory
  async translateWithMyMemory(text, sourceLang, targetLang) {
    const langPair = `${sourceLang}|${targetLang}`;
    const url = `${this.providers.mymemory.url}?q=${encodeURIComponent(
      text
    )}&langpair=${langPair}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`MyMemory API error: ${response.status}`);
    }

    const result = await response.json();

    if (result.responseStatus === 200 && result.responseData) {
      const translatedText = result.responseData.translatedText || null;
      return translatedText ? translatedText.toLowerCase() : null;
    }

    throw new Error(
      `MyMemory translation failed: ${
        result.responseDetails || "Unknown error"
      }`
    );
  }

  // Translate with specific provider
  async translateWithProvider(providerKey, text, sourceLang, targetLang) {
    switch (providerKey) {
      case "google":
        return await this.translateWithGoogle(text, sourceLang, targetLang);
      case "mymemory":
        return await this.translateWithMyMemory(text, sourceLang, targetLang);
      default:
        throw new Error(`Unknown translation provider: ${providerKey}`);
    }
  }

  // Main translation method with fallback
  async translate(text, sourceLang, targetLang) {
    if (!text || !text.trim()) {
      return null;
    }

    const normalizedText = text.trim();

    // Check cache first
    const cached = this.getCachedTranslation(
      normalizedText,
      sourceLang,
      targetLang
    );
    if (cached) {
      return cached;
    }

    // Try providers in order of preference (Google first if available)
    const availableProviders = Object.entries(this.providers)
      .filter(([key, provider]) => provider.available)
      .sort((a, b) => a[1].priority - b[1].priority)
      .map(([key]) => key);

    const providerKeys =
      availableProviders.length > 0 ? availableProviders : ["mymemory"]; // Fallback to free provider

    for (const providerKey of providerKeys) {
      if (!this.canMakeRequest(providerKey)) {
        console.warn(
          `Rate limit reached for ${this.providers[providerKey].name}`
        );
        continue;
      }

      try {
        this.recordRequest(providerKey);
        const translation = await this.translateWithProvider(
          providerKey,
          normalizedText,
          sourceLang,
          targetLang
        );

        if (translation && translation.trim()) {
          // Convert translation to lowercase to ensure consistent formatting
          const lowercasedTranslation = translation.toLowerCase();

          // Cache successful translation
          this.cacheTranslation(
            normalizedText,
            sourceLang,
            targetLang,
            lowercasedTranslation
          );
          return lowercasedTranslation;
        }
      } catch (error) {
        console.warn(
          `Translation failed with ${this.providers[providerKey].name}:`,
          error
        );
        // Mark provider as temporarily unavailable if it's a server error
        if (
          error.message.includes("500") ||
          error.message.includes("502") ||
          error.message.includes("503")
        ) {
          this.providers[providerKey].available = false;
          // Re-enable after 5 minutes
          setTimeout(() => {
            this.providers[providerKey].available = true;
          }, 5 * 60 * 1000);
        }
      }
    }

    // If all providers fail, return null
    console.error(
      `Failed to translate "${text}" from ${sourceLang} to ${targetLang}`
    );
    return null;
  }

  // Translate Spanish to English
  async translateToEnglish(spanishText) {
    return await this.translate(spanishText, "es", "en");
  }

  // Translate Spanish to Russian
  async translateToRussian(spanishText) {
    return await this.translate(spanishText, "es", "ru");
  }

  // Batch translate multiple words
  async batchTranslate(words, sourceLang, targetLang, onProgress = null) {
    const results = [];
    const total = words.length;
    let completed = 0;

    for (const word of words) {
      try {
        const translation = await this.translate(word, sourceLang, targetLang);
        results.push({
          original: word,
          translation: translation,
          success: translation !== null,
        });

        completed++;
        if (onProgress) {
          onProgress(completed, total, word, translation);
        }

        // Add small delay to respect rate limits
        await this.delay(100);
      } catch (error) {
        console.error(`Error translating "${word}":`, error);
        results.push({
          original: word,
          translation: null,
          success: false,
          error: error.message,
        });

        completed++;
        if (onProgress) {
          onProgress(completed, total, word, null);
        }
      }
    }

    return results;
  }

  // Utility method to add delays
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Get translation statistics
  getStats() {
    const cacheSize = Object.keys(this.cache).length;
    const availableProviders = Object.values(this.providers).filter(
      (p) => p.available
    );

    return {
      cacheSize,
      availableProviders: availableProviders.length,
      providers: Object.fromEntries(
        Object.entries(this.providers).map(([key, provider]) => [
          key,
          {
            name: provider.name,
            available: provider.available,
            requestsInLastMinute: this.requestCounts[key]
              ? this.requestCounts[key].filter((t) => Date.now() - t < 60000)
                  .length
              : 0,
          },
        ])
      ),
    };
  }

  // Clear translation cache
  clearCache() {
    this.cache = {};
    localStorage.removeItem("dgt-vocab-translation-cache");
  }

  // Export cache for backup
  exportCache() {
    return JSON.stringify(this.cache, null, 2);
  }

  // Import cache from backup
  importCache(cacheData) {
    try {
      this.cache = JSON.parse(cacheData);
      this.saveCache();
      return true;
    } catch (error) {
      console.error("Error importing cache:", error);
      return false;
    }
  }

  // Normalize existing cache to ensure all translations are lowercase
  normalizeExistingCache() {
    let modified = false;
    Object.keys(this.cache).forEach((key) => {
      const value = this.cache[key];
      if (value && typeof value === "string" && value !== value.toLowerCase()) {
        this.cache[key] = value.toLowerCase();
        modified = true;
      }
    });

    if (modified) {
      this.saveCache();
      console.log("Normalized existing translation cache to lowercase");
    }
  }
}

// Export for use in other modules
window.TranslationService = TranslationService;
