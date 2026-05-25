const mongoose = require('mongoose');
const baseOptions = require('./baseOptions');

const membershipSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 255 },
    email: {
      type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 255,
    },
    phone: { type: String, maxlength: 20, default: null },
    college: { type: String, maxlength: 255, default: null },
    branch: { type: String, maxlength: 255, default: null },
    year_of_study: { type: String, maxlength: 20, default: null },
    roll_number: { type: String, maxlength: 100, default: null },
    ieee_membership_id: { type: String, maxlength: 100, default: null },
    membership_type: {
      type: String,
      enum: ['student', 'associate', 'full', 'senior'],
      default: 'student',
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'expired', 'rejected'],
      default: 'pending',
    },
    applied_at: { type: Date, default: Date.now },
    approved_at: { type: Date, default: null },
    approved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { ...baseOptions, timestamps: false }
);

membershipSchema.index({ status: 1, applied_at: -1 });

module.exports = mongoose.model('Membership', membershipSchema);
