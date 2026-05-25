const mongoose = require('mongoose');
const baseOptions = require('./baseOptions');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 255 },
    email: {
      type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 255,
    },
    password_hash: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'member', 'moderator'], default: 'member' },
  },
  baseOptions
);

userSchema.set('toJSON', {
  ...baseOptions.toJSON,
  transform: (_doc, ret) => {
    ret.id = ret._id?.toString?.();
    delete ret._id;
    delete ret.password_hash;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
