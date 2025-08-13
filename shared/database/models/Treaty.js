// shared/database/models/Treaty.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Treaty = sequelize.define(
    'Treaty',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },

      treatyNumber: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: 'treaty_number' // map to physical column (UNIQUE already in DB DDL)
      },

      name: {
        type: DataTypes.STRING(200),
        allowNull: false
      },

      type: {
        type: DataTypes.ENUM('QUOTA_SHARE', 'SURPLUS', 'EXCESS_OF_LOSS', 'FACULTATIVE'),
        allowNull: false
      },

      reinsurer: {
        type: DataTypes.STRING(200),
        allowNull: false
      },

      share: {
        type: DataTypes.DECIMAL(5, 4),
        allowNull: false,
        comment: 'Reinsurer share (e.g., 0.50 for 50%)'
      },

      commission: {
        type: DataTypes.DECIMAL(5, 4),
        allowNull: false,
        defaultValue: 0,
        comment: 'Commission rate (e.g., 0.25 for 25%)'
      },

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

      attachment: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Attachment point for XoL treaties'
      },

      limit: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Limit for XoL treaties'
        // physical column is `limit` in your DDL; no mapping needed
      },

      applicableLines: {
        type: DataTypes.JSON,
        defaultValue: [],
        field: 'applicable_lines',
        comment: 'Array of applicable lines of business'
      },

      status: {
        type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'EXPIRED'),
        defaultValue: 'ACTIVE'
      },

      metadata: {
        type: DataTypes.JSON,
        defaultValue: {}
      }
    },
    {
      tableName: 'treaties',
      indexes: [
        { name: 'treaties_treaty_number', fields: ['treaty_number'] },
        { name: 'treaties_type', fields: ['type'] },
        { name: 'treaties_reinsurer', fields: ['reinsurer'] },
        { name: 'treaties_status', fields: ['status'] },
        { name: 'treaties_inception_date', fields: ['inception_date'] },
        { name: 'treaties_expiry_date', fields: ['expiry_date'] }
      ]
    }
  );

  return Treaty;
};
