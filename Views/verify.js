const express = require('express');
const router = express.Router();  // Create a new router instance
const { getDb } = require('../db');  // Adjust path as needed

router.get('/', async (req, res) => {
    const { token } = req.query;  // Get token from the query string
    const db = getDb();  // Get the database instance

    try {
        // Find the user by the verification token
        const user = await db.collection('users').findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).send('Invalid token or user not found.');
        }

        // Update the user's email as verified
        await db.collection('users').updateOne(
            { _id: user._id },
            { $set: { emailVerified: true }, $unset: { verificationToken: "" } } // Optionally remove the token after verification
        );

        // Send a success response or redirect to login page
        res.send(`
            <h1>Email Verified Successfully!</h1>
            <p>Your email has been verified. You can now <a href="/login">login here</a>.</p>
        `);
    } catch (err) {
        console.error('Error verifying email:', err);
        res.status(500).send('Error verifying email.');
    }
});

// Export the router to use it in your main server file (server.js)
module.exports = router;