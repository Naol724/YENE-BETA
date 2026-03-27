const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
    houseId: { type: mongoose.Schema.Types.ObjectId, ref: 'House', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: [true, 'Message is required'], minlength: 10, maxlength: 2000 },
    contactPhone: { type: String },
    status: { type: String, enum: ['pending', 'read', 'responded'], default: 'pending' },
    replies: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
}, { timestamps: true });

inquirySchema.index({ houseId: 1 });
inquirySchema.index({ userId: 1 });

module.exports = mongoose.model('Inquiry', inquirySchema);
