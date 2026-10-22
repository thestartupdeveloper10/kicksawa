const config = require('./utils/config');
const path = require('path');
const express = require('express');
require('express-async-errors');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const middleware = require('./utils/middleware');
const logger = require('./utils/logger');
const mongoose = require('mongoose');
const authRouter = require('./controllers/auth');
const usersRouter = require('./controllers/users');
const productRouter = require('./controllers/product');
const cartRouter = require('./controllers/cart');
const orderRouter = require('./controllers/order');
const contactRouter = require('./controllers/contact');
const mpesaRouter = require('./controllers/mpesa');
const { imgRouter } = require('./controllers/img');

mongoose.set('strictQuery', false);

const url = config.MONGODB_URI;
logger.info('connecting to db');

mongoose.connect(url)
  .then(() => {
    logger.info('connected to MongoDB');
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message);
  });

// Behind a proxy (Render, Heroku, nginx...) set TRUST_PROXY to the number of
// proxies, so rate limits see each client's address instead of the proxy's.
// Left unset, forwarded headers are ignored, so they cannot be spoofed.
if (process.env.TRUST_PROXY) {
  app.set('trust proxy', Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY);
}

// Query strings parse to plain strings (and arrays), never objects, so
// ?brand[$ne]=x cannot smuggle a MongoDB operator into a filter.
app.set('query parser', 'simple');

app.use(helmet({
  // A Content-Security-Policy needs tuning against Firebase, Google sign-in
  // and the image hosts before it can be switched on without breaking pages.
  contentSecurityPolicy: false,
  // Google sign-in opens a popup that must be able to report back.
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}));

// The storefront is served from this same origin and needs no CORS. Other
// origins (the admin app) must be listed in CORS_ORIGINS, comma-separated;
// local development servers are allowed by default.
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    const allowed = !origin
      || allowedOrigins.includes(origin)
      || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    callback(null, allowed);
  },
}));
app.use(express.json({ limit: '100kb' }));
app.use(middleware.requestLogger);
app.use(express.static('dist'));

app.use('/api/contact', contactRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);
app.use('/api/orders', orderRouter);
app.use('/api/checkout', mpesaRouter);
app.use('/api/img', imgRouter);

// Every non-API path is a client-side route, so hand back the SPA shell instead
// of falling through to unknownEndpoint. Without this, refreshing or sharing a
// deep link such as /products returns a 404.
app.get('*', (request, response, next) => {
  if (request.path.startsWith('/api/')) {
    return next();
  }
  response.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;