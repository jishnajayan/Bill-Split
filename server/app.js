require('dotenv').config()
require('express-async-errors');
const express = require('express');
const connectDB = require('./db/connect');
const path = require('path');

const app = express();

const authRouter = require('./routes/auth');

app.use(express.static(path.join(__dirname, '../client/build')));
app.use(express.json());

app.use('/api/v1/auth', authRouter);

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

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
