const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    Password: {
        type: String,
        required: true,
        minlength: 6
    },
    Date: {
        type: Date,
        default: Date.now
    },
    // Add a friends field with a default value of an empty array
    friends: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        conversationid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Conversation'
        },
        default: []
    }
});

module.exports = mongoose.model('User', UserSchema);
