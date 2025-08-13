const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3009;

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Nuigini Insurance API Gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'All microservices are ready!'
  });
});

// Test endpoint
app.get('/api/v1/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Nuigini Insurance API is working!',
    services: [
      'API Gateway (Port 3000)',
      'Lead Service (Port 3001)',
      'Quote Service (Port 3002)',
      'Policy Service (Port 3003)',
      'Payment Service (Port 3004)',
      'Claims Service (Port 3005)',
      'Reinsurance Service (Port 3006)',
      'Rule Engine Service (Port 3007)',
      'Notification Service (Port 3008)'
    ],
    features: [
      'Complete microservices architecture',
      'MySQL database with Sequelize ORM',
      'Rule engine for business logic',
      'Australian tax calculations (GST, Stamp Duty, ESL)',
      'JWT authentication and authorization',
      'Role-based access control',
      'Comprehensive API documentation',
      'Postman collection for testing'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Nuigini Insurance API Gateway running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/v1/test`);
});

module.exports = app; 