const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// 1. GET: Fetch all products from the database
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching all products:", error);
        res.status(500).json({ 
            message: "Failed to fetch products.", 
            error: error.message 
        });
    }
});

// 2. GET: Fetch products by a specific category
router.get('/category/:categoryName', async (req, res) => {
    try {
        const categoryName = req.params.categoryName;
        const products = await Product.find({ category: categoryName });
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products by category:", error);
        res.status(500).json({ 
            message: "Failed to fetch category.", 
            error: error.message 
        });
    }
});

// 3. POST: Add a new product to the database
router.post('/', async (req, res) => {
    try {
        const newProduct = new Product({
            name: req.body.name,
            category: req.body.category,
            price: req.body.price,
            image: req.body.image,
            description: req.body.description
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error("Error saving product:", error);
        res.status(500).json({ 
            message: "Failed to add product.", 
            error: error.message 
        });
    }
});

// 4. PUT: Update an existing product by its ID
router.put('/:id', async (req, res) => {
    try {
        // Find product by ID and update it with new data from req.body
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true } // Return the updated document
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found in database!" });
        }

        res.status(200).json({ message: "Product updated successfully!", product: updatedProduct });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ 
            message: "Failed to update product.", 
            error: error.message 
        });
    }
});

// 5. DELETE: Remove a product from the database by its ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        
        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found in database!" });
        }
        
        res.status(200).json({ message: "Product deleted successfully!" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ 
            message: "Failed to delete product.", 
            error: error.message 
        });
    }
});

module.exports = router;