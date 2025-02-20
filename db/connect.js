const mongoose = require('mongoose')


const connectDB = (mongoUri) => {
    return mongoose.connect(mongoUri)
}

module.exports = connectDB