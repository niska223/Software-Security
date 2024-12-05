const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

// View logs route
router.get('/', async (req, res) => {
    const db = getDb();

    try {
        const logs = await db.collection('logs').find({}).toArray();
        let logsHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>User Login/Logout Logs</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #e6f0fa; /* Light blue background */
                    color: #333;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    min-height: 100vh;
                }
                header {
                    background-color: #007bff; /* Blue header */
                    color: white;
                    padding: 20px;
                    text-align: center;
                }
                header h1 {
                    margin: 0;
                    font-size: 2em;
                }
                header a {
                    color: white;
                    text-decoration: none;
                    font-size: 1.1em;
                    margin-top: 10px;
                    display: inline-block;
                    transition: color 0.3s ease;
                }
                header a:hover {
                    color: #d9e5ff;
                }
                main {
                    flex: 1;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    padding: 20px;
                }
                table {
                    width: 90%;
                    max-width: 800px;
                    border-collapse: collapse;
                    background-color: white;
                    border-radius: 10px;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                th, td {
                    padding: 15px;
                    text-align: left;
                    border-bottom: 1px solid #ccc;
                }
                th {
                    background-color: #0056b3; /* Darker blue for table header */
                    color: white;
                }
                td {
                    background-color: #f9f9f9;
                }
                tr:nth-child(even) td {
                    background-color: #e3e9f0; /* Subtle alternate row color */
                }
                tr:hover td {
                    background-color: #d0e4f7; /* Light blue hover effect */
                }
                footer {
                    background-color: #007bff; /* Blue footer */
                    color: white;
                    text-align: center;
                    padding: 10px 0;
                }
            </style>
        </head>
        <body>
            <header>
                <h1>User Login/Logout Logs</h1>
                <a href="/dashboard">&larr; Back to Dashboard</a>
            </header>
            <main>
                <table>
                    <thead>
                        <tr>
                            <th>Login Time</th>
                            <th>Logout Time</th>
                            <th>Device</th>
                        </tr>
                    </thead>
                    <tbody>`;
        logs.forEach(log => {
            logsHtml += `
                        <tr>
                            <td>${new Date(log.loginTime).toLocaleString()}</td>
                            <td>${log.logoutTime ? new Date(log.logoutTime).toLocaleString() : 'Still logged in'}</td>
                            <td>${log.device}</td>
                        </tr>`;
        });
        logsHtml += `
                    </tbody>
                </table>
            </main>
            <footer>
                <p>&copy; 2024 My Node.js App</p>
            </footer>
        </body>
        </html>`;

        res.send(logsHtml);
    } catch (err) {
        console.error('Error retrieving logs:', err);
        res.status(500).send('Error retrieving logs');
    }
});

module.exports = router;
