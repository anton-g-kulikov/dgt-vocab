# Spanish DGT Vocabulary Flashcards

[![USE IT ONLINE](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge&logo=github)](https://anton-g-kulikov.github.io/dgt-vocab/)

## Overview

An interactive web application designed to help users study Spanish vocabulary for the Spanish DGT (Dirección General de Tráfico) driving exam. The application features flashcards, quiz modes, vocabulary management, text parsing capabilities, and automated GitHub integration for collaborative vocabulary expansion.

## Features

### Main Application (index.html)

- **Flashcard Mode**: Interactive flashcards with flip animations for studying Spanish-English vocabulary
- **Quiz Mode**: Multiple choice quiz with flippable answer cards
- **Category Filtering**: Filter vocabulary by grammatical categories (noun, verb, adjective, adverb)
- **Progress Tracking**: Track known/unknown cards with visual progress indicators
- **Toggle Modes**: Switch between studying all cards or only unknown cards
- **Responsive Design**: Mobile-friendly interface

### Vocabulary Manager (vocabulary-manager.html)

- **Add New Words**: Single word addition form with category selection
- **Text Parser**: Extract and analyze Spanish words from text passages
- **Vocabulary Editing**: View and filter existing vocabulary
- **Export Functionality**: Export parsing results to CSV format
- **Duplicate Detection**: Prevent adding words that already exist
- **Category Management**: Dynamic category creation and selection
- **GitHub Integration**: Automated pull request creation for vocabulary updates
- **Two Workflow Options**:
  - **Automated**: Direct GitHub API integration with Personal Access Token
  - **Manual**: Download files with git command instructions

### Core Features

- **Local Storage**: All progress and custom words saved locally
- **394 Pre-loaded Words**: Comprehensive Spanish DGT vocabulary from traffic regulations
- **Smart Text Analysis**: Automatic word categorization based on Spanish grammar patterns
- **Responsive UI**: Clean, modern interface that works on all devices
- **GitHub Integration**: Automated vocabulary contribution workflow with pull requests
- **Collaborative Development**: Easy vocabulary expansion through GitHub workflow

## Project Structure

```
/Users/antonkulikov/Projects/dgt-vocab/
├── index.html                  # Main flashcard application
├── vocabulary-manager.html     # Vocabulary management interface
├── styles.css                  # Global styles and responsive design
├── script.js                   # Main application entry point
├── vocabulary.js               # Spanish DGT vocabulary data (394 words)
├── core.js                     # Core DGTVocabulary class
├── flashcard-mode.js          # Flashcard functionality
├── quiz-mode.js               # Quiz mode implementation
├── category-manager.js        # Category filtering logic
├── stats-manager.js           # Progress tracking and statistics
├── ui-helpers.js              # UI utility functions
├── vocabulary-manager.js      # Vocabulary management features
├── github-integration.js      # GitHub API integration for pull requests
└── sources/                   # Source materials
    ├── REGLAMENTO GENERAL DE CIRCULACIÓN.epub
    └── REGLAMENTO GENERAL DE CIRCULACIÓN.pdf
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
2. **Add single words**: Use the "Add Word" form
3. **Parse text**: Paste Spanish text to extract new vocabulary
4. **Edit words**: View and filter existing vocabulary
5. **Export data**: Download vocabulary as CSV or JavaScript and update the source file with new additions

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

#### Manual Workflow

1. **Parse or add new words** in the vocabulary manager
2. **Click "🚀 Create Pull Request"** → **"📁 Use Manual Workflow Instead"**
3. **Download files**: Get updated vocabulary.js and instruction files
4. **Follow git commands**: Copy provided commands to create branch and PR manually

### Advanced Features

- **Progress Reset**: Clear all learning progress to start fresh
- **Category Creation**: Add new grammatical categories
- **Duplicate Prevention**: System prevents adding existing words
- **Text Analysis**: Smart categorization of Spanish words by grammatical patterns
- **GitHub API Integration**: Automated pull request creation for vocabulary contributions
- **Secure Authentication**: GitHub Personal Access Token stored locally in browser
- **Collaborative Development**: Easy vocabulary expansion through GitHub workflow

## Technologies Used

- **HTML5**: Semantic structure and accessibility
- **CSS3**: Modern styling with flexbox, grid, and animations
- **Vanilla JavaScript**: No frameworks - pure ES6+ JavaScript
- **Local Storage API**: Client-side data persistence
- **CSS Animations**: Smooth card flips and transitions
- **GitHub REST API**: Automated pull request creation and repository management
- **Web Clipboard API**: Copy git commands to clipboard for manual workflow

## Vocabulary Sources

The vocabulary is sourced from official Spanish traffic regulations:

- **Real Decreto 1428/2003**: Official Spanish traffic regulation
- **Reglamento General de Circulación**: General traffic circulation rules
- **394 curated terms**: Nouns, verbs, adjectives, and adverbs essential for the DGT exam

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

This project is licensed under the MIT License.

## Author

Anton Kulikov

## Contributing

Contributions welcome! You can contribute in several ways:

### Adding Vocabulary

- Use the **vocabulary manager** with GitHub integration for seamless contributions
- **Automated workflow**: Authenticate with GitHub for automatic PR creation
- **Manual workflow**: Download files and follow provided git instructions

### Development Contributions

- Submit issues for bugs or feature requests
- Create pull requests for code improvements
- Help improve documentation

### Getting Started with Development

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/dgt-vocab.git`
3. Create a feature branch: `git checkout -b feature-name`
4. Make your changes and test locally
5. Commit and push: `git commit -m "Description" && git push origin feature-name`
6. Create a pull request

Please feel free to submit issues or pull requests to improve the vocabulary database or add new features.
