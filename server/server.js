require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const componentRoutes = require('./routes/components');
const uploadRoutes = require('./routes/uploads');

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/components', componentRoutes);
app.use('/api/uploads', uploadRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lowcode';

let mongoMemoryServer;

const startServer = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB connected');
    } catch (err) {
        const shouldUseMemoryFallback =
            !process.env.MONGO_URI &&
            (err.message.includes('ECONNREFUSED') || err.message.includes('127.0.0.1:27017'));

        if (!shouldUseMemoryFallback) {
            throw err;
        }

        console.warn('⚠️ Local MongoDB not found. Starting in-memory MongoDB...');
        mongoMemoryServer = await MongoMemoryServer.create();
        const memoryUri = mongoMemoryServer.getUri();
        await mongoose.connect(memoryUri);
        console.log('✅ Connected to in-memory MongoDB');
    }

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

startServer().catch(async (err) => {
    console.error('❌ MongoDB connection error:', err.message);
    if (mongoMemoryServer) {
        await mongoMemoryServer.stop();
    }
    process.exit(1);
});