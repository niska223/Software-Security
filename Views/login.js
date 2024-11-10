const express = require('express');
const bcrypt = require('bcryptjs'); // For password hashing
const { getDb } = require('../db'); // For DB access
const { v4: uuidv4 } = require('uuid'); // For session management
const useragent = require('useragent'); // For user device tracking

const router = express.Router();

// Handle GET request for login page
router.get('/', (req, res) => {
    const lockedOutUntil = req.session.lockedOutUntil || 0;
    const currentTime = Date.now();
    const isLockedOut = currentTime < lockedOutUntil;

    const remainingTime = isLockedOut ? Math.ceil((lockedOutUntil - currentTime) / 1000) : 0; // Calculate remaining time in seconds

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login - My Node.js App</title>
        <style>
            * { box-sizing: border-box; }
            body {
                font-family: Arial, sans-serif;
                background-color: #f0f0f0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
            header {
                text-align: center;
                margin-bottom: 20px;
            }
            h1 {
                color: #4CAF50;
                font-size: 2em;
            }
            .login-container {
                width: 100%;
                max-width: 400px;
                padding: 20px;
                background-color: #fff;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                border-radius: 10px;
            }
            .login-card {
                text-align: center;
            }
            .login-form {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            .form-group {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
            }
            label {
                font-weight: bold;
                margin-bottom: 5px;
                color: #333;
            }
            input[type="email"], input[type="password"] {
                width: 100%;
                padding: 10px;
                border: 1px solid #ccc;
                border-radius: 5px;
                font-size: 1em;
            }
            button {
                padding: 10px;
                background-color: #4CAF50;
                color: #fff;
                border: none;
                border-radius: 5px;
                font-size: 1em;
                cursor: pointer;
                transition: background-color 0.3s ease;
            }
            button:hover {
                background-color: #45a049;
            }
            p {
                margin: 10px 0;
            }
            a {
                color: #7B97D3;
                text-decoration: none;
            }
            a:hover {
                text-decoration: underline;
            }
            #countdown {
                color: red;
                font-weight: bold;
                margin-bottom: 10px;
            }
            footer {
                text-align: center;
                margin-top: 20px;
                font-size: 0.9em;
                color: #666;
            }
        </style>
        <script>
            window.onload = function() {
                var remainingTime = ${remainingTime};
                var countdownElement = document.getElementById('countdown');
                var submitButton = document.querySelector('button[type="submit"]');
                var emailInput = document.getElementById('email');
                var passwordInput = document.getElementById('password');

                if (remainingTime > 0) {
                    submitButton.disabled = true;
                    emailInput.disabled = true;
                    passwordInput.disabled = true;

                    var interval = setInterval(function() {
                        countdownElement.textContent = remainingTime + ' seconds remaining';
                        remainingTime--;

                        if (remainingTime <= 0) {
                            clearInterval(interval);
                            countdownElement.textContent = '';
                            submitButton.disabled = false;
                            emailInput.disabled = false;
                            passwordInput.disabled = false;
                        }
                    }, 1000);
                }
            };
        </script>
    </head>
    <body>
        <header>
            <h1>Welcome Back</h1>
        </header>
        <main>
            <section class="login-container">
                <div class="login-card">
                    <h2>Login</h2>
                    ${req.session.errorMessage ? `<p style="color: red;">${req.session.errorMessage}</p>` : ''}
                    <p id="countdown"></p>
                    <form action="/login" method="POST" class="login-form">
                        <div class="form-group">
                            <label for="email">Email:</label>
                            <input type="email" id="email" name="email" placeholder="Enter your email" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Password:</label>
                            <input type="password" id="password" name="password" placeholder="Enter your password" required>
                        </div>
                        <button type="submit">Login</button>
                    </form>
                    <p>Don't have an account? <a href="/register">Register here</a></p>
                    <p><a href="/forgetPassword">Forgot your password?</a></p>
                </div>
            </section>
        </main>
        <footer>
            <p>&copy; 2024 My Node.js App</p>
        </footer>
    </body>
    </html>
    `;
    res.send(htmlContent);
});

// Handle login form submission
router.post('/', async (req, res) => {
    const { email, password } = req.body;
    const db = getDb();

    if (!req.session.attempts) {
        req.session.attempts = 0;
    }

    const currentTime = Date.now();

    if (req.session.lockedOutUntil && currentTime < req.session.lockedOutUntil) {
        req.session.errorMessage = "Too many failed login attempts. Please try again later.";
        return res.redirect('/login');
    }

    try {
        const user = await db.collection('users').findOne({ email: email });
        if (!user) {
            return res.status(400).send(`
                <script>
                    alert("Invalid email or password");
                    window.history.back();
                </script>
            `);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            req.session.attempts++;
            if (req.session.attempts >= 3) {
                req.session.lockedOutUntil = currentTime + 30 * 1000;
                req.session.errorMessage = "Too many failed login attempts. Please wait for 30 seconds.";
            } else {
                req.session.errorMessage = `Invalid email or password. ${3 - req.session.attempts} attempts remaining.`;
            }
            return res.redirect('/login');
        }

        req.session.attempts = 0;
        const agent = useragent.parse(req.headers['user-agent']);
        const deviceDetails = `${agent.family} on ${agent.os.family} (${agent.device.family})`;
        const sessionCode = uuidv4();
        const loginTime = new Date();

        await db.collection('logs').insertOne({
            userId: user._id,
            loginTime,
            device: deviceDetails,
            sessionCode
        });

        req.session.user = {
            id: user._id,
            email: user.email,
            sessionCode
        };

        res.redirect('/dashboard');
    } catch (err) {
        console.error('Error querying the database:', err);
        req.session.errorMessage = 'An error occurred. Please try again.';
        res.redirect('/login');
    }
});

module.exports = router;
