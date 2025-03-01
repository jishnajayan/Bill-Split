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

updateBill = async (req, res) => {
    const { billId } = req.params;
    const { items, resolved } = req.body;
    
    // Find the bill
    const bill = await Bill.findById(billId);
    if (!bill) {
        return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Bill not found' });
    }
    
    // Check authorization
    const isAuthorized = bill.paymentUserId.toString() === req.user.userId || 
                          bill.participants.some(p => p.toString() === req.user.userId);
    
    if (!isAuthorized) {
        return res.status(StatusCodes.FORBIDDEN).json({ msg: 'Not authorized to update this bill' });
    }
    
    // If it's not the bill creator, they can only update item claims for themselves
    if (bill.paymentUserId.toString() !== req.user.userId && items) {
        // Validate that they're only adding/removing themselves from claimedBy arrays
        const isValidUpdate = items.every(newItem => {
            const oldItem = bill.items.find(i => i.itemId.toString() === newItem.itemId.toString());
            if (!oldItem) return false;
            
            // Get the difference between the old and new claimedBy arrays
            const oldClaimers = oldItem.claimedBy?.map(id => id.toString()) || [];
            const newClaimers = newItem.claimedBy?.map(id => id.toString()) || [];
            
            // Either the user was added or removed from the claimedBy array
            const addedUsers = newClaimers.filter(id => !oldClaimers.includes(id));
            const removedUsers = oldClaimers.filter(id => !newClaimers.includes(id));
            
            // Only the current user should be in the added or removed lists
            return (addedUsers.length === 0 || (addedUsers.length === 1 && addedUsers[0] === req.user.userId)) &&
                   (removedUsers.length === 0 || (removedUsers.length === 1 && removedUsers[0] === req.user.userId));
        });
        
        if (!isValidUpdate) {
            return res.status(StatusCodes.FORBIDDEN)
                .json({ msg: 'You can only update your own claims on this bill' });
        }
    }
    
    // Build update object
    const updateData = {};
    if (items) {
        updateData.items = items;
        
        // Auto-resolve the bill if all items have been claimed by at least one person
        const allItemsClaimed = items.every(item => 
            item.claimedBy && item.claimedBy.length > 0
        );
        
        // If all items are claimed and bill is not resolved yet, mark it as resolved
        if (allItemsClaimed && !bill.resolved) {
            updateData.resolved = true;
        }
    }
    
    // If explicit resolved flag is set (only for bill creator)
    if (resolved !== undefined && bill.paymentUserId.toString() === req.user.userId) {
        updateData.resolved = resolved;
    }
    
    // Apply the update
    const updatedBill = await Bill.findByIdAndUpdate(
        billId,
        updateData,
        { new: true, runValidators: true }
    );
    
    return res.status(StatusCodes.OK).json(updatedBill);
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

module.exports = { postBill, getBill, updateBill };