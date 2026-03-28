const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ['premium_upgrade', 'extra_listing'], required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    paymentMethod: { type: String, default: 'mpesa' },
    mpesaPhone: { type: String },
    reference: { type: String, unique: true, default: () => `TXN-${uuidv4().substring(0, 8).toUpperCase()}` },
    receiptNumber: { type: String },
    failureReason: { type: String },
}, { timestamps: true });

transactionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
