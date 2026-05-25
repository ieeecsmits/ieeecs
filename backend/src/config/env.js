require('dotenv').config();

const REQUIRED = ['MONGODB_URI', 'JWT_SECRET'];
const missing = REQUIRED.filter((k) => !process.env[k]);
if (missing.length) {
  const msg = `Missing required environment variables: ${missing.join(', ')}`;
  console.error(`❌ ${msg}`);
  throw new Error(msg);
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI,
  mongooseAutoIndex: process.env.MONGOOSE_AUTO_INDEX !== 'false',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 12,
  corsOrigins: (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  trustProxy: process.env.TRUST_PROXY === 'true',
};

env.isProduction = env.nodeEnv === 'production';
env.isDevelopment = env.nodeEnv === 'development';

// In production, never auto-build indexes on every boot; use `db:sync-indexes`.
if (env.isProduction) env.mongooseAutoIndex = false;

module.exports = env;
