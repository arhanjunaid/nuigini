// shared/database/models/AuditLog.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuditLog = sequelize.define(
    'AuditLog',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },

      entityType: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'entity_type'
      },

      entityId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'entity_id'
      },

      action: {
        type: DataTypes.STRING(50),
        allowNull: false
      },

      actorId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'actor_id',
        references: {
          model: 'users',
          key: 'id'
        }
      },

      before: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Entity state before change'
      },

      after: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Entity state after change'
      },

      metadata: {
        type: DataTypes.JSON,
        defaultValue: {},
        comment: 'Additional audit information'
      },

      ipAddress: {
        type: DataTypes.STRING(45),
        allowNull: true,
        field: 'ip_address'
      },

      userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'user_agent'
      }
    },
    {
      tableName: 'audit_logs',
      timestamps: true, // created_at / updated_at
      underscored: true,
      indexes: [
        { name: 'audit_logs_entity_type', fields: ['entity_type'] },
        { name: 'audit_logs_entity_id', fields: ['entity_id'] },
        { name: 'audit_logs_action', fields: ['action'] },
        { name: 'audit_logs_actor_id', fields: ['actor_id'] },
        { name: 'audit_logs_created_at', fields: ['created_at'] }
      ]
    }
  );

  return AuditLog;
};
