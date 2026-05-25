const express = require('express');

const { GalleryImage, Membership, Contact } = require('../models');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { writeLimiter } = require('../middleware/rateLimits');
const asyncHandler = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const schemas = require('../validators/schemas');
const HttpError = require('../utils/HttpError');

const router = express.Router();

// ==================== GALLERY ====================
router.get(
  '/gallery',
  schemas.pagination,
  validate,
  asyncHandler(async (req, res) => {
    const { category, event_id, featured } = req.query;
    const limit = req.query.limit ?? 20;
    const offset = req.query.offset ?? 0;

    const filter = {};
    if (category) filter.category = category;
    if (event_id) filter.event_id = event_id;
    if (featured === 'true') filter.is_featured = true;

    const images = await GalleryImage.find(filter)
      .populate('event_id', 'title')
      .sort({ created_at: -1 })
      .skip(offset)
      .limit(limit);

    res.json({ success: true, images, limit, offset });
  })
);

router.post(
  '/gallery',
  authMiddleware,
  adminOnly,
  schemas.galleryCreate,
  validate,
  asyncHandler(async (req, res) => {
    const { title, description, image_url, event_id, category, is_featured } = req.body;
    const image = await GalleryImage.create({
      title, description, image_url,
      event_id: event_id || null,
      category: category || 'general',
      is_featured: is_featured ?? false,
      uploaded_by: req.user.id,
    });
    res.status(201).json({ success: true, image });
  })
);

router.delete(
  '/gallery/:id',
  authMiddleware,
  adminOnly,
  schemas.idParam(),
  validate,
  asyncHandler(async (req, res) => {
    const result = await GalleryImage.findByIdAndDelete(req.params.id);
    if (!result) throw new HttpError(404, 'Image not found');
    res.json({ success: true, message: 'Deleted' });
  })
);

// ==================== MEMBERSHIP ====================
router.post(
  '/membership/apply',
  writeLimiter,
  schemas.membershipApply,
  validate,
  asyncHandler(async (req, res) => {
    try {
      const membership = await Membership.create(req.body);
      res.status(201).json({ success: true, membership, message: 'Membership application submitted' });
    } catch (err) {
      if (err.code === 11000) throw new HttpError(409, 'Application already submitted with this email');
      throw err;
    }
  })
);

router.get(
  '/membership',
  authMiddleware,
  adminOnly,
  asyncHandler(async (_req, res) => {
    const memberships = await Membership.find().sort({ applied_at: -1 });
    res.json({ success: true, memberships });
  })
);

router.put(
  '/membership/:id/status',
  authMiddleware,
  adminOnly,
  schemas.idParam(),
  schemas.membershipStatus,
  validate,
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    const update = {
      status,
      approved_at: status === 'active' ? new Date() : null,
      approved_by: req.user.id,
    };
    const membership = await Membership.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!membership) throw new HttpError(404, 'Membership not found');
    res.json({ success: true, membership });
  })
);

// ==================== CONTACT ====================
router.post(
  '/contact',
  writeLimiter,
  schemas.contactCreate,
  validate,
  asyncHandler(async (req, res) => {
    const contact = await Contact.create(req.body);
    res.status(201).json({ success: true, contact, message: 'Message sent' });
  })
);

router.get(
  '/contact',
  authMiddleware,
  adminOnly,
  asyncHandler(async (_req, res) => {
    const contacts = await Contact.find().sort({ created_at: -1 });
    res.json({ success: true, contacts });
  })
);

module.exports = router;
