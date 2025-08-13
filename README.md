# Nuigini Insurance Microservices Backend

A comprehensive Node.js microservices application for Australian General Insurance, featuring lead management, quoting, policy administration, claims processing, and reinsurance with an integrated rule engine.

## 🏗️ Architecture

### Microservices
- **API Gateway** (Port 3000) - Central routing and authentication
- **Lead Service** (Port 3001) - Lead management and conversion
- **Quote Service** (Port 3002) - Insurance quoting and rating
- **Policy Service** (Port 3003) - Policy administration and endorsements
- **Payment Service** (Port 3004) - Payment processing and billing
- **Claims Service** (Port 3005) - Claims management and processing
- **Reinsurance Service** (Port 3006) - Treaty and facultative reinsurance
- **Rule Engine Service** (Port 3007) - Business rules and underwriting
- **Notification Service** (Port 3008) - Email, SMS, and push notifications

### Technology Stack
- **Runtime**: Node.js 18+
- **Database**: MySQL 8.0 with Sequelize ORM
- **Cache**: Redis for session management and caching
- **Message Queue**: Bull for background job processing
- **Authentication**: JWT with role-based access control
- **API Documentation**: Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- MySQL 8.0 (for local development)

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd new-nuigini-backend
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Initialize database**
   ```bash
   docker-compose exec api-gateway npm run migrate
   docker-compose exec api-gateway npm run seed
   ```

5. **Access the application**
   - API Gateway: http://localhost:3000
   - API Documentation: http://localhost:3000/api-docs
   - Health Check: http://localhost:3000/health

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up database**
   ```bash
   # Start MySQL and Redis
   docker-compose up mysql redis -d
   
   # Run migrations
   npm run migrate
   
   # Seed data
   npm run seed
   ```

3. **Start services**
   ```bash
   # Start all services
   npm run dev
   
   # Or start individual services
   cd services/api-gateway && npm run dev
   cd services/lead-service && npm run dev
   # ... etc
   ```

## 📊 Database Schema

### Core Entities
- **Users & Roles** - Authentication and authorization
- **Parties** - Customers and organizations with KYC/AML
- **Leads** - Lead management and conversion tracking
- **Quotes** - Insurance quotes with rating and underwriting
- **Policies** - Active insurance policies
- **Claims** - Claims processing and management
- **Payments** - Payment processing and reconciliation
- **Treaties** - Reinsurance treaties and cessions

### Key Relationships
- Lead → Quote → Policy (lifecycle)
- Policy → Claims (one-to-many)
- Policy → Payments (one-to-many)
- Treaty → Cessions (one-to-many)

## 🔧 Rule Engine

The Rule Engine service provides:

### Rule Types
- **Underwriting Rules** - Quote acceptance, referral, decline
- **Rating Rules** - Premium calculation and adjustments
- **Claims Rules** - Claims processing and fraud detection
- **Compliance Rules** - Regulatory compliance validation

### Rule Structure
```json
{
  "name": "High Risk Driver Decline",
  "ruleType": "UNDERWRITING",
  "condition": {
    "operator": "AND",
    "conditions": [
      {
        "operator": "GREATER_THAN",
        "field": "driverClaimsHistory",
        "value": 3
      },
      {
        "operator": "LESS_THAN",
        "field": "driverAge",
        "value": 25
      }
    ]
  },
  "action": {
    "action": "DECLINE",
    "reason": "High risk driver profile"
  }
}
```

### API Endpoints
- `POST /api/v1/rule-engine/execute` - Execute rules
- `POST /api/v1/rule-engine/test` - Test rules without saving
- `GET /api/v1/rule-engine/types` - Get available rule types
- `GET /api/v1/rule-engine/stats` - Get rule execution statistics

## 💰 Premium Calculation

### Australian Tax Structure
- **Base Premium** (ex-tax)
- **Fees** (policy, underwriting, brokerage)
- **GST** (10% on premium + fees)
- **Stamp Duty** (varies by state and class)
- **ESL** (NSW only, Emergency Services Levy)

### Example Calculation
```
Base Premium: $1,000.00
Fees: $50.00
Premium Before Tax: $1,050.00
GST (10%): $105.00
Stamp Duty (5%): $52.50
ESL (NSW, 0.5%): $5.25
Total Payable: $1,212.75
```

## 🔐 Security & Compliance

### Authentication
- JWT-based authentication
- Role-based access control (RBAC)
- Multi-factor authentication (MFA)
- Session management with Redis

### Data Protection
- PII encryption at rest
- Field-level data masking
- Audit logging for all changes
- GDPR compliance features

### Australian Compliance
- KYC/AML verification
- Sanctions screening
- TMD/DDO compliance
- Duty of disclosure tracking

## 📈 Business Workflows

### New Business Flow
1. **Lead Creation** → Lead captured from various channels
2. **Lead Qualification** → Customer contact and qualification
3. **Quote Generation** → Risk assessment and premium calculation
4. **Underwriting** → Rule evaluation and referral if needed
5. **Customer Onboarding** → KYC/AML verification
6. **Payment Processing** → Premium collection
7. **Policy Issuance** → Policy documents and activation

### Claims Flow
1. **FNOL** → First notice of loss
2. **Coverage Check** → Policy validation
3. **Triage** → Initial assessment and assignment
4. **Investigation** → Claims investigation and reserving
5. **Assessment** → Damage assessment and quotes
6. **Settlement** → Payment processing
7. **Recovery** → Third-party recovery if applicable

### Endorsement Flow
1. **Change Request** → Customer requests policy change
2. **Re-rating** → Premium recalculation
3. **Proration** → Premium adjustment for remaining term
4. **Documentation** → Endorsement certificate generation
5. **Billing** → Additional premium collection if required

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### API Tests
```bash
# Using the provided Postman collection
# Import: postman/Nuigini_Insurance_API.postman_collection.json
```

## 📊 Monitoring & Observability

### Health Checks
- Service health endpoints
- Database connectivity
- External service dependencies

### Logging
- Structured JSON logging
- Request/response correlation
- Error tracking and alerting

### Metrics
- Business metrics (conversion rates, claims frequency)
- Technical metrics (response times, error rates)
- Financial metrics (premium volume, loss ratios)

## 🚀 Deployment

### Production Deployment
1. **Environment Setup**
   ```bash
   # Set production environment variables
   export NODE_ENV=production
   export MYSQL_HOST=production-db-host
   export REDIS_HOST=production-redis-host
   ```

2. **Database Migration**
   ```bash
   npm run migrate:prod
   ```

3. **Service Deployment**
   ```bash
   # Deploy to Kubernetes or cloud platform
   kubectl apply -f k8s/
   ```

### Environment Variables
```bash
# Database
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=nuigini_insurance
MYSQL_USER=nuigini_user
MYSQL_PASSWORD=nuigini_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# External Services
STRIPE_SECRET_KEY=sk_test_...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 📚 API Documentation

### Swagger Documentation
Access the interactive API documentation at:
- Development: http://localhost:3000/api-docs
- Production: https://api.nuigini.com/api-docs

### Postman Collection
Import the provided Postman collection for testing:
- File: `postman/Nuigini_Insurance_API.postman_collection.json`
- Environment variables included for easy testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Email: support@nuigini.com
- Documentation: https://docs.nuigini.com
- Issues: GitHub Issues

## 🔄 Version History

- **v1.0.0** - Initial release with core insurance functionality
- **v1.1.0** - Added rule engine and advanced underwriting
- **v1.2.0** - Enhanced claims processing and reinsurance
- **v1.3.0** - Improved security and compliance features 