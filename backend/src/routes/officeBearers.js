const express = require('express');

const { OfficeBearer } = require('../models');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const schemas = require('../validators/schemas');
const buildUpdate = require('../utils/buildUpdate');
const HttpError = require('../utils/HttpError');

const router = express.Router();

const BEARER_UPDATABLE_FIELDS = new Set([
  'name', 'position', 'department', 'year', 'email',
  'linkedin_url', 'github_url', 'image_url', 'bio',
  'order_index', 'is_active', 'tenure_year',
]);

const BEARER_CREATE_FIELDS = [
  'name', 'position', 'department', 'year', 'email',
  'linkedin_url', 'github_url', 'image_url', 'bio',
  'order_index', 'tenure_year',
];

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { tenure_year, active } = req.query;
    const filter = {};
    if (active !== 'false') filter.is_active = true;
    if (tenure_year) filter.tenure_year = tenure_year;
    const bearers = await OfficeBearer.find(filter).sort({ order_index: 1 });
    res.json({ success: true, bearers });
  })
);

router.post(
  '/',
  authMiddleware,
  adminOnly,
  schemas.officeBearerCreate,
  validate,
  asyncHandler(async (req, res) => {
    const doc = {};
    for (const f of BEARER_CREATE_FIELDS) if (f in req.body) doc[f] = req.body[f];
    const bearer = await OfficeBearer.create(doc);
    res.status(201).json({ success: true, bearer });
  })
);

router.put(
  '/:id',
  authMiddleware,
  adminOnly,
  schemas.idParam(),
  validate,
  asyncHandler(async (req, res) => {
    const update = buildUpdate(req.body, BEARER_UPDATABLE_FIELDS);
    const bearer = await OfficeBearer.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!bearer) throw new HttpError(404, 'Office bearer not found');
    res.json({ success: true, bearer });
  })
);

router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  schemas.idParam(),
  validate,
  asyncHandler(async (req, res) => {
    const result = await OfficeBearer.findByIdAndDelete(req.params.id);
    if (!result) throw new HttpError(404, 'Office bearer not found');
    res.json({ success: true, message: 'Deleted' });
  })
);

module.exports = router;
