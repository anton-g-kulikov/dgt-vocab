# Spanish DGT Vocabulary Flashcards

[![USE IT NOW](https://img.shields.io/badge/Try%20It-dgtvocab.app-blue?style=for-the-badge)](https://dgtvocab.app)
[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-☕-yellow?style=for-the-badge)](https://buymeacoffee.com/antonkulikov)

Study Spanish vocabulary for the DGT (Dirección General de Tráfico) driving exam with interactive flashcards, quizzes, and collaborative vocabulary management.

## Quick Links

- 🚀 [Start Learning](https://dgtvocab.app)
- 📚 [Vocabulary Manager](https://dgtvocab.app/vocabulary-manager.html)
- 💡 [Contribute](https://github.com/anton-g-kulikov/dgt-vocab)
- ☕ [Support the Project](https://buymeacoffee.com/antonkulikov)

## Features

### Study Tools

- 📝 **Flashcard Mode** - Interactive cards with Spanish-English translations
- 📋 **Quiz Mode** - Test your knowledge with multiple choice questions
- 🏷️ **Categories** - Filter by nouns, verbs, adjectives, and adverbs
- 📊 **Progress Tracking** - Monitor your learning progress
- 📱 **Mobile-Friendly** - Study anywhere on any device

### Vocabulary Management
- 📄 **Text Parser** - Extract words from Spanish texts
- 🔄 **GitHub Integration** - Automated vocabulary contributions
- 🔍 **Smart Analysis** - Automatic word categorization

## Getting Started

1. Visit [dgtvocab.app](https://dgtvocab.app)
2. Choose Flashcard or Quiz mode
3. Start learning!

## Project Structure

```
src/
├── core/              # Core app logic and vocabulary
├── features/          # Flashcards, quiz, and stats
├── ui/               # Styles and UI components
└── utils/            # Helper functions
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

### Quick Start

1. Visit [Vocabulary Manager](https://dgtvocab.app/vocabulary-manager.html)
2. Add new words or parse text
3. Use automated GitHub integration to contribute

### Development

1. Fork and clone: `git clone https://github.com/yourusername/dgt-vocab.git`
2. Create branch: `git checkout -b feature-name`
3. Submit PR with your improvements

## Support the Project

If you find this tool useful, consider [buying me a coffee](https://buymeacoffee.com/antonkulikov) ☕