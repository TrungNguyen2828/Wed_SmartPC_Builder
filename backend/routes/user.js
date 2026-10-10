const express = require('express');
const router = express.Router();
const User = require('../models/User');

// API: Get User Profile
router.get('/profile/:email', async (req, res) => {
    try {
        // Find user by email, exclude password from response
        const user = await User.findOne({ email: req.params.email }).select('-password');
        if (!user) return res.status(404).json({ message: "User not found" });
        
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// API: Update User Profile (Email is locked)
router.put('/profile/:email', async (req, res) => {
    try {
        // Extract fields from frontend request
        const { username, phone, address } = req.body;
        
        const updatedUser = await User.findOneAndUpdate(
            { email: req.params.email },
            { 
                $set: {
                    fullname: username, // Mapped 'username' from frontend to 'fullname' in DB
                    phone: phone,
                    address: address
                }
            },
            { returnDocument: 'after' } // Replaced 'new: true' to fix Mongoose deprecation warning
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Profile updated successfully!", user: updatedUser });
    } catch (err) {
        res.status(500).json({ message: "Error updating profile", error: err.message });
    }
});

module.exports = router;