const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../../shared/middleware/auth');

// Apply authentication to all routes
router.use(authenticateToken);

// Forward to policy service
router.all('*', (req, res) => {
  // In a real implementation, this would proxy to the policy service
  res.status(501).json({
    success: false,
    error: 'Policy service not implemented in API Gateway'
  });
});

module.exports = router; 