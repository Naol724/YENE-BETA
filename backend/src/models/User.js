const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Name is required'], trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email format'] },
    phone: { type: String, required: [true, 'Phone is required'], trim: true },
    password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    role: { type: String, enum: ['renter', 'owner', 'broker', 'admin'], required: true, default: 'renter' },
    isApproved: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    premiumExpiry: { type: Date },
    avatar: { type: String },
    location: { type: String, trim: true },
    bio: { type: String, maxlength: 500 },
    status: { type: String, enum: ['active', 'suspended', 'banned'], default: 'active' },
    suspensionReason: { type: String },
    suspensionExpiry: { type: Date },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    refreshToken: { type: String, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },
}, { timestamps: true });

// Auto-approve renters
userSchema.pre('save', function (next) {
    if (this.isNew && this.role === 'renter') this.isApproved = true;
    if (this.isNew && this.role === 'admin') this.isApproved = true;
    next();
});

// Hash password on save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare password
userSchema.methods.matchPassword = async function (entered) {
    return bcrypt.compare(entered, this.password);
};

// Check if premium is still valid
userSchema.methods.checkPremium = function () {
    if (!this.isPremium) return false;
    if (this.premiumExpiry && this.premiumExpiry < new Date()) {
        this.isPremium = false;
        this.save();
        return false;
    }
    return true;
};

module.exports = mongoose.model('User', userSchema);
