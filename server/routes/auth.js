const { register, login, refreshToken, logout } = require('../controllers/auth');

const express = require('express');
const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/refresh-token').post(refreshToken);
router.route('/logout').post(logout);

module.exports = router;