// shared/database/models/UWRule.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UWRule = sequelize.define(
    'UWRule',
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

      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },

      ruleType: {
        type: DataTypes.ENUM('UNDERWRITING', 'RATING', 'CLAIMS', 'COMPLIANCE'),
        allowNull: false,
        field: 'rule_type'
      },

      priority: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Lower number = higher priority'
      },

      // Rule definition
      condition: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'JSON string defining the rule condition'
      },

      action: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'JSON string defining the rule action'
      },

      // Applicability
      applicableEntities: {
        type: DataTypes.STRING(200),
        allowNull: false,
        defaultValue: 'QUOTE,POLICY',
        field: 'applicable_entities',
        comment: 'Comma-separated list of entity types this rule applies to'
      },

      applicableLines: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'applicable_lines',
        comment: 'Comma-separated list of lines of business this rule applies to'
      },

      applicableStates: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'applicable_states',
        comment: 'Comma-separated list of states this rule applies to'
      },

      // Status & versioning
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
      },

      version: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      },

      effectiveFrom: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'effective_from'
      },

      effectiveTo: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'effective_to'
      },

      // Audit
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

      // Metadata
      metadata: {
        type: DataTypes.JSON,
        defaultValue: {}
      }
    },
    {
      tableName: 'uw_rules',
      timestamps: true,       // uses createdAt/updatedAt
      underscored: true,      // maps to created_at / updated_at
      indexes: [
        { name: 'uw_rules_rule_type', fields: ['rule_type'] },
        { name: 'uw_rules_is_active', fields: ['is_active'] },
        { name: 'uw_rules_priority', fields: ['priority'] },
        { name: 'uw_rules_effective_from', fields: ['effective_from'] },
        { name: 'uw_rules_effective_to', fields: ['effective_to'] },
        { name: 'uw_rules_created_by', fields: ['created_by'] },
        { name: 'uw_rules_approved_by', fields: ['approved_by'] }
      ]
    }
  );

  // Helpers
  UWRule.prototype.isEffective = function () {
    const now = new Date();
    return (
      this.isActive &&
      now >= this.effectiveFrom &&
      (!this.effectiveTo || now <= this.effectiveTo)
    );
  };

  UWRule.prototype.appliesToEntity = function (entityType) {
    return (this.applicableEntities || '').split(',').includes(entityType);
  };

  UWRule.prototype.appliesToLine = function (lineOfBusiness) {
    if (!this.applicableLines) return true;
    return this.applicableLines.split(',').includes(lineOfBusiness);
  };

  UWRule.prototype.appliesToState = function (state) {
    if (!this.applicableStates) return true;
    return this.applicableStates.split(',').includes(state);
  };

  return UWRule;
};
