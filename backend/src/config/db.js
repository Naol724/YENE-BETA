const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB connection error: ${error.message}`);
        console.error('');
        console.error('⚠️  Make sure MongoDB is running locally on port 27017, OR');
        console.error('    update MONGODB_URI in .env to a MongoDB Atlas connection string.');
        console.error('    Free Atlas cluster: https://www.mongodb.com/cloud/atlas/register');
        process.exit(1);
    }
};

module.exports = connectDB;
