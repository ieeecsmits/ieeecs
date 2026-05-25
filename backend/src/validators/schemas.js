const { body, param, query } = require('express-validator');

const email = () => body('email').isEmail().withMessage('Valid email is required').normalizeEmail();
const requiredStr = (field, max = 255) =>
  body(field).isString().trim().isLength({ min: 1, max }).withMessage(`${field} is required (max ${max} chars)`);
const optionalStr = (field, max = 500) =>
  body(field).optional({ nullable: true }).isString().trim().isLength({ max }).withMessage(`${field} too long (max ${max})`);
const optionalUrl = (field) =>
  body(field).optional({ nullable: true, checkFalsy: true }).isURL().withMessage(`${field} must be a valid URL`);
const optionalEnum = (field, values) =>
  body(field).optional().isIn(values).withMessage(`${field} must be one of: ${values.join(', ')}`);
const uuidParam = (name = 'id') => param(name).isUUID().withMessage(`${name} must be a UUID`);

const pagination = [
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('offset').optional().isInt({ min: 0 }).toInt(),
];

const login = [
  email(),
  body('password').isString().isLength({ min: 1 }).withMessage('Password is required'),
];

const eventCreate = [
  requiredStr('title'),
  optionalStr('description', 10000),
  optionalStr('short_description', 500),
  optionalEnum('event_type', ['workshop', 'seminar', 'hackathon', 'competition', 'webinar', 'conference', 'other']),
  optionalEnum('status', ['upcoming', 'ongoing', 'completed', 'cancelled']),
  body('date').isISO8601().withMessage('date must be ISO8601 (YYYY-MM-DD)'),
  body('time').optional({ nullable: true, checkFalsy: true }).matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('time must be HH:MM[:SS]'),
  body('end_date').optional({ nullable: true, checkFalsy: true }).isISO8601(),
  optionalStr('venue'),
  body('is_online').optional().isBoolean().toBoolean(),
  optionalUrl('meeting_link'),
  optionalUrl('registration_link'),
  body('max_participants').optional({ nullable: true }).isInt({ min: 1 }).toInt(),
  optionalUrl('image_url'),
  body('tags').optional().isArray().withMessage('tags must be an array'),
  body('is_featured').optional().isBoolean().toBoolean(),
];

const eventRegister = [
  requiredStr('name'),
  email(),
  optionalStr('phone', 20),
  optionalStr('college'),
  optionalStr('branch'),
  optionalStr('year_of_study', 20),
  optionalStr('roll_number', 100),
  optionalStr('ieee_member_id', 100),
  body('is_ieee_member').optional().isBoolean().toBoolean(),
  optionalStr('notes', 2000),
];

const officeBearerCreate = [
  requiredStr('name'),
  requiredStr('position'),
  optionalStr('department'),
  optionalStr('year', 20),
  body('email').optional({ nullable: true, checkFalsy: true }).isEmail().normalizeEmail(),
  optionalUrl('linkedin_url'),
  optionalUrl('github_url'),
  optionalUrl('image_url'),
  optionalStr('bio', 2000),
  body('order_index').optional().isInt({ min: 0 }).toInt(),
  optionalStr('tenure_year', 20),
];

const galleryCreate = [
  optionalStr('title'),
  optionalStr('description', 2000),
  body('image_url').isURL().withMessage('image_url must be a valid URL'),
  body('event_id').optional({ nullable: true, checkFalsy: true }).isUUID(),
  optionalStr('category', 100),
  body('is_featured').optional().isBoolean().toBoolean(),
];

const membershipApply = [
  requiredStr('name'),
  email(),
  optionalStr('phone', 20),
  optionalStr('college'),
  optionalStr('branch'),
  optionalStr('year_of_study', 20),
  optionalStr('roll_number', 100),
  optionalStr('ieee_membership_id', 100),
  optionalEnum('membership_type', ['student', 'associate', 'full', 'senior']),
];

const membershipStatus = [
  body('status').isIn(['pending', 'active', 'expired', 'rejected']).withMessage('Invalid status'),
];

const contactCreate = [
  requiredStr('name'),
  email(),
  optionalStr('subject'),
  requiredStr('message', 5000),
];

module.exports = {
  uuidParam,
  pagination,
  login,
  eventCreate,
  eventRegister,
  officeBearerCreate,
  galleryCreate,
  membershipApply,
  membershipStatus,
  contactCreate,
};
