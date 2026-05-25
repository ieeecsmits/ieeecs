const app = require('./app');
const env = require('./config/env');
const { connect, mongoose } = require('./db/connection');

let server;

const start = async () => {
  await connect();
  server = app.listen(env.port, () => {
    console.log(`🚀 IEEE CS API running on http://localhost:${env.port} [${env.nodeEnv}]`);
  });
};

const shutdown = (signal) => {
  console.log(`\n${signal} received — shutting down gracefully`);
  const closeHttp = () => new Promise((resolve) => (server ? server.close(resolve) : resolve()));
  closeHttp()
    .then(() => mongoose.disconnect())
    .then(() => {
      console.log('✅ Closed HTTP server and MongoDB connection');
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
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

module.exports = app;
