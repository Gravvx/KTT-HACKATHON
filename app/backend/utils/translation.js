const { translate } = require('@vitalets/google-translate-api');

// Language mappings for Indian languages
const languageMap = {
  hi: 'hi', // Hindi
  mr: 'mr', // Marathi
  bn: 'bn', // Bengali
  te: 'te', // Telugu
  ta: 'ta', // Tamil
  gu: 'gu', // Gujarati
  kn: 'kn', // Kannada
  en: 'en', // English
};

class TranslationService {
  async translateText(text, targetLang, sourceLang = 'auto') {
    try {
      if (!text || !text.trim()) {
        return {
          translatedText: '',
          originalText: text,
          sourceLang,
          targetLang,
        };
      }

      // If target is same as source, skip translation
      if (sourceLang !== 'auto' && sourceLang === targetLang) {
        return {
          translatedText: text,
          originalText: text,
          sourceLang,
          targetLang,
        };
      }

      // Use google translate library
      const result = await translate(text, {
        from: sourceLang === 'auto' ? undefined : sourceLang,
        to: languageMap[targetLang] || targetLang,
      });

      const detectedSource =
        result.raw?.src ||
        (result.from && result.from.language && result.from.language.iso) ||
        sourceLang;

      return {
        translatedText: result.text,
        originalText: text,
        sourceLang: detectedSource,
        targetLang: targetLang,
      };
    } catch (error) {
      console.error('Translation error:', error.message || error);
      return {
        translatedText: text, // Fallback to original if translation fails
        originalText: text,
        sourceLang: sourceLang,
        targetLang: targetLang,
        error: 'Translation failed',
      };
    }
  }

  async detectLanguage(text) {
    try {
      if (!text || !text.trim()) return 'en';
      const result = await translate(text, { to: 'en' });
      return (
        result.raw?.src ||
        (result.from && result.from.language && result.from.language.iso) ||
        'en'
      );
    } catch (error) {
      return 'en'; // Default to English
    }
  }
}

module.exports = new TranslationService();
