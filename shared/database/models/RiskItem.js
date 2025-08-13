const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RiskItem = sequelize.define(
    'RiskItem',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      addressId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'address_id',
        references: {
          model: 'addresses',
          key: 'id'
        }
      },
      type: {
        type: DataTypes.ENUM('VEHICLE', 'PROPERTY', 'BUSINESS', 'PERSONAL_EFFECTS'),
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      registrationNumber: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'registration_number'
      },
      vehicleMake: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'vehicle_make'
      },
      vehicleModel: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'vehicle_model'
      },
      vehicleYear: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'vehicle_year'
      },
      vehicleValue: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        field: 'vehicle_value'
      },
      propertyType: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'property_type'
      },
      constructionType: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'construction_type'
      },
      yearBuilt: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'year_built'
      },
      propertyValue: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        field: 'property_value'
      },
      businessType: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'business_type'
      },
      annualTurnover: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        field: 'annual_turnover'
      },
      employeeCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'employee_count'
      },
      riskScore: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 100
        },
        field: 'risk_score'
      },
      riskFactors: {
        type: DataTypes.JSON,
        defaultValue: [],
        field: 'risk_factors'
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
      },
      metadata: {
        type: DataTypes.JSON,
        defaultValue: {}
      }
    },
    {
      tableName: 'risk_items',
      indexes: [
        { fields: ['type'] },
        { name: 'idx_registration_number', fields: ['registration_number'] },
        { name: 'idx_address_id', fields: ['address_id'] }
      ]
    }
  );

  return RiskItem;
};
