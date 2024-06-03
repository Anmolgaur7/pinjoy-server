const mongoose = require('mongoose');

// Define the message schema
const MessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Define the conversation schema
const ConversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    messages: [MessageSchema]
}, {
    timestamps: true // Automatically manages createdAt and updatedAt fields
});

// Create the Conversation model
const Conversation = mongoose.model('Conversation', ConversationSchema);

module.exports = Conversation;
