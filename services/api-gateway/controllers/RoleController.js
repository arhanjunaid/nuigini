const { models } = require('../../../shared/database');
const logger = require('../utils/logger');

class RoleController {
  static async list(req, res) {
    try {
      const { q, isActive, page = 1, limit = 20 } = req.query;

      const where = {};
      if (q) where.name = { [models.Sequelize.Op.like]: `%${q}%` };
      if (typeof isActive !== 'undefined') where.isActive = `${isActive}` === 'true';

      const result = await models.Role.findAndCountAll({
        where,
        order: [['name', 'ASC']],
        limit: parseInt(limit, 10),
        offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
      });

      res.json({
        success: true,
        data: result.rows,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total: result.count,
          pages: Math.ceil(result.count / parseInt(limit, 10)),
        },
      });
    } catch (err) {
      logger.error('Roles list error:', err);
      res.status(500).json({ success: false, error: 'Failed to list roles', message: err.message });
    }
  }

  static async get(req, res) {
    try {
      const role = await models.Role.findByPk(req.params.id);
      if (!role) return res.status(404).json({ success: false, error: 'Role not found' });
      res.json({ success: true, data: role });
    } catch (err) {
      logger.error('Roles get error:', err);
      res.status(500).json({ success: false, error: 'Failed to get role', message: err.message });
    }
  }

  static async create(req, res) {
    try {
      const { name, description, permissions, isActive = true, metadata = {} } = req.body;

      // app-level uniqueness (model is not UNIQUE to avoid ALTER issues)
      const existing = await models.Role.findOne({ where: { name } });
      if (existing) {
        return res.status(409).json({ success: false, error: `Role '${name}' already exists` });
      }

      const role = await models.Role.create({ name, description, permissions, isActive, metadata });
      res.status(201).json({ success: true, data: role });
    } catch (err) {
      logger.error('Roles create error:', err);
      res.status(400).json({ success: false, error: 'Failed to create role', message: err.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description, permissions, isActive, metadata } = req.body;

      const role = await models.Role.findByPk(id);
      if (!role) return res.status(404).json({ success: false, error: 'Role not found' });

      if (name && name !== role.name) {
        const dupe = await models.Role.findOne({ where: { name } });
        if (dupe && dupe.id !== id) {
          return res.status(409).json({ success: false, error: `Role '${name}' already exists` });
        }
      }

      await role.update({ name, description, permissions, isActive, metadata });
      res.json({ success: true, data: role });
    } catch (err) {
      logger.error('Roles update error:', err);
      res.status(400).json({ success: false, error: 'Failed to update role', message: err.message });
    }
  }

  static async remove(req, res) {
    try {
      const { id } = req.params;
      const role = await models.Role.findByPk(id);
      if (!role) return res.status(404).json({ success: false, error: 'Role not found' });

      // If FK constraints exist to users, this may fail. You can choose to soft-disable instead:
      // await role.update({ isActive: false });
      await role.destroy();

      res.json({ success: true });
    } catch (err) {
      logger.error('Roles delete error:', err);
      res.status(400).json({ success: false, error: 'Failed to delete role', message: err.message });
    }
  }
}

module.exports = RoleController;
