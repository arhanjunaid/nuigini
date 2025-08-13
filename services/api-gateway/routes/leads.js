const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../../shared/middleware/auth');

// Apply authentication to all routes
router.use(authenticateToken);

// Forward to lead service
router.all('*', (req, res) => {
  // In a real implementation, this would proxy to the lead service
  res.status(501).json({
    success: false,
    error: 'Lead service not implemented in API Gateway'
  });
});

module.exports = router; 