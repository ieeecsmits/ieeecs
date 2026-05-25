const app = require('../src/app');
const { connect } = require('../src/db/connection');

module.exports = async (req, res) => {
  try {
    await connect();
  } catch (err) {
    res.status(503).json({ success: false, message: 'Database unavailable' });
    return;
  }
  return app(req, res);
};
