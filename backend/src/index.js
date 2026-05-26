const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const env = require('./config/env');
const { connect, mongoose } = require('./db/connection');
const { apiLimiter } = require('./middleware/rateLimits');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const officeBearerRoutes = require('./routes/officeBearers');
const miscRoutes = require('./routes/misc');

const app = express();

if (env.trustProxy) app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(helmet());
app.use(compression());
app.use(morgan(env.isProduction ? 'combined' : 'dev'));

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (env.corsOrigins.includes(origin)) return cb(null, true);
    if (env.isDevelopment && origin.startsWith('http://localhost')) return cb(null, true);
    return cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use('/api', apiLimiter);

app.get('/health', (req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    success: true,
    message: 'IEEE CS API is running',
    db: dbStates[mongoose.connection.readyState] || 'unknown',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/office-bearers', officeBearerRoutes);
app.use('/api', miscRoutes);

app.use(notFound);
app.use(errorHandler);

let server;

const start = async () => {
  await connect();
  server = app.listen(env.port, () => {
    console.log(` IEEE CS API running on http://localhost:${env.port} [${env.nodeEnv}]`);
  });
};

const shutdown = (signal) => {
  console.log(`\n${signal} received — shutting down gracefully`);
  const closeHttp = () => new Promise((resolve) => (server ? server.close(resolve) : resolve()));
  closeHttp()
    .then(() => mongoose.disconnect())
    .then(() => {
      console.log(' Closed HTTP server and MongoDB connection');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error during shutdown:', err);
      process.exit(1);
    });
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => console.error('Unhandled rejection:', reason));
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

start().catch((err) => {
  console.error(' Failed to start server:', err);
  process.exit(1);
});

module.exports = app;
