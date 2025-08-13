const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Quote = sequelize.define('Quote', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    quoteNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    // Relationships
    leadId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'leads',
        key: 'id'
      }
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'parties',
        key: 'id'
      }
    },
    // Quote details
    lineOfBusiness: {
      type: DataTypes.ENUM('MOTOR', 'HOME', 'COMMERCIAL', 'LIFE', 'HEALTH'),
      allowNull: false
    },
    productCode: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('DRAFT', 'RATED', 'REFERRED', 'ACCEPTED', 'EXPIRED', 'DECLINED'),
      defaultValue: 'DRAFT'
    },
    // Risk data
    riskData: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Structured risk information specific to LOB'
    },
    // Rating information
    ratingVersion: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    ratingEngine: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    // Premium breakdown
    basePremiumExTax: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    feesExTax: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    premiumBeforeTax: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    gst: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    stampDuty: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    esl: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    totalPayable: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    // Tax details
    gstRate: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      defaultValue: 0.10
    },
    stampDutyRate: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      defaultValue: 0
    },
    eslRate: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      defaultValue: 0
    },
    // State and jurisdiction
    state: {
      type: DataTypes.ENUM('NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'),
      allowNull: false
    },
    // Underwriting
    uwReferralReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    uwDecision: {
      type: DataTypes.ENUM('PENDING', 'ACCEPT', 'DECLINE', 'ACCEPT_WITH_CONDITIONS'),
      allowNull: true
    },
    uwDecisionBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    uwDecisionAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    uwNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Validity
    validFrom: {
      type: DataTypes.DATE,
      allowNull: false
    },
    validTo: {
      type: DataTypes.DATE,
      allowNull: false
    },
    // Timestamps
    ratedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    acceptedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    expiredAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Metadata
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
          }, {
            tableName: 'quotes',
            indexes: [
              { fields: ['status'] },
              { fields: ['line_of_business'] },
              { fields: ['customer_id'] },
              { fields: ['lead_id'] },
              { fields: ['valid_to'] },
              { fields: ['created_at'] }
            ]
          });

  Quote.prototype.isValid = function() {
    return new Date() <= this.validTo;
  };

  Quote.prototype.isExpired = function() {
    return new Date() > this.validTo;
  };

  Quote.prototype.canBeAccepted = function() {
    return this.status === 'RATED' && this.isValid();
  };

  Quote.prototype.calculateTotal = function() {
    this.premiumBeforeTax = parseFloat(this.basePremiumExTax) + parseFloat(this.feesExTax);
    this.gst = Math.round((this.premiumBeforeTax * this.gstRate) * 100) / 100;
    this.stampDuty = Math.round((this.premiumBeforeTax * this.stampDutyRate) * 100) / 100;
    this.esl = Math.round((this.premiumBeforeTax * this.eslRate) * 100) / 100;
    this.totalPayable = this.premiumBeforeTax + this.gst + this.stampDuty + this.esl;
  };

  return Quote;
}; 