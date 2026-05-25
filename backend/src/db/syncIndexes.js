const { connect, mongoose } = require('./connection');
const models = require('../models');

const run = async () => {
  await connect();
  for (const [name, Model] of Object.entries(models)) {
    process.stdout.write(`Syncing indexes for ${name}... `);
    await Model.syncIndexes();
    console.log('done');
  }
  await mongoose.disconnect();
  console.log('✅ All indexes synced');
};

run().catch((err) => {
  console.error('❌ Index sync failed:', err);
  process.exit(1);
});
