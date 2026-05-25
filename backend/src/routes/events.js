const express = require('express');

const { Event, EventRegistration } = require('../models');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { writeLimiter } = require('../middleware/rateLimits');
const asyncHandler = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const schemas = require('../validators/schemas');
const buildUpdate = require('../utils/buildUpdate');
const HttpError = require('../utils/HttpError');

const router = express.Router();

const EVENT_UPDATABLE_FIELDS = new Set([
  'title', 'description', 'short_description', 'event_type', 'status',
  'date', 'time', 'end_date', 'venue', 'is_online', 'meeting_link',
  'registration_link', 'max_participants', 'current_participants',
  'image_url', 'tags', 'is_featured',
]);

const EVENT_CREATE_FIELDS = [
  'title', 'description', 'short_description', 'event_type', 'status',
  'date', 'time', 'end_date', 'venue', 'is_online', 'meeting_link',
  'registration_link', 'max_participants', 'image_url', 'tags', 'is_featured',
];

router.get(
  '/',
  schemas.pagination,
  validate,
  asyncHandler(async (req, res) => {
    const { status, type, featured } = req.query;
    const limit = req.query.limit ?? 20;
    const offset = req.query.offset ?? 0;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.event_type = type;
    if (featured === 'true') filter.is_featured = true;

    const [events, total] = await Promise.all([
      Event.find(filter).sort({ date: -1 }).skip(offset).limit(limit),
      Event.countDocuments(filter),
    ]);

    res.json({ success: true, events, total, limit, offset });
  })
);

router.get(
  '/:id',
  schemas.idParam(),
  validate,
  asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) throw new HttpError(404, 'Event not found');
    res.json({ success: true, event });
  })
);

router.post(
  '/',
  authMiddleware,
  adminOnly,
  schemas.eventCreate,
  validate,
  asyncHandler(async (req, res) => {
    const doc = {};
    for (const f of EVENT_CREATE_FIELDS) if (f in req.body) doc[f] = req.body[f];
    doc.created_by = req.user.id;
    const event = await Event.create(doc);
    res.status(201).json({ success: true, event });
  })
);

router.put(
  '/:id',
  authMiddleware,
  adminOnly,
  schemas.idParam(),
  validate,
  asyncHandler(async (req, res) => {
    const update = buildUpdate(req.body, EVENT_UPDATABLE_FIELDS);
    const event = await Event.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!event) throw new HttpError(404, 'Event not found');
    res.json({ success: true, event });
  })
);

router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  schemas.idParam(),
  validate,
  asyncHandler(async (req, res) => {
    const result = await Event.findByIdAndDelete(req.params.id);
    if (!result) throw new HttpError(404, 'Event not found');
    await EventRegistration.deleteMany({ event_id: req.params.id });
    res.json({ success: true, message: 'Event deleted' });
  })
);

router.post(
  '/:id/register',
  writeLimiter,
  schemas.idParam(),
  schemas.eventRegister,
  validate,
  asyncHandler(async (req, res) => {
    const eventId = req.params.id;

    // Atomically reserve a seat: only succeeds if event is open and not full.
    const reserved = await Event.findOneAndUpdate(
      {
        _id: eventId,
        status: { $nin: ['completed', 'cancelled'] },
        $or: [
          { max_participants: null },
          { $expr: { $lt: ['$current_participants', '$max_participants'] } },
        ],
      },
      { $inc: { current_participants: 1 } },
      { new: true }
    );

    if (!reserved) {
      const existing = await Event.findById(eventId).lean();
      if (!existing) throw new HttpError(404, 'Event not found');
      if (['completed', 'cancelled'].includes(existing.status)) {
        throw new HttpError(400, `Registration closed: event is ${existing.status}`);
      }
      throw new HttpError(400, 'Event is full');
    }

    try {
      const registration = await EventRegistration.create({
        event_id: eventId,
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        college: req.body.college,
        branch: req.body.branch,
        year_of_study: req.body.year_of_study,
        roll_number: req.body.roll_number,
        ieee_member_id: req.body.ieee_member_id,
        is_ieee_member: req.body.is_ieee_member ?? false,
        notes: req.body.notes,
      });
      res.status(201).json({ success: true, registration, message: 'Registration successful' });
    } catch (err) {
      // Rollback the reservation on failure.
      await Event.updateOne({ _id: eventId }, { $inc: { current_participants: -1 } }).catch(() => {});
      if (err.code === 11000) throw new HttpError(409, 'Already registered with this email');
      throw err;
    }
  })
);

router.get(
  '/:id/registrations',
  authMiddleware,
  adminOnly,
  schemas.idParam(),
  validate,
  asyncHandler(async (req, res) => {
    const registrations = await EventRegistration.find({ event_id: req.params.id })
      .sort({ registered_at: -1 });
    res.json({ success: true, registrations });
  })
);

module.exports = router;
