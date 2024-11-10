const express = require('express');
const router = express.Router();

// Home page route with detailed description and login button
router.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>University Student Application - Home</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    background-color: #f0f2f5;
                    color: #333;
                }
                .container {
                    text-align: center;
                    max-width: 600px;
                    padding: 20px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                }
                h1 {
                    font-size: 2em;
                    color: #0073e6;
                }
                p {
                    font-size: 1.2em;
                    line-height: 1.6;
                    color: #666;
                }
                button {
                    padding: 10px 20px;
                    font-size: 1em;
                    color: white;
                    background-color: #0073e6;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 20px;
                }
                button:hover {
                    background-color: #005bb5;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Welcome to the University Student Application</h1>
                <p>This application is designed to help students manage their academic activities seamlessly. Here, you can check your class schedules, submit assignments, track attendance, and stay updated with university events. Log in to access your personalized dashboard and explore more features tailored for your success.</p>
                <button onclick="window.location.href='/login'">Login</button>
            </div>
        </body>
        </html>
    `);
});

module.exports = router;
