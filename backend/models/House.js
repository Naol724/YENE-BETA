const mongoose = require('mongoose');

const houseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a property title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  propertyType: {
    type: String,
    enum: ['Apartment', 'House', 'Condo', 'Studio'],
    required: true
  },
  bedrooms: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  bathrooms: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  squareFootage: {
    type: Number
  },
  location: {
    city: {
      type: String,
      required: true
    },
    area: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  pricing: {
    pricePerMonth: {
      type: Number,
      required: true
    },
    securityDeposit: Number,
    utilitiesIncluded: [String]
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    minlength: 100,
    maxlength: 2000
  },
  amenities: [String],
  images: [{
    url: String,
    public_id: String,
    isMain: Boolean
  }],
  rules: {
    checkInTime: String,
    checkOutTime: String,
    petFriendly: { type: Boolean, default: false },
    smokingAllowed: { type: Boolean, default: false },
    eventsAllowed: { type: Boolean, default: false },
    additionalRules: String
  },
  status: {
    type: String,
    enum: ['Active', 'Paused', 'Flagged'],
    default: 'Active'
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Create a geospatial index for nearby queries later
// houseSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('House', houseSchema);
