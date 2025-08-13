const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Lead = sequelize.define('Lead', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    leadNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    channel: {
      type: DataTypes.ENUM('WEB', 'BROKER', 'CALL_CENTRE', 'PARTNER', 'REFERRAL'),
      allowNull: false
    },
    source: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    lineOfBusiness: {
      type: DataTypes.ENUM('MOTOR', 'HOME', 'COMMERCIAL', 'LIFE', 'HEALTH'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('NEW', 'CONTACTED', 'QUALIFIED', 'DISQUALIFIED', 'CONVERTED_TO_QUOTE'),
      defaultValue: 'NEW'
    },
    priority: {
      type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
      defaultValue: 'MEDIUM'
    },
    // Customer information
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'parties',
        key: 'id'
      }
    },
    // Owner information
    ownerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    // Lead details
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    estimatedValue: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    expectedCloseDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    // Contact information
    contactMethod: {
      type: DataTypes.ENUM('EMAIL', 'PHONE', 'SMS', 'IN_PERSON'),
      allowNull: true
    },
    preferredContactTime: {
      type: DataTypes.ENUM('MORNING', 'AFTERNOON', 'EVENING', 'ANYTIME'),
      allowNull: true
    },
    // Marketing and tracking
    utmSource: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    utmMedium: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    utmCampaign: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    referrer: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    // Consent flags
    marketingConsent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    electronicCommsConsent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // Timestamps
    contactedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    qualifiedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    convertedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Notes and metadata
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
          }, {
            tableName: 'leads',
            indexes: [
              { fields: ['status'] },
              { fields: ['channel'] },
              { fields: ['line_of_business'] },
              { fields: ['owner_id'] },
              { fields: ['customer_id'] },
              { fields: ['created_at'] }
            ]
          });

  Lead.prototype.isQualified = function() {
    return this.status === 'QUALIFIED';
  };

  Lead.prototype.isConverted = function() {
    return this.status === 'CONVERTED_TO_QUOTE';
  };

  Lead.prototype.canBeConverted = function() {
    return ['NEW', 'CONTACTED', 'QUALIFIED'].includes(this.status);
  };

  return Lead;
}; 