// db.js
const mongoose = require('mongoose');

// MongoDB Atlas connection string
const uri = 'mongodb+srv://fathimaniska12:byHrLDmmMdxG8dIl@cluster0.yqd0p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

let db;

// MongoDB connection function
async function connectToMongoDB() {
    try {
        // Mongoose connection settings
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000, // 30 seconds timeout
            socketTimeoutMS: 45000, // 45 seconds socket timeout
        });

        console.log('✅ Connected to MongoDB Atlas');
        db = mongoose.connection; // Set the db object to the connection instance
    } catch (err) {
        console.error('❌ Error connecting to MongoDB:', err);
        process.exit(1); // Exit the process if connection fails
    }
}

// Function to get the DB connection (using Mongoose connection object)
function getDb() {
    if (!db) {
        throw new Error('Database connection is not established');
    }
    return db;
}

// Export the connectToMongoDB function and getDb function
module.exports = { connectToMongoDB, getDb };

// Export Mongoose instance to be used for models and queries (if needed)
module.exports.mongoose = mongoose;
