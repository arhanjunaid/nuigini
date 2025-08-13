const express = require('express');
const router = express.Router();
const RuleEngineController = require('../controllers/RuleEngineController');
const { validateRuleExecution } = require('../../../shared/middleware/validation');
const { authenticateToken } = require('../../../shared/middleware/auth');

// Apply authentication to all routes
router.use(authenticateToken);

// Execute rules for a given context
router.post('/execute', validateRuleExecution, RuleEngineController.executeRules);

// Get rule execution history
router.get('/history/:entityType/:entityId', RuleEngineController.getExecutionHistory);

// Get available rule types
router.get('/types', RuleEngineController.getRuleTypes);

// Get rule statistics
router.get('/stats', RuleEngineController.getRuleStats);

// Test rule execution
router.post('/test', validateRuleExecution, RuleEngineController.testRules);

module.exports = router; 