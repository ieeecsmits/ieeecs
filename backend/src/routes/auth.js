const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const pool = require('../db/connection');
const env = require('../config/env');
const { authMiddleware } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimits');
const asyncHandler = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const schemas = require('../validators/schemas');
const HttpError = require('../utils/HttpError');

const router = express.Router();

router.post(
  '/login',
  authLimiter,
  schemas.login,
  validate,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const { rows } = await pool.query(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = $1',
      [email]
    );
    const user = rows[0];
    // Always run bcrypt to mitigate user-enumeration timing.
    const valid = user
      ? await bcrypt.compare(password, user.password_hash)
      : await bcrypt.compare(password, '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv');

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
    const { rows } = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!rows[0]) throw new HttpError(404, 'User not found');
    res.json({ success: true, user: rows[0] });
  })
);

module.exports = router;
