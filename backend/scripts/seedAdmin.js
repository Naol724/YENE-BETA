#!/usr/bin/env node

/**
 * Seed script to create admin user for YENE-BETA platform
 * 
 * Usage:
 *   node scripts/seedAdmin.js
 * 
 * This script will create an admin user with:
 *   Email: naolgonfa449@gmail.com
 *   Password: 12345678
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const User = require('../models/User');

const ADMIN_EMAIL = 'naolgonfa449@gmail.com';
const ADMIN_PASSWORD = '12345678';
const ADMIN_NAME = 'Admin User';
const ADMIN_PHONE = '+251911222333';

async function seedAdmin() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/house_rental';
    console.log('[Seed] Connecting to MongoDB...');
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      family: 4,
    });
    
    console.log('[Seed] Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    
    if (existingAdmin) {
      console.log(`[Seed] Admin user with email ${ADMIN_EMAIL} already exists.`);
      console.log('[Seed] Skipping creation.');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create admin user
    console.log('[Seed] Creating admin user...');
    const adminUser = new User({
      fullName: ADMIN_NAME,
      email: ADMIN_EMAIL,
      phone: ADMIN_PHONE,
      password: ADMIN_PASSWORD,
      role: 'ADMIN',
      isApproved: true,
      isEmailVerified: true,
    });

    await adminUser.save();

    console.log('[Seed] ✓ Admin user created successfully!');
    console.log('[Seed] ');
    console.log('[Seed] Admin Credentials:');
    console.log(`[Seed]   Email: ${ADMIN_EMAIL}`);
    console.log(`[Seed]   Password: ${ADMIN_PASSWORD}`);
    console.log('[Seed] ');
    console.log('[Seed] You can now login to the admin dashboard at /admin');
    console.log('[Seed] ');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedAdmin();
