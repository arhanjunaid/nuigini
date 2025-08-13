// shared/database/models/Claim.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Claim = sequelize.define(
    'Claim',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },

      // Identifiers
      claimNumber: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: 'claim_number' // <-- physical column
      },

      // Foreign keys (FKs handled via migrations to avoid sync/alter FK churn)
      policyId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'policy_id'
      },
      claimantId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'claimant_id'
      },

      // Incident
      incidentDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'incident_date'
      },
      incidentType: {
        type: DataTypes.ENUM('COLLISION', 'THEFT', 'FIRE', 'STORM', 'OTHER'),
        allowNull: false,
        field: 'incident_type'
      },
      cause: {
        type: DataTypes.STRING(200),
        allowNull: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      location: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'Location details including address and coordinates'
      },
      estimatedDamage: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        field: 'estimated_damage'
      },

      // Status
      status: {
        type: DataTypes.ENUM(
          'OPENED',
          'INVESTIGATING',
          'ASSESSED',
          'SETTLEMENT_PENDING',
          'SETTLED',
          'CLOSED'
        ),
        defaultValue: 'OPENED'
      },

      // Third party
      thirdParty: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Third party details if applicable',
        field: 'third_party'
      },

      // Police
      policeReport: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'police_report'
      },
      policeReportNumber: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'police_report_number'
      },

      // Assignment
      assignedTo: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'assigned_to'
      },
      assignedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'assigned_at'
      },

      // Timestamps
      openedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'opened_at'
      },
      settledAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'settled_at'
      },
      closedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'closed_at'
      },

      // Metadata
      metadata: {
        type: DataTypes.JSON,
        defaultValue: {}
      }
    },
    {
      tableName: 'claims',
      indexes: [
        // use physical column names in indexes
        { name: 'claims_claim_number', unique: true, fields: ['claim_number'] },
        { name: 'claims_policy_id', fields: ['policy_id'] },
        { name: 'claims_claimant_id', fields: ['claimant_id'] },
        { name: 'claims_status', fields: ['status'] },
        { name: 'claims_incident_date', fields: ['incident_date'] },
        { name: 'claims_assigned_to', fields: ['assigned_to'] }
      ]
    }
  );

  return Claim;
};
