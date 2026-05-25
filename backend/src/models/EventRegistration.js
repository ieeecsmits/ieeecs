const mongoose = require('mongoose');
const baseOptions = require('./baseOptions');

const registrationSchema = new mongoose.Schema(
  {
    event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    name: { type: String, required: true, trim: true, maxlength: 255 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 255 },
    phone: { type: String, maxlength: 20, default: null },
    college: { type: String, maxlength: 255, default: null },
    branch: { type: String, maxlength: 255, default: null },
    year_of_study: { type: String, maxlength: 20, default: null },
    roll_number: { type: String, maxlength: 100, default: null },
    ieee_member_id: { type: String, maxlength: 100, default: null },
    is_ieee_member: { type: Boolean, default: false },
    registration_status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'waitlisted'],
      default: 'pending',
    },
    payment_status: {
      type: String,
      enum: ['free', 'pending', 'paid', 'refunded'],
      default: 'free',
    },
    notes: { type: String, maxlength: 2000, default: null },
    registered_at: { type: Date, default: Date.now },
  },
  { ...baseOptions, timestamps: false }
);

registrationSchema.index({ event_id: 1, email: 1 }, { unique: true });
registrationSchema.index({ event_id: 1, registered_at: -1 });

module.exports = mongoose.model('EventRegistration', registrationSchema);
