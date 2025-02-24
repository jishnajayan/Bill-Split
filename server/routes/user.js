const express = require('express')
const router = express.Router()

const { getUser, getUsersFriends, postUsersFriends, deleteUsersFriends, getIncomingBills, getOutgoingBills } = require('../controllers/user');

router.route('/:userId').get(getUser);
router.route('/:userId/friends').get(getUsersFriends).post(postUsersFriends);
router.route('/:userId/friends/:friendUserId').delete(deleteUsersFriends);
router.route('/:userId/bills/incoming').get(getIncomingBills);
router.route('/:userId/bills/outgoing').get(getOutgoingBills);

module.exports = router;