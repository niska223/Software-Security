const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { getDb } = require('../db'); // Adjust based on your project setup

const router = express.Router();

// Function to generate a random verification code
function generateVerificationCode() {
    return crypto.randomBytes(3).toString('hex'); // 6-character hex code
}

// GET: Render the forget password page
router.get('/', (req, res) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Forget Password</title>
    </head>
    <body>
        <h1>Forget Password</h1>
        <form action="/forgetPassword" method="POST">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required>
            <button type="submit">Send Email</button>
        </form>
    </body>
    </html>
    `;
    res.send(htmlContent);
});

// POST: Handle email submission and send verification code
router.post('/', async (req, res) => {
    const { email } = req.body;
    const db = getDb();

    try {
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.status(404).send('Email not found.');
        }

        const verificationCode = generateVerificationCode();
        const expirationTime = Date.now() + 15 * 60 * 1000; // 15 minutes validity

        await db.collection('users').updateOne(
            { email },
            { $set: { verificationCode, codeExpiresAt: expirationTime } }
        );

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'fniska8@gmail.com',
                pass: 'ewnr ubyc vahc ybnf' // Replace with your email password or app password
            }
        });

        await transporter.sendMail({
            from: 'fniska8@gmail.com',
            to: email,
            subject: 'Password Reset Code',
            text: `Your password reset code is: ${verificationCode}. It expires in 15 minutes.`
        });

        res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Code</title>
        </head>
        <body>
            <h1>Verify Code</h1>
            <form action="/forgetPassword/verify" method="POST">
                <label for="code">Verification Code:</label>
                <input type="text" id="code" name="code" required>
                <input type="hidden" name="email" value="${email}">
                <button type="submit">Verify</button>
            </form>
        </body>
        </html>
        `);
    } catch (err) {
        console.error('Error sending email:', err);
        res.status(500).send('Error sending email. Please try again later.');
    }
});

// POST: Verify the code entered by the user
router.post('/verify', async (req, res) => {
    const { email, code } = req.body;
    const db = getDb();

    try {
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.status(404).send('Email not found.');
        }

        if (user.verificationCode !== code) {
            return res.status(400).send('Invalid verification code.');
        }

        if (Date.now() > user.codeExpiresAt) {
            return res.status(400).send('Verification code has expired.');
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
        </head>
        <body>
            <h1>Reset Password</h1>
            <form action="/forgetPassword/reset" method="POST">
                <input type="hidden" name="email" value="${email}">
                <label for="password">New Password:</label>
                <input type="password" id="password" name="password" required>
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

// POST: Handle password reset
router.post('/reset', async (req, res) => {
    const { email, password } = req.body;
    const db = getDb();

    try {
        // Validate password length
        if (password.length < 8) {
            return res.status(400).send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Reset Password</title>
            </head>
            <body>
                <h1>Password Too Short</h1>
                <p>Your password must be at least 8 characters long.</p>
                <form action="/forgetPassword/reset" method="POST">
                    <input type="hidden" name="email" value="${email}">
                    <label for="password">New Password:</label>
                    <input type="password" id="password" name="password" required>
                    <button type="submit">Reset Password</button>
                </form>
            </body>
            </html>
            `);
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
        </head>
        <body>
            <h1>Password Reset Successful</h1>
            <p>You can now log in with your new password.</p>
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
