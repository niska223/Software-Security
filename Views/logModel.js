const mongoose = require('mongoose');

// Define the schema for logs
const logSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,  // Reference to the User model
        ref: 'User',  // The name of the User model (replace with your actual model name if different)
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,  // Automatically set the timestamp when the log is created
    },
    action: {
        type: String,
        required: true,  // The action performed by the user
    },
    details: {
        type: String,
        required: true,  // Additional details about the action
    },
});

// Create and export the Log model
const Log = mongoose.model('Log', logSchema);

module.exports = Log;
