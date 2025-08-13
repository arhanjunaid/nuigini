const { models } = require('../../../shared/database');
const RatingEngine = require('../services/RatingEngine');
const logger = require('../utils/logger');

class QuoteController {
  /**
   * Create a new quote
   */
  static async createQuote(req, res) {
    try {
      const quoteData = req.body;
      const actorId = req.user.id;

      // Generate quote number
      const quoteNumber = await this.generateQuoteNumber();

      // Create initial quote
      const quote = await models.Quote.create({
        ...quoteData,
        quoteNumber,
        status: 'DRAFT'
      });

      // Rate the quote
      const ratingEngine = new RatingEngine();
      const ratingResult = await ratingEngine.rateQuote(quote);

      // Update quote with rating results
      await quote.update({
        ...ratingResult,
        status: 'RATED',
        ratedAt: new Date()
      });

      // Execute underwriting rules
      const ruleEngine = require('../../rule-engine-service/services/RuleEngine');
      const ruleEngineInstance = new ruleEngine();
      const ruleResults = await ruleEngineInstance.executeRules({
        entityType: 'QUOTE',
        entityId: quote.id,
        context: quoteData.riskData,
        ruleTypes: ['UNDERWRITING'],
        actorId
      });

      // Update quote status based on rule results
      if (ruleResults.summary.declined > 0) {
        await quote.update({ status: 'DECLINED' });
      } else if (ruleResults.summary.referred > 0) {
        await quote.update({ status: 'REFERRED' });
      }

      // Get quote with associations
      const quoteWithAssociations = await models.Quote.findByPk(quote.id, {
        include: [
          {
            model: models.Party,
            as: 'customer',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          },
          {
            model: models.Lead,
            attributes: ['id', 'leadNumber', 'channel', 'source']
          }
        ]
      });

      res.status(201).json({
        success: true,
        data: {
          quote: quoteWithAssociations,
          ruleResults
        }
      });
    } catch (error) {
      logger.error('Error creating quote:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create quote',
        message: error.message
      });
    }
  }

  /**
   * Get quote by ID
   */
  static async getQuote(req, res) {
    try {
      const { id } = req.params;

      const quote = await models.Quote.findByPk(id, {
        include: [
          {
            model: models.Party,
            as: 'customer',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'type']
          },
          {
            model: models.Lead,
            attributes: ['id', 'leadNumber', 'channel', 'source']
          },
          {
            model: models.Coverage,
            attributes: ['id', 'code', 'sumInsured', 'excess', 'premium']
          }
        ]
      });

      if (!quote) {
        return res.status(404).json({
          success: false,
          error: 'Quote not found'
        });
      }

      res.status(200).json({
        success: true,
        data: quote
      });
    } catch (error) {
      logger.error('Error getting quote:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get quote',
        message: error.message
      });
    }
  }

  /**
   * Update quote (re-rate)
   */
  static async updateQuote(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const actorId = req.user.id;

      const quote = await models.Quote.findByPk(id);

      if (!quote) {
        return res.status(404).json({
          success: false,
          error: 'Quote not found'
        });
      }

      if (!['DRAFT', 'RATED', 'REFERRED'].includes(quote.status)) {
        return res.status(400).json({
          success: false,
          error: 'Quote cannot be updated in current status'
        });
      }

      // Update quote data
      await quote.update(updateData);

      // Re-rate the quote
      const ratingEngine = new RatingEngine();
      const ratingResult = await ratingEngine.rateQuote(quote);

      // Update quote with new rating
      await quote.update({
        ...ratingResult,
        status: 'RATED',
        ratedAt: new Date()
      });

      // Execute underwriting rules again
      const ruleEngine = require('../../rule-engine-service/services/RuleEngine');
      const ruleEngineInstance = new ruleEngine();
      const ruleResults = await ruleEngineInstance.executeRules({
        entityType: 'QUOTE',
        entityId: quote.id,
        context: updateData.riskData || quote.riskData,
        ruleTypes: ['UNDERWRITING'],
        actorId
      });

      // Update quote status based on rule results
      if (ruleResults.summary.declined > 0) {
        await quote.update({ status: 'DECLINED' });
      } else if (ruleResults.summary.referred > 0) {
        await quote.update({ status: 'REFERRED' });
      }

      res.status(200).json({
        success: true,
        data: {
          quote,
          ruleResults
        }
      });
    } catch (error) {
      logger.error('Error updating quote:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update quote',
        message: error.message
      });
    }
  }

  /**
   * Accept quote
   */
  static async acceptQuote(req, res) {
    try {
      const { id } = req.params;
      const { acceptedAt } = req.body;
      const actorId = req.user.id;

      const quote = await models.Quote.findByPk(id);

      if (!quote) {
        return res.status(404).json({
          success: false,
          error: 'Quote not found'
        });
      }

      if (!quote.canBeAccepted()) {
        return res.status(400).json({
          success: false,
          error: 'Quote cannot be accepted in current status'
        });
      }

      // Update quote status
      await quote.update({
        status: 'ACCEPTED',
        acceptedAt: acceptedAt || new Date()
      });

      res.status(200).json({
        success: true,
        data: quote
      });
    } catch (error) {
      logger.error('Error accepting quote:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to accept quote',
        message: error.message
      });
    }
  }

  /**
   * List quotes with filters
   */
  static async listQuotes(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        lineOfBusiness,
        customerId,
        startDate,
        endDate
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Apply filters
      if (status) whereClause.status = status;
      if (lineOfBusiness) whereClause.lineOfBusiness = lineOfBusiness;
      if (customerId) whereClause.customerId = customerId;

      if (startDate && endDate) {
        whereClause.createdAt = {
          [models.Sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const { count, rows: quotes } = await models.Quote.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: models.Party,
            as: 'customer',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          },
          {
            model: models.Lead,
            attributes: ['id', 'leadNumber', 'channel']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.status(200).json({
        success: true,
        data: {
          quotes,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count,
            pages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      logger.error('Error listing quotes:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list quotes',
        message: error.message
      });
    }
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

module.exports = QuoteController; 