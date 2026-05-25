const mongoose = require('mongoose');
const baseOptions = require('./baseOptions');

const officeBearerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 255 },
    position: { type: String, required: true, trim: true, maxlength: 255 },
    department: { type: String, maxlength: 255, default: null },
    year: { type: String, maxlength: 20, default: null },
    email: { type: String, lowercase: true, trim: true, maxlength: 255, default: null },
    linkedin_url: { type: String, maxlength: 500, default: null },
    github_url: { type: String, maxlength: 500, default: null },
    image_url: { type: String, maxlength: 500, default: null },
    bio: { type: String, maxlength: 2000, default: null },
    order_index: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
    tenure_year: { type: String, maxlength: 20, default: null },
  },
  { ...baseOptions, timestamps: { createdAt: 'created_at', updatedAt: false } }
);

officeBearerSchema.index({ is_active: 1, order_index: 1 });
officeBearerSchema.index({ tenure_year: 1 });

module.exports = mongoose.model('OfficeBearer', officeBearerSchema);
