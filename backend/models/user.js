const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true // Ensure no duplicate emails
    },
    password: { 
        type: String, 
        required: true 
    },
    fullname: { // FIXED: Changed from 'username' to 'fullname' to match Frontend UI
        type: String, 
        default: '' 
    },
    phone: { 
        type: String, 
        default: '' 
    },
    address: { 
        type: String, 
        default: '' 
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);