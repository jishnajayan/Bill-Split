const mongoose = require('mongoose');
const { StatusCodes } = require('http-status-codes')

const Bill = require('../models/bill');

getBill = async (req, res) => {
    const bill = await Bill.findById(req.params.billId);
    if (!bill) return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Bill not found' });
    return res.status(StatusCodes.OK).json(bill);
}

postBill = async (req, res) => {
    const { paymentUserId, restaurantName, totalAmount, items, participants } = req.body;

    const billItems = items.map((item) => (
        {
            itemId: new mongoose.Types.ObjectId(),
            name: item.name,
            price: item.price,
            claimedBy: item.claimedBy ? item.claimedBy.map(id => id) : []
        }
    ));
    const bill = {
        paymentUserId,
        restaurantName,
        totalAmount,
        items: billItems,
        participants
    }
    const savedBill = await Bill.insertOne(bill);
    return res.status(StatusCodes.CREATED).json(savedBill);
}

module.exports = { postBill, getBill };