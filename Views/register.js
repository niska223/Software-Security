const express = require('express');
const router = express.Router();
const { getDb } = require('../db'); // MongoDB Atlas connection
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const nodemailer = require('nodemailer');
const { ObjectID } = require('mongodb');

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'fniska8@gmail.com', // Replace with your email address
        pass: 'ewnr ubyc vahc ybnf', // Use app-specific password for Gmail
    },
});

// Route for user registration form
router.get('/', (req, res) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>User Registration - My Node.js App</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f0f2f5;
                color: #333;
            }
            header, footer {
                background-color: #0077b6;
                color: white;
                text-align: center;
                padding: 10px 0;
            }
            .register-container {
                display: flex;
                justify-content: center;
                padding: 20px;
            }
            .register-card {
                background-color: #fff;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                max-width: 400px;
                width: 100%;
            }
            .form-group {
                margin-bottom: 15px;
            }
            label {
                font-weight: bold;
            }
            input[type="text"], input[type="email"], input[type="password"] {
                width: 100%;
                padding: 10px;
                border-radius: 5px;
                border: 1px solid #ccc;
            }
            button {
                width: 100%;
                padding: 10px;
                background-color: #0077b6;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            }
            button:hover {
                background-color: #005b9a;
            }
        </style>
    </head>
    <body>
        <header>
            <h1>User Registration</h1>
        </header>
        <main class="register-container">
            <div class="register-card">
                <h2>Create Your Account</h2>
                <form action="/register" method="POST">
                    <div class="form-group">
                        <label for="name">Name:</label>
                        <input type="text" id="name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password:</label>
                        <input type="password" id="password" name="password" required>
                        <input type="checkbox" id="show-password" onclick="togglePassword()"> Show Password
                    </div>
                    <button type="submit">Register</button>
                </form>
                <p>Already have an account? <a href="/login">Login</a></p>
            </div>
        </main>
        <footer>
            <p>&copy; 2024 My Node.js App</p>
        </footer>
        <script>
            function togglePassword() {
                const passwordField = document.getElementById("password");
                const checkBox = document.getElementById("show-password");
                passwordField.type = checkBox.checked ? "text" : "password";
            }
        </script>
    </body>
    </html>
    `;
    res.send(htmlContent);
});

// Handle user registration
router.post('/', async (req, res) => {
    const { name, email, password } = req.body;
    const db = getDb();
    const saltRounds = 10;

    try {
        // Check if the email already exists
        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            return res.send('Email already registered. Please use a different email.');
        }

        // Hash the user's password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Generate a 2FA secret
        const secret = speakeasy.generateSecret({ length: 20 });

        // Insert new user into MongoDB
        const result = await db.collection('users').insertOne({
            name,
            email,
            password: hashedPassword,
            twofa_secret: secret.base32,
            emailVerified: false,
            verificationToken: ""
        });

        // Create verification token
        const verificationToken = result.insertedId.toString();
        await db.collection('users').updateOne(
            { _id: result.insertedId },
            { $set: { verificationToken } }
        );

        // Send verification email
        const verificationLink = `http://localhost:3000/verify?token=${verificationToken}`;
        const mailOptions = {
            from: 'fniska8@gmail.com',
            to: email,
            subject: 'Email Verification for Your Account',
            html: `<h2>Verify Your Email</h2>
                   <p>Click <a href="${verificationLink}">here</a> to verify your email.</p>
                   <p>Or copy and paste this link: ${verificationLink}</p>`,
        };
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent to:', email);

        // Generate QR Code for 2FA
        const qrCodeURL = await qrcode.toDataURL(secret.otpauth_url);

        // Response with success message and QR code
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Registration Successful</title>
                <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
            </head>
            <body>
                <script>
                    Swal.fire({
                        title: 'Registration Successful!',
                        text: 'A verification email has been sent to ${email}.',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    }).then(() => {
                        window.location.href = '/';
                    });
                </script>
                <img src="${qrCodeURL}" alt="QR Code for 2FA" style="display: block; margin: 20px auto;">
            </body>
            </html>
        `;
        res.send(htmlContent);

    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).send('Internal Server Error.');
    }
});

module.exports = router;
