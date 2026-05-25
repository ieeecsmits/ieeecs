const env = require('../config/env');

const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
};

const errorHandler = (err, req, res, _next) => {
  const status = err.status || 500;

  if (status >= 500) {
    console.error(`[${req.method} ${req.originalUrl}]`, err);
  }

  const body = {
    success: false,
    message: status >= 500 && env.isProduction ? 'Internal server error' : err.message,
  };
  if (err.details) body.details = err.details;
  if (!env.isProduction && status >= 500) body.stack = err.stack;

  res.status(status).json(body);
};

module.exports = { notFound, errorHandler };
