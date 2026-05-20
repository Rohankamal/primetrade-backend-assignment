const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MongoMemoryServer } = require('mongodb-memory-server');
const authRoutes = require('./routes/auth');

const app = express();

// Global Middleware Configuration
app.use(express.json()); 
app.use(cors()); 

// API Routing Initialization (v1 Architecture)
app.use('/api/v1/auth', authRoutes);

// Isolated Memory-Database Grid Initialization
async function initializeCluster() {
    try {
        const mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        await mongoose.connect(mongoUri);
        console.log("🎉 SYSTEM METRIC: INTERNAL MONGODB ENGINE INITIALIZED SUCCESSFULLY (VOLATILE RAM LAYER)");
        
        const PORT = 5000;
        app.listen(PORT, () => {
            console.log(`🚀 SYSTEM METRIC: NETWORK GATEWAY ONLINE ON PORT ${PORT}`);
        });
    } catch (err) {
        console.error("❌ CRITICAL ERROR: MATRIX CLUSTER INITIALIZATION EXCEPTION:", err.message);
    }
}

initializeCluster();