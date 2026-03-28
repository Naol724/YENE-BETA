const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  house: {
    type: mongoose.Schema.ObjectId,
    ref: 'House',
    required: true
  }
}, { timestamps: true });

// Prevent duplicate favorites by the same user
favoriteSchema.index({ user: 1, house: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
