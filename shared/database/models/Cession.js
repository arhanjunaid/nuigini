// shared/database/models/Cession.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Cession = sequelize.define(
    'Cession',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },

      treatyId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'treaty_id',
        references: { model: 'treaties', key: 'id' }
      },

      policyId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'policy_id',
        references: { model: 'policies', key: 'id' }
      },

      claimId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'claim_id',
        references: { model: 'claims', key: 'id' }
      },

      cessionNumber: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: 'cession_number' // UNIQUE already in your DDL; don't set unique here
      },

      type: {
        type: DataTypes.ENUM('PREMIUM', 'CLAIM'),
        allowNull: false
      },

      grossAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        field: 'gross_amount'
      },

      cededAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        field: 'ceded_amount'
      },

      commission: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'commission'
      },

      netAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        field: 'net_amount'
      },

      effectiveDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'effective_date'
      },

      status: {
        type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'PAID', 'CANCELLED'),
        defaultValue: 'PENDING'
      },

      metadata: {
        type: DataTypes.JSON,
        defaultValue: {}
      }
    },
    {
      tableName: 'cessions',
      indexes: [
        { name: 'cessions_cession_number', fields: ['cession_number'] },
        { name: 'cessions_treaty_id', fields: ['treaty_id'] },
        { name: 'cessions_policy_id', fields: ['policy_id'] },
        { name: 'cessions_claim_id', fields: ['claim_id'] },
        { name: 'cessions_type', fields: ['type'] },
        { name: 'cessions_status', fields: ['status'] }
      ]
    }
  );

  return Cession;
};
