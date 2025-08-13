// shared/database/models/RatingTable.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RatingTable = sequelize.define(
    'RatingTable',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },

      name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },

      lineOfBusiness: {
        type: DataTypes.ENUM('MOTOR', 'HOME', 'COMMERCIAL', 'LIFE', 'HEALTH'),
        allowNull: false,
        field: 'line_of_business' // maps camelCase to DB column
      },

      version: {
        type: DataTypes.STRING(20),
        allowNull: false
      },

      baseRate: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: false,
        field: 'base_rate'
      },

      factors: {
        type: DataTypes.JSON,
        defaultValue: {},
        comment: 'Rating factors and tables'
      },

      effectiveFrom: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'effective_from'
      },

      effectiveTo: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'effective_to'
      },

      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
      },

      createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'created_by'
      },

      approvedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'approved_by'
      },

      approvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'approved_at'
      },

      metadata: {
        type: DataTypes.JSON,
        defaultValue: {}
      }
    },
    {
      tableName: 'rating_tables',
      timestamps: true,  // created_at / updated_at
      underscored: true, // ensures snake_case in DB
      indexes: [
        { name: 'rating_tables_line_of_business', fields: ['line_of_business'] },
        { name: 'rating_tables_version', fields: ['version'] },
        { name: 'rating_tables_is_active', fields: ['is_active'] },
        { name: 'rating_tables_effective_from', fields: ['effective_from'] },
        { name: 'rating_tables_effective_to', fields: ['effective_to'] }
      ]
    }
  );

  return RatingTable;
};
