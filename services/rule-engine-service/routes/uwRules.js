const express = require('express');
const { models } = require('../../../shared/database');
const { authenticateToken } = require('../../../shared/middleware/auth');

const router = express.Router();

// all routes need auth (dev-safe middleware should set req.user)
router.use(authenticateToken);

// GET /api/v1/uw-rules?ruleType=UNDERWRITING&isActive=true&page=1&limit=20
router.get('/', async (req, res) => {
  try {
    const {
      ruleType,
      isActive,
      page = 1,
      limit = 20,
      q
    } = req.query;

    const where = {};
    if (ruleType) where.ruleType = ruleType;
    if (typeof isActive !== 'undefined') where.isActive = `${isActive}` === 'true';
    if (q) where.name = { [models.Sequelize.Op.like]: `%${q}%` };

    const result = await models.UWRule.findAndCountAll({
      where,
      order: [['priority', 'ASC'], ['createdAt', 'DESC']],
      limit: parseInt(limit, 10),
      offset: (parseInt(page, 10) - 1) * parseInt(limit, 10)
    });

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total: result.count,
        pages: Math.ceil(result.count / parseInt(limit, 10))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to list rules', message: err.message });
  }
});

// GET /api/v1/uw-rules/:id
router.get('/:id', async (req, res) => {
  try {
    const rule = await models.UWRule.findByPk(req.params.id);
    if (!rule) return res.status(404).json({ success: false, error: 'Rule not found' });
    res.json({ success: true, data: rule });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to get rule', message: err.message });
  }
});

// POST /api/v1/uw-rules
router.post('/', async (req, res) => {
  try {
    const body = { ...req.body };
    // condition/action can arrive as objects; store as JSON string if your model expects TEXT
    if (typeof body.condition !== 'string') body.condition = JSON.stringify(body.condition || {});
    if (typeof body.action !== 'string') body.action = JSON.stringify(body.action || {});
    if (!body.createdBy && req.user?.id) body.createdBy = req.user.id;

    const rule = await models.UWRule.create(body);
    res.status(201).json({ success: true, data: rule });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Failed to create rule', message: err.message });
  }
});

// PUT /api/v1/uw-rules/:id
router.put('/:id', async (req, res) => {
  try {
    const rule = await models.UWRule.findByPk(req.params.id);
    if (!rule) return res.status(404).json({ success: false, error: 'Rule not found' });

    const body = { ...req.body };
    if (typeof body.condition !== 'string' && body.condition !== undefined) body.condition = JSON.stringify(body.condition);
    if (typeof body.action !== 'string' && body.action !== undefined) body.action = JSON.stringify(body.action);

    await rule.update(body);
    res.json({ success: true, data: rule });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Failed to update rule', message: err.message });
  }
});

// PATCH /api/v1/uw-rules/:id/toggle
router.patch('/:id/toggle', async (req, res) => {
  try {
    const rule = await models.UWRule.findByPk(req.params.id);
    if (!rule) return res.status(404).json({ success: false, error: 'Rule not found' });

    await rule.update({ isActive: !rule.isActive });
    res.json({ success: true, data: rule });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Failed to toggle rule', message: err.message });
  }
});

// DELETE /api/v1/uw-rules/:id
router.delete('/:id', async (req, res) => {
  try {
    const rule = await models.UWRule.findByPk(req.params.id);
    if (!rule) return res.status(404).json({ success: false, error: 'Rule not found' });
    await rule.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Failed to delete rule', message: err.message });
  }
});

module.exports = router;
