require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

const User = require('../models/User');
const House = require('../models/House');
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');

async function seed() {
    await connectDB();
    console.log('🌱 Seeding database...');

    // Clear existing data
    await Promise.all([
        User.deleteMany({}),
        House.deleteMany({}),
        Transaction.deleteMany({}),
        AuditLog.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // ── USERS ──────────────────────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash('password123', 10);
    const adminHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);

    const users = await User.insertMany([
        // Admin
        {
            name: 'Admin User', email: process.env.ADMIN_EMAIL || 'admin@houserental.com',
            password: adminHash, phone: '+254700000000', role: 'admin',
            isApproved: true, status: 'active',
        },
        // Owners
        {
            name: 'John Doe', email: 'john@example.com',
            password: passwordHash, phone: '+254712345678', role: 'owner',
            isApproved: true, status: 'active', isPremium: true,
            premiumExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            location: 'Nairobi, Kenya',
        },
        {
            name: 'Peter Otieno', email: 'peter@example.com',
            password: passwordHash, phone: '+254723456789', role: 'owner',
            isApproved: true, status: 'active',
            location: 'Nairobi, Kenya',
        },
        // Brokers
        {
            name: 'Mary Wanjiku', email: 'mary@example.com',
            password: passwordHash, phone: '+254734567890', role: 'broker',
            isApproved: true, status: 'active', isPremium: true,
            premiumExpiry: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            location: 'Mombasa, Kenya',
        },
        {
            name: 'Samuel Kamau', email: 'samuel@example.com',
            password: passwordHash, phone: '+254745678901', role: 'broker',
            isApproved: false, status: 'active',  // Pending approval
            location: 'Kisumu, Kenya',
        },
        // Renters
        {
            name: 'Grace Akinyi', email: 'grace@example.com',
            password: passwordHash, phone: '+254756789012', role: 'renter',
            isApproved: true, status: 'active',
            location: 'Nairobi, Kenya',
        },
        {
            name: 'James Mwangi', email: 'james@example.com',
            password: passwordHash, phone: '+254767890123', role: 'renter',
            isApproved: true, status: 'active',
            location: 'Nakuru, Kenya',
        },
        // Pending broker
        {
            name: 'Ruth Njeri', email: 'ruth@example.com',
            password: passwordHash, phone: '+254778901234', role: 'owner',
            isApproved: false, status: 'active',  // Pending approval
            location: 'Eldoret, Kenya',
        },
    ]);

    const [admin, john, peter, mary, samuel, grace, james, ruth] = users;
    console.log(`👥 Created ${users.length} users`);

    // ── HOUSES ─────────────────────────────────────────────────────────────────
    const houses = await House.insertMany([
        {
            title: 'Modern 3BR Apartment in Westlands',
            description: 'Spacious and modern apartment with stunning city views. Features a fully equipped kitchen, master ensuite, and secure parking. Located in the heart of Westlands, close to shopping centers and restaurants.',
            price: 75000, location: 'Westlands, Nairobi', bedrooms: 3, bathrooms: 2,
            type: 'apartment', amenities: ['wifi', 'parking', 'security', 'gym', 'swimming_pool'],
            images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'],
            listedBy: john._id, isPremium: true, isActive: true, status: 'active', views: 342, inquiryCount: 18,
            createdAt: new Date('2024-01-15'),
        },
        {
            title: 'Cozy Studio in Kilimani',
            description: 'Perfect for young professionals. Close to shopping centers and public transport. All utilities included. Modern finish with open plan living.',
            price: 28000, location: 'Kilimani, Nairobi', bedrooms: 1, bathrooms: 1,
            type: 'studio', amenities: ['wifi', 'security', 'water'],
            images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
            listedBy: peter._id, isPremium: false, isActive: true, status: 'active', views: 189, inquiryCount: 9,
            createdAt: new Date('2024-02-01'),
        },
        {
            title: 'Spacious 4BR Family Home in Karen',
            description: 'Excellent family home in the leafy suburbs of Karen. Large garden, servant quarters, and ample parking. Near international schools and Karen shopping centre.',
            price: 150000, location: 'Karen, Nairobi', bedrooms: 4, bathrooms: 3,
            type: 'house', amenities: ['parking', 'security', 'garden', 'servants_quarters', 'borehole'],
            images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'],
            listedBy: mary._id, isPremium: true, isActive: true, status: 'active', views: 521, inquiryCount: 24,
            createdAt: new Date('2024-02-10'),
        },
        {
            title: '2BR Apartment — Mombasa Road',
            description: 'Modern 2 bedroom apartment along Mombasa Road. Great access to the expressway. Includes fibre internet and DSTV connection.',
            price: 45000, location: 'Mombasa Road, Nairobi', bedrooms: 2, bathrooms: 1,
            type: 'apartment', amenities: ['wifi', 'parking', 'security'],
            images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
            listedBy: john._id, isPremium: false, isActive: true, status: 'active', views: 203, inquiryCount: 11,
            createdAt: new Date('2024-02-20'),
        },
        {
            title: 'Luxury Condo in Riverside',
            description: 'Premium condo with panoramic river views. Fully serviced with concierge, gym, rooftop pool, and 24-hour security. Ideal for executives.',
            price: 120000, location: 'Riverside, Nairobi', bedrooms: 2, bathrooms: 2,
            type: 'condo', amenities: ['wifi', 'parking', 'security', 'gym', 'swimming_pool', 'concierge'],
            images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
            listedBy: mary._id, isPremium: true, isActive: true, status: 'active', views: 678, inquiryCount: 31,
            createdAt: new Date('2024-03-01'),
        },
        {
            title: 'Affordable 1BR in Ruaka',
            description: 'Clean and affordable one bedroom apartment in the growing suburb of Ruaka. Easy access to the Northern Bypass. Water included.',
            price: 18000, location: 'Ruaka, Kiambu', bedrooms: 1, bathrooms: 1,
            type: 'apartment', amenities: ['security', 'water'],
            images: [],
            listedBy: peter._id, isPremium: false, isActive: true, status: 'active', views: 97, inquiryCount: 5,
            createdAt: new Date('2024-03-10'),
        },
    ]);
    console.log(`🏠 Created ${houses.length} houses`);

    // ── TRANSACTIONS ────────────────────────────────────────────────────────────
    const transactions = await Transaction.insertMany([
        {
            userId: john._id, amount: 5000, type: 'premium_upgrade',
            status: 'completed', paymentMethod: 'mpesa', mpesaPhone: '+254712345678',
            reference: 'TXN-SEED-001', receiptNumber: 'MPESA001', createdAt: new Date('2024-01-10'),
        },
        {
            userId: mary._id, amount: 5000, type: 'premium_upgrade',
            status: 'completed', paymentMethod: 'mpesa', mpesaPhone: '+254734567890',
            reference: 'TXN-SEED-002', receiptNumber: 'MPESA002', createdAt: new Date('2024-02-05'),
        },
        {
            userId: john._id, amount: 2000, type: 'extra_listing',
            status: 'completed', paymentMethod: 'mpesa', mpesaPhone: '+254712345678',
            reference: 'TXN-SEED-003', receiptNumber: 'MPESA003', createdAt: new Date('2024-02-15'),
        },
        {
            userId: peter._id, amount: 2000, type: 'extra_listing',
            status: 'pending', paymentMethod: 'mpesa', mpesaPhone: '+254723456789',
            reference: 'TXN-SEED-004', createdAt: new Date('2024-03-01'),
        },
    ]);
    console.log(`💳 Created ${transactions.length} transactions`);

    // ── AUDIT LOGS ──────────────────────────────────────────────────────────────
    const auditLogs = await AuditLog.insertMany([
        { adminId: admin._id, action: 'Approved owner: John Doe', targetType: 'user', targetId: john._id.toString(), ipAddress: '127.0.0.1', status: 'success', createdAt: new Date('2024-01-08') },
        { adminId: admin._id, action: 'Approved broker: Mary Wanjiku', targetType: 'user', targetId: mary._id.toString(), ipAddress: '127.0.0.1', status: 'success', createdAt: new Date('2024-01-20') },
        { adminId: admin._id, action: 'Deleted listing: Old Apartment', targetType: 'listing', targetId: null, ipAddress: '127.0.0.1', status: 'success', createdAt: new Date('2024-02-12') },
        { adminId: admin._id, action: 'Updated platform settings', targetType: 'setting', targetId: null, ipAddress: '127.0.0.1', status: 'success', createdAt: new Date('2024-02-28') },
        { adminId: admin._id, action: 'Exported user report (CSV)', targetType: 'report', targetId: null, ipAddress: '127.0.0.1', status: 'success', createdAt: new Date('2024-03-15') },
    ]);
    console.log(`📋 Created ${auditLogs.length} audit logs`);

    console.log('\n✅ Seeding complete!');
    console.log('────────────────────────────────────────');
    console.log('Admin Login:');
    console.log(`  Email: ${admin.email}`);
    console.log(`  Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    console.log('\nTest Users (all password: password123):');
    console.log(`  Owner (premium): ${john.email}`);
    console.log(`  Owner: ${peter.email}`);
    console.log(`  Broker (premium): ${mary.email}`);
    console.log(`  Broker (pending): ${samuel.email}`);
    console.log(`  Renter: ${grace.email}`);
    console.log('────────────────────────────────────────');

    mongoose.connection.close();
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Seeder error:', err);
    mongoose.connection.close();
    process.exit(1);
});
