const mongoose = require('mongoose');
const { StatusCodes } = require('http-status-codes')

const Bill = require('../models/bill');

getBill = async (req, res) => {
    const bill = await Bill.findById(req.params.billId);
    if (!bill) return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Bill not found' });
    
    // Check if user is authorized to view this bill (either payee or participant)
    const isAuthorized = bill.paymentUserId.toString() === req.user.userId || 
                          bill.participants.some(p => p.toString() === req.user.userId);
                          
    if (!isAuthorized) {
        return res.status(StatusCodes.FORBIDDEN).json({ msg: 'Not authorized to view this bill' });
    }
    
    return res.status(StatusCodes.OK).json(bill);
}

postBill = async (req, res) => {
    const { restaurantName, totalAmount, items, participants } = req.body;
    
    // Use authenticated user's ID as paymentUserId
    const paymentUserId = req.user.userId;

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
    
    const savedBill = await Bill.create(bill);
    return res.status(StatusCodes.CREATED).json(savedBill);
}

module.exports = { postBill, getBill };