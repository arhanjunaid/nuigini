const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Address = sequelize.define('Address', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    partyId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'party_id',
      references: {
        model: 'parties',
        key: 'id'
      }
    },
    addressType: {
      type: DataTypes.ENUM('HOME', 'WORK', 'MAILING', 'RISK'),
      defaultValue: 'HOME',
      field: 'address_type'
    },
    line1: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    line2: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    suburb: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    state: {
      type: DataTypes.ENUM('NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'),
      allowNull: false
    },
    postcode: {
      type: DataTypes.STRING(4),
      allowNull: false
    },
    country: {
      type: DataTypes.STRING(50),
      defaultValue: 'AUSTRALIA'
    },
    // Geocoding data
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true
    },
    // Risk assessment data
    floodRisk: {
      type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'),
      allowNull: true
    },
    bushfireRisk: {
      type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'),
      allowNull: true
    },
    crimeRisk: {
      type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'),
      allowNull: true
    },
    // Validation
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Metadata
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    tableName: 'addresses',
    indexes: [
      { fields: ['party_id'] },
      { fields: ['state'] },
      { fields: ['postcode'] },
      { fields: ['address_type'] }
    ]
  });

  return Address;
}; 