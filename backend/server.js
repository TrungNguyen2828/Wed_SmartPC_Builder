const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// FIXED: Hardcoded port to 5001 to match Frontend requests and avoid port 5000 conflicts
const PORT = 5001; 

// Configure CORS to allow the Frontend to request data
app.use(cors());

// Increase limit to 50mb to safely handle large Base64 image strings from Frontend
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/SmartPC_Builder')
  .then(() => console.log("✅ MongoDB connected successfully to SmartPC_Builder!"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Test Route
app.get('/', (req, res) => {
    res.send("Backend server is running perfectly on port 5001!");
});

// --- ROUTE TRACKING SYSTEM ---
console.log("⏳ Loading API Routes...");
const userRoute = require('./routes/auth'); 
const productRoute = require('./routes/product');
const orderRoute = require('./routes/order'); 
console.log("✅ Loaded route files successfully!");

// Mount routes
app.use('/api/users', userRoute); 
app.use('/api/products', productRoute);
app.use('/api/orders', orderRoute); 
console.log("✅ Mounted /api/orders route!");

// --- 404 JSON FALLBACK HANDLER (CRITICAL FIX FOR '<' ERROR) ---
app.use((req, res, next) => {
    console.log(`❌ WARNING: Frontend called invalid route: ${req.method} ${req.url}`);
    res.status(404).json({ message: "API route not found on the server!" });
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running flawlessly on port ${PORT}`);
});