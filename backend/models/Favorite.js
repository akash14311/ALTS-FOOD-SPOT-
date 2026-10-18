const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['restaurant', 'food'],
      required: true,
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate favorites for the same user and entity
favoriteSchema.index({ user: 1, type: 1, refId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
