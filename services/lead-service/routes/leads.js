const express = require('express');
const router = express.Router();
const LeadController = require('../controllers/LeadController');
const { authenticateToken } = require('../../../shared/middleware/auth');
const { validateLead } = require('../../../shared/middleware/validation');

// Apply authentication to all routes
router.use(authenticateToken);

// Create lead
router.post('/', validateLead, LeadController.createLead.bind(LeadController));

// Get lead by ID
router.get('/:id(\\d+)', LeadController.getLead.bind(LeadController));

// Update lead
router.put('/:id(\\d+)', validateLead, LeadController.updateLead.bind(LeadController));

// Convert lead to quote
router.post('/:id(\\d+)/convert', LeadController.convertToQuote.bind(LeadController));

// List leads with filters
router.get('/', LeadController.listLeads.bind(LeadController));

// Get lead statistics
router.get('/stats/overview', LeadController.getLeadStats.bind(LeadController));

module.exports = router; 