require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// 1. Connect to MongoDB
connectDB();

// 2. Middleware
app.use(cors());
app.use(express.json());

// 3. Routes (Linking your separated route files)
app.use('/api/expenses', require('./routes/expenseRoutes'));

// 4. Global Welcome Route
app.get('/', (req, res) => {
    res.send('✅ SpendWise MERN API is live!');
});
// Add this line in your backend server.js
app.use('/api/auth', require('./routes/authRoutes'));
// 3. Routes
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/auth', require('./routes/authRoutes')); // This will work once you create the file above

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Backend Server running on port ${PORT}`);
    console.log(`💡 DB Connection: Check your terminal for "MongoDB Connected"`);
});