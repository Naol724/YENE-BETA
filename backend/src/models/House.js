const mongoose = require('mongoose');

const houseSchema = new mongoose.Schema({
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 200 },
    description: { type: String, required: [true, 'Description is required'], minlength: 10, maxlength: 5000 },
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    location: { type: String, required: [true, 'Location is required'], trim: true },
    coordinates: { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: { type: [Number], default: [36.8219, -1.2921] } },
    bedrooms: { type: Number, required: [true, 'Bedrooms required'], min: 0 },
    bathrooms: { type: Number, required: [true, 'Bathrooms required'], min: 0 },
    type: { type: String, enum: ['apartment', 'house', 'condo', 'studio'], required: true },
    amenities: [{ type: String }],
    images: [{ type: String }],
    listedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isPremium: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    status: { type: String, enum: ['active', 'pending', 'suspended', 'deleted'], default: 'active' },
    isFlagged: { type: Boolean, default: false },
    flagReason: { type: String },
    views: { type: Number, default: 0 },
    inquiryCount: { type: Number, default: 0 },
    houseRules: { type: String },
    availableFrom: { type: Date },
}, { timestamps: true });

houseSchema.index({ location: 'text', title: 'text', description: 'text' });
houseSchema.index({ coordinates: '2dsphere' });
houseSchema.index({ price: 1, bedrooms: 1 });
houseSchema.index({ listedBy: 1 });
houseSchema.index({ status: 1, isPremium: -1 });

module.exports = mongoose.model('House', houseSchema);
