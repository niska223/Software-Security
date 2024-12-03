const express = require('express');
const router = express.Router();
const { getDb } = require('../db');
const { ObjectId } = require('mongodb'); // Import ObjectId

// Handle user logout
router.get('/', async (req, res) => {
    if (req.session.user) {
        const db = getDb();
        const userId = req.session.user.id;
        const sessionCode = req.session.user.sessionCode;

        console.log(`Attempting to log out user: ${userId} with sessionCode: ${sessionCode}`);

        try {
            // Convert userId to ObjectId
            const objectIdUserId = new ObjectId(userId);

            // Record logout time in the database
            const result = await db.collection('logs').updateOne(
                { userId: objectIdUserId, sessionCode: sessionCode },
                { $set: { logoutTime: new Date() } }
            );

            if (result.modifiedCount === 0) {
                console.error(`No log entry found for userId: ${userId}, sessionCode: ${sessionCode}.`);
            } else {
                console.log(`Successfully logged out user: ${userId}`);
            }

            // Destroy session and redirect to login page
            req.session.destroy((err) => {
                if (err) {
                    console.error('Error destroying session:', err);
                    return res.status(500).send('Error logging out');
                }
                console.log('Session destroyed successfully');
                res.redirect('/login'); // Redirect to login after logout
            });
        } catch (error) {
            console.error('Error during logout:', error);
            res.status(500).send('An error occurred while logging out.');
        }
    } else {
        console.warn('No active session found. Redirecting to login.');
        res.redirect('/login');
    }
});

// Middleware to ensure the user is logged in before accessing protected routes
router.use((req, res, next) => {
    if (!req.session.user) {
        // If the user is not logged in, redirect to login page
        console.warn('User not logged in, redirecting to login.');
        return res.redirect('/login'); // Redirect to login page if no session exists
    }
    next(); // Proceed if the session exists
});

module.exports = router;
