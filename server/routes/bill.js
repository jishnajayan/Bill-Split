const express = require('express');

const { postBill, getBill } = require('../controllers/bill');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all bill routes
router.route('/').post(authenticateUser, postBill);
router.route('/:billId').get(authenticateUser, getBill);

module.exports = router;
