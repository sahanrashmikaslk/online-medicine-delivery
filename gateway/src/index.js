require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');

const app = express();

// IMPORTANT: Do NOT parse JSON bodies in the gateway.
// It should just forward bodies to services.
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for Azure deployment
}));

// Configure CORS for Google Cloud deployment
const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').filter(Boolean);
app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

function verifyJWT(req, res, next) {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'missing token' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) return res.status(403).json({ error: 'forbidden' });
    next();
  };
}

const targets = {
  auth: process.env.AUTH_SERVICE_URL || 'http://auth-cluster-ip:3001',
  catalog: process.env.CATALOG_SERVICE_URL || 'http://catalog-cluster-ip:3002',
  order: process.env.ORDER_SERVICE_URL || 'http://order-cluster-ip:3003',
  delivery: process.env.DELIVERY_SERVICE_URL || 'http://delivery-cluster-ip:3004',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-cluster-ip:3005',
};

// Health
app.get('/health', (req, res) => res.json({ ok: true, service: 'gateway' }));
// Duplicate explicit API health for ingress debug
app.get('/api/health', (req, res) => res.json({ ok: true, service: 'gateway', api: true }));

// Temporary request logger to debug routing (can be removed later)
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/auth') ) {
    console.log('GW_REQ', req.method, req.originalUrl);
  }
  next();
});

// Public auth routes
app.use('/auth', createProxyMiddleware({
  target: targets.auth, changeOrigin: true, pathRewrite: { '^/auth': '' }
}));

// Support both /auth and /api/auth for ingress compatibility
app.use('/api/auth', createProxyMiddleware({
  target: targets.auth, changeOrigin: true, pathRewrite: { '^/api/auth': '' }
}));

// Catalog: GET is public; writes require ADMIN
app.get('/catalog', createProxyMiddleware({
  target: targets.catalog, changeOrigin: true, pathRewrite: { '^/catalog': '' }
}));
app.get('/catalog/*', createProxyMiddleware({
  target: targets.catalog, changeOrigin: true, pathRewrite: { '^/catalog': '' }
}));

// Support /api/catalog for ingress compatibility
app.get('/api/catalog', createProxyMiddleware({
  target: targets.catalog, changeOrigin: true, pathRewrite: { '^/api/catalog': '' }
}));
app.get('/api/catalog/*', createProxyMiddleware({
  target: targets.catalog, changeOrigin: true, pathRewrite: { '^/api/catalog': '' }
}));

['post', 'put', 'patch', 'delete'].forEach(m => {
  app[m]('/catalog', verifyJWT, requireRole('ADMIN'), createProxyMiddleware({
    target: targets.catalog, changeOrigin: true, pathRewrite: { '^/catalog': '' }
  }));
  app[m]('/catalog/*', verifyJWT, requireRole('ADMIN'), createProxyMiddleware({
    target: targets.catalog, changeOrigin: true, pathRewrite: { '^/catalog': '' }
  }));
  // Support /api/catalog for ingress compatibility
  app[m]('/api/catalog', verifyJWT, requireRole('ADMIN'), createProxyMiddleware({
    target: targets.catalog, changeOrigin: true, pathRewrite: { '^/api/catalog': '' }
  }));
  app[m]('/api/catalog/*', verifyJWT, requireRole('ADMIN'), createProxyMiddleware({
    target: targets.catalog, changeOrigin: true, pathRewrite: { '^/api/catalog': '' }
  }));
});

// Orders: authenticated
app.use('/orders', verifyJWT, createProxyMiddleware({
  target: targets.order, changeOrigin: true, pathRewrite: { '^/orders': '' }
}));

// Support /api/orders for ingress compatibility
app.use('/api/orders', verifyJWT, createProxyMiddleware({
  target: targets.order, changeOrigin: true, pathRewrite: { '^/api/orders': '' }
}));

// Delivery: GET for any logged-in user, PATCH only ADMIN
app.get('/delivery', verifyJWT, createProxyMiddleware({
  target: targets.delivery, changeOrigin: true, pathRewrite: { '^/delivery': '' }
}));
app.get('/delivery/*', verifyJWT, createProxyMiddleware({
  target: targets.delivery, changeOrigin: true, pathRewrite: { '^/delivery': '' }
}));
app.patch('/delivery/*', verifyJWT, requireRole('ADMIN'), createProxyMiddleware({
  target: targets.delivery, changeOrigin: true, pathRewrite: { '^/delivery': '' }
}));

// Support /api/delivery for ingress compatibility
app.get('/api/delivery', verifyJWT, createProxyMiddleware({
  target: targets.delivery, changeOrigin: true, pathRewrite: { '^/api/delivery': '' }
}));
app.get('/api/delivery/*', verifyJWT, createProxyMiddleware({
  target: targets.delivery, changeOrigin: true, pathRewrite: { '^/api/delivery': '' }
}));
app.patch('/api/delivery/*', verifyJWT, requireRole('ADMIN'), createProxyMiddleware({
  target: targets.delivery, changeOrigin: true, pathRewrite: { '^/api/delivery': '' }
}));

// Notifications (if you keep it private)
app.use('/notify', verifyJWT, createProxyMiddleware({
  target: targets.notification, changeOrigin: true, pathRewrite: { '^/notify': '' }
}));

// Support /api/notify for ingress compatibility
app.use('/api/notify', verifyJWT, createProxyMiddleware({
  target: targets.notification, changeOrigin: true, pathRewrite: { '^/api/notify': '' }
}));

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Gateway running on ${port}`));
