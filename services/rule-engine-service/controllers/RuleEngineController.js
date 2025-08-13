const { models } = require('../../../shared/database');
const RuleEngine = require('../services/RuleEngine');
const logger = require('../utils/logger');

class RuleEngineController {
  /**
   * Execute rules for a given context
   */
  static async executeRules(req, res) {
    try {
      const { entityType, entityId, context, ruleTypes = [] } = req.body;
      const actorId = req.user.id;

      logger.info('Executing rules', {
        entityType,
        entityId,
        ruleTypes,
        actorId
      });

      const ruleEngine = new RuleEngine();
      const results = await ruleEngine.executeRules({
        entityType,
        entityId,
        context,
        ruleTypes,
        actorId
      });

      res.status(200).json({
        success: true,
        data: {
          entityType,
          entityId,
          results,
          executedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Error executing rules:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to execute rules',
        message: error.message
      });
    }
  }

  /**
   * Get rule execution history
   */
  static async getExecutionHistory(req, res) {
    try {
      const { entityType, entityId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const offset = (page - 1) * limit;

      const history = await models.AuditLog.findAndCountAll({
        where: {
          entityType,
          entityId,
          action: 'RULE_EXECUTION'
        },
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          {
            model: models.User,
            as: 'actor',
            attributes: ['id', 'username', 'firstName', 'lastName']
          }
        ]
      });

      res.status(200).json({
        success: true,
        data: {
          history: history.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: history.count,
            pages: Math.ceil(history.count / limit)
          }
        }
      });
    } catch (error) {
      logger.error('Error fetching rule execution history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch rule execution history',
        message: error.message
      });
    }
  }

  /**
   * Get available rule types
   */
  static async getRuleTypes(req, res) {
    try {
      const ruleTypes = [
        {
          type: 'UNDERWRITING',
          name: 'Underwriting Rules',
          description: 'Rules for quote acceptance, referral, or decline',
          categories: ['AUTO_ACCEPT', 'AUTO_REFER', 'AUTO_DECLINE', 'MANUAL_REVIEW']
        },
        {
          type: 'RATING',
          name: 'Rating Rules',
          description: 'Rules for premium calculation and adjustments',
          categories: ['BASE_RATE', 'LOADINGS', 'DISCOUNTS', 'FEES']
        },
        {
          type: 'CLAIMS',
          name: 'Claims Rules',
          description: 'Rules for claims processing and fraud detection',
          categories: ['COVERAGE_CHECK', 'FRAUD_DETECTION', 'RESERVE_CALCULATION']
        },
        {
          type: 'COMPLIANCE',
          name: 'Compliance Rules',
          description: 'Rules for regulatory compliance and validation',
          categories: ['KYC', 'SANCTIONS', 'REPORTING']
        }
      ];

      res.status(200).json({
        success: true,
        data: ruleTypes
      });
    } catch (error) {
      logger.error('Error fetching rule types:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch rule types',
        message: error.message
      });
    }
  }

  /**
   * Get rule statistics
   */
  static async getRuleStats(req, res) {
    try {
      const { startDate, endDate, ruleType } = req.query;

      const whereClause = {
        action: 'RULE_EXECUTION'
      };

      if (startDate && endDate) {
        whereClause.createdAt = {
          [models.Sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      if (ruleType) {
        whereClause.metadata = {
          [models.Sequelize.Op.like]: `%${ruleType}%`
        };
      }

      const stats = await models.AuditLog.findAll({
        where: whereClause,
        attributes: [
          [models.Sequelize.fn('DATE', models.Sequelize.col('createdAt')), 'date'],
          [models.Sequelize.fn('COUNT', models.Sequelize.col('id')), 'executions'],
          [models.Sequelize.fn('COUNT', models.Sequelize.literal('CASE WHEN metadata LIKE "%DECLINE%" THEN 1 END')), 'declines'],
          [models.Sequelize.fn('COUNT', models.Sequelize.literal('CASE WHEN metadata LIKE "%REFER%" THEN 1 END')), 'refers']
        ],
        group: [models.Sequelize.fn('DATE', models.Sequelize.col('createdAt'))],
        order: [[models.Sequelize.fn('DATE', models.Sequelize.col('createdAt')), 'ASC']]
      });

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error fetching rule statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch rule statistics',
        message: error.message
      });
    }
  }

  /**
   * Test rule execution without saving results
   */
  static async testRules(req, res) {
    try {
      const { entityType, entityId, context, ruleTypes = [] } = req.body;

      logger.info('Testing rules', {
        entityType,
        entityId,
        ruleTypes
      });

      const ruleEngine = new RuleEngine();
      const results = await ruleEngine.executeRules({
        entityType,
        entityId,
        context,
        ruleTypes,
        testMode: true
      });

      res.status(200).json({
        success: true,
        data: {
          entityType,
          entityId,
          results,
          testMode: true,
          executedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Error testing rules:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to test rules',
        message: error.message
      });
    }
  }
}

module.exports = RuleEngineController; 