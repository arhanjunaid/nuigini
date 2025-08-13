const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../../shared/middleware/auth');

// Apply authentication to all routes
router.use(authenticateToken);

// Placeholder routes
router.all('*', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Notification service routes not implemented'
  });
});

module.exports = router; 