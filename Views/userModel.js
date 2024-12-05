const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the user schema combining both definitions
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // Name should be required for identification purposes
    },
    
    email: {
        type: String,
        required: true,
        unique: true, // Ensure it’s unique
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
        required: false, // Optional field for age
        min: [13, 'Age must be at least 13'], // Add validation for a minimum age
    },
    gender: {
        type: String,
        required: false, // Optional field for gender
        enum: ['Male', 'Female', 'Other'], // Gender validation
    },
    dob: {
        type: Date,
        required: false, // Optional field for date of birth
        validate: {
            validator: function (value) {
                return value <= new Date(); // Ensure date of birth is not in the future
            },
            message: 'Date of birth cannot be in the future',
        },
    },
    role: {
        type: String,
        default: 'user', // Default role is 'user', but it can be set to 'admin'
        enum: ['user', 'admin'], // Ensure the role is either 'user' or 'admin'
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically sets the creation date
    },
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
