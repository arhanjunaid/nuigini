// shared/database/models/Reserve.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Reserve = sequelize.define(
    'Reserve',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },

      claimId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'claim_id', // map to DB column
        references: {
          model: 'claims',
          key: 'id'
        }
      },

      component: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Reserve component (e.g., REPAIR, LOSS_OF_USE, LEGAL)'
      },

      initialAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        field: 'initial_amount'
      },

      currentAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        field: 'current_amount'
      },

      movement: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'movement',
        comment: 'Change in reserve amount'
      },

      reason: {
        type: DataTypes.TEXT,
        allowNull: true
      },

      approvedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'approved_by',
        references: {
          model: 'users',
          key: 'id'
        }
      },

      approvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'approved_at'
      },

      // Metadata
      metadata: {
        type: DataTypes.JSON,
        defaultValue: {}
      }
    },
    {
      tableName: 'reserves',
      indexes: [
        { name: 'reserves_claim_id', fields: ['claim_id'] },
        { name: 'reserves_component', fields: ['component'] },
        { name: 'reserves_approved_by', fields: ['approved_by'] }
      ]
    }
  );

  return Reserve;
};
