const express = require('express');
const router = express.Router();
const User = require('./userModel'); // Import your User model (make sure to adjust if you have a different path)
const auth = require('../middleware/auth'); // You can add an auth middleware to check if the user is logged in

// Route to display user profile
router.get('/', auth, async (req, res) => {
    try {
        // Get the user's email from the session (assuming the email is stored in the session)
        const email = req.session.email;

        // Find the user in the database using the email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Return the user profile page with the user's details
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Profile - My Node.js App</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f4f8;
            color: #03045e;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
        }
        header {
            background-color: #C9D2F2;
            color: #7B97D3;
            padding: 20px 0;
            text-align: center;
        }
        h1 {
            margin: 0;
            font-size: 2em;
        }
        main {
            flex-grow: 1;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .profile-container {
            background-color: white;
            border-radius: 10px;
            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
            padding: 20px;
            width: 100%;
            max-width: 500px;
        }
        h2 {
            color: #03045e;
            text-align: center;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            font-size: 1.1em;
            color: black;
            margin-bottom: 8px;
        }
        .profile-details {
            margin-bottom: 20px;
        }
        .profile-details span {
            font-weight: bold;
        }
        button {
            background-color: #0077b6;
            color: white;
            padding: 12px 20px;
            border: none;
            border-radius: 5px;
            font-size: 1.1em;
            cursor: pointer;
            width: 100%;
            transition: background-color 0.3s;
        }
        button:hover {
            background-color: #03045e;
        }
        a {
            display: block;
            text-align: center;
            margin-top: 20px;
            color: #0077b6;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <header>
        <h1>Your Profile</h1>
    </header>
    <main>
        <div class="profile-container">
            <h2>Profile Details</h2>
            <div class="profile-details">
                <p><span>Name:</span> ${user.name}</p>
                <p><span>Email:</span> ${user.email}</p>
                <p><span>Age:</span> ${user.age}</p>
                <p><span>Gender:</span> ${user.gender}</p>
                <p><span>Date of Birth:</span> ${user.dob ? new Date(user.dob).toLocaleDateString() : 'Not provided'}</p>
            </div>
            <a href="/profile/edit">Edit Profile</a>
            <a href="/dashboard">Back to Dashboard</a>
        </div>
    </main>
</body>
</html>
        `;
        res.send(htmlContent);
    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).send('Error fetching user details.');
    }
});

module.exports = router;
