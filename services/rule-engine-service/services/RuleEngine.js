const { models } = require('../../../shared/database');
const logger = require('../utils/logger');

class RuleEngine {
  constructor() {
    this.ruleProcessors = {
      UNDERWRITING: this.processUnderwritingRules.bind(this),
      RATING: this.processRatingRules.bind(this),
      CLAIMS: this.processClaimsRules.bind(this),
      COMPLIANCE: this.processComplianceRules.bind(this)
    };
  }

  /**
   * Execute rules for a given context
   */
  async executeRules({ entityType, entityId, context, ruleTypes = [], actorId, testMode = false }) {
    const results = {
      entityType,
      entityId,
      executedAt: new Date().toISOString(),
      rules: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        referred: 0,
        declined: 0
      }
    };

    try {
      // Get applicable rules
      const rules = await this.getApplicableRules(entityType, ruleTypes);
      
      // Execute each rule type
      for (const ruleType of ruleTypes) {
        if (this.ruleProcessors[ruleType]) {
          const ruleResults = await this.ruleProcessors[ruleType](rules, context);
          results.rules.push(...ruleResults);
          
          // Update summary
          ruleResults.forEach(rule => {
            results.summary.total++;
            if (rule.result === 'PASS') results.summary.passed++;
            if (rule.result === 'FAIL') results.summary.failed++;
            if (rule.result === 'REFER') results.summary.referred++;
            if (rule.result === 'DECLINE') results.summary.declined++;
          });
        }
      }

      // Log execution if not in test mode
      if (!testMode) {
        await this.logExecution(entityType, entityId, results, actorId);
      }

      return results;
    } catch (error) {
      logger.error('Error in rule execution:', error);
      throw error;
    }
  }

  /**
   * Get applicable rules for entity type and rule types
   */
  async getApplicableRules(entityType, ruleTypes) {
    const whereClause = {
      isActive: true
    };

    if (ruleTypes.length > 0) {
      whereClause.ruleType = {
        [models.Sequelize.Op.in]: ruleTypes
      };
    }

    if (entityType) {
      whereClause.applicableEntities = {
        [models.Sequelize.Op.like]: `%${entityType}%`
      };
    }

    return await models.UWRule.findAll({
      where: whereClause,
      order: [['priority', 'ASC'], ['createdAt', 'ASC']]
    });
  }

  /**
   * Process underwriting rules
   */
  async processUnderwritingRules(rules, context) {
    const results = [];
    
    for (const rule of rules.filter(r => r.ruleType === 'UNDERWRITING')) {
      try {
        const result = await this.evaluateRule(rule, context);
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          ruleType: 'UNDERWRITING',
          condition: rule.condition,
          action: rule.action,
          result: result.passed ? 'PASS' : 'FAIL',
          details: result.details,
          executedAt: new Date().toISOString()
        });
      } catch (error) {
        logger.error(`Error evaluating underwriting rule ${rule.id}:`, error);
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          ruleType: 'UNDERWRITING',
          result: 'ERROR',
          error: error.message,
          executedAt: new Date().toISOString()
        });
      }
    }

    return results;
  }

  /**
   * Process rating rules
   */
  async processRatingRules(rules, context) {
    const results = [];
    
    for (const rule of rules.filter(r => r.ruleType === 'RATING')) {
      try {
        const result = await this.evaluateRatingRule(rule, context);
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          ruleType: 'RATING',
          condition: rule.condition,
          action: rule.action,
          result: 'PASS',
          adjustment: result.adjustment,
          details: result.details,
          executedAt: new Date().toISOString()
        });
      } catch (error) {
        logger.error(`Error evaluating rating rule ${rule.id}:`, error);
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          ruleType: 'RATING',
          result: 'ERROR',
          error: error.message,
          executedAt: new Date().toISOString()
        });
      }
    }

    return results;
  }

  /**
   * Process claims rules
   */
  async processClaimsRules(rules, context) {
    const results = [];
    
    for (const rule of rules.filter(r => r.ruleType === 'CLAIMS')) {
      try {
        const result = await this.evaluateRule(rule, context);
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          ruleType: 'CLAIMS',
          condition: rule.condition,
          action: rule.action,
          result: result.passed ? 'PASS' : 'FAIL',
          details: result.details,
          executedAt: new Date().toISOString()
        });
      } catch (error) {
        logger.error(`Error evaluating claims rule ${rule.id}:`, error);
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          ruleType: 'CLAIMS',
          result: 'ERROR',
          error: error.message,
          executedAt: new Date().toISOString()
        });
      }
    }

    return results;
  }

  /**
   * Process compliance rules
   */
  async processComplianceRules(rules, context) {
    const results = [];
    
    for (const rule of rules.filter(r => r.ruleType === 'COMPLIANCE')) {
      try {
        const result = await this.evaluateRule(rule, context);
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          ruleType: 'COMPLIANCE',
          condition: rule.condition,
          action: rule.action,
          result: result.passed ? 'PASS' : 'FAIL',
          details: result.details,
          executedAt: new Date().toISOString()
        });
      } catch (error) {
        logger.error(`Error evaluating compliance rule ${rule.id}:`, error);
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          ruleType: 'COMPLIANCE',
          result: 'ERROR',
          error: error.message,
          executedAt: new Date().toISOString()
        });
      }
    }

    return results;
  }

  /**
   * Evaluate a rule condition
   */
  async evaluateRule(rule, context) {
    try {
      // Parse the condition (JSON-based rule definition)
      const condition = JSON.parse(rule.condition);
      const passed = await this.evaluateCondition(condition, context);
      
      return {
        passed,
        details: {
          condition: condition,
          context: this.sanitizeContext(context),
          evaluatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      throw new Error(`Failed to evaluate rule condition: ${error.message}`);
    }
  }

  /**
   * Evaluate rating rule and return adjustment
   */
  async evaluateRatingRule(rule, context) {
    try {
      const condition = JSON.parse(rule.condition);
      const action = JSON.parse(rule.action);
      
      const passed = await this.evaluateCondition(condition, context);
      
      if (passed) {
        return {
          adjustment: action.adjustment || 0,
          details: {
            condition: condition,
            action: action,
            context: this.sanitizeContext(context),
            evaluatedAt: new Date().toISOString()
          }
        };
      }
      
      return {
        adjustment: 0,
        details: {
          condition: condition,
          context: this.sanitizeContext(context),
          evaluatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      throw new Error(`Failed to evaluate rating rule: ${error.message}`);
    }
  }

  /**
   * Evaluate a condition against context
   */
  async evaluateCondition(condition, context) {
    const { operator, field, value, conditions } = condition;

    switch (operator) {
      case 'AND':
        return conditions.every(cond => this.evaluateCondition(cond, context));
      
      case 'OR':
        return conditions.some(cond => this.evaluateCondition(cond, context));
      
      case 'NOT':
        return !this.evaluateCondition(conditions[0], context);
      
      case 'EQUALS':
        return this.getFieldValue(context, field) === value;
      
      case 'NOT_EQUALS':
        return this.getFieldValue(context, field) !== value;
      
      case 'GREATER_THAN':
        return this.getFieldValue(context, field) > value;
      
      case 'LESS_THAN':
        return this.getFieldValue(context, field) < value;
      
      case 'GREATER_EQUAL':
        return this.getFieldValue(context, field) >= value;
      
      case 'LESS_EQUAL':
        return this.getFieldValue(context, field) <= value;
      
      case 'CONTAINS':
        return this.getFieldValue(context, field).includes(value);
      
      case 'IN':
        return value.includes(this.getFieldValue(context, field));
      
      case 'NOT_IN':
        return !value.includes(this.getFieldValue(context, field));
      
      case 'IS_NULL':
        return this.getFieldValue(context, field) === null || this.getFieldValue(context, field) === undefined;
      
      case 'IS_NOT_NULL':
        return this.getFieldValue(context, field) !== null && this.getFieldValue(context, field) !== undefined;
      
      default:
        throw new Error(`Unknown operator: ${operator}`);
    }
  }

  /**
   * Get field value from context using dot notation
   */
  getFieldValue(context, field) {
    return field.split('.').reduce((obj, key) => obj && obj[key], context);
  }

  /**
   * Sanitize context for logging (remove sensitive data)
   */
  sanitizeContext(context) {
    const sanitized = { ...context };
    const sensitiveFields = ['password', 'cardNumber', 'cvv', 'ssn', 'abn'];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });
    
    return sanitized;
  }

  /**
   * Log rule execution
   */
  async logExecution(entityType, entityId, results, actorId) {
    try {
      await models.AuditLog.create({
        entityType,
        entityId,
        action: 'RULE_EXECUTION',
        actorId,
        before: null,
        after: results,
        metadata: {
          ruleTypes: results.rules.map(r => r.ruleType),
          summary: results.summary
        }
      });
    } catch (error) {
      logger.error('Failed to log rule execution:', error);
    }
  }
}

module.exports = RuleEngine; 