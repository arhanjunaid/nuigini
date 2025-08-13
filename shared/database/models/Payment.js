const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
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
    claimId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'claim_id',
      references: {
        model: 'claims',
        key: 'id'
      }
    },
    payeeId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'payee_id',
      references: {
        model: 'parties',
        key: 'id'
      }
    },
    paymentNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'payment_number'
      // don't add unique: true if DB already has it
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'AUD'
    },
    method: {
      type: DataTypes.ENUM('CARD', 'BANK_TRANSFER', 'DIRECT_DEBIT', 'BPAY', 'CASH'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'CANCELLED', 'REFUNDED'),
      defaultValue: 'PENDING'
    },
    type: {
      type: DataTypes.ENUM('PREMIUM', 'CLAIM', 'REFUND', 'COMMISSION'),
      allowNull: false
    },
    component: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Payment component (e.g., REPAIR, LOSS_OF_USE)'
    },
    gatewayReference: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'gateway_reference'
    },
    gatewayResponse: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'gateway_response'
    },
    bankDetails: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'bank_details'
    },
    authorizedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'authorized_at'
    },
    capturedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'captured_at'
    },
    failedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'failed_at'
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    tableName: 'payments',
    indexes: [
      { fields: ['payment_number'] },
      { fields: ['policy_id'] },
      { fields: ['claim_id'] },
      { fields: ['status'] },
      { fields: ['type'] }
    ]
  });

  return Payment;
};
