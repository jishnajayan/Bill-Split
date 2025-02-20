const bcrypt = require('bcryptjs')
const { StatusCodes } = require('http-status-codes')

const User = require('../models/user')

register = async (req, res) => {
    const user = await User.create({ ...req.body });
    const token = user.createJWT()
    res.status(StatusCodes.CREATED).json({
        user: {
            name: user.name,
            email: user.email,
        },
        token
    });
}

login = async (req, res) => {
    console.log("Login user");
    res.status(200).send()
}

module.exports = { register, login }