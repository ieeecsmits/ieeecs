const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const env = require('../config/env');
const { User } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimits');
const asyncHandler = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const schemas = require('../validators/schemas');
const HttpError = require('../utils/HttpError');

const router = express.Router();

const DUMMY_HASH = '$2a$12$CwTycUXWue0Thq9StjUM0uJ8E1f9dTQp.kVdQ8XOQ7zHQQ.HqU5L.';

router.post(
  '/login',
  authLimiter,
  schemas.login,
  validate,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password_hash');
    // Run bcrypt even when user is missing to mitigate user-enumeration timing.
    const valid = user
      ? await bcrypt.compare(password, user.password_hash)
      : await bcrypt.compare(password, DUMMY_HASH);
    if (!user || !valid) throw new HttpError(401, 'Invalid credentials');

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn }
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  })
);

router.get(
  '/me',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) throw new HttpError(404, 'User not found');
    res.json({ success: true, user });
  })
);

module.exports = router;
