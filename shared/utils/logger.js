const winston = require('winston');

const createLogger = (serviceName) => {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: { service: serviceName },
    transports: [
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/combined.log' })
    ]
  });
};

// Create logger for each service
const loggers = {
  'api-gateway': createLogger('api-gateway'),
  'auth-service': createLogger('auth-service'),
  'lead-service': createLogger('lead-service'),
  'quote-service': createLogger('quote-service'),
  'policy-service': createLogger('policy-service'),
  'payment-service': createLogger('payment-service'),
  'claims-service': createLogger('claims-service'),
  'reinsurance-service': createLogger('reinsurance-service'),
  'rule-engine-service': createLogger('rule-engine-service'),
  'notification-service': createLogger('notification-service')
};

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  Object.values(loggers).forEach(logger => {
    logger.add(new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }));
  });
}

module.exports = loggers; 