# Spanish DGT Vocabulary Flashcards PWA

[![USE IT NOW](https://img.shields.io/badge/Try%20It-dgtvocab.app-blue?style=for-the-badge)](https://dgtvocab.app)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-green?style=for-the-badge)](https://dgtvocab.app)
[![Install App](https://img.shields.io/badge/📱-Install%20App-orange?style=for-the-badge)](https://dgtvocab.app)
[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-☕-yellow?style=for-the-badge)](https://buymeacoffee.com/antonkulikov)

**Progressive Web App** for studying Spanish vocabulary for the DGT (Dirección General de Tráfico) driving exam. Install as a native app on your mobile device with offline support, or use directly in your browser with interactive flashcards, quizzes, and collaborative vocabulary management.

## Quick Links

- 🚀 [Launch PWA](https://dgtvocab.app) - Use in browser or install as app
- 📱 [Install App](https://dgtvocab.app) - Add to home screen for native experience
- 📚 [Vocabulary Manager](https://dgtvocab.app/vocabulary-manager.html)
- 💡 [Contribute](https://github.com/anton-g-kulikov/dgt-vocab)
- ☕ [Support the Project](https://buymeacoffee.com/antonkulikov)

## Features

### 📱 Progressive Web App (PWA)

- **🏠 Install as Native App** - Add to home screen on iOS and Android
- **⚡ Offline Support** - Study without internet connection
- **🚀 Fast Loading** - Instant startup with cached resources
- **🎯 App Shortcuts** - Quick access to flashcards, quiz, and vocabulary manager
- **📲 Cross-Platform** - Works on mobile, tablet, and desktop
- **🔄 Auto-Updates** - Always get the latest features

### Study Tools

- 📝 **Flashcard Mode** - Interactive cards with Spanish-English-Russian translations
- 📋 **Quiz Mode** - Test your knowledge with multiple choice questions
- 🏷️ **Categories** - Filter by nouns, verbs, adjectives, and adverbs
- 📊 **Progress Tracking** - Monitor your learning progress
- 📱 **Mobile-Optimized** - Perfect experience on any device size

### Vocabulary Management

- 📄 **Text Parser** - Extract words from Spanish texts
- 🔄 **GitHub Integration** - Automated vocabulary contributions
- 🔍 **Smart Analysis** - Automatic word categorization
- 🌐 **Multi-language Support** - Spanish-English-Russian translations

## Getting Started

### Option 1: Install as Native App (Recommended)

1. Visit [dgtvocab.app](https://dgtvocab.app) on your mobile device
2. **Android (Chrome)**: Tap "Add to Home Screen" in browser menu
3. **iOS (Safari)**: Tap Share button → "Add to Home Screen"
4. **Desktop**: Click the install button in the address bar
5. Launch the app from your home screen like any native app!

### Option 2: Use in Browser

1. Visit [dgtvocab.app](https://dgtvocab.app)
2. Choose Flashcard or Quiz mode
3. Start learning immediately!

### PWA Installation Benefits

- **📲 Native App Experience** - Looks and feels like a native app
- **⚡ Faster Performance** - No browser UI, dedicated app window
- **🔌 Offline Access** - Study even without internet
- **📱 Home Screen Icon** - Quick access from your device
- **🔄 Background Updates** - Automatic updates when online

## Project Structure

```
src/
├── core/              # Core app logic and vocabulary
├── features/          # Flashcards, quiz, and stats
│   ├── flashcards/    # Flashcard and quiz modes
│   ├── stats/         # Progress tracking
│   └── vocabulary-manager/  # Vocabulary management system
├── ui/               # Styles and UI components
└── utils/            # Helper functions and translation scripts
```

### Vocabulary Manager Architecture

The Vocabulary Manager has been refactored from a monolithic file into a modular, component-based architecture for better maintainability and code organization.

#### Component Managers

1. **Text Parser** (`text-parser.js`) - Handles text analysis and word extraction
2. **Vocabulary Updates Manager** (`vocabulary-updates-manager.js`) - Manages vocabulary updates table
3. **Current Vocabulary Manager** (`current-vocabulary-manager.js`) - Handles vocabulary filtering and display
4. **Export Manager** (`export-manager.js`) - Manages CSV export functionality
5. **Translation Manager** (`translation-manager.js`) - Handles translation operations with progress tracking
6. **API Key Manager** (`api-key-manager.js`) - Manages API key configuration
7. **Merge Request Manager** (`merge-request-manager.js`) - Handles merge request creation

#### Supporting Services

- **Translation Service** (`translation-service.js`) - Multi-provider translation capabilities
- **GitHub Integration** (`github-integration.js`) - Automated pull request creation

#### Inter-Component Communication

Components communicate using a custom event system:

- `vocabularyUpdatesChanged` - Vocabulary updates modified
- `currentVocabularyChanged` - Current vocabulary updated
- `providerStatusChanged` - Translation provider status changes

```
src/features/vocabulary-manager/
├── vocabulary-manager.js          # Main orchestrator
├── text-parser.js                 # Text analysis component
├── vocabulary-updates-manager.js  # Updates table management
├── current-vocabulary-manager.js  # Current vocabulary display
├── export-manager.js              # CSV export functionality
├── translation-manager.js         # Translation UI and operations
├── api-key-manager.js             # API key configuration
├── merge-request-manager.js       # Merge request handling
├── translation-service.js         # Translation service
└── github-integration.js          # GitHub API integration
```

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
2. **Click "🚀 Create Pull Request"**
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

- **Progressive Web App (PWA)**: Service workers, web app manifest, offline caching
- **HTML5**: Semantic structure and accessibility
- **CSS3**: Modern styling with flexbox, grid, and animations
- **Vanilla JavaScript**: No frameworks - pure ES6+ JavaScript
- **Service Workers**: Offline functionality and background sync
- **Web App Manifest**: Native app installation and theming
- **Local Storage API**: Client-side data persistence
- **CSS Animations**: Smooth card flips and transitions
- **GitHub REST API**: Automated pull request creation and repository management
- **Web Clipboard API**: Copy git commands to clipboard for manual workflow
- **Python**: Translation scripts for multi-language support
- **Deep Translator**: Python library for automated translations

## Vocabulary Sources

The vocabulary is sourced from official Spanish traffic regulations:

- **Real Decreto 1428/2003**: Official Spanish traffic regulation
- **Reglamento General de Circulación**: General traffic circulation rules
- **400+ curated terms**: Nouns, verbs, adjectives, and adverbs essential for the DGT exam, with translations in English and Russian

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

## License

This project is licensed under the MIT License.

## Author

Anton Kulikov

## Contributing

### Quick Start

1. Visit [Vocabulary Manager](https://dgtvocab.app/vocabulary-manager.html)
2. Add new words or parse text
3. Use automated GitHub integration to contribute

### Development

1. Fork and clone: `git clone https://github.com/yourusername/dgt-vocab.git`
2. Create branch: `git checkout -b feature-name`
3. Submit PR with your improvements

### Extending Vocabulary Manager

The modular architecture makes it easy to add new features:

1. **Create a new component manager class**
2. **Add it to the `initializeComponents()` method** in `vocabulary-manager.js`
3. **Set up event listeners** for inter-component communication
4. **Add necessary HTML script tags** in `vocabulary-manager.html`

#### Possible Future Enhancements

- **Word Analytics Component** - Track vocabulary learning progress
- **Pronunciation Manager** - Add audio pronunciation features
- **Study Mode Manager** - Interactive vocabulary study sessions
- **Import Manager** - Import vocabulary from various sources
- **Sync Manager** - Synchronize vocabulary across devices

### Architecture Benefits

The refactored vocabulary manager provides:

- **Improved Maintainability** - Each component has a single responsibility
- **Better Testability** - Components can be tested in isolation
- **Enhanced Reusability** - Components can be reused in other contexts
- **Reduced Coupling** - Components communicate through events
- **Better Code Organization** - Logical grouping of related functionality

## Support the Project

If you find this tool useful, consider [buying me a coffee](https://buymeacoffee.com/antonkulikov) ☕
