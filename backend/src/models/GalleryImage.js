const mongoose = require('mongoose');
const baseOptions = require('./baseOptions');

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, maxlength: 255, default: null },
    description: { type: String, maxlength: 2000, default: null },
    image_url: { type: String, required: true, maxlength: 500 },
    event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
    category: { type: String, maxlength: 100, default: 'general' },
    is_featured: { type: Boolean, default: false },
    uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { ...baseOptions, timestamps: { createdAt: 'created_at', updatedAt: false } }
);

gallerySchema.index({ event_id: 1 });
gallerySchema.index({ category: 1 });
gallerySchema.index({ created_at: -1 });

module.exports = mongoose.model('GalleryImage', gallerySchema, 'gallery');
