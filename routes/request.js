const express = require('express');
const router = express.Router();

const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');
const Conversation = require('../models/Conversation');


router.post('/send-request', async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;
        console.log(senderId, receiverId);
        const sender = await User.findById(senderId);
        console.log(sender.Name);
        // Create a new friend request
        const friendRequest = new FriendRequest({
            Name: sender.Name,
            sender: senderId,
            receiver: receiverId,
            action: 'pending'
        });
        
        await friendRequest.save();

        res.status(201).json({ message: 'Friend request sent', friendRequest });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to get all friend requests for a user

router.post('/get-requests', async (req, res) => {

    try {
        const { userId } = req.body;

        // Find all friend requests where the user is the receiver
        const requests = await FriendRequest.find({ receiver: userId });

        res.status(200).json({ requests });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Route to respond to a friend request
router.post('/respond-request', async (req, res) => {
    try {
        const { requestId, action } = req.body; // `action` should be either 'accept' or 'decline'

        // Find the friend request by ID
        const friendRequest = await FriendRequest.findById(requestId);

        if (!friendRequest) {
            return res.status(404).json({ message: 'Friend request not found' });
        }

        // Handle the action (accept or decline)
        if (action === 'accept') {
            // Update the friend request status to accepted
            friendRequest.status = 'accepted';
            await friendRequest.save();

            // Create a new conversation
            const conversation = new Conversation({
                members: [friendRequest.sender, friendRequest.receiver]
            });
            await conversation.save();

            // Add the conversation ID to both users' friends list
            await User.updateOne(
                { _id: friendRequest.sender },
                { $addToSet: { friends: friendRequest.receiver, conversationid: conversation._id } }
            );
            
            await User.updateOne(
                { _id: friendRequest.receiver },
                { $addToSet: { friends: friendRequest.sender, conversationid: conversation._id } }
            );         
            await FriendRequest.findByIdAndDelete(requestId);
            res.status(200).json({ message: 'Friend request accepted and friendship established' });
        } else if (action === 'decline') {
            // Update the friend request status to declined
            friendRequest.status = 'declined';
            await friendRequest.save();
            await FriendRequest.findByIdAndDelete(requestId);
            res.status(200).json({ message: 'Friend request declined' });
        } else {
            res.status(400).json({ message: 'Invalid action. Use "accept" or "decline".' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});



module.exports = router;