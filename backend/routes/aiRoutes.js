const express = require('express');
const router = express.Router();
const { getAiSuggestions, getQuickPrompts } = require('../controllers/aiController');

// Route to get AI recommendations based on user message and preferences
router.post('/suggest', getAiSuggestions);
router.post('/chat', getAiSuggestions);

// Route to get starter interactive option buttons
router.get('/prompts', getQuickPrompts);

module.exports = router;

