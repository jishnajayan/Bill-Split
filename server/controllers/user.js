const { StatusCodes } = require('http-status-codes')

const User = require('../models/user')
const Bill = require('../models/bill');

// User and friend related functions.

getUser = async (req, res) => {
    const user = await User.findById(req.params.userId, ["name", "email"])
    return res.status(200).json({ user: { id: req.params.userId, name: user.name, email: user.email } });
}

searchUsers = async (req, res) => {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
        return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Search query is required" });
    }
    
    // Search by name or email, case insensitive
    const users = await User.find({
        $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
        ]
    }, ["_id", "name", "email"])
    .limit(10); // Limit to 10 results
    
    // Format the results to match the expected format
    const formattedUsers = users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email
    }));
    
    return res.status(StatusCodes.OK).json({ users: formattedUsers });
}

getUsersFriends = async (req, res) => {
    const user = await User.findById(req.params.userId, "friends")
    return res.status(200).json({ user: { id: req.params.userId, friends: user.friends } });
}

postUsersFriends = async (req, res) => {
    // Handle adding friend by either user ID or email
    const { friendUserId, friendEmail } = req.body;
    
    let friend;
    
    if (friendEmail) {
        // Find friend by email
        friend = await User.findOne({ email: friendEmail });
        if (!friend) {
            return res.status(StatusCodes.BAD_REQUEST).json({ msg: "No user found with that email" });
        }
    } else if (friendUserId) {
        // Find friend by ID
        friend = await User.findById(friendUserId);
        if (!friend) {
            return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Friend not found" });
        }
    } else {
        return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Please provide either friendUserId or friendEmail" });
    }
    
    // Check if user is trying to add themselves
    if (friend._id.toString() === req.params.userId) {
        return res.status(StatusCodes.BAD_REQUEST).json({ msg: "You cannot add yourself as a friend" });
    }
    
    // Check if the friend is already in the user's friends list
    const user = await User.findById(req.params.userId);
    const existingFriend = user.friends.find(f => f.friendUserId.toString() === friend._id.toString());
    
    if (existingFriend) {
        return res.status(StatusCodes.BAD_REQUEST).json({ msg: "This user is already in your friends list" });
    }
    
    // Add the friend
    await User.findByIdAndUpdate(req.params.userId, { 
        $push: { friends: { friendUserId: friend._id, friendUsername: friend.name } } 
    });
    
    // Also add the current user to the friend's friends list (bidirectional friendship)
    await User.findByIdAndUpdate(friend._id, { 
        $push: { friends: { friendUserId: req.params.userId, friendUsername: user.name } } 
    });
    
    res.status(201).json({ msg: 'Friend added successfully' });
}

deleteUsersFriends = async (req, res) => {
    await User.findByIdAndUpdate(req.params.userId, { $pull: { friends: { friendUserId: req.params.friendUserId } } });
    res.sendStatus(StatusCodes.NO_CONTENT);
}

// User's Bill related functions.

getIncomingBills = async (req, res) => {
    // Get bills where:
    // 1. The user is a participant
    // 2. The user is NOT the bill creator (paymentUserId)
    // This correctly identifies bills from other users that this user should claim items from
    let filter = { 
        participants: req.params.userId,
        paymentUserId: { $ne: req.params.userId }
    };
    
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

module.exports = { getUser, searchUsers, getUsersFriends, postUsersFriends, deleteUsersFriends, getOutgoingBills, getIncomingBills };