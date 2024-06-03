const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
// const FriendRequest = require('../models/Friendrequest');

const User = require('../models/User');



router.post('/', async (req, res) => {
    try {
        const { participants } = req.body;
        // Check if participants are provided
        if (!participants || participants.length < 2) {
            return res.status(400).json({ message: 'At least two participants are required' });
        }

        // Check if all participants exist
        for (const _id of participants) {
            const userExists = await User.findById(_id);
            if (!userExists) {
                return res.status(404).json({ message: `User with ID ${_id} not found` });
            }
        }

        // Check if conversation already exists with the same participants
        const existingConversation = await Conversation.findOne({ participants: { $all: participants } });
        if (existingConversation) {
            return res.status(400).json({ message: 'Conversation already exists with these participants',id:existingConversation._id  }
            );
        }

        // Create a new conversation
        const conversation = new Conversation({ participants });
        await conversation.save();
        res.status(201).json(conversation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Assuming you already have the required imports and setup for your router

// Route to fetch a conversation by participant IDs
router.post('/one', async (req, res) => {
    try {
        const { participantIds } = req.body;

        // Check if participantIds are provided
        if (!participantIds || participantIds.length < 2) {
            return res.status(400).json({ message: 'At least two participant IDs are required' });
        }

        const conversation = await Conversation.findOne({ participants: { $all: participantIds } });

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found with these participants' });
        }

        res.json(conversation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Route to get all conversations 
router.get('/fetch', async (req, res) => {
    try {
        const conversations = await Conversation.find();
        res.json(conversations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to add a message to a conversation
router.post('/message', async (req, res) => {
    try {

        const {conversationId, senderId, content } = req.body;

        // Find the conversation by ID
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Add a new message to the conversation
        conversation.messages.push({
            sender: senderId,
            content
        });

        // Save the updated conversation
        await conversation.save();

        res.status(200).json(conversation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to get a conversation by ID
router.get('/:conversationId', async (req, res) => {
    try {
        const { conversationId } = req.params;

        // Find the conversation by ID and populate participants and messages
        const conversation = await Conversation.findById(conversationId)

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        res.json(conversation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
