const express = require('express');
const router = express.Router();
const { getDb } = require('../db'); // MongoDB Atlas connection
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const nodemailer = require('nodemailer');
const { ObjectID } = require('mongodb');

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'fniska8@gmail.com', // your email address
        pass: 'ewnr ubyc vahc ybnf', // your email password (use app-specific password if using Gmail)
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
        <link rel="stylesheet" href="/style.css">
    </head>
    <body>
        <header>
            <h1>User Registration</h1>
        </header>
        <main>
            <section class="register-container">
                <div class="register-card">
                    <h2>Create Your Account</h2>
                    <form action="/register" method="POST" class="register-form">
                        <div class="form-group">
                            <label for="name">Name:</label>
                            <input type="text" id="name" name="name" placeholder="Enter your name" required>
                        </div>
                        <div class="form-group">
                            <label for="email">Email:</label>
                            <input type="email" id="email" name="email" placeholder="Enter your email" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Password:</label>
                            <input type="password" id="password" name="password" placeholder="Enter your password" required>
                        </div>
                        <button type="submit">Register</button>
                    </form>
                    <p>Already have an account? <a href="/login">Login here</a></p>
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

// Handle user registration
router.post('/', async (req, res) => {
    const { name, email, password } = req.body;

    // Generate a 2FA secret for the user
    const secret = speakeasy.generateSecret({ length: 20 });
    console.log('Generated Secret (base32):', secret.base32);

    const db = getDb(); // Get the MongoDB database instance

    try {
        // Check if the email already exists
        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            return res.send('This email is already registered. Please use a different email.');
        }

        // Insert the user into MongoDB
        const result = await db.collection('users').insertOne({
            email,
            password,
            name,
            twofa_secret: secret.base32,
            emailVerified: false, // Field to track email verification
            verificationToken: "" // Initialize it as empty
        });

        // After insertion, update with the verification token (which is the insertedId)
        const verificationToken = result.insertedId.toString();

        await db.collection('users').updateOne(
            { _id: result.insertedId },
            { $set: { verificationToken } }
        );

        // Send verification email with token
        const mailOptions = {
            from: 'fniska8@gmail.com',
            to: email,
            subject: 'Email Verification for Your Account',
            html: `
                <h1>Verify Your Email</h1>
                <p>Thank you for registering! Please click the button below to verify your email address and complete your registration.</p>
                <a href="http://localhost:3000/verify?token=${verificationToken}" 
                   style="display:inline-block; padding: 10px 20px; color: white; background-color: #28a745; text-decoration: none; border-radius: 5px;">
                   Verify Email
                </a>
                <p>If the button above doesn't work, please copy and paste this link into your browser:</p>
                <p>http://localhost:3000/verify-email?token=${verificationToken}</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log('Verification email sent to:', email);

        // QR Code generation for 2FA
        const data_url = await qrcode.toDataURL(secret.otpauth_url);

        // Respond with SweetAlert2 for success message
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
                    }).then(function() {
                        window.location.href = '/';
                    });
                </script>
            </body>
            </html>
        `;
        res.send(htmlContent);

    } catch (err) {
        console.error('Error saving the user:', err);
        res.send('Error saving the user.');
    }
});

module.exports = router;