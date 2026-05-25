const mongoose = require('mongoose');
const baseOptions = require('./baseOptions');

const achievementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 255 },
    description: { type: String, maxlength: 5000, default: null },
    date: { type: Date, default: null },
    image_url: { type: String, maxlength: 500, default: null },
    category: { type: String, maxlength: 100, default: null },
    order_index: { type: Number, default: 0 },
  },
  { ...baseOptions, timestamps: { createdAt: 'created_at', updatedAt: false } }
);

module.exports = mongoose.model('Achievement', achievementSchema);
