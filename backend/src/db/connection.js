const mongoose = require('mongoose');
const env = require('../config/env');

mongoose.set('strictQuery', true);

let connectPromise;

const connect = () => {
  if (!connectPromise) {
    connectPromise = mongoose
      .connect(env.mongoUri, {
        autoIndex: env.mongooseAutoIndex,
        serverSelectionTimeoutMS: 10_000,
        maxPoolSize: Number(process.env.MONGO_POOL_MAX) || 10,
      })
      .then((m) => {
        console.log('✅ Connected to MongoDB');
        return m;
      })
      .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        throw err;
      });
  }
  return connectPromise;
};

mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected'));
mongoose.connection.on('reconnected', () => console.log('✅ MongoDB reconnected'));
mongoose.connection.on('error', (err) => console.error('❌ MongoDB error:', err));

module.exports = { mongoose, connect };
