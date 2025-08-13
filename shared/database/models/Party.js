const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Party = sequelize.define('Party', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    type: {
      type: DataTypes.ENUM('INDIVIDUAL', 'ORGANIZATION'),
      allowNull: false
    },
    // Individual fields
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    gender: {
      type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER'),
      allowNull: true
    },
    // Organization fields
    organizationName: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    abn: {
      type: DataTypes.STRING(11),
      allowNull: true,
      validate: {
        len: [11, 11]
      }
    },
    acn: {
      type: DataTypes.STRING(9),
      allowNull: true,
      validate: {
        len: [9, 9]
      }
    },
    // Contact fields
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    mobile: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    // KYC/AML fields
    kycStatus: {
      type: DataTypes.ENUM('PENDING', 'VERIFIED', 'SOFT_FAIL', 'HARD_FAIL'),
      defaultValue: 'PENDING'
    },
    kycVerifiedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    sanctionsCheck: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    sanctionsResult: {
      type: DataTypes.ENUM('CLEAR', 'MATCH', 'PENDING'),
      defaultValue: 'PENDING'
    },
    sanctionsCheckedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Consent fields
    marketingConsent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    electronicCommsConsent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // Risk assessment
    riskScore: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100
      }
    },
    riskFactors: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    // Status
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    // Metadata
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
          }, {
            tableName: 'parties',
            indexes: [
              { fields: ['email'] },
              { fields: ['kyc_status'] },
              { fields: ['type'] },
              { fields: ['abn'] }
            ]
          });

  Party.prototype.getFullName = function() {
    if (this.type === 'INDIVIDUAL') {
      return `${this.firstName} ${this.lastName}`.trim();
    }
    return this.organizationName;
  };

  Party.prototype.isKYCVerified = function() {
    return this.kycStatus === 'VERIFIED';
  };

  Party.prototype.hasSanctionsMatch = function() {
    return this.sanctionsResult === 'MATCH';
  };

  return Party;
}; 