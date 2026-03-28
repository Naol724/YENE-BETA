const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  referenceId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    default: 'M-Pesa'
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
