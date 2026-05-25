const mongoose = require('mongoose');
const baseOptions = require('./baseOptions');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 255 },
    description: { type: String, default: null },
    short_description: { type: String, maxlength: 500, default: null },
    event_type: {
      type: String,
      enum: ['workshop', 'seminar', 'hackathon', 'competition', 'webinar', 'conference', 'other'],
      default: 'workshop',
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    date: { type: Date, required: true },
    time: { type: String, default: null, match: /^\d{2}:\d{2}(:\d{2})?$/ },
    end_date: { type: Date, default: null },
    venue: { type: String, maxlength: 255, default: null },
    is_online: { type: Boolean, default: false },
    meeting_link: { type: String, maxlength: 500, default: null },
    registration_link: { type: String, maxlength: 500, default: null },
    max_participants: { type: Number, min: 1, default: null },
    current_participants: { type: Number, default: 0, min: 0 },
    image_url: { type: String, maxlength: 500, default: null },
    tags: { type: [String], default: [] },
    is_featured: { type: Boolean, default: false },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  baseOptions
);

eventSchema.index({ date: -1 });
eventSchema.index({ status: 1 });
eventSchema.index({ event_type: 1 });
eventSchema.index({ is_featured: 1 }, { partialFilterExpression: { is_featured: true } });

module.exports = mongoose.model('Event', eventSchema);
