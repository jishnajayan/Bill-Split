const express = require('express')
const router = express.Router()

const { getUser, getUsersFriends, postUsersFriends, deleteUsersFriends } = require('../controllers/user');

router.route('/:userId').get(getUser);
router.route('/:userId/friends').get(getUsersFriends).post(postUsersFriends);
router.route('/:userId/friends/:friendUserId').delete(deleteUsersFriends);
module.exports = router;