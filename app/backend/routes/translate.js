// app/backend/routes/translate.js
const express = require('express');
const router = express.Router();
const translationService = require('../utils/translation');

// Translate text
// POST /api/translate/text
// Body: { text: "Hello", targetLanguage: "hi", sourceLanguage: "en" (optional) }
router.post('/text', async (req, res) => {
  try {
    const { text, targetLanguage, sourceLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({ error: 'Text and target language are required' });
    }

    const result = await translationService.translateText(
      text,
      targetLanguage,
      sourceLanguage
    );

    res.json(result);
  } catch (error) {
    console.error('Translation route error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
});

// Detect language
// POST /api/translate/detect
// Body: { text: "Hello" }
router.post('/detect', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const language = await translationService.detectLanguage(text);
    res.json({ detectedLanguage: language });
  } catch (error) {
    console.error('Language detection error:', error);
    res.status(500).json({ error: 'Language detection failed' });
  }
});

module.exports = router;
