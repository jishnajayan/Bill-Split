const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SALT_LENGTH = 10;

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
        minLength: 2,
        maxLength: 20
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide a valid email',
        ],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please enter a strong password (min 10 chars)'],
        minLength: 10
    }
});

UserSchema.pre('save', async function () {
    this.password = await bcrypt.hash(this.password, SALT_LENGTH)
});

UserSchema.methods.createJWT = function () {
    return jwt.sign(
        { userId: this._id, email: this.email },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_LIFETIME,
        }
    )
};

UserSchema.methods.comparePassword = async function (providedPassword) {
    return await bcrypt.compare(providedPassword, this.password);
}

module.exports = mongoose.model('User', UserSchema);