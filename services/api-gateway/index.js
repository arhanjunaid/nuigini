// services/api-gateway/index.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const logger = require('./utils/logger'); // keep your logger

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * ===== Swagger Setup =====
 */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Nuigini Insurance API',
      version: '1.0.0',
      description: 'Australian General Insurance Microservices API',
    },
    servers: [
      {
        url: `http://localhost:${PORT}/api/v1`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./routes/*.js'], // keep if you also generate from JSDoc; harmless if no local routes
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);

/**
 * ===== Security / Perf Middleware =====
 */
app.use(helmet({
  // Allow Swagger UI scripts/styles in dev
  contentSecurityPolicy: NODE_ENV === 'production' ? undefined : false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors());
app.use(compression());

// Basic rate limit
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}));

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId: req.get('x-request-id'),
  });
  next();
});

/**
 * ===== Health =====
 */
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'API Gateway',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * ===== Swagger UI =====
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * ===== Proxy Targets (env overrideable) =====
 * Use Docker service names + ports as defaults so everything works in docker-compose.
 */
const TARGETS = {
  AUTH: process.env.AUTH_SERVICE_URL || 'http://auth-service:3000',
  LEADS: process.env.LEAD_SERVICE_URL || 'http://lead-service:3001',
  QUOTES: process.env.QUOTE_SERVICE_URL || 'http://quote-service:3002',
  POLICIES: process.env.POLICY_SERVICE_URL || 'http://policy-service:3003',
  PAYMENTS: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3004',
  CLAIMS: process.env.CLAIMS_SERVICE_URL || 'http://claims-service:3005',
  REINS: process.env.REINS_SERVICE_URL || 'http://reinsurance-service:3006',
  ADMIN: process.env.ADMIN_SERVICE_URL || 'http://admin-service:3007',
  ROLES: process.env.ROLE_SERVICE_URL || 'http://role-service:3008',
};

/**
 * Common proxy options:
 * - keep path but strip the /api/v1/<resource> prefix
 * - forward Authorization header (if services also check JWT)
 */
const mkProxy = (target, prefix) => createProxyMiddleware({
  target,
  changeOrigin: true,
  xfwd: true,
  pathRewrite: { [`^/api/v1/${prefix}`]: '/' }, // e.g., /api/v1/leads -> /
  onProxyReq(proxyReq, req) {
    const auth = req.get('authorization');
    if (auth) proxyReq.setHeader('authorization', auth);
    const reqId = req.get('x-request-id');
    if (reqId) proxyReq.setHeader('x-request-id', reqId);
  },
  onError(err, _req, res) {
    logger.error(`Proxy error (${prefix} → ${target}):`, err);
    res.status(502).json({ error: `Bad gateway for ${prefix}` });
  },
});

/**
 * ===== API Routes (Proxies) =====
 * If any downstream service expects the /api/v1 prefix, just remove pathRewrite above.
 */
app.use('/api/v1/auth', mkProxy(TARGETS.AUTH, 'auth'));
app.use('/api/v1/leads', mkProxy(TARGETS.LEADS, 'leads'));
app.use('/api/v1/quotes', mkProxy(TARGETS.QUOTES, 'quotes'));
app.use('/api/v1/policies', mkProxy(TARGETS.POLICIES, 'policies'));
app.use('/api/v1/payments', mkProxy(TARGETS.PAYMENTS, 'payments'));
app.use('/api/v1/claims', mkProxy(TARGETS.CLAIMS, 'claims'));
app.use('/api/v1/reinsurance', mkProxy(TARGETS.REINS, 'reinsurance'));
app.use('/api/v1/admin', mkProxy(TARGETS.ADMIN, 'admin'));
app.use('/api/v1/roles', mkProxy(TARGETS.ROLES, 'roles'));

/**
 * ===== Error & 404 =====
 */
app.use((err, _req, res, _next) => {
  logger.error('Unhandled error in API Gateway:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`,
  });
});

/**
 * ===== Start =====
 * No DB initialization here—gateway is a proxy.
 */
app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
});

module.exports = app;
