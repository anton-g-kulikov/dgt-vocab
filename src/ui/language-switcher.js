// The updateTranslation method is now part of the FlashcardMode class directly

// Global function to switch language
function switchLanguage(lang, event) {
  if (window.vocabApp) {
    window.vocabApp.switchLanguage(lang);

    // Update UI active state (for when language switcher is visible)
    if (event) {
      const buttons = document.querySelectorAll(".lang-btn");
      buttons.forEach((btn) => btn.classList.remove("active"));
      event.target.classList.add("active");
    }

    // Update title language display
    const currentLanguageElement = document.getElementById("current-language");
    if (currentLanguageElement) {
      currentLanguageElement.textContent =
        lang === "en" ? "English" : "Russian";
    }
  }
}

/**
 * Toggle between English and Russian languages
 * This function is specifically designed to be mobile-friendly
 * and prevent text selection issues on touch devices
 *
 * @param {Event} event - The click/touch event
 */
function toggleLanguage(event) {
  // Prevent default behavior (like selection)
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (window.vocabApp) {
    // Toggle to the other language
    const newLang = window.vocabApp.currentLanguage === "en" ? "ru" : "en";

    // Call the existing switchLanguage function
    window.vocabApp.switchLanguage(newLang);

    // Update title display
    const currentLanguageElement = document.getElementById("current-language");
    if (currentLanguageElement) {
      currentLanguageElement.textContent =
        newLang === "en" ? "English" : "Russian";
    }

    // Add a highlight animation effect
    if (event && event.target) {
      event.target.classList.add("language-toggle-flash");
      setTimeout(() => {
        event.target.classList.remove("language-toggle-flash");
      }, 300);
    }
  }
}
