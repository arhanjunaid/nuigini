const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Policy = sequelize.define('Policy', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    policyNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      field: 'policy_number'
    },
    // Relationships
    quoteId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'quote_id',
      references: {
        model: 'quotes',
        key: 'id'
      }
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'customer_id',
      references: {
        model: 'parties',
        key: 'id'
      }
    },
    // Policy details
    lineOfBusiness: {
      type: DataTypes.ENUM('MOTOR', 'HOME', 'COMMERCIAL', 'LIFE', 'HEALTH'),
      allowNull: false,
      field: 'line_of_business'
    },
    productCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'product_code'
    },
    status: {
      type: DataTypes.ENUM('PENDING_BIND', 'ACTIVE', 'ENDORSED', 'RENEWAL_OFFERED', 'RENEWED', 'CANCELLED', 'LAPSED'),
      defaultValue: 'PENDING_BIND'
    },
    // Policy period
    inceptionDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'inception_date'
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expiry_date'
    },
    // Premium information
    annualPremium: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: 'annual_premium'
    },
    totalPremium: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: 'total_premium'
    },
    // Payment information
    paymentMethod: {
      type: DataTypes.ENUM('ANNUAL', 'MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL'),
      allowNull: false,
      field: 'payment_method'
    },
    paymentStatus: {
      type: DataTypes.ENUM('PENDING', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED'),
      defaultValue: 'PENDING',
      field: 'payment_status'
    },
    // Risk data snapshot
    riskData: {
      type: DataTypes.JSON,
      allowNull: false,
      field: 'risk_data',
      comment: 'Snapshot of risk data at bind'
    },
    // Timestamps
    boundAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'bound_at'
    },
    activatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'activated_at'
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'cancelled_at'
    },
    // Metadata
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    tableName: 'policies',
    indexes: [
      { fields: ['policy_number'] },
      { fields: ['status'] },
      { fields: ['customer_id'] },
      { fields: ['line_of_business'] },
      { fields: ['inception_date'] },
      { fields: ['expiry_date'] }
    ]
  });

  Policy.prototype.isActive = function() {
    return this.status === 'ACTIVE' || this.status === 'ENDORSED';
  };

  Policy.prototype.isExpired = function() {
    return new Date() > this.expiryDate;
  };

  Policy.prototype.canBeCancelled = function() {
    return ['ACTIVE', 'ENDORSED'].includes(this.status);
  };

  Policy.prototype.getDaysRemaining = function() {
    const now = new Date();
    const expiry = new Date(this.expiryDate);
    const diffTime = expiry - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return Policy;
}; 