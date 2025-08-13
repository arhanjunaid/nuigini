const express = require('express');
const { models } = require('../../../shared/database');
const { authenticateToken } = require('../../../shared/middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// GET /api/v1/rating-rules
router.get('/', async (req, res) => {
  try {
    const { lineOfBusiness, isActive, page = 1, limit = 20 } = req.query;
    const where = {};
    if (lineOfBusiness) where.lineOfBusiness = lineOfBusiness;
    if (typeof isActive !== 'undefined') where.isActive = `${isActive}` === 'true';

    const result = await models.RatingTable.findAndCountAll({
      where,
      order: [['effectiveFrom', 'DESC']],
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
    res.status(500).json({ success: false, error: 'Failed to list rating tables', message: err.message });
  }
});

// GET /api/v1/rating-rules/:id
router.get('/:id', async (req, res) => {
  try {
    const row = await models.RatingTable.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, error: 'Rating table not found' });
    res.json({ success: true, data: row });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to get rating table', message: err.message });
  }
});

// POST /api/v1/rating-rules
router.post('/', async (req, res) => {
  try {
    const body = { ...req.body };
    if (!body.createdBy && req.user?.id) body.createdBy = req.user.id;
    const row = await models.RatingTable.create(body);
    res.status(201).json({ success: true, data: row });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Failed to create rating table', message: err.message });
  }
});

// PUT /api/v1/rating-rules/:id
router.put('/:id', async (req, res) => {
  try {
    const row = await models.RatingTable.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, error: 'Rating table not found' });
    await row.update(req.body);
    res.json({ success: true, data: row });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Failed to update rating table', message: err.message });
  }
});

// DELETE /api/v1/rating-rules/:id
router.delete('/:id', async (req, res) => {
  try {
    const row = await models.RatingTable.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, error: 'Rating table not found' });
    await row.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Failed to delete rating table', message: err.message });
  }
});

module.exports = router;
