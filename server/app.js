require('dotenv').config()
require('express-async-errors');
const express = require('express');
const connectDB = require('./db/connect');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();

const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const billRouter = require('./routes/bill');

app.use(express.static(path.join(__dirname, '../client/build')));
app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/bills', billRouter);

// TODO: Add more sophisticated error handling. For now this is okay.
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(8000, () => {
            console.log(`Server listening at http://localhost:8000`);
        });
    } catch (error) {
        console.log(error);
    }
}

start();
