const mongoose = require('mongoose');

const connectDB = async () => {
    // Check if the URI exists before trying to connect
    const dbUri = process.env.MONGO_URI;
    
    if (!dbUri) {
        console.error('❌ Error: MONGO_URI is not defined in the .env file.');
        process.exit(1);
    }

    try {
        await mongoose.connect(dbUri);
        console.log('🚀 MongoDB Connected...');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;