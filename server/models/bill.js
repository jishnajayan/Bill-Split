const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
    paymentUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    restaurantName: String,
    totalAmount: Number,
    createdAt: Date,
    resolved: [Boolean, false],
    items: [{ itemId: mongoose.Schema.Types.ObjectId, name: String, price: Number, claimedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] }],
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Bill', BillSchema);
