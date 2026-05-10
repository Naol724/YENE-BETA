const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.ObjectId,
    ref: 'House',
    required: true
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  tenant: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide an end date']
  },
  totalCost: {
    type: Number,
    required: [true, 'Please provide the total cost']
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Cancelled', 'Active', 'Completed'],
    default: 'Pending'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partial', 'Completed', 'Refunded'],
    default: 'Pending'
  },
  tenantInfo: {
    fullName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    idNumber: String,
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    }
  },
  specialRequests: String,
  agreeToTerms: {
    type: Boolean,
    required: true,
    default: false
  },
  paymentTransaction: {
    type: mongoose.Schema.ObjectId,
    ref: 'Transaction'
  },
  approvalDate: Date,
  rejectionReason: String,
  cancellationReason: String,
  moveInDate: Date,
  moveOutDate: Date,
  notes: [{
    author: {
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

// Index for finding bookings by property and date range
bookingSchema.index({ property: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ tenant: 1 });
bookingSchema.index({ owner: 1 });
bookingSchema.index({ status: 1 });

// Pre-save middleware to check for overlapping bookings
bookingSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('startDate') || this.isModified('endDate')) {
    const overlappingBooking = await this.constructor.findOne({
      property: this.property,
      status: { $in: ['Pending', 'Approved', 'Active'] },
      _id: { $ne: this._id },
      $or: [
        {
          startDate: { $lte: this.endDate },
          endDate: { $gte: this.startDate }
        }
      ]
    });

    if (overlappingBooking) {
      const error = new Error('Property is already booked for these dates');
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
