// Import required modules
const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { getDb } = require('../db'); // Adjust based on your project setup

const router = express.Router();

// Helper function to generate a random verification code
function generateVerificationCode() {
    return crypto.randomBytes(3).toString('hex'); // 6-character hex code
}

/**
 * GET: Render the Forget Password page
 */
router.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Forget Password</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f9f9f9;
                color: #03045e;
                text-align: center;
                padding: 50px;
            }
            h1 {
                color: #03045e;
            }
            form {
                background-color: #ffffff;
                border-radius: 10px;
                padding: 20px;
                display: inline-block;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                width: 300px;
            }
            input, button {
                width: 90%;
                padding: 10px;
                margin: 10px 0;
                border: 1px solid #7B97D3;
                border-radius: 5px;
            }
            button {
                background-color: #7B97D3;
                color: white;
                border: none;
                cursor: pointer;
            }
            button:hover {
                background-color: #5A77B2;
            }
        </style>
    </head>
    <body>
        <h1>Forget Password</h1>
        <form action="/forgetPassword" method="POST">
            <label for="email">Enter Your Email:</label><br>
            <input type="email" id="email" name="email" placeholder="example@domain.com" required><br>
            <button type="submit">Send Verification Email</button>
        </form>
    </body>
    </html>
    `);
});

/**
 * POST: Handle email submission and send verification code
 */
router.post('/', async (req, res) => {
    const { email } = req.body;
    const db = getDb();

    try {
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.status(404).send('Email not found.');
        }

        const verificationCode = generateVerificationCode();
        const expirationTime = Date.now() + 15 * 60 * 1000;
        await db.collection('users').updateOne(
            { email },
            { $set: { verificationCode, codeExpiresAt: expirationTime } }
        );

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'fniska8@gmail.com',
                pass: 'ewnr ubyc vahc ybnf',
            },
        });

        await transporter.sendMail({
            from: 'fniska8@gmail.com',
            to: email,
            subject: 'Password Reset Code',
            text: `Your password reset code is: ${verificationCode}. It expires in 15 minutes.`,
        });

        res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Code</title>
            <style>
                body, form, input, button { /* Styles same as above */ }
            </style>
        </head>
        <body>
            <h1>Verify Your Email</h1>
            <form action="/forgetPassword/verify" method="POST">
                <label for="code">Enter Verification Code:</label><br>
                <input type="text" id="code" name="code" placeholder="6-digit code" required><br>
                <input type="hidden" name="email" value="${email}">
                <button type="submit">Verify Code</button>
            </form>
        </body>
        </html>
        `);
    } catch (err) {
        console.error('Error sending email:', err);
        res.status(500).send('Error sending email. Please try again later.');
    }
});

/**
 * POST: Verify the code entered by the user
 */
router.post('/verify', async (req, res) => {
    const { email, code } = req.body;
    const db = getDb();

    try {
        const user = await db.collection('users').findOne({ email });
        if (!user || user.verificationCode !== code || Date.now() > user.codeExpiresAt) {
            return res.status(400).send('Invalid or expired verification code.');
        }

        await db.collection('users').updateOne(
            { email },
            { $unset: { verificationCode: "", codeExpiresAt: "" } }
        );

        res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Password</title>
            <style>
                body, form, input, button { /* Styles same as above */ }
            </style>
        </head>
        <body>
            <h1>Reset Your Password</h1>
            <form action="/forgetPassword/reset" method="POST">
                <input type="hidden" name="email" value="${email}">
                <label for="password">New Password:</label><br>
                <input type="password" id="password" name="password" placeholder="Min 8 characters" required><br>
                <button type="submit">Reset Password</button>
            </form>
        </body>
        </html>
        `);
    } catch (err) {
        console.error('Error verifying code:', err);
        res.status(500).send('Error verifying code. Please try again later.');
    }
});

/**
 * POST: Handle password reset
 */
router.post('/reset', async (req, res) => {
    const { email, password } = req.body;
    const db = getDb();

    try {
        if (password.length < 8) {
            return res.status(400).send('Password must be at least 8 characters long.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.collection('users').updateOne(
            { email },
            { $set: { password: hashedPassword } }
        );

        res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset Successful</title>
            <style>
                body { /* Same styles as above */ }
            </style>
        </head>
        <body>
            <h1>Password Reset Successful</h1>
            <p>Your password has been reset successfully. You can now log in with your new password.</p>
            <form action="/login" method="GET">
                <button type="submit">Go to Login</button>
            </form>
        </body>
        </html>
        `);
    } catch (err) {
        console.error('Error resetting password:', err);
        res.status(500).send('Error resetting password. Please try again later.');
    }
});

module.exports = router;
