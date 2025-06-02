#!/usr/bin/env python3

import re
import time
import sys
from deep_translator import GoogleTranslator

# Configuration
INPUT_FILE = "../../src/core/vocabulary.js"
BACKUP_FILE = "../../src/core/vocabulary.js.before_deep_translation"
BATCH_SIZE = 10  # Process in small batches to avoid rate limits

def extract_vocabulary_data(file_content):
    """Extract the vocabulary data from the JS file."""
    # Find the start of the data array
    start_match = re.search(r'window\.vocabularyData\s*=\s*\[', file_content)
    if not start_match:
        print("Error: Could not find the start of vocabularyData array")
        sys.exit(1)
    
    start_idx = start_match.end()
    
    # Find the end of the array (the last closing bracket followed by semicolon)
    end_match = re.search(r'\];', file_content[start_idx:])
    if not end_match:
        print("Error: Could not find the end of vocabularyData array")
        sys.exit(1)
    
    end_idx = start_idx + end_match.start()
    
    # Extract the array content
    array_content = file_content[start_idx:end_idx]
    
    # Split into individual entries
    entries = []
    brace_count = 0
    start = 0
    
    for i, char in enumerate(array_content):
        if char == '{':
            if brace_count == 0:
                start = i
            brace_count += 1
        elif char == '}':
            brace_count -= 1
            if brace_count == 0:
                entries.append(array_content[start:i+1])
    
    return entries, file_content[:start_idx], file_content[start_idx + end_match.end() - 1:]

def translate_text(text, src='en', dest='ru', max_retries=5):
    """Translate text using Google Translate."""
    if not text or not text.strip():
        return ""
    
    # Some text preprocessing
    text = text.replace('/', ' or ')
    
    translator = GoogleTranslator(source=src, target=dest)
    
    for attempt in range(max_retries):
        try:
            result = translator.translate(text)
            return result
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"Translation error for '{text}': {e}. Retrying in {2 ** attempt} seconds...")
                time.sleep(2 ** attempt)  # Exponential backoff
            else:
                print(f"Failed to translate '{text}' after {max_retries} attempts: {e}")
                return f"[FAILED: {text}]"

def process_entry(entry):
    """Process a single vocabulary entry."""
    # Find translation field
    translation_match = re.search(r'translation:\s*"([^"]*)"', entry)
    if not translation_match:
        return entry
    
    english_text = translation_match.group(1)
    
    # Find perevod field
    perevod_match = re.search(r'perevod:\s*"([^"]*)"', entry)
    if not perevod_match:
        return entry
        
    # Only translate if perevod is empty
    if perevod_match.group(1).strip():
        return entry
    
    # Translate the English text
    russian_text = translate_text(english_text)
    
    # Replace the perevod field value
    return re.sub(r'perevod:\s*"([^"]*)"', f'perevod: "{russian_text}"', entry)

def main():
    # Read the vocabulary file
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        file_content = f.read()
    
    # Create a backup
    with open(BACKUP_FILE, 'w', encoding='utf-8') as f:
        f.write(file_content)
    
    print(f"Created backup at {BACKUP_FILE}")
    
    # Extract vocabulary entries
    entries, prefix, suffix = extract_vocabulary_data(file_content)
    
    print(f"Found {len(entries)} vocabulary entries")
    print("Starting translation process...")
    
    # Process entries in batches
    processed_entries = []
    success_count = 0
    
    for i in range(0, len(entries), BATCH_SIZE):
        batch = entries[i:i+BATCH_SIZE]
        batch_end = min(i+BATCH_SIZE, len(entries))
        print(f"Processing batch {i//BATCH_SIZE + 1}/{(len(entries) + BATCH_SIZE - 1)//BATCH_SIZE} (entries {i+1}-{batch_end})...")
        
        for j, entry in enumerate(batch):
            entry_num = i+j+1
            print(f"  Processing entry {entry_num}/{len(entries)}...", end="\r")
            try:
                processed_entry = process_entry(entry)
                processed_entries.append(processed_entry)
                
                if processed_entry != entry:
                    success_count += 1
                
                # Save progress after each entry to avoid losing work if interrupted
                if entry_num % 5 == 0 or entry_num == len(entries):
                    temp_content = prefix + ",\n  ".join(processed_entries + entries[entry_num:]) + suffix
                    with open(INPUT_FILE, 'w', encoding='utf-8') as f:
                        f.write(temp_content)
                    print(f"  Progress saved: {entry_num}/{len(entries)} entries processed ({success_count} translations)")
                
                # Small delay between translations to avoid rate limiting
                time.sleep(1)
            except Exception as e:
                print(f"\nError processing entry {entry_num}: {e}")
                processed_entries.append(entry)  # Keep original if error
        
        # Add a delay between batches to avoid rate limiting
        if i + BATCH_SIZE < len(entries):
            delay = 5
            print(f"Pausing for {delay} seconds to avoid rate limiting...")
            time.sleep(delay)
    
    # Final save
    final_content = prefix + ",\n  ".join(processed_entries) + suffix
    with open(INPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(final_content)
    
    print("\nTranslation complete!")
    print(f"Updated {INPUT_FILE} with {success_count} Russian translations")

if __name__ == "__main__":
    main()
