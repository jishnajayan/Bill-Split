const { StatusCodes } = require('http-status-codes')

const User = require('../models/user')
const Bill = require('../models/bill');

// User and friend related functions.

getUser = async (req, res) => {
    const user = await User.findById(req.params.userId, ["name", "email"])
    return res.status(200).json({ user: { id: req.params.userId, name: user.name, email: user.email } });
}

getUsersFriends = async (req, res) => {
    const user = await User.findById(req.params.userId, "friends")
    return res.status(200).json({ user: { id: req.params.userId, friends: user.friends } });
}

postUsersFriends = async (req, res) => {
    const { friendUserId } = req.body;
    const friend = await User.findById(friendUserId);
    if (!friend) {
        return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Friend not found" });
    }
    await User.findByIdAndUpdate(req.params.userId, { $push: { friends: { friendUserId, friendUsername: friend.name } } });
    res.status(201).json({ msg: 'Friend added' });
}

deleteUsersFriends = async (req, res) => {
    await User.findByIdAndUpdate(req.params.userId, { $pull: { friends: { friendUserId: req.params.friendUserId } } });
    res.sendStatus(StatusCodes.NO_CONTENT);
}

// User's Bill related functions.

getIncomingBills = async (req, res) => {
    let filter = { participants: req.params.userId, 'items.claimedBy': { $ne: req.params.userId } };
    if (req.query.resolved) {
        filter.resolved = req.query.resolved
    }
    const bills = await Bill.find(filter);
    return res.status(StatusCodes.OK).json(bills);
}

getOutgoingBills = async (req, res) => {
    let filter = { paymentUserId: req.params.userId, };
    if (req.query.resolved) {
        filter.resolved = req.query.resolved
    }
    const bills = await Bill.find(filter);
    return res.status(StatusCodes.OK).json(bills);
}

module.exports = { getUser, getUsersFriends, postUsersFriends, deleteUsersFriends, getOutgoingBills, getIncomingBills };