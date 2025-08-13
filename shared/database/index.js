// shared/database/index.js
const { Sequelize } = require('sequelize');
const config = require('./config');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Initialize Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    define: dbConfig.define,
  }
);

// Import models
const User = require('./models/User')(sequelize);
const Role = require('./models/Role')(sequelize);
const Party = require('./models/Party')(sequelize);
const Address = require('./models/Address')(sequelize);
const Lead = require('./models/Lead')(sequelize);
const Quote = require('./models/Quote')(sequelize);
const Policy = require('./models/Policy')(sequelize);
const Coverage = require('./models/Coverage')(sequelize);
const RiskItem = require('./models/RiskItem')(sequelize);
const Payment = require('./models/Payment')(sequelize);
const Claim = require('./models/Claim')(sequelize);
const Reserve = require('./models/Reserve')(sequelize);
const Treaty = require('./models/Treaty')(sequelize);
const Cession = require('./models/Cession')(sequelize);
const UWRule = require('./models/UWRule')(sequelize);
const RatingTable = require('./models/RatingTable')(sequelize);
const AuditLog = require('./models/AuditLog')(sequelize);

// Build models bag (so it's usable everywhere, including seeding)
const models = {
  Sequelize,
  User,
  Role,
  Party,
  Address,
  Lead,
  Quote,
  Policy,
  Coverage,
  RiskItem,
  Payment,
  Claim,
  Reserve,
  Treaty,
  Cession,
  UWRule,
  RatingTable,
  AuditLog,
};

// Define associations explicitly so foreign keys match your fields
const defineAssociations = () => {
  const {
    User, Role, Party, Address, Lead, Quote, Policy, Coverage,
    RiskItem, Payment, Claim, Reserve, Treaty, Cession, AuditLog,
  } = models;

  // Users & Roles
  User.belongsTo(Role, { foreignKey: 'roleId' });
  Role.hasMany(User, { foreignKey: 'roleId' });

  // Parties & Addresses
  Party.hasMany(Address, { foreignKey: 'partyId' });
  Address.belongsTo(Party, { foreignKey: 'partyId' });

  // Leads
  Lead.belongsTo(Party, { as: 'customer', foreignKey: 'customerId' });
  Lead.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });

  // Quotes
  Quote.belongsTo(Lead, { foreignKey: 'leadId' });
  Quote.belongsTo(Party, { as: 'customer', foreignKey: 'customerId' });
  Quote.hasMany(Coverage, { foreignKey: 'quoteId' });
  Quote.belongsToMany(RiskItem, {
    through: 'QuoteRiskItems',
    foreignKey: 'quoteId',
    otherKey: 'riskItemId',
  });

  // Policies
  Policy.belongsTo(Quote, { foreignKey: 'quoteId' });
  Policy.belongsTo(Party, { as: 'customer', foreignKey: 'customerId' });
  Policy.hasMany(Coverage, { foreignKey: 'policyId' });
  Policy.belongsToMany(RiskItem, {
    through: 'PolicyRiskItems',
    foreignKey: 'policyId',
    otherKey: 'riskItemId',
  });
  Policy.hasMany(Payment, { foreignKey: 'policyId' });

  // Coverages
  Coverage.belongsTo(Quote, { foreignKey: 'quoteId' });
  Coverage.belongsTo(Policy, { foreignKey: 'policyId' });

  // Risk Items
  RiskItem.belongsTo(Address, { foreignKey: 'addressId' });

  // Payments
  Payment.belongsTo(Policy, { foreignKey: 'policyId' });
  Payment.belongsTo(Claim, { as: 'claim', foreignKey: 'claimId' });
  Payment.belongsTo(Party, { as: 'payee', foreignKey: 'payeeId' });

  // Claims
  Claim.belongsTo(Policy, { foreignKey: 'policyId' });
  Claim.belongsTo(Party, { as: 'claimant', foreignKey: 'claimantId' });
  Claim.hasMany(Reserve, { foreignKey: 'claimId' });
  Claim.hasMany(Payment, { as: 'claimPayments', foreignKey: 'claimId' });

  // Reserves
  Reserve.belongsTo(Claim, { foreignKey: 'claimId' });
  Reserve.belongsTo(User, { as: 'approvedByUser', foreignKey: 'approvedBy' });

  // Reinsurance
  Treaty.hasMany(Cession, { foreignKey: 'treatyId' });
  Cession.belongsTo(Treaty, { foreignKey: 'treatyId' });
  Cession.belongsTo(Policy, { foreignKey: 'policyId' });
  Cession.belongsTo(Claim, { foreignKey: 'claimId' });

  // Audit
  AuditLog.belongsTo(User, { as: 'actor', foreignKey: 'actorId' });
};

// Initialize + sync + seed
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    defineAssociations();

    if (env === 'development') {
      // Database schema is now managed by init.sql script
      // Only verify connection and load models
      console.log('Database connection verified. Schema managed by init.sql script.');

      // Check if roles exist, but don't create them (they're in init.sql)
      const adminRole = await Role.findOne({
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('name')),
          'admin'
        ),
      });
      
      if (!adminRole) {
        console.log('Warning: Admin role not found. Database may not be properly initialized.');
      } else {
        console.log('Database schema verified successfully.');
      }
    }

    return sequelize;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  initializeDatabase,
  models,
};
