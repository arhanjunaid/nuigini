const { models } = require('../../../shared/database');
const logger = require('../utils/logger');

class RatingEngine {
  constructor() {
    this.ratingTables = new Map();
    this.dutyRates = new Map();
    this.eslRates = new Map();
  }

  /**
   * Rate a quote and calculate premium
   */
  async rateQuote(quote) {
    try {
      const riskData = quote.riskData;
      const lineOfBusiness = quote.lineOfBusiness;
      const state = quote.state;

      // Calculate base premium
      const basePremium = await this.calculateBasePremium(lineOfBusiness, riskData);

      // Apply loadings and discounts
      const adjustedPremium = await this.applyLoadingsAndDiscounts(basePremium, riskData);

      // Calculate fees
      const fees = await this.calculateFees(adjustedPremium, lineOfBusiness);

      // Calculate taxes
      const taxes = await this.calculateTaxes(adjustedPremium + fees, state, lineOfBusiness);

      // Calculate total
      const totalPayable = adjustedPremium + fees + taxes.gst + taxes.stampDuty + taxes.esl;

      return {
        basePremiumExTax: basePremium,
        feesExTax: fees,
        premiumBeforeTax: adjustedPremium + fees,
        gst: taxes.gst,
        stampDuty: taxes.stampDuty,
        esl: taxes.esl,
        totalPayable: totalPayable,
        gstRate: 0.10,
        stampDutyRate: taxes.stampDutyRate,
        eslRate: taxes.eslRate
      };
    } catch (error) {
      logger.error('Error rating quote:', error);
      throw error;
    }
  }

  /**
   * Calculate base premium from rating tables
   */
  async calculateBasePremium(lineOfBusiness, riskData) {
    try {
      // Get rating table for the line of business
      const ratingTable = await this.getRatingTable(lineOfBusiness);
      
      let basePremium = 0;

      switch (lineOfBusiness) {
        case 'MOTOR':
          basePremium = await this.calculateMotorPremium(ratingTable, riskData);
          break;
        case 'HOME':
          basePremium = await this.calculateHomePremium(ratingTable, riskData);
          break;
        case 'COMMERCIAL':
          basePremium = await this.calculateCommercialPremium(ratingTable, riskData);
          break;
        default:
          throw new Error(`Unsupported line of business: ${lineOfBusiness}`);
      }

      return basePremium;
    } catch (error) {
      logger.error('Error calculating base premium:', error);
      throw error;
    }
  }

  /**
   * Calculate motor insurance premium
   */
  async calculateMotorPremium(ratingTable, riskData) {
    const {
      vehicleMake,
      vehicleModel,
      vehicleYear,
      driverAge,
      driverLicenseType,
      driverClaimsHistory,
      vehicleValue,
      excess
    } = riskData;

    // Base rate from rating table
    let baseRate = ratingTable.baseRate || 0.05;

    // Age factor
    const ageFactor = this.getAgeFactor(driverAge);
    baseRate *= ageFactor;

    // Claims history factor
    const claimsFactor = this.getClaimsFactor(driverClaimsHistory);
    baseRate *= claimsFactor;

    // License type factor
    const licenseFactor = this.getLicenseFactor(driverLicenseType);
    baseRate *= licenseFactor;

    // Vehicle value factor
    const valueFactor = this.getValueFactor(vehicleValue);
    baseRate *= valueFactor;

    // Calculate premium
    const premium = vehicleValue * baseRate;

    // Apply excess adjustment
    const excessAdjustment = this.getExcessAdjustment(excess);
    return premium * excessAdjustment;
  }

  /**
   * Calculate home insurance premium
   */
  async calculateHomePremium(ratingTable, riskData) {
    const {
      propertyType,
      constructionType,
      yearBuilt,
      sumInsured,
      location,
      securityFeatures
    } = riskData;

    // Base rate from rating table
    let baseRate = ratingTable.baseRate || 0.02;

    // Property type factor
    const propertyFactor = this.getPropertyTypeFactor(propertyType);
    baseRate *= propertyFactor;

    // Construction factor
    const constructionFactor = this.getConstructionFactor(constructionType);
    baseRate *= constructionFactor;

    // Age factor
    const ageFactor = this.getPropertyAgeFactor(yearBuilt);
    baseRate *= ageFactor;

    // Location factor
    const locationFactor = await this.getLocationFactor(location);
    baseRate *= locationFactor;

    // Security features discount
    const securityDiscount = this.getSecurityDiscount(securityFeatures);
    baseRate *= (1 - securityDiscount);

    // Calculate premium
    return sumInsured * baseRate;
  }

  /**
   * Calculate commercial insurance premium
   */
  async calculateCommercialPremium(ratingTable, riskData) {
    const {
      businessType,
      annualTurnover,
      employeeCount,
      sumInsured,
      location
    } = riskData;

    // Base rate from rating table
    let baseRate = ratingTable.baseRate || 0.03;

    // Business type factor
    const businessFactor = this.getBusinessTypeFactor(businessType);
    baseRate *= businessFactor;

    // Turnover factor
    const turnoverFactor = this.getTurnoverFactor(annualTurnover);
    baseRate *= turnoverFactor;

    // Employee factor
    const employeeFactor = this.getEmployeeFactor(employeeCount);
    baseRate *= employeeFactor;

    // Location factor
    const locationFactor = await this.getLocationFactor(location);
    baseRate *= locationFactor;

    // Calculate premium
    return sumInsured * baseRate;
  }

  /**
   * Apply loadings and discounts
   */
  async applyLoadingsAndDiscounts(basePremium, riskData) {
    let adjustedPremium = basePremium;

    // Apply rating rules
    const ruleEngine = require('../../rule-engine-service/services/RuleEngine');
    const ruleEngineInstance = new ruleEngine();
    const ruleResults = await ruleEngineInstance.executeRules({
      entityType: 'QUOTE',
      entityId: 'temp',
      context: riskData,
      ruleTypes: ['RATING'],
      testMode: true
    });

    // Apply adjustments from rating rules
    ruleResults.rules.forEach(rule => {
      if (rule.adjustment) {
        adjustedPremium += rule.adjustment;
      }
    });

    return Math.max(adjustedPremium, 0); // Ensure premium is not negative
  }

  /**
   * Calculate fees
   */
  async calculateFees(premium, lineOfBusiness) {
    const fees = {
      policyFee: 50.00,
      underwritingFee: premium * 0.05, // 5% of premium
      brokerageFee: premium * 0.10 // 10% of premium
    };

    return fees.policyFee + fees.underwritingFee + fees.brokerageFee;
  }

  /**
   * Calculate taxes
   */
  async calculateTaxes(premiumBeforeTax, state, lineOfBusiness) {
    // GST (10%)
    const gst = Math.round((premiumBeforeTax * 0.10) * 100) / 100;

    // Stamp Duty (varies by state and class)
    const stampDutyRate = await this.getStampDutyRate(state, lineOfBusiness);
    const stampDuty = Math.round((premiumBeforeTax * stampDutyRate) * 100) / 100;

    // ESL (NSW only)
    let esl = 0;
    let eslRate = 0;
    if (state === 'NSW') {
      eslRate = await this.getESLRate(lineOfBusiness);
      esl = Math.round((premiumBeforeTax * eslRate) * 100) / 100;
    }

    return {
      gst,
      stampDuty,
      esl,
      stampDutyRate,
      eslRate
    };
  }

  /**
   * Get rating table
   */
  async getRatingTable(lineOfBusiness) {
    if (this.ratingTables.has(lineOfBusiness)) {
      return this.ratingTables.get(lineOfBusiness);
    }

    const ratingTable = await models.RatingTable.findOne({
      where: {
        lineOfBusiness,
        isActive: true
      },
      order: [['version', 'DESC']]
    });

    if (ratingTable) {
      this.ratingTables.set(lineOfBusiness, ratingTable);
      return ratingTable;
    }

    // Return default rating table
    return {
      baseRate: 0.05,
      factors: {}
    };
  }

  /**
   * Get stamp duty rate
   */
  async getStampDutyRate(state, lineOfBusiness) {
    const key = `${state}-${lineOfBusiness}`;
    
    if (this.dutyRates.has(key)) {
      return this.dutyRates.get(key);
    }

    // Default rates (in production, these would come from database)
    const defaultRates = {
      'NSW-MOTOR': 0.05,
      'NSW-HOME': 0.04,
      'NSW-COMMERCIAL': 0.06,
      'VIC-MOTOR': 0.05,
      'VIC-HOME': 0.04,
      'VIC-COMMERCIAL': 0.06,
      'QLD-MOTOR': 0.05,
      'QLD-HOME': 0.04,
      'QLD-COMMERCIAL': 0.06
    };

    const rate = defaultRates[key] || 0.05;
    this.dutyRates.set(key, rate);
    return rate;
  }

  /**
   * Get ESL rate
   */
  async getESLRate(lineOfBusiness) {
    const key = lineOfBusiness;
    
    if (this.eslRates.has(key)) {
      return this.eslRates.get(key);
    }

    // Default ESL rates (NSW only)
    const defaultRates = {
      'MOTOR': 0.005,
      'HOME': 0.003,
      'COMMERCIAL': 0.004
    };

    const rate = defaultRates[key] || 0.005;
    this.eslRates.set(key, rate);
    return rate;
  }

  // Helper methods for rating factors
  getAgeFactor(age) {
    if (age < 25) return 1.5;
    if (age < 30) return 1.3;
    if (age < 50) return 1.0;
    if (age < 65) return 1.1;
    return 1.2;
  }

  getClaimsFactor(claims) {
    if (claims === 0) return 0.8;
    if (claims === 1) return 1.0;
    if (claims === 2) return 1.3;
    return 1.8;
  }

  getLicenseFactor(licenseType) {
    const factors = {
      'LEARNER': 1.5,
      'PROVISIONAL': 1.3,
      'FULL': 1.0
    };
    return factors[licenseType] || 1.0;
  }

  getValueFactor(value) {
    if (value < 10000) return 1.2;
    if (value < 25000) return 1.0;
    if (value < 50000) return 0.9;
    return 0.8;
  }

  getExcessAdjustment(excess) {
    if (excess <= 500) return 1.0;
    if (excess <= 1000) return 0.9;
    if (excess <= 2000) return 0.8;
    return 0.7;
  }

  getPropertyTypeFactor(propertyType) {
    const factors = {
      'HOUSE': 1.0,
      'UNIT': 0.9,
      'TOWNHOUSE': 1.1,
      'APARTMENT': 0.8
    };
    return factors[propertyType] || 1.0;
  }

  getConstructionFactor(constructionType) {
    const factors = {
      'BRICK': 0.9,
      'TIMBER': 1.1,
      'STEEL': 0.8,
      'CONCRETE': 0.9
    };
    return factors[constructionType] || 1.0;
  }

  getPropertyAgeFactor(yearBuilt) {
    const currentYear = new Date().getFullYear();
    const age = currentYear - yearBuilt;
    
    if (age < 10) return 1.0;
    if (age < 20) return 1.1;
    if (age < 30) return 1.2;
    return 1.3;
  }

  async getLocationFactor(location) {
    // In production, this would call a geocoding service
    // For now, return a default factor
    return 1.0;
  }

  getSecurityDiscount(securityFeatures) {
    let discount = 0;
    if (securityFeatures.includes('ALARM')) discount += 0.05;
    if (securityFeatures.includes('CCTV')) discount += 0.03;
    if (securityFeatures.includes('SECURITY_GUARD')) discount += 0.08;
    return Math.min(discount, 0.15); // Max 15% discount
  }

  getBusinessTypeFactor(businessType) {
    const factors = {
      'RETAIL': 1.0,
      'OFFICE': 0.8,
      'MANUFACTURING': 1.3,
      'WAREHOUSE': 1.1,
      'RESTAURANT': 1.2
    };
    return factors[businessType] || 1.0;
  }

  getTurnoverFactor(turnover) {
    if (turnover < 100000) return 0.8;
    if (turnover < 500000) return 1.0;
    if (turnover < 2000000) return 1.2;
    return 1.5;
  }

  getEmployeeFactor(employeeCount) {
    if (employeeCount < 5) return 0.8;
    if (employeeCount < 20) return 1.0;
    if (employeeCount < 50) return 1.2;
    return 1.5;
  }
}

module.exports = RatingEngine; 