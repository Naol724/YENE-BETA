const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.ObjectId,
    ref: 'House',
    required: true
  },
  renter: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Please add a message'],
    minlength: 10,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['Pending', 'Read', 'Responded'],
    default: 'Pending'
  },
  replies: [{
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    message: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);
