const mongoose = require('mongoose');
const baseOptions = require('./baseOptions');

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 255 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 255 },
    subject: { type: String, maxlength: 255, default: null },
    message: { type: String, required: true, maxlength: 5000 },
    is_read: { type: Boolean, default: false },
    replied_at: { type: Date, default: null },
  },
  { ...baseOptions, timestamps: { createdAt: 'created_at', updatedAt: false } }
);

contactSchema.index({ is_read: 1, created_at: -1 });

module.exports = mongoose.model('Contact', contactSchema);
