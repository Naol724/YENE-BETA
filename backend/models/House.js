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
    enum: ['Apartment', 'Villa', 'Studio', 'Family house', 'Single room', 'House', 'Condo'],
    required: [true, 'Please specify property type']
  },
  bedrooms: {
    type: Number,
    required: [true, 'Please specify number of bedrooms'],
    min: [0, 'Bedrooms cannot be negative'],
    max: [20, 'Bedrooms cannot exceed 20']
  },
  bathrooms: {
    type: Number,
    required: [true, 'Please specify number of bathrooms'],
    min: [0, 'Bathrooms cannot be negative'],
    max: [20, 'Bathrooms cannot exceed 20']
  },
  squareFootage: {
    type: Number,
    min: [0, 'Square footage cannot be negative']
  },
  location: {
    city: {
      type: String,
      required: [true, 'Please specify city'],
      trim: true,
      maxlength: [50, 'City name too long']
    },
    area: {
      type: String,
      required: [true, 'Please specify area/sub-city'],
      trim: true,
      maxlength: [50, 'Area name too long']
    },
    address: {
      type: String,
      required: [true, 'Please specify full address'],
      trim: true,
      maxlength: [200, 'Address too long']
    },
    coordinates: {
      lat: { type: Number, min: -90, max: 90 },
      lng: { type: Number, min: -180, max: 180 }
    }
  },
  pricing: {
    pricePerMonth: {
      type: Number,
      required: [true, 'Please specify monthly rent'],
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      enum: ['ETB', 'USD', 'EUR'],
      default: 'ETB'
    },
    securityDeposit: {
      type: Number,
      min: [0, 'Security deposit cannot be negative']
    },
    utilitiesIncluded: [String],
    paymentFrequency: {
      type: String,
      enum: ['Monthly', 'Quarterly', 'Annually'],
      default: 'Monthly'
    }
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    minlength: [50, 'Description must be at least 50 characters'],
    maxlength: [3000, 'Description cannot exceed 3000 characters']
  },
  amenities: [{
    type: String,
    enum: [
      'WiFi', 'Water', 'Electricity', 'Security', 'Furnished', 'Balcony',
      'Parking', 'Air conditioning', 'Swimming Pool', 'Gym', 'Elevator',
      'Garden', 'Pet friendly', 'Wheelchair accessible', 'Hot water',
      'Backup generator', 'CCTV', 'Intercom', 'Kids play area', 'Rooftop',
      'Study room', 'Walk-in closet', 'Hardwood floors', 'Kitchen',
      'Laundry room', 'Storage', 'Dishwasher', 'Refrigerator',
      'Microwave', 'Oven', 'Stove', 'Washer', 'Dryer', 'Internet'
    ]
  }],
  customAmenities: [String],
  images: [{
    url: {
      type: String,
      required: true
    },
    public_id: String,
    isMain: {
      type: Boolean,
      default: false
    },
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  contact: {
    phone: {
      type: String,
      required: [true, 'Please provide contact phone number'],
      validate: {
        validator: function(v) {
          return /^(\+?\d{1,3}[- ]?)?\d{10}$/.test(v);
        },
        message: 'Please enter a valid phone number'
      }
    },
    whatsapp: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^(\+?\d{1,3}[- ]?)?\d{10}$/.test(v);
        },
        message: 'Please enter a valid WhatsApp number'
      }
    },
    ownerName: {
      type: String,
      required: [true, 'Please provide owner name'],
      trim: true,
      maxlength: [100, 'Owner name too long']
    }
  },
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
    enum: ['Available', 'Rented', 'Active', 'Paused', 'Flagged'],
    default: 'Available'
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  availability: {
    availableFrom: {
      type: Date,
      default: Date.now
    },
    minimumStay: {
      type: Number,
      default: 1,
      min: 1
    },
    maximumStay: {
      type: Number
    }
  },
  statistics: {
    contactCount: {
      type: Number,
      default: 0
    },
    favoriteCount: {
      type: Number,
      default: 0
    },
    lastContacted: Date
  }
}, { timestamps: true });

// Create a geospatial index for nearby queries later
// houseSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('House', houseSchema);
