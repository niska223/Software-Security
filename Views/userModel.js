const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User schema definition
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true, // Normalize to lowercase for case-insensitive email
        match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'], // Email validation
    },
    password: {
        type: String,
        required: true,
        minlength: 6, // Enforce a minimum length for the password
    },
    age: {
        type: Number,
        required: true,
    },
    gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female', 'Other'], // Optional: Gender validation
    },
    dob: {
        type: Date,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically sets the creation date
    }
});

// Hash password before saving the user
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        // Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// Method to compare passwords for login
userSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Create and export the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
