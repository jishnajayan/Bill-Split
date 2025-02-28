const jwt = require('jsonwebtoken')
const { StatusCodes } = require('http-status-codes')
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const SALT_LENGTH = 10

const register = async (req, res) => {
    // Hash the password before creating the user
    const userData = { ...req.body };
    userData.password = await bcrypt.hash(userData.password, SALT_LENGTH);
    
    const user = await User.create(userData);
    
    // Generate tokens
    const accessToken = user.createAccessToken();
    const refreshToken = user.createRefreshToken();
    
    // Save user with refresh token
    await user.save();
    
    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    
    res.status(StatusCodes.CREATED).json({
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
        accessToken
    });
}

const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Invalid credentials' });

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Invalid credentials' });

    // Generate tokens
    const accessToken = user.createAccessToken();
    const refreshToken = user.createRefreshToken();
    
    // Save user with refresh token
    await user.save();
    
    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });

    res.status(StatusCodes.OK).json({
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
        accessToken
    });
}

const refresh = async (req, res) => {
    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'No refresh token provided' });
    }
    
    try {
        // Verify refresh token
        const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        
        // Find user
        const user = await User.findById(payload.userId);
        if (!user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Invalid refresh token' });
        }
        
        // Check if refresh token is in user's refresh tokens
        if (!user.refreshTokens.includes(refreshToken)) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Invalid refresh token' });
        }
        
        // Generate new access token
        const accessToken = user.createAccessToken();
        
        res.status(StatusCodes.OK).json({ accessToken });
    } catch (error) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Invalid refresh token' });
    }
}

const logout = async (req, res) => {
    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;
    
    if (refreshToken) {
        try {
            // Verify refresh token
            const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            
            // Find user and remove refresh token
            const user = await User.findById(payload.userId);
            if (user) {
                user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
                await user.save();
            }
        } catch (error) {
            // Just continue even if there's an error with the token
        }
    }
    
    // Clear cookie
    res.clearCookie('refreshToken');
    
    res.status(StatusCodes.OK).json({ msg: 'Logged out successfully' });
}

module.exports = { register, login, refreshToken: refresh, logout }