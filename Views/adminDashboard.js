const express = require('express');
const router = express.Router();
const User = require('../Views/userModel');
const Log = require('../Views/logModel'); // Assuming there's a Log model that stores logs

// Route to fetch the admin dashboard
router.get('/', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).send(`
        <html>
            <head>
                <title>Access Denied</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        text-align: center;
                        background-color: #f4f4f9;
                        color: #333;
                        padding: 50px;
                    }
                </style>
            </head>
            <body>
                <h1>403 - Forbidden</h1>
                <p>Access Denied</p>
            </body>
        </html>`);
    }

    try {
        const users = await User.find({}, 'name email').sort({ createdAt: -1 });

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Admin Dashboard</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f9;
                    margin: 0;
                    padding: 20px;
                }
                h1 {
                    text-align: center;
                    color: #0056b3;
                }
                .dashboard {
                    max-width: 800px;
                    margin: 20px auto;
                    padding: 20px;
                    background-color: #fff;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                th, td {
                    padding: 12px;
                    border: 1px solid #ddd;
                    text-align: left;
                }
                th {
                    background-color: #0056b3;
                    color: white;
                }
                tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                .actions a {
                    color: #0056b3;
                    text-decoration: none;
                    margin-right: 10px;
                }
                .actions a:hover {
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <h1>Admin Dashboard</h1>
            <div class="dashboard">
                <h2>Registered Users</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => `
                            <tr>
                                <td>${user.name || 'No username provided'}</td>
                                <td>${user.email}</td>
                                <td class="actions">
                                    <a href="/admin/delete/${user._id}">Delete</a>
                                    <a href="/admin/logs/${user.name}">View Logs</a>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <a href="/logout" style="display: block; text-align: center; margin-top: 20px;">Logout</a>
            </div>
        </body>
        </html>`;

        res.send(htmlContent);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('<h1>500 - Internal Server Error</h1><p>Could not fetch users.</p>');
    }
});

// Route to delete a user
router.get('/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).send('<h1>404 - Not Found</h1><p>User not found.</p>');
        }

        await User.findByIdAndDelete(id);
        res.redirect('/admin');
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send('<h1>500 - Internal Server Error</h1><p>Could not delete user.</p>');
    }
});

// Route to view logs for a specific user by their username
router.get('/logs/:username', async (req, res) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({ name: username });

        if (!user) {
            return res.status(404).send('<h1>404 - Not Found</h1><p>User not found.</p>');
        }

        const logs = await Log.find({ userId: user._id }).sort({ createdAt: -1 });

        const logContent = logs.map(log => `
            <tr>
                <td>${log.timestamp}</td>
            </tr>`).join('');

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>User Logs</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f9;
                    margin: 0;
                    padding: 20px;
                }
                h1 {
                    text-align: center;
                    color: #0056b3;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th, td {
                    padding: 10px;
                    border: 1px solid #ddd;
                    text-align: left;
                }
                th {
                    background-color: #0056b3;
                    color: white;
                }
            </style>
        </head>
        <body>
            <h1>User Logs for ${username}</h1>
            <table>
                <thead>
                    <tr>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    ${logContent}
                </tbody>
            </table>
            <a href="/admin" style="display: block; text-align: center; margin-top: 20px;">Back to Dashboard</a>
        </body>
        </html>`;

        res.send(htmlContent);
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).send('<h1>500 - Internal Server Error</h1><p>Could not fetch logs.</p>');
    }
});

// User registration route
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const user = new User({ name, email, password });
        await user.save();
        res.status(201).json({
            message: 'User registered successfully',
            user: { name: user.name, email: user.email },
        });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
});

module.exports = router;
