const express = require('express');
const router = express.Router();
const QuoteController = require('../controllers/QuoteController');
const { authenticateToken } = require('../../../shared/middleware/auth');
const { validateQuote } = require('../../../shared/middleware/validation');

// Apply authentication to all routes
router.use(authenticateToken);

// Create quote
router.post('/', validateQuote, QuoteController.createQuote);

// Get quote by ID
router.get('/:id', QuoteController.getQuote);

// Update quote
router.put('/:id', validateQuote, QuoteController.updateQuote);

// Accept quote
router.post('/:id/accept', QuoteController.acceptQuote);

// List quotes with filters
router.get('/', QuoteController.listQuotes);

module.exports = router; 