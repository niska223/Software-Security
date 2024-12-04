const express = require('express');
const router = express.Router();

// Home page route with an enhanced design
router.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>University Student Application - Home</title>
            <style>
                /* General Reset */
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                /* Body Styling */
                body {
                    font-family: 'Roboto', Arial, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    background: linear-gradient(135deg, #0073e6, #004a99);
                    color: #333;
                }

                /* Container */
                .container {
                    text-align: center;
                    max-width: 600px;
                    padding: 30px;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
                    transform: translateY(-10px);
                    animation: fadeIn 1s ease-in-out;
                }

                /* Keyframes for Fade-In */
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* Heading */
                h1 {
                    font-size: 2.5em;
                    color: #0073e6;
                    margin-bottom: 15px;
                }

                /* Paragraph */
                p {
                    font-size: 1.2em;
                    line-height: 1.8;
                    color: #555;
                    margin-bottom: 25px;
                }

                /* Button */
                button {
                    padding: 12px 25px;
                    font-size: 1em;
                    color: white;
                    background: linear-gradient(135deg, #0073e6, #005bb5);
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background 0.3s ease, transform 0.3s ease;
                }

                /* Button Hover */
                button:hover {
                    background: linear-gradient(135deg, #005bb5, #003f7f);
                    transform: scale(1.05);
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Welcome to the University Student Application</h1>
                <p>
                    This application is designed to help students manage their academic activities seamlessly. 
                    Here, you can check your class schedules, submit assignments, track attendance, 
                    and stay updated with university events. 
                    Log in to access your personalized dashboard and explore more features tailored for your success.
                </p>
                <button onclick="window.location.href='/login'">Login</button>
            </div>
        </body>
        </html>
    `);
});

module.exports = router;
