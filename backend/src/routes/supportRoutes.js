const express = require('express');
const router = express.Router();
const { generateSupportResponse } = require('../utils/aiService');

// POST /api/support/chat
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const response = await generateSupportResponse(message);
    res.json({ reply: response });
  } catch (error) {
    console.error('AI support error:', error?.message || error);
    res.status(500).json({ error: error?.message || 'AI service error' });
  }
});

module.exports = router;