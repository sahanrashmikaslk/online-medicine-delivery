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

// Configure CORS for Azure deployment
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);
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
  auth: process.env.TARGET_AUTH || 'http://auth:3001',
  catalog: process.env.TARGET_CATALOG || 'http://catalog:3002',
  order: process.env.TARGET_ORDER || 'http://order:3003',
  delivery: process.env.TARGET_DELIVERY || 'http://delivery:3004',
  notification: process.env.TARGET_NOTIFICATION || 'http://notification:3005',
};

// Health
app.get('/health', (req, res) => res.json({ ok: true, service: 'gateway' }));

// Public auth routes
app.use('/auth', createProxyMiddleware({
  target: targets.auth, changeOrigin: true, pathRewrite: { '^/auth': '' }
}));

// Catalog: GET is public; writes require ADMIN
app.get('/catalog', createProxyMiddleware({
  target: targets.catalog, changeOrigin: true, pathRewrite: { '^/catalog': '' }
}));
app.get('/catalog/*', createProxyMiddleware({
  target: targets.catalog, changeOrigin: true, pathRewrite: { '^/catalog': '' }
}));

['post', 'put', 'patch', 'delete'].forEach(m => {
  app[m]('/catalog', verifyJWT, requireRole('ADMIN'), createProxyMiddleware({
    target: targets.catalog, changeOrigin: true, pathRewrite: { '^/catalog': '' }
  }));
  app[m]('/catalog/*', verifyJWT, requireRole('ADMIN'), createProxyMiddleware({
    target: targets.catalog, changeOrigin: true, pathRewrite: { '^/catalog': '' }
  }));
});

// Orders: authenticated
app.use('/orders', verifyJWT, createProxyMiddleware({
  target: targets.order, changeOrigin: true, pathRewrite: { '^/orders': '' }
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

// Notifications (if you keep it private)
app.use('/notify', verifyJWT, createProxyMiddleware({
  target: targets.notification, changeOrigin: true, pathRewrite: { '^/notify': '' }
}));

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Gateway running on ${port}`));
