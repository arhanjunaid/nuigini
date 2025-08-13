const express = require('express');
const RoleController = require('../controllers/RoleController');
const { authenticateToken } = require('../../../shared/middleware/auth');

const router = express.Router();

// Simple validators local to this route
const validateCreate = (req, res, next) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || name.length > 50) {
    return res.status(400).json({ success: false, error: 'name is required (<= 50 chars)' });
  }
  next();
};

const validateUpdate = (req, res, next) => {
  const { name } = req.body;
  if (name && (typeof name !== 'string' || name.length > 50)) {
    return res.status(400).json({ success: false, error: 'name must be a string (<= 50 chars)' });
  }
  next();
};

// Protect all endpoints
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   - name: Roles
 *     description: Manage user roles
 */

/**
 * @swagger
 * /api/v1/roles:
 *   get:
 *     summary: List roles
 *     tags: [Roles]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Search by name (LIKE)
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: OK }
 */
router.get('/', RoleController.list);

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   get:
 *     summary: Get a role by id
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found }
 */
router.get('/:id', RoleController.get);

/**
 * @swagger
 * /api/v1/roles:
 *   post:
 *     summary: Create a role
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, maxLength: 50 }
 *               description: { type: string }
 *               permissions: { type: object, additionalProperties: true }
 *               isActive: { type: boolean }
 *               metadata: { type: object, additionalProperties: true }
 *     responses:
 *       201: { description: Created }
 *       409: { description: Role already exists }
 */
router.post('/', validateCreate, RoleController.create);

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   put:
 *     summary: Update a role
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, maxLength: 50 }
 *               description: { type: string }
 *               permissions: { type: object, additionalProperties: true }
 *               isActive: { type: boolean }
 *               metadata: { type: object, additionalProperties: true }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found }
 *       409: { description: Role name already exists }
 */
router.put('/:id', validateUpdate, RoleController.update);

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   delete:
 *     summary: Delete a role
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found }
 */
router.delete('/:id', RoleController.remove);

module.exports = router;
