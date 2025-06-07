/**
 * WordCategorizer - A module for categorizing Spanish words based on linguistic patterns
 *
 * This module provides functionality to guess the grammatical category of Spanish words
 * based on their endings, exact matches with known word lists, and linguistic patterns.
 */
class WordCategorizer {
  constructor() {
    // Initialize known word sets for exact matching
    this.initializeWordSets();
    // Initialize category matchers for extensibility
    this.initializeCategoryMatchers();
    // Counter for unique ID generation
    this.idCounter = 0;
  }

  /**
   * Initialize sets of known words for exact matching
   */
  initializeWordSets() {
    // Define known prepositions
    this.prepositions = new Set([
      "a",
      "ante",
      "bajo",
      "cabe",
      "con",
      "contra",
      "de",
      "desde",
      "durante",
      "en",
      "entre",
      "hacia",
      "hasta",
      "mediante",
      "para",
      "por",
      "según",
      "sin",
      "so",
      "sobre",
      "tras",
      "versus",
      "vía",
      "salvo",
      "excepto",
    ]);

    // Define known conjunctions
    this.conjunctions = new Set([
      "y",
      "e",
      "ni",
      "o",
      "u",
      "pero",
      "mas",
      "sino",
      "aunque",
      "porque",
      "pues",
      "que",
      "si",
      "como",
      "cuando",
      "donde",
      "mientras",
      "para",
      "por",
      "sin",
      "con",
      "así",
      "entonces",
      "luego",
      "además",
      "también",
    ]);

    // Define common directional adverbs
    this.directionalAdverbs = new Set([
      "atrás",
      "adelante",
      "arriba",
      "abajo",
      "aquí",
      "ahí",
      "allí",
      "cerca",
      "lejos",
      "dentro",
      "fuera",
      "encima",
      "debajo",
    ]);

    // Define interrogative adverbs
    this.interrogativeAdverbs = new Set([
      "cómo",
      "cuándo",
      "dónde",
      "por qué",
      "para qué",
    ]);

    // Combine all adverbs for easier checking
    this.adverbs = new Set([
      ...this.directionalAdverbs,
      ...this.interrogativeAdverbs,
    ]);

    // Define pronouns
    this.pronouns = new Set([
      "yo",
      "tú",
      "él",
      "ella",
      "usted",
      "nosotros",
      "nosotras",
      "vosotros",
      "vosotras",
      "ellos",
      "ellas",
      "ustedes",
      "me",
      "te",
      "se",
      "nos",
      "os",
      "le",
      "les",
      "lo",
      "los",
      "las",
      "mí",
      "ti",
      "sí",
      "conmigo",
      "contigo",
      "consigo",
    ]);

    // Define determiners/articles
    this.determiners = new Set([
      "el",
      "la",
      "los",
      "las",
      "un",
      "una",
      "unos",
      "unas",
      "mi",
      "tu",
      "su",
      "nuestro",
      "nuestra",
      "nuestros",
      "nuestras",
      "vuestro",
      "vuestra",
      "vuestros",
      "vuestras",
      "este",
      "esta",
      "estos",
      "estas",
      "ese",
      "esa",
      "esos",
      "esas",
      "aquel",
      "aquella",
      "aquellos",
      "aquellas",
      "algún",
      "alguna",
      "algunos",
      "algunas",
      "ningún",
      "ninguna",
      "todo",
      "toda",
      "todos",
      "todas",
      "cada",
      "ambos",
      "ambas",
    ]);

    // Define common adverbs (including negations)
    this.knownAdverbs = new Set([
      "no",
      "sí",
      "muy",
      "bien",
      "mal",
      "aquí",
      "allí",
      "ahora",
      "después",
      "antes",
      "siempre",
      "nunca",
      "ya",
      "aún",
      "también",
      "tampoco",
      "más",
      "menos",
      "tanto",
      "poco",
      "mucho",
      "bastante",
      "demasiado",
      "apenas",
      "casi",
      "solo",
      "solamente",
    ]);

    // Define common nouns to avoid misclassification
    this.knownNouns = new Set([
      "casa",
      "personas",
      "hombre",
      "mujer",
      "niño",
      "niña",
      "día",
      "noche",
      "tiempo",
      "vida",
      "mundo",
      "país",
      "ciudad",
      "trabajo",
      "familia",
      "agua",
      "fuego",
      "tierra",
      "aire",
      "sol",
      "luna",
      "mesa",
      "silla",
      "libro",
      "escuela",
      "profesor",
    ]);

    // Define imperative forms
    this.imperativeForms = new Set([
      "ven",
      "sal",
      "haz",
      "ten",
      "sé",
      "di",
      "ve",
      "pon",
      "da",
      "dé",
      "mira",
      "oye",
      "dame",
      "vamos",
      "vámonos",
      "para",
      "sigue",
      "espera",
    ]);

    // Define auxiliary/helping verbs
    this.auxiliaryVerbs = new Set([
      "ser",
      "estar",
      "haber",
      "ir",
      "tener",
      "hacer",
      "poder",
      "deber",
      "soy",
      "eres",
      "es",
      "somos",
      "sois",
      "son", // ser present
      "estoy",
      "estás",
      "está",
      "estamos",
      "estáis",
      "están", // estar present
      "he",
      "has",
      "ha",
      "hemos",
      "habéis",
      "han", // haber present
      "voy",
      "vas",
      "va",
      "vamos",
      "vais",
      "van", // ir present
      "tengo",
      "tienes",
      "tiene",
      "tenemos",
      "tenéis",
      "tienen", // tener present
    ]);
  }

  /**
   * Initialize extensible category matchers for future-proofing
   */
  initializeCategoryMatchers() {
    this.categoryMatchers = [
      { category: "preposition", test: (w) => this.prepositions.has(w) },
      { category: "conjunction", test: (w) => this.conjunctions.has(w) },
      {
        category: "adverb",
        test: (w) => this.knownAdverbs.has(w) || this.isAdverb(w),
      }, // Check exact match first
      { category: "pronoun", test: (w) => this.pronouns.has(w) },
      { category: "determiner", test: (w) => this.determiners.has(w) },
      {
        category: "noun",
        test: (w) => this.knownNouns.has(w) || this.isNoun(w),
      }, // Check exact match first
      { category: "verb", test: (w) => this.isVerb(w) }, // Enhanced verb detection
      { category: "adjective", test: (w) => this.isAdjective(w) }, // Enhanced adjective detection
    ];
  }
  /**
   * Categorize a word based on its linguistic properties
   * @param {string} word - The word to categorize
   * @returns {object} - Object containing word, category, and unique ID
   */
  categorizeWord(word) {
    const category = this.guessWordCategory(word);

    return {
      word: word,
      category: category,
      id: this.generateUniqueId(), // Use improved ID generation
    };
  }

  /**
   * Generate a unique ID using an incrementing counter
   * @returns {number} - Unique ID
   */
  generateUniqueId() {
    return Date.now() + ++this.idCounter;
  }

  /**
   * Guess the grammatical category of a Spanish word
   * @param {string} word - The word to analyze
   * @returns {string} - The guessed category
   */
  guessWordCategory(word) {
    // Normalize to lowercase for consistent matching
    word = word.toLowerCase();

    // Use extensible category matchers
    for (const { category, test } of this.categoryMatchers) {
      if (test(word)) {
        return category;
      }
    }

    // Default to noun if no pattern matches
    return "noun";
  }

  /**
   * Check if a word follows verb patterns
   * @param {string} word - The word to check
   * @returns {boolean} - True if the word appears to be a verb
   */
  isVerb(word) {
    // First check for superlative adjectives that should NOT be verbs
    if (word.includes("ísimo") || word.includes("ísima")) {
      return false;
    }

    // Check auxiliary/helping verbs first
    if (this.auxiliaryVerbs.has(word)) {
      return true;
    }

    // Check imperative forms
    if (this.imperativeForms.has(word)) {
      return true;
    }

    // Check infinitive endings
    const infinitiveEndings = ["ar", "er", "ir", "arse", "erse", "irse"];
    if (infinitiveEndings.some((ending) => word.endsWith(ending))) {
      return true;
    }

    // Check gerunds and participles
    if (
      word.endsWith("ando") ||
      word.endsWith("endo") ||
      word.endsWith("ado") ||
      word.endsWith("ido")
    ) {
      return true;
    }

    // Check conjugated verb endings
    const conjugatedVerbSuffixes = [
      // Present tense endings
      "o",
      "as",
      "es",
      "a",
      "e",
      "amos",
      "emos",
      "imos",
      "áis",
      "éis",
      "ís",
      "an",
      "en",
      // Past tense endings
      "é",
      "í",
      "aste",
      "iste",
      "ó",
      "ió",
      "aron",
      "ieron",
      // Imperfect endings
      "aba",
      "ía",
      "abas",
      "ías",
      "ábamos",
      "íamos",
      "aban",
      "ían",
      // Future endings
      "aré",
      "eré",
      "iré",
      "arás",
      "erás",
      "irás",
      "ará",
      "erá",
      "irá",
      "aremos",
      "eremos",
      "iremos",
      "aréis",
      "eréis",
      "iréis",
      "arán",
      "erán",
      "irán",
      // Conditional endings
      "aría",
      "ería",
      "iría",
      "arías",
      "erías",
      "irías",
      "aríamos",
      "eríamos",
      "iríamos",
      "aríais",
      "eríais",
      "iríais",
      "arían",
      "erían",
      "irían",
    ];

    // Be more careful with short endings to avoid false positives
    const shortEndings = ["o", "as", "es", "a", "e", "an", "en"];
    const longerEndings = conjugatedVerbSuffixes.filter(
      (ending) => !shortEndings.includes(ending)
    );

    // First check longer, more specific endings
    if (longerEndings.some((ending) => word.endsWith(ending))) {
      return true;
    }

    // For short endings, add additional checks to reduce false positives
    if (
      shortEndings.some((ending) => word.endsWith(ending)) &&
      word.length > 3
    ) {
      return this.isLikelyConjugatedVerb(word);
    }

    return false;
  }

  /**
   * Helper method to determine if a word with short ending is likely a conjugated verb
   * @param {string} word - The word to check
   * @returns {boolean} - True if likely a conjugated verb
   */
  isLikelyConjugatedVerb(word) {
    // Check if it's not a common short word that would be misclassified
    const commonNonVerbs = new Set([
      "yo",
      "no",
      "sí",
      "lo",
      "la",
      "le",
      "se",
      "me",
      "te",
      "de",
      "en",
      "es",
    ]);

    if (commonNonVerbs.has(word)) {
      return false;
    }

    // Check for common verb stem patterns
    const verbStemPatterns = [
      "habl",
      "com",
      "viv",
      "trabaj",
      "estudi",
      "jug",
      "camin",
      "cant",
      "bail",
    ];

    return verbStemPatterns.some((stem) => word.startsWith(stem));
  }

  /**
   * Check if a word follows adverb patterns
   * @param {string} word - The word to check
   * @returns {boolean} - True if the word appears to be an adverb
   */
  isAdverb(word) {
    // Check for adverbs ending in -mente
    return word.endsWith("mente");
  }

  /**
   * Check if a word follows adjective patterns
   * @param {string} word - The word to check
   * @returns {boolean} - True if the word appears to be an adjective
   */
  isAdjective(word) {
    // Skip if it's already identified as a known noun
    if (this.knownNouns.has(word)) {
      return false;
    }

    // Check for adjective-specific endings first (high confidence)
    const pureAdjectiveEndings = [
      "oso",
      "osa",
      "osos",
      "osas", // peligroso
      "ivo",
      "iva",
      "ivos",
      "ivas", // activo
      "ico",
      "ica",
      "icos",
      "icas", // artístico
      "ible",
      "ibles",
      "able",
      "ables", // posible, notable
      "ísimo",
      "ísima",
      "ísimos",
      "ísimas", // superlatives: buenísimo, altísimos
      "eño",
      "eña",
      "eños",
      "eñas", // nationality: madrileño
      "ino",
      "ina",
      "inos",
      "inas", // nationality: argentino
      "ante",
      "antes",
      "ente",
      "entes", // verbal adjectives
      "al",
      "ales", // personal, legales
    ];

    if (pureAdjectiveEndings.some((ending) => word.endsWith(ending))) {
      return true;
    }

    // Handle nationality adjectives that end in consonants
    const nationalityAdjectives = new Set([
      "español",
      "francés",
      "inglés",
      "alemán",
      "japonés",
      "chino",
      "ruso",
      "italiano",
      "portugués",
      "holandés",
      "sueco",
      "danés",
    ]);

    if (nationalityAdjectives.has(word)) {
      return true;
    }

    // Check for ambiguous endings that could be noun or adjective
    const ambiguousEndings = [
      "ario",
      "aria",
      "arios",
      "arias",
      "ero",
      "era",
      "eros",
      "eras",
    ];
    if (ambiguousEndings.some((ending) => word.endsWith(ending))) {
      // Apply heuristics - prefer adjective for shorter words or common patterns
      return word.length <= 8 || this.isLikelyAdjective(word);
    }

    // Check for participle forms (past participles used as adjectives)
    if (
      (word.endsWith("ado") ||
        word.endsWith("ada") ||
        word.endsWith("idos") ||
        word.endsWith("idas")) &&
      word.length > 4
    ) {
      return true;
    }

    // Check for basic endings (but be careful with very short words)
    const basicEndings = ["o", "a", "os", "as"];
    if (
      basicEndings.some((ending) => word.endsWith(ending)) &&
      word.length > 3
    ) {
      // Additional check to avoid false positives with common short words
      return !this.isCommonShortWord(word) && !this.knownNouns.has(word);
    }

    return false;
  }

  /**
   * Helper method to check if a word is likely an adjective based on patterns
   * @param {string} word - The word to check
   * @returns {boolean} - True if the word seems like an adjective
   */
  isLikelyAdjective(word) {
    // Words ending in -ario/-aria that are likely adjectives
    const adjectivePatterns = [
      "primario",
      "secundario",
      "necesario",
      "ordinario",
      "extraordinario",
    ];
    return adjectivePatterns.some((pattern) =>
      word.includes(pattern.slice(0, -2))
    );
  }

  /**
   * Helper method to check if a word is a common short word that shouldn't be classified as adjective
   * @param {string} word - The word to check
   * @returns {boolean} - True if it's a common short word
   */
  isCommonShortWord(word) {
    const commonShortWords = new Set([
      "yo",
      "no",
      "sí",
      "lo",
      "la",
      "los",
      "las",
      "le",
      "les",
      "os",
      "as",
      "ya",
      "va",
      "da",
      "do",
      "me",
      "te",
      "se",
      "nos",
      "en",
      "de",
      "el",
      "un",
      "una",
      "con",
      "por",
      "para",
      "sin",
    ]);
    return commonShortWords.has(word);
  }

  /**
   * Check if a word follows noun patterns
   * @param {string} word - The word to check
   * @returns {boolean} - True if the word appears to be a noun
   */
  isNoun(word) {
    // Check if it's already in the known nouns set
    if (this.knownNouns.has(word)) {
      return true;
    }

    const nounEndings = [
      "ción",
      "sión", // educación, decisión
      "dad",
      "tad", // felicidad, libertad
      "miento",
      "ancia", // pensamiento, ignorancia
      "encia",
      "ura", // experiencia, cultura
      "aje",
      "ismo", // viaje, turismo
      "ista", // artista, pianista
    ];

    // Check for clear noun endings
    if (nounEndings.some((ending) => word.endsWith(ending))) {
      return true;
    }

    // Handle ambiguous endings -dor, -dora, -tor, -tora
    const ambiguousAgentEndings = ["dor", "dora", "tor", "tora"];
    if (ambiguousAgentEndings.some((ending) => word.endsWith(ending))) {
      // Prefer noun for longer words or agent nouns
      return word.length > 6;
    }

    // Check for plural nouns (words ending in -s that aren't adjectives or verbs)
    if (word.endsWith("s") && word.length > 4) {
      const singular = word.slice(0, -1);
      // If the singular form would be a known noun, this is likely a plural noun
      if (this.knownNouns.has(singular)) {
        return true;
      }
      // Check if removing -es gives us a known noun (e.g., "personas" -> "persona")
      if (word.endsWith("es")) {
        const singularFromEs = word.slice(0, -2);
        if (this.knownNouns.has(singularFromEs)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Detect the gender of a Spanish word (optional feature)
   * @param {string} word - The word to analyze
   * @returns {string} - "masculine", "feminine", or "unknown"
   */
  detectGender(word) {
    word = word.toLowerCase();

    // Common feminine endings
    if (
      word.endsWith("a") ||
      word.endsWith("ión") ||
      word.endsWith("sión") ||
      word.endsWith("dad") ||
      word.endsWith("tad") ||
      word.endsWith("ura")
    ) {
      return "feminine";
    }

    // Common masculine endings
    if (
      word.endsWith("o") ||
      word.endsWith("or") ||
      word.endsWith("aje") ||
      word.endsWith("ismo") ||
      word.endsWith("miento")
    ) {
      return "masculine";
    }

    return "unknown";
  }

  /**
   * Check if a word is likely plural
   * @param {string} word - The word to check
   * @returns {boolean} - True if the word appears to be plural
   */
  isPlural(word) {
    word = word.toLowerCase();
    return word.endsWith("s") || word.endsWith("es");
  }

  /**
   * Get detailed word analysis including category, gender, and number
   * @param {string} word - The word to analyze
   * @returns {object} - Detailed analysis object
   */
  analyzeWord(word) {
    const basicAnalysis = this.categorizeWord(word);

    return {
      ...basicAnalysis,
      gender: this.detectGender(word),
      isPlural: this.isPlural(word),
      patterns: this.getMatchingPatterns(word),
    };
  }

  /**
   * Get the patterns that match a word (for debugging)
   * @param {string} word - The word to analyze
   * @returns {Array<string>} - Array of matching patterns
   */
  getMatchingPatterns(word) {
    word = word.toLowerCase();
    const patterns = [];

    // Check each category matcher
    for (const { category, test } of this.categoryMatchers) {
      if (test(word)) {
        patterns.push(category);
      }
    }

    return patterns;
  }

  /**
   * Public method to check if a word is a verb
   * @param {string} word - The word to check
   * @returns {boolean} - True if the word appears to be a verb
   */
  checkIsVerb(word) {
    return this.isVerb(word.toLowerCase());
  }

  /**
   * Public method to check if a word is a noun
   * @param {string} word - The word to check
   * @returns {boolean} - True if the word appears to be a noun
   */
  checkIsNoun(word) {
    return this.isNoun(word.toLowerCase());
  }

  /**
   * Public method to check if a word is an adjective
   * @param {string} word - The word to check
   * @returns {boolean} - True if the word appears to be an adjective
   */
  checkIsAdjective(word) {
    return this.isAdjective(word.toLowerCase());
  }

  /**
   * Public method to check if a word is an adverb
   * @param {string} word - The word to check
   * @returns {boolean} - True if the word appears to be an adverb
   */
  checkIsAdverb(word) {
    return this.isAdverb(word.toLowerCase());
  }
}

/**
 * WordCategorizer - A module for categorizing Spanish words based on linguistic patterns
 *
 * This module provides functionality to guess the grammatical category of Spanish words
 * based on their endings, exact matches with known word lists, and linguistic patterns.
 */
window.WordCategorizer = WordCategorizer;
