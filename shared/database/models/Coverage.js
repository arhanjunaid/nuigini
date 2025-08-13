const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Coverage = sequelize.define(
    'Coverage',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      quoteId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'quote_id', // maps to DB
        references: {
          model: 'quotes',
          key: 'id'
        }
      },
      policyId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'policy_id',
        references: {
          model: 'policies',
          key: 'id'
        }
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      sumInsured: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
      },
      excess: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      premium: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
      },
      limits: {
        type: DataTypes.JSON,
        defaultValue: {},
        comment: 'Coverage limits and sublimits'
      },
      conditions: {
        type: DataTypes.JSON,
        defaultValue: {},
        comment: 'Coverage conditions and exclusions'
      },
      isOptional: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      isSelected: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      metadata: {
        type: DataTypes.JSON,
        defaultValue: {}
      }
    },
    {
      tableName: 'coverages',
      indexes: [
        { name: 'coverages_quote_id', fields: ['quote_id'] }, // ✅ match physical column
        { name: 'coverages_policy_id', fields: ['policy_id'] }, // ✅ match physical column
        { fields: ['code'] }
      ]
    }
  );

  return Coverage;
};
