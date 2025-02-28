const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// SALT_LENGTH moved to controller

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
    },
    friends: [{ friendUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, friendUsername: String }],
    refreshTokens: [String]
});

// Password hashing moved to controller

UserSchema.methods.createAccessToken = function () {
    return jwt.sign(
        { userId: this._id, email: this.email },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_LIFETIME || '15m',
        }
    )
};

UserSchema.methods.createRefreshToken = function () {
    const refreshToken = jwt.sign(
        { userId: this._id },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_LIFETIME || '7d',
        }
    );
    
    // Store refresh token with user
    this.refreshTokens.push(refreshToken);
    return refreshToken;
};

// For backward compatibility
UserSchema.methods.createJWT = function() {
    return this.createAccessToken();
};

UserSchema.methods.comparePassword = async function (providedPassword) {
    return await bcrypt.compare(providedPassword, this.password);
}

module.exports = mongoose.model('User', UserSchema);