require('dotenv').config()
require('express-async-errors');
const express = require('express');
const connectDB = require('./db/connect');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

// Require routers
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const billRouter = require('./routes/bill');

// Order of middleware is important!
// 1. CORS setup before any other middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // React app URLs
  credentials: true, // Required for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Parse request body and cookies
app.use(express.json());
app.use(cookieParser());

// 3. Static files (if any)
app.use(express.static(path.join(__dirname, '../client/build')));


app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/bills', billRouter);

// Better error handling
app.use((err, req, res, next) => {
    console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        headers: req.headers,
        body: req.body
    });
    
    // Handle specific error types
    if (err.name === 'ValidationError') {
        return res.status(400).json({ msg: err.message });
    }
    
    if (err.name === 'MongoServerError' && err.code === 11000) {
        return res.status(400).json({ msg: 'Duplicate value entered. Please choose another value.' });
    }
    
    // Default error response
    res.status(err.statusCode || 500).json({ 
        msg: err.message || 'Something went wrong, please try again later',
        error: process.env.NODE_ENV === 'development' ? err : undefined
    });
});

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        const PORT = process.env.PORT || 8000;
        
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server listening on port ${PORT}`);
            console.log(`Server available at:`);
            console.log(`  - http://localhost:${PORT}`);
            console.log(`  - http://127.0.0.1:${PORT}`);
        });
    } catch (error) {
        console.error('Server startup error:', error);
    }
}

start();
