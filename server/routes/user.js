const express = require('express')
const router = express.Router()

const { getUser, searchUsers, getUsersFriends, postUsersFriends, deleteUsersFriends, getIncomingBills, getOutgoingBills } = require('../controllers/user');
const { authenticateUser, authorizeUser } = require('../middleware/auth');

// Search users endpoint
router.route('/search').get(authenticateUser, searchUsers);

// Apply authentication and authorization to all user routes
router.route('/:userId').get(authenticateUser, authorizeUser, getUser);
router.route('/:userId/friends').get(authenticateUser, authorizeUser, getUsersFriends).post(authenticateUser, authorizeUser, postUsersFriends);
router.route('/:userId/friends/:friendUserId').delete(authenticateUser, authorizeUser, deleteUsersFriends);
router.route('/:userId/bills/incoming').get(authenticateUser, authorizeUser, getIncomingBills);
router.route('/:userId/bills/outgoing').get(authenticateUser, authorizeUser, getOutgoingBills);

module.exports = router;