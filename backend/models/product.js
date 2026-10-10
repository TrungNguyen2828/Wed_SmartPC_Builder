// File: backend/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true }, // e.g., CPU, GPU, RAM, Mainboard
    price: { type: Number, required: true },
    image: { type: String, required: true },    // URL of the product image OR Base64 string
    description: { type: String, required: true } // Set to true to match Frontend validation
}, {
    timestamps: true // Automatically adds 'createdAt' and 'updatedAt' fields to track product history
});

// The 3rd parameter 'product' safely prevents Mongoose from pluralizing the collection name
module.exports = mongoose.model('Product', productSchema, 'product');