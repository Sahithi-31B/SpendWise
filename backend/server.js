// 1. Load Environment Variables (Looking in the current backend folder)
require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// 2. Connect to MongoDB
// This will trigger the "MongoDB Connected" message from your config/db.js
connectDB();

// 3. Middleware
// CORS allows your React Frontend (5173) to talk to this API (5000)
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// Allows the server to understand JSON data sent from the frontend
app.use(express.json());

// 4. Routes
// These link your frontend requests to your backend logic
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

// Global Welcome Route (Open http://localhost:5000 in your browser to see this)
app.get('/', (req, res) => {
    res.send('✅ SpendWise MERN API is live and healthy!');
});

// 5. Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`\n🚀 SpendWise Backend running on port ${PORT}`);
    
    // Safety Check: Check if .env variables are actually loaded
    if (!process.env.MONGO_URI) {
        console.log('❌ ERROR: MONGO_URI is undefined. Check your .env file!');
    } else {
        console.log('🔗 .env file loaded successfully.');
    }
});