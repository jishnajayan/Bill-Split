const express = require('express');

const { postBill, getBill } = require('../controllers/bill');

const router = express.Router();

router.route('/').post(postBill);
router.route('/:billId').get(getBill);

module.exports = router;
