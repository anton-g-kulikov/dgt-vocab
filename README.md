# Spanish DGT Vocabulary Flashcards PWA

[![USE IT NOW](https://img.shields.io/badge/Try%20It-dgtvocab.app-blue?style=for-the-badge)](https://dgtvocab.app)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-green?style=for-the-badge)](https://dgtvocab.app)
[![Install App](https://img.shields.io/badge/Install%20App-orange?style=for-the-badge)](https://dgtvocab.app)
[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-yellow?style=for-the-badge)](https://buymeacoffee.com/antonkulikov)

A **Progressive Web App** for studying Spanish vocabulary for the DGT (Dirección General de Tráfico) driving exam. Install as a native app on your mobile device with offline support, or use directly in your browser with interactive flashcards, quizzes, and collaborative vocabulary management.

## Quick Links

- [Launch PWA](https://dgtvocab.app) - Use in browser or install as app
- [Install App](https://dgtvocab.app) - Add to home screen for native experience
- [Vocabulary Manager](https://dgtvocab.app/vocabulary-manager.html)
- [Contribute](https://github.com/anton-g-kulikov/dgt-vocab)
- [Support the Project](https://buymeacoffee.com/antonkulikov)

## Features

### Progressive Web App (PWA)

- **Install as Native App** - Add to home screen on iOS and Android
- **Offline Support** - Study without internet connection
- **Fast Loading** - Instant startup with cached resources
- **App Shortcuts** - Quick access to flashcards, quiz, and vocabulary manager
- **Cross-Platform** - Works on mobile, tablet, and desktop
- **Auto-Updates** - Always get the latest features

### Study Tools

- **Flashcard Mode** - Interactive cards with Spanish-English-Russian translations
- **Quiz Mode** - Test your knowledge with multiple choice questions
- **Category Filtering** - Filter by nouns, verbs, adjectives, and adverbs
- **Topic Organization** - Study by specific DGT regulation topics
- **Progress Tracking** - Monitor your learning progress with statistics
- **Mobile-Optimized** - Perfect experience on any device size
- **Language Switching** - Toggle between English and Russian translations

### Vocabulary Management

- **Text Parser** - Extract words from Spanish texts with automatic categorization
- **GitHub Integration** - Automated vocabulary contributions via pull requests
- **Translation Service** - Multi-provider translation with fallback options
- **Export Functionality** - Download vocabulary as CSV or JavaScript
- **Smart Analysis** - Automatic word categorization and topic assignment
- **Multi-language Support** - Spanish-English-Russian translations

## Root Directory Overview

| File/Folder                | Purpose                                                                 |
|----------------------------|-------------------------------------------------------------------------|
| `index.html`               | Main entry point for flashcard and quiz app                             |
| `vocabulary-manager.html`  | Entry point for vocabulary management interface                         |
| `sw.js`                    | Service worker for offline/PWA support                                 |
| `manifest.json`            | Web app manifest for PWA installation and theming                      |
| `icons/`                   | App icons for Android/iOS/desktop (with `android/` and `ios/` subdirs) |
| `CNAME`                    | Custom domain configuration for deployment (GitHub Pages)               |
| `.gitignore`               | Git ignore rules                                                        |
| `README.md`                | Project documentation (this file)                                       |
| `src/`                     | Main application source code                                            |
| `sources/`                 | (If present) Source/reference materials (not required for app)          |
| `.creds`, `.DS_Store`, `venv/`, `.git/` | Not relevant for users; ignored by app and version control |

## Project Structure

```
src/
├── core/                      # Core application logic and data
│   ├── analytics.js           # Google Analytics integration
│   ├── core.js                # Main DGTVocabulary class
│   ├── filter-utils.js        # Vocabulary filtering utilities
│   ├── init.js                # Application initialization
│   ├── topics.js              # DGT topic definitions and utilities
│   ├── vocabulary.js          # Core vocabulary data structure
│   ├── vocabulary.js.backup.* # Backup files (not used by app, for recovery only)
├── features/                  # Feature modules
│   ├── flashcards/            # Flashcard and quiz functionality
│   │   ├── category-manager.js    # Category and topic filtering
│   │   ├── flashcard-mode.js      # Flashcard display and interaction
│   │   └── quiz-mode.js           # Quiz functionality
│   ├── stats/                 # Statistics management
│   │   └── stats-manager.js       # Centralized statistics handling
│   └── vocabulary-manager/    # Vocabulary management system
│       ├── api-key-manager.js         # API key configuration
│       ├── current-vocabulary-manager.js # Vocabulary display and filtering
│       ├── export-manager.js          # CSV and JavaScript export
│       ├── github-integration.js      # GitHub API integration
│       ├── merge-request-manager.js   # GitHub merge request handling
│       ├── text-parser.js             # Text analysis and word extraction
│       ├── translation-manager.js     # Translation UI and operations
│       ├── translation-service.js     # Multi-provider translation service
│       ├── vocabulary-manager.js      # Main orchestrator
│       ├── vocabulary-updates-manager.js # Updates table management
│       └── word-categorizer.js        # Spanish word categorization logic
├── ui/                       # User interface components and styles
│   ├── icons.js              # SVG icon system
│   ├── language-switcher.css # Language switcher styles
│   ├── language-switcher.js  # Language toggle functionality
│   ├── styles.css            # Main application styles
│   └── ui-helpers.js         # UI utility functions
└── utils/                    # Utility functions and helpers
    ├── analytics.js          # Analytics helper functions
    ├── cache-manager.js      # PWA cache management
    ├── deep_translator_script.py # Python script for updating Russian translations
    ├── pwa-installer.js      # PWA installation handler
    ├── reset-progress.js     # Progress reset utility
    ├── script.js             # Main application entry point for utilities
    ├── shuffle-utils.js      # Shared shuffling algorithms for flashcards and quiz
    └── version-sync.js       # Version synchronization utility
```

> **Note:**  
> - Backup files (e.g., `vocabulary.js.backup.*`) are for recovery only and not used by the app.  
> - System files like `.DS_Store` and folders like `.git/`, `venv/`, and `.creds` are ignored by the app and version control.

### Vocabulary Manager Architecture

The Vocabulary Manager is modular and component-based for maintainability and code organization.

#### Component Managers

- **Word Categorizer** (`word-categorizer.js`): Categorizes Spanish words based on linguistic patterns
- **Text Parser** (`text-parser.js`): Handles text analysis and word extraction
- **Vocabulary Updates Manager** (`vocabulary-updates-manager.js`): Manages vocabulary updates table
- **Current Vocabulary Manager** (`current-vocabulary-manager.js`): Handles vocabulary filtering and display
- **Export Manager** (`export-manager.js`): Manages CSV and JavaScript export
- **Translation Manager** (`translation-manager.js`): Handles translation operations with progress tracking
- **API Key Manager** (`api-key-manager.js`): Manages API key configuration
- **Merge Request Manager** (`merge-request-manager.js`): Handles GitHub integration and pull request creation

#### Supporting Services

- **Translation Service** (`translation-service.js`): Multi-provider translation capabilities
- **GitHub Integration** (`github-integration.js`): Automated pull request creation

#### Inter-Component Communication

Components communicate using a custom event system:
- `vocabularyUpdatesChanged` - Vocabulary updates modified
- `currentVocabularyChanged` - Current vocabulary updated
- `providerStatusChanged` - Translation provider status changes

## Getting Started

### Option 1: Install as Native App (Recommended)

1. Visit [dgtvocab.app](https://dgtvocab.app) on your mobile device
2. **Android (Chrome)**: Tap "Add to Home Screen" in browser menu
3. **iOS (Safari)**: Tap Share button → "Add to Home Screen"
4. **Desktop**: Click the install button in the address bar
5. Launch the app from your home screen like any native app

### Option 2: Use in Browser

1. Visit [dgtvocab.app](https://dgtvocab.app)
2. Choose Flashcard or Quiz mode
3. Start learning immediately

### PWA Installation Benefits

- **Native App Experience** - Looks and feels like a native app
- **Faster Performance** - No browser UI, dedicated app window
- **Offline Access** - Study even without internet
- **Home Screen Icon** - Quick access from your device
- **Background Updates** - Automatic updates when online

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd dgt-vocab
   ```

2. Open in browser:

   ```bash
   # Open main flashcard application
   open index.html

   # Or open vocabulary manager
   open vocabulary-manager.html
   ```

3. Start studying immediately - no server setup required!

## Usage

### Studying with Flashcards

1. Open `index.html` in your browser
2. Select categories using the filter buttons
3. Click cards to flip and see translations
4. Mark cards as "Know" or "Don't Know"
5. Use the toggle switch to focus on unknown cards only

### Taking Quizzes

1. Click "Quiz Mode" in the mode selector
2. Read the Spanish word and click answer options to flip them
3. Find the correct English translation
4. Quiz automatically advances after each correct answer

### Managing Vocabulary

1. Open `vocabulary-manager.html`
2. **Parse text**: Paste Spanish text to extract new vocabulary
3. **Review vocab**: View and filter existing vocabulary
4. **Export data**: Download vocabulary as CSV or JavaScript and update the source file with new additions

### Contributing Vocabulary (GitHub Integration)

#### Automated Workflow (Recommended)

1. **Parse or add new words** in the vocabulary manager
2. **Click "Create Pull Request"**
3. **Authenticate with GitHub** using a Personal Access Token:
   - Go to [GitHub Settings → Personal Access Tokens → Tokens (classic)](https://github.com/settings/tokens)
   - Generate new token with `repo` or `public_repo` scope
   - Paste token in the authentication dialog
4. **Automatic PR creation**: The system will:
   - Create a new branch with timestamp
   - Update vocabulary.js with new words
   - Create a pull request with detailed description
   - Clear your local vocabulary updates

### Translation Management

#### Updating Missing Translations

For developers or contributors who want to update or add missing translations:

1. Navigate to the `src/utils` directory
2. Run the translation script to add/update Russian translations:
   ```bash
   cd src/utils
   python3 deep_translator_script.py
   ```

This script will:
- Identify vocabulary entries with missing Russian translations
- Use the `deep_translator` library with Google Translate backend to automatically translate English definitions to Russian
- Update the vocabulary.js file with the new translations
- Create a backup of the original file before making changes
- Process entries in small batches to avoid API rate limits

## Technologies Used

- **Progressive Web App (PWA)**: Service workers, web app manifest, offline caching with intelligent update management
- **HTML5**: Semantic structure and accessibility
- **CSS3**: Modern styling with CSS Grid, Flexbox, and custom properties
- **Vanilla JavaScript**: ES6+ modules with class-based architecture
- **Service Workers**: Optimized offline functionality with smart caching strategies and controlled update notifications
- **Web App Manifest**: Native app installation and theming
- **Local Storage API**: Client-side data persistence and progress tracking
- **CSS Animations**: Smooth card flips and UI transitions
- **GitHub REST API**: Automated pull request creation and repository management
- **Web Clipboard API**: Copy functionality for manual workflows
- **Google Analytics**: User interaction tracking and analytics
- **Translation APIs**: Multi-provider translation service support
- **Python**: Automated translation scripts using deep-translator library

## Vocabulary Sources

The vocabulary is sourced from official Spanish traffic regulations:

- **Real Decreto 1428/2003**: Official Spanish traffic regulation
- **Reglamento General de Circulación**: General traffic circulation rules
- **500+ curated terms**: Organized by 13 DGT regulation topics
- **Multi-category classification**: Nouns, verbs, adjectives, and adverbs
- **Triple translation support**: Spanish-English-Russian translations

## Browser Support

### PWA Installation Support

- **Chrome 67+** (Android, Desktop)
- **Safari 11.3+** (iOS, macOS)
- **Edge 79+** (Windows, Android)
- **Samsung Internet 8.2+** (Android)

### General Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

**Note**: PWA installation is not supported in Firefox, but the app works perfectly in-browser.

## Troubleshooting

### PWA Cache Issues

If you're experiencing issues with updates not appearing:

1. **Force Cache Refresh**: Open browser DevTools → Console → Type:

   ```javascript
   CacheManager.forceClearCache();
   ```

2. **Manual Service Worker Reset**:

   - DevTools → Application → Service Workers
   - Click "Unregister" next to the service worker
   - Refresh the page

3. **Clear Browser Cache**: Clear your browser's cache and hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

### Styling Issues on Mobile

If Spanish words in quiz mode aren't properly highlighted:

1. **Check Console**: Open DevTools and look for CSS or JavaScript errors
2. **Force Refresh**: Use the cache clearing methods above
3. **Verify Network**: Ensure you have a stable internet connection for initial load

### Common Issues

- **Update Notifications**: The app checks for updates only on page load to avoid spam notifications
- **Offline Mode**: Some features require initial online load before working offline
- **Mobile Installation**: Use browser's "Add to Home Screen" option for best PWA experience

## Architecture

### Core Application Structure

The application follows a modular, component-based architecture:

- **Core Layer**: Essential functionality including the main DGTVocabulary class, vocabulary data, and filtering utilities
- **Features Layer**: Organized feature modules for flashcards, quiz functionality, and vocabulary management
- **UI Layer**: User interface components, styles, and interaction handlers
- **Utils Layer**: Utility functions, PWA management, and helper services

### Vocabulary Manager Architecture

The Vocabulary Manager uses a modular component system with event-driven communication:

#### Component Managers

- **Text Parser** - Handles text analysis and word extraction with automatic categorization
- **Vocabulary Updates Manager** - Manages the vocabulary updates table and operations
- **Current Vocabulary Manager** - Handles vocabulary filtering and display
- **Export Manager** - Manages CSV and JavaScript export functionality
- **Translation Manager** - Handles translation operations with progress tracking
- **API Key Manager** - Manages translation service API key configuration
- **Merge Request Manager** - Handles GitHub integration and pull request creation

#### Inter-Component Communication

Components communicate using a custom event system:
- `vocabularyUpdatesChanged` - Triggered when vocabulary updates are modified
- `currentVocabularyChanged` - Triggered when current vocabulary is updated
- `providerStatusChanged` - Triggered when translation provider status changes
- `translationManagerReady` - Signals translation manager initialization

### Shuffling Algorithm Architecture

The application implements sophisticated shuffling algorithms to ensure truly random card distribution and prevent alphabetical patterns:

#### Shared Shuffling Utilities (`shuffle-utils.js`)

The shuffling functionality has been abstracted into a reusable utility module that both flashcard and quiz modes utilize:

- **`aggressiveShuffle(array, vocabApp)`** - Main shuffling method combining multiple randomization techniques
- **`applyEducationalWeighting(array, vocabApp)`** - Smart weighting based on card interaction history
- **`basicShuffle(array)`** - Simple Fisher-Yates shuffle for basic randomization
- **`multiShuffle(array, passes)`** - Multiple shuffle passes for extra randomization

#### Shuffling Algorithm Features

1. **Fisher-Yates Shuffle** - Ensures mathematically sound randomization
2. **Multiple Randomization Passes** - Eliminates subtle patterns from original ordering
3. **Educational Weighting** - Prioritizes cards that haven't been seen recently while maintaining randomness
4. **Fallback Logic** - Graceful degradation if utility fails to load
5. **Aggressive Anti-Pattern Prevention** - Multiple techniques to prevent alphabetical or other predictable sequences

#### Benefits of Shuffling Abstraction

- **DRY Principle** - No code duplication between flashcard and quiz modes
- **Consistency** - Both modes use identical shuffling algorithms
- **Maintainability** - Improvements only need to be made in one location
- **Flexibility** - Different shuffling methods available for different use cases
- **Better Randomization** - Prevents alphabetical patterns that could occur after progress resets

## License

This project is licensed under the MIT License.

## Author

Anton Kulikov

## Contributing

### Quick Start

1. Visit [Vocabulary Manager](https://dgtvocab.app/vocabulary-manager.html)
2. Add by parsing Spanish text
3. Use automated GitHub integration to contribute changes

### Development

1. Fork and clone: `git clone https://github.com/yourusername/dgt-vocab.git`
2. Create feature branch: `git checkout -b feature-name`
3. Make changes and test locally
4. Submit pull request with detailed description

## Support the Project

If you find this tool useful, consider [supporting the project](https://buymeacoffee.com/antonkulikov)
