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
                background-color: #f0f2f5;
                color: #333;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
            }
            header {
                background-color: #0077b6;
                width: 100%;
                padding: 1rem;
                text-align: center;
                color: white;
            }
            h1 {
                font-size: 2.5em;
                font-weight: bold;
            }
            nav {
                display: flex;
                gap: 15px;
                justify-content: center;
                margin-top: 1rem;
            }
            nav button {
                background-color: #f7f9fc;
                border: 2px solid #0077b6;
                color: #0077b6;
                padding: 0.7rem 1.5rem;
                border-radius: 5px;
                cursor: pointer;
                font-size: 1.1em;
                transition: all 0.3s ease;
            }
            nav button:hover {
                background-color: #0077b6;
                color: white;
            }
            footer {
                margin-top: 2rem;
                text-align: center;
                font-size: 1em;
                color: #777;
            }
            main {
                margin-top: 2rem;
                font-size: 1.2em;
                color: #333;
                text-align: center;
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
