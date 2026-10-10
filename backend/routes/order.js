const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); // Ensure you have an Order model

// 1. GET: Fetch all orders (For Admin Panel)
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching all orders:", error);
        res.status(500).json({ message: "Failed to fetch orders.", error: error.message });
    }
});

// 2. GET: Fetch orders for a specific user (For User Profile) 
// (Lưu ý: Phải đặt API này TRƯỚC API lấy theo ID bên dưới để tránh lỗi route)
router.get('/user/:userId', async (req, res) => {
    try {
        // Tìm tất cả đơn hàng có chứa ID của user đang đăng nhập
        const orders = await Order.find({ user: req.params.userId }).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).json({ message: "Failed to fetch user orders.", error: error.message });
    }
});

// 3. GET: Fetch a specific order by ID
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found!" });
        }
        res.status(200).json(order);
    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({ message: "Failed to fetch order details.", error: error.message });
    }
});

// 4. POST: Create a new order (For Customer Checkout)
router.post('/', async (req, res) => {
    try {
        // Lấy toàn bộ dữ liệu giỏ hàng mà Frontend gửi lên và tạo đơn hàng mới
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();
        
        res.status(201).json({ 
            message: "Order placed successfully!", 
            order: savedOrder 
        });
    } catch (error) {
        console.error("Error saving order:", error);
        res.status(500).json({ message: "Failed to place order.", error: error.message });
    }
});

// 5. PUT: Update order status (For Admin Panel)
router.put('/:id/status', async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        
        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found!" });
        }
        
        res.status(200).json({ message: "Order status updated!", order: updatedOrder });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ message: "Failed to update order status.", error: error.message });
    }
});

module.exports = router;