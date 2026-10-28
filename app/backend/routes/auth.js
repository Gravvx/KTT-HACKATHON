const express = require('express');
const router = express.Router();
const localDb = require('../utils/localDb');

// Citizen Login / Registration (Saved to local JSON)
router.post('/login', (req, res) => {
  try {
    const { name, phone, preferredLanguage } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    const cleanPhone = phone.trim();
    const cleanName = name.trim();

    // Save or update user in local file database
    const user = localDb.saveUser({
      name: cleanName,
      phone: cleanPhone,
      preferredLanguage: preferredLanguage || 'en',
    });

    // Generate token
    const token = Buffer.from(`${cleanName}:${cleanPhone}:${Date.now()}`).toString('base64');

    res.json({
      success: true,
      user,
      token,
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Get user profile
router.get('/profile', (req, res) => {
  const { phone } = req.query;
  if (!phone) return res.status(400).json({ error: 'Phone number required' });
  const user = localDb.findUserByPhone(phone);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ success: true, user });
});

module.exports = router;
