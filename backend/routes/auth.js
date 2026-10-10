const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // Using bcryptjs as it is more stable on Windows environments
const User = require('../models/User'); // Correct path to your User model

// @route   POST /register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        // Included phone and address to match the frontend form and database schema
        const { fullname, email, password, phone, address } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists with this email.' });
        }

        // Hash password before saving to database
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user object
        user = new User({
            fullname: fullname,
            email: email,
            password: hashedPassword,
            phone: phone || '',
            address: address || ''
        });

        // Save user to MongoDB
        await user.save();

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error('Register Error:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// @route   POST /login
// @desc    Authenticate user and log in
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check if the user exists in MongoDB
        const user = await User.findOne({ email });
        if (!user) {
            // For security, do not specify whether the email or password is wrong
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        // 2. Compare the provided password with the hashed password in MongoDB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        // 3. Send success response (along with basic user info for frontend localStorage)
        res.status(200).json({ 
            message: 'Login successful!',
            user: {
                id: user._id,
                fullname: user.fullname,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login Error:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;