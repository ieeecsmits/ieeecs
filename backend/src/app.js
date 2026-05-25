const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const env = require('./config/env');
const { mongoose } = require('./db/connection');
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

module.exports = app;
