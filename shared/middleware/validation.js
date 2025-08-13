const Joi = require('joi');

/**
 * Validate login request
 */
const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }

  next();
};

/**
 * Validate registration request
 */
const validateRegister = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    roleId: Joi.string().uuid().optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }

  next();
};

/**
 * Validate lead creation/update
 */
const validateLead = (req, res, next) => {
  const schema = Joi.object({
    channel: Joi.string().valid('WEB', 'BROKER', 'CALL_CENTRE', 'PARTNER', 'REFERRAL').required(),
    source: Joi.string().optional(),
    lineOfBusiness: Joi.string().valid('MOTOR', 'HOME', 'COMMERCIAL', 'LIFE', 'HEALTH').required(),
    customerId: Joi.string().uuid().required(),
    description: Joi.string().optional(),
    estimatedValue: Joi.number().positive().optional(),
    contactMethod: Joi.string().valid('EMAIL', 'PHONE', 'SMS', 'IN_PERSON').optional(),
    preferredContactTime: Joi.string().valid('MORNING', 'AFTERNOON', 'EVENING', 'ANYTIME').optional(),
    marketingConsent: Joi.boolean().optional(),
    electronicCommsConsent: Joi.boolean().optional(),
    utmSource: Joi.string().optional(),
    utmMedium: Joi.string().optional(),
    utmCampaign: Joi.string().optional(),
    referrer: Joi.string().optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }

  next();
};

/**
 * Validate quote creation/update
 */
const validateQuote = (req, res, next) => {
  const schema = Joi.object({
    customerId: Joi.string().uuid().required(),
    lineOfBusiness: Joi.string().valid('MOTOR', 'HOME', 'COMMERCIAL', 'LIFE', 'HEALTH').required(),
    productCode: Joi.string().required(),
    riskData: Joi.object().required(),
    state: Joi.string().valid('NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT').required(),
    validFrom: Joi.date().required(),
    validTo: Joi.date().greater(Joi.ref('validFrom')).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }

  next();
};

/**
 * Validate rule execution
 */
const validateRuleExecution = (req, res, next) => {
  const schema = Joi.object({
    entityType: Joi.string().valid('QUOTE', 'POLICY', 'CLAIM').required(),
    entityId: Joi.string().required(),
    ruleTypes: Joi.array().items(Joi.string().valid('UNDERWRITING', 'RATING', 'CLAIMS', 'COMPLIANCE')).required(),
    context: Joi.object().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }

  next();
};

/**
 * Validate policy creation
 */
const validatePolicy = (req, res, next) => {
  const schema = Joi.object({
    quoteId: Joi.string().uuid().required(),
    inceptionDate: Joi.date().required(),
    expiryDate: Joi.date().greater(Joi.ref('inceptionDate')).required(),
    paymentMethod: Joi.string().valid('ANNUAL', 'MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL').required(),
    paymentDetails: Joi.object().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }

  next();
};

/**
 * Validate claim creation
 */
const validateClaim = (req, res, next) => {
  const schema = Joi.object({
    policyId: Joi.string().uuid().required(),
    incidentDate: Joi.date().required(),
    incidentType: Joi.string().valid('COLLISION', 'THEFT', 'FIRE', 'STORM', 'OTHER').required(),
    description: Joi.string().required(),
    location: Joi.object({
      address: Joi.string().required(),
      latitude: Joi.number().min(-90).max(90).optional(),
      longitude: Joi.number().min(-180).max(180).optional()
    }).required(),
    estimatedDamage: Joi.number().positive().optional(),
    policeReport: Joi.boolean().optional(),
    policeReportNumber: Joi.string().optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }

  next();
};

module.exports = {
  validateLogin,
  validateRegister,
  validateLead,
  validateQuote,
  validateRuleExecution,
  validatePolicy,
  validateClaim
}; 