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
    // Pending = awaiting payment; AwaitingApproval = paid, needs admin; Completed = premium granted
    enum: ['Pending', 'AwaitingApproval', 'Completed', 'Failed', 'Rejected'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    default: 'M-Pesa'
  },
  merchantRequestId: {
    type: String,
    index: true,
    sparse: true,
  },
  checkoutRequestId: {
    type: String,
    sparse: true,
  },
  mpesaResultDesc: {
    type: String,
  },
  reviewedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  reviewedAt: {
    type: Date,
  },
  reviewNote: {
    type: String,
    maxlength: 500,
  },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
