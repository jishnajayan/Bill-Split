const bcrypt = require('bcryptjs')
const { StatusCodes } = require('http-status-codes')

const User = require('../models/user')

register = async (req, res) => {
    const user = await User.create({ ...req.body });
    const token = user.createJWT();
    res.status(StatusCodes.CREATED).json({
        user: {
            name: user.name,
            email: user.email,
        },
        token
    });
}

login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(StatusCodes.UNAUTHORIZED).send();

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) return res.status(StatusCodes.UNAUTHORIZED).send();

    const token = user.createJWT();
    res.status(StatusCodes.OK).json({
        user: {
            name: user.name,
            email: user.email,
        },
        token
    });
}

module.exports = { register, login }