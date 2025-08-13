const { models } = require('../../../shared/database');
const logger = require('../utils/logger');

class LeadController {
  /**
   * Create a new lead
   */
  static async createLead(req, res) {
    try {
      const leadData = req.body;
      const actorId = req.user.id;

      // Generate lead number
      const leadNumber = await this.generateLeadNumber();

      // Create lead
      const lead = await models.Lead.create({
        ...leadData,
        leadNumber,
        ownerId: actorId
      });

      // Get lead with associations
      const leadWithAssociations = await models.Lead.findByPk(lead.id, {
        include: [
          {
            model: models.Party,
            as: 'customer',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          },
          {
            model: models.User,
            as: 'owner',
            attributes: ['id', 'firstName', 'lastName', 'username']
          }
        ]
      });

      res.status(201).json({
        success: true,
        data: leadWithAssociations
      });
    } catch (error) {
      logger.error('Error creating lead:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create lead',
        message: error.message
      });
    }
  }

  /**
   * Get lead by ID
   */
  static async getLead(req, res) {
    try {
      const { id } = req.params;

      const lead = await models.Lead.findByPk(id, {
        include: [
          {
            model: models.Party,
            as: 'customer',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'type']
          },
          {
            model: models.User,
            as: 'owner',
            attributes: ['id', 'firstName', 'lastName', 'username']
          }
        ]
      });

      if (!lead) {
        return res.status(404).json({
          success: false,
          error: 'Lead not found'
        });
      }

      res.status(200).json({
        success: true,
        data: lead
      });
    } catch (error) {
      logger.error('Error getting lead:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get lead',
        message: error.message
      });
    }
  }

  /**
   * Update lead
   */
  static async updateLead(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const actorId = req.user.id;

      const lead = await models.Lead.findByPk(id);

      if (!lead) {
        return res.status(404).json({
          success: false,
          error: 'Lead not found'
        });
      }

      // Update lead
      await lead.update(updateData);

      // Get updated lead with associations
      const updatedLead = await models.Lead.findByPk(id, {
        include: [
          {
            model: models.Party,
            as: 'customer',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          },
          {
            model: models.User,
            as: 'owner',
            attributes: ['id', 'firstName', 'lastName', 'username']
          }
        ]
      });

      res.status(200).json({
        success: true,
        data: updatedLead
      });
    } catch (error) {
      logger.error('Error updating lead:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update lead',
        message: error.message
      });
    }
  }

  /**
   * Convert lead to quote
   */
  static async convertToQuote(req, res) {
    try {
      const { id } = req.params;
      const quoteData = req.body;
      const actorId = req.user.id;

      const lead = await models.Lead.findByPk(id, {
        include: [
          {
            model: models.Party,
            as: 'customer'
          }
        ]
      });

      if (!lead) {
        return res.status(404).json({
          success: false,
          error: 'Lead not found'
        });
      }

      if (!lead.canBeConverted()) {
        return res.status(400).json({
          success: false,
          error: 'Lead cannot be converted to quote'
        });
      }

      // Generate quote number
      const quoteNumber = await this.generateQuoteNumber();

      // Create quote
      const quote = await models.Quote.create({
        ...quoteData,
        quoteNumber,
        leadId: lead.id,
        customerId: lead.customerId
      });

      // Update lead status
      await lead.update({
        status: 'CONVERTED_TO_QUOTE',
        convertedAt: new Date()
      });

      res.status(201).json({
        success: true,
        data: {
          quote,
          lead: {
            id: lead.id,
            status: lead.status,
            convertedAt: lead.convertedAt
          }
        }
      });
    } catch (error) {
      logger.error('Error converting lead to quote:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to convert lead to quote',
        message: error.message
      });
    }
  }

  /**
   * List leads with filters
   */
  static async listLeads(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        channel,
        lineOfBusiness,
        ownerId,
        startDate,
        endDate
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Apply filters
      if (status) whereClause.status = status;
      if (channel) whereClause.channel = channel;
      if (lineOfBusiness) whereClause.lineOfBusiness = lineOfBusiness;
      if (ownerId) whereClause.ownerId = ownerId;

      if (startDate && endDate) {
        whereClause.createdAt = {
          [models.Sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const { count, rows: leads } = await models.Lead.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: models.Party,
            as: 'customer',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          },
          {
            model: models.User,
            as: 'owner',
            attributes: ['id', 'firstName', 'lastName', 'username']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.status(200).json({
        success: true,
        data: {
          leads,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count,
            pages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      logger.error('Error listing leads:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list leads',
        message: error.message
      });
    }
  }

  /**
   * Get lead statistics
   */
  static async getLeadStats(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const whereClause = {};
      if (startDate && endDate) {
        whereClause.createdAt = {
          [models.Sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const stats = await models.Lead.findAll({
        where: whereClause,
        attributes: [
          'status',
          'channel',
          'lineOfBusiness',
          [models.Sequelize.fn('COUNT', models.Sequelize.col('id')), 'count']
        ],
        group: ['status', 'channel', 'lineOfBusiness'],
        raw: true
      });

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error getting lead stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get lead statistics',
        message: error.message
      });
    }
  }

  /**
   * Generate unique lead number
   */
  static async generateLeadNumber() {
    const prefix = 'L';
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    // Get count of leads for this month
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const count = await models.Lead.count({
      where: {
        createdAt: {
          [models.Sequelize.Op.between]: [startOfMonth, endOfMonth]
        }
      }
    });
    
    const sequence = (count + 1).toString().padStart(4, '0');
    return `${prefix}${year}${month}${sequence}`;
  }

  /**
   * Generate unique quote number
   */
  static async generateQuoteNumber() {
    const prefix = 'Q';
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    // Get count of quotes for this month
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const count = await models.Quote.count({
      where: {
        createdAt: {
          [models.Sequelize.Op.between]: [startOfMonth, endOfMonth]
        }
      }
    });
    
    const sequence = (count + 1).toString().padStart(4, '0');
    return `${prefix}${year}${month}${sequence}`;
  }
}

module.exports = LeadController; 