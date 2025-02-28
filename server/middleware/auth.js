const jwt = require('jsonwebtoken')
const { StatusCodes } = require('http-status-codes')
const User = require('../models/user')

const authenticateUser = async (req, res, next) => {
  // Check for authorization header
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Authentication invalid' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    // Attach user to request object
    req.user = { userId: payload.userId, email: payload.email }
    next()
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Authentication invalid' })
  }
}

const authorizeUser = (req, res, next) => {
  // Check if requested userId matches authenticated userId
  const requestedUserId = req.params.userId
  
  if (req.user.userId !== requestedUserId) {
    return res.status(StatusCodes.FORBIDDEN).json({ msg: 'Not authorized to access this resource' })
  }
  
  next()
}

module.exports = { authenticateUser, authorizeUser }