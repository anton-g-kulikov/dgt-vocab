# Spanish DGT Vocabulary Flashcards

## Overview

An interactive web application designed to help users study Spanish vocabulary for the Spanish DGT (Dirección General de Tráfico) driving exam. The application features flashcards, quiz modes, vocabulary management, and text parsing capabilities.

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

### Core Features

- **Local Storage**: All progress and custom words saved locally
- **394 Pre-loaded Words**: Comprehensive Spanish DGT vocabulary from traffic regulations
- **Smart Text Analysis**: Automatic word categorization based on Spanish grammar patterns
- **Responsive UI**: Clean, modern interface that works on all devices

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

### Advanced Features

- **Progress Reset**: Clear all learning progress to start fresh
- **Category Creation**: Add new grammatical categories
- **Duplicate Prevention**: System prevents adding existing words
- **Text Analysis**: Smart categorization of Spanish words by grammatical patterns

## Technologies Used

- **HTML5**: Semantic structure and accessibility
- **CSS3**: Modern styling with flexbox, grid, and animations
- **Vanilla JavaScript**: No frameworks - pure ES6+ JavaScript
- **Local Storage API**: Client-side data persistence
- **CSS Animations**: Smooth card flips and transitions

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

Contributions welcome! Please feel free to submit issues or pull requests to improve the vocabulary database or add new features.
