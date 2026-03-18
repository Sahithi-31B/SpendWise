const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json({ message: "User Created" });
    } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
        const token = jwt.sign({ id: user._id }, 'SECRET_KEY', { expiresIn: '1h' });
        res.json({ token, name: user.name });
    } else {
        res.status(401).json({ message: "Invalid Credentials" });
    }
};