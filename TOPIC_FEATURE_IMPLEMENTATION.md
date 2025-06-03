# Topic-Based Learning Feature Implementation Plan

## Overview

Implement a topic-based learning system that allows users to filter vocabulary by specific driving-related topics while maintaining the existing category system.

## Topics List

- Topic 01. Definitions of road users
- Topic 02. Vehicles and basic mechanics
- Topic 03. License and points
- Topic 04. Roads and speed
- Topic 05. Headlights and lighting
- Topic 06. Documents
- Topic 07. Traffic regulations
- Topic 08. Special lanes
- Topic 09. Signs and rules
- Topic 10. Maneuvers
- Topic 11. Safety (risk factors, driving styles, distance, alcohol/drugs, passive/active)
- Topic 12. Emergencies
- Topic 13. Transportation of goods and children

## Implementation Checklist

### Phase 1: Data Structure Updates

- [x] Update vocabulary data structure to include `topics` field (array of topic IDs)
- [x] Define topic constants and mappings
- [x] Ensure backward compatibility with existing 400+ words without topics

### Phase 2: Core Functionality

- [x] Create topic management utilities
- [x] Update vocabulary loading/saving logic to handle topics
- [x] Implement topic filtering functionality in core.js

### Phase 3: Vocabulary Manager Updates

- [x] Add global topic selection dropdown to vocabulary manager UI
- [x] Update text parser to assign global topic to new words
- [ ] Modify vocabulary updates manager to include topic information
- [ ] Update GitHub integration to include topic data in commits

### Phase 4: User Interface Updates

- [x] Create topic selector component for flashcard mode
- [x] Update category manager to work alongside topics
- [x] Add topic filtering to flashcard and quiz modes
- [x] Update UI to show topic information where relevant

### Phase 5: Testing & Validation

- [ ] Test topic filtering with existing vocabulary
- [ ] Test vocabulary manager with global topic setting
- [ ] Validate GitHub integration includes topic data
- [ ] Test backward compatibility with words without topics

## Technical Considerations

### Data Structure

```javascript
// Current word structure
{
  word: "string",
  translation: "string",
  perevod: "string",
  category: "string",
  example: "string"
}

// Updated word structure
{
  word: "string",
  translation: "string",
  perevod: "string",
  category: "string",
  example: "string",
  topics: ["topic01", "topic02"] // Optional array of topic IDs
}
```

### Topic Constants

```javascript
const TOPICS = {
  topic01: "Definitions of road users",
  topic02: "Vehicles and basic mechanics",
  // ... etc
};
```

### Backward Compatibility

- Words without topics should work seamlessly
- "All Topics" option should include words without topics
- Default behavior should not break existing functionality

## Files to Modify

### Core Files

- `/src/core/vocabulary.js` - Add topic support to vocabulary data
- `/src/core/core.js` - Update filtering logic

### Vocabulary Manager

- `/vocabulary-manager.html` - Add global topic selector UI
- `/src/features/vocabulary-manager/vocabulary-manager.js` - Add topic state management
- `/src/features/vocabulary-manager/text-parser.js` - Apply global topic to new words
- `/src/features/vocabulary-manager/vocabulary-updates-manager.js` - Include topics in updates
- `/src/features/vocabulary-manager/github-integration.js` - Include topic data in commits

### Flashcard System

- `/src/features/flashcards/category-manager.js` - Extend to handle topics
- `/src/features/flashcards/flashcard-mode.js` - Add topic filtering
- `/src/features/flashcards/quiz-mode.js` - Add topic filtering

### UI Components

- Create new topic selector component
- Update existing UI to show topic information

## Implementation Priority

1. **High Priority**: Core data structure and topic filtering
2. **High Priority**: Vocabulary manager global topic setting
3. **Medium Priority**: Flashcard mode topic filtering
4. **Medium Priority**: UI enhancements
5. **Low Priority**: Advanced topic features and analytics

## Notes

- Maintain existing category system alongside topics
- Words can have multiple topics or no topics
- Global topic setting applies to all words in a vocabulary update/PR
- Ensure 400+ existing words without topics continue to work properly
