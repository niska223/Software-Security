// dashboard.js
const express = require('express');
const router = express.Router();

// Dashboard route
router.get('/', (req, res) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dashboard - My Node.js App</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: Arial, sans-serif;
                background-color: #f0f4f8;
                color: #333;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
            }
            header {
                background-color: #4a90e2;
                width: 100%;
                padding: 1rem;
                text-align: center;
                color: white;
            }
            h1 {
                font-size: 2em;
            }
            nav {
                display: flex;
                gap: 10px;
                justify-content: center;
                margin-top: 1rem;
            }
            nav button {
                background-color: #f7f9fc;
                border: 2px solid #4a90e2;
                color: #4a90e2;
                padding: 0.5rem 1rem;
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            nav button:hover {
                background-color: #4a90e2;
                color: #fff;
            }
            footer {
                margin-top: 2rem;
                text-align: center;
                font-size: 0.9em;
                color: #777;
            }
        </style>
    </head>
    <body>
        <header>
            <h1>Welcome to Your Dashboard</h1>
            <nav>
                <button onclick="window.location.href='/userProfile'">Profile</button>
                <button onclick="window.location.href='/logs'">Activity</button>
                <button onclick="window.location.href='/logout'">Logout</button>
            </nav>
        </header>
        <main>
            <p>You are logged in!</p>
        </main>
        <footer>
            <p>&copy; 2024 My Node.js App. All rights reserved.</p>
        </footer>
    </body>
    </html>
    `;
    res.send(htmlContent);
});

module.exports = router;
