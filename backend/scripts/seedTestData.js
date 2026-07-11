const mongoose = require('mongoose');
const path = require('path');
const User = require('../models/User');
const House = require('../models/House');

// Load .env from backend directory
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Use the same MongoDB connection logic as server.js
const { resolveMongoUri } = require('../utils/resolveMongoUri');

const seedTestData = async () => {
  try {
    // Connect to MongoDB using the same logic as server.js
    const mongoUri = resolveMongoUri() || 'mongodb://127.0.0.1:27017/house_rental';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Create or find admin user
    let admin = await User.findOne({ email: 'naolgonfa449@gmail.com' });
    if (!admin) {
      admin = await User.create({
        fullName: 'System Administrator',
        email: 'naolgonfa449@gmail.com',
        phone: '+251911000001',
        password: '12345678',
        role: 'ADMIN',
        isEmailVerified: true,
        isApproved: true
      });
      console.log('Created admin user');
    } else {
      // Update admin password to match requirements
      admin.password = '12345678';
      await admin.save();
      console.log('Updated admin user password');
    }

    // Create or find test owner
    let owner = await User.findOne({ email: 'owner@test.com' });
    if (!owner) {
      owner = await User.create({
        fullName: 'Test Property Owner',
        email: 'owner@test.com',
        phone: '+251911000000',
        password: 'password123',
        role: 'OWNER',
        isEmailVerified: true,
        isApproved: true
      });
      console.log('Created test owner');
    }

    // Create sample houses
    const sampleHouses = [
      {
        title: 'Modern Apartment in Bole',
        owner: owner._id,
        propertyType: 'Apartment',
        bedrooms: 2,
        bathrooms: 1,
        squareFootage: 85,
        location: {
          city: 'Addis Ababa',
          area: 'Bole',
          address: 'Bole Road, near Edna Mall'
        },
        pricing: {
          pricePerMonth: 15000,
          securityDeposit: 30000,
          utilitiesIncluded: ['Water', 'Electricity']
        },
        description: 'Beautiful modern apartment in the heart of Bole with easy access to shopping centers, restaurants, and public transportation. The apartment features spacious rooms, natural lighting, and modern amenities.',
        amenities: ['Air Conditioning', 'WiFi', 'Parking', 'Security Guard', 'Elevator', 'Balcony'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
            isMain: true
          },
          {
            url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be'
          }
        ],
        rules: {
          checkInTime: '08:00',
          checkOutTime: '18:00',
          petFriendly: false,
          smokingAllowed: false,
          eventsAllowed: false
        }
      },
      {
        title: 'Cozy Studio in Kazanchis',
        owner: owner._id,
        propertyType: 'Studio',
        bedrooms: 1,
        bathrooms: 1,
        squareFootage: 45,
        location: {
          city: 'Addis Ababa',
          area: 'Kazanchis',
          address: 'Kazanchis Business District'
        },
        pricing: {
          pricePerMonth: 8000,
          securityDeposit: 16000,
          utilitiesIncluded: ['Water']
        },
        description: 'Perfect studio apartment for professionals working in the Kazanchis business area. Compact yet functional with all necessary amenities.',
        amenities: ['WiFi', 'Security Guard', 'Elevator'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
            isMain: true
          }
        ],
        rules: {
          checkInTime: '09:00',
          checkOutTime: '17:00',
          petFriendly: false,
          smokingAllowed: false,
          eventsAllowed: false
        }
      },
      {
        title: 'Spacious Family House in Mekelle',
        owner: owner._id,
        propertyType: 'House',
        bedrooms: 4,
        bathrooms: 2,
        squareFootage: 200,
        location: {
          city: 'Mekelle',
          area: 'Hawelti',
          address: 'Near Hawelti Monument'
        },
        pricing: {
          pricePerMonth: 25000,
          securityDeposit: 50000,
          utilitiesIncluded: ['Water', 'Electricity', 'Garden Service']
        },
        description: 'Large family house with beautiful garden, perfect for families. Located in a quiet neighborhood with easy access to schools and markets.',
        amenities: ['Garden', 'Parking', 'Security Guard', 'Storage', 'Water Tank', 'Generator'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
            isMain: true
          },
          {
            url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c'
          }
        ],
        rules: {
          checkInTime: '07:00',
          checkOutTime: '20:00',
          petFriendly: true,
          smokingAllowed: false,
          eventsAllowed: true,
          additionalRules: 'Family gatherings allowed with prior notice'
        }
      }
    ];

    // Clear existing houses and create new ones
    await House.deleteMany({});
    console.log('Cleared existing houses');

    const createdHouses = await House.insertMany(sampleHouses);
    console.log(`Created ${createdHouses.length} sample houses`);

    // Log the created house IDs for testing
    createdHouses.forEach((house, index) => {
      console.log(`House ${index + 1}: ${house.title} (ID: ${house._id})`);
    });

    console.log('Test data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding test data:', error);
    process.exit(1);
  }
};

seedTestData();
