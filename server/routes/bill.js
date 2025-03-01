const express = require('express');

const { postBill, getBill, updateBill } = require('../controllers/bill');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all bill routes
router.route('/').post(authenticateUser, postBill);
router.route('/:billId')
  .get(authenticateUser, getBill)
  .patch(authenticateUser, updateBill);

module.exports = router;
