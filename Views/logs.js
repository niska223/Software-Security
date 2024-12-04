const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

// Route to view user logs
router.get('/', async (req, res) => {
    const db = getDb();

    try {
        const logs = await db.collection('logs').find({}).toArray();

        // HTML Template
        let logsHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>User Login/Logout Logs</title>
            <style>
                /* General Styles */
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f1f5ff;
                    color: #03045e;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    min-height: 100vh;
                }
                
                /* Header Styling */
                header {
                    background-color: #0077b6;
                    color: white;
                    text-align: center;
                    padding: 20px 0;
                    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
                }
                header h1 {
                    margin: 0;
                    font-size: 2.5em;
                }
                header a {
                    color: #caf0f8;
                    text-decoration: none;
                    font-size: 1.2em;
                    margin-top: 10px;
                    display: inline-block;
                }
                header a:hover {
                    color: #90e0ef;
                }

                /* Main Table Styles */
                main {
                    flex: 1;
                    padding: 20px;
                }
                table {
                    width: 90%;
                    margin: 0 auto;
                    border-collapse: collapse;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.15);
                }
                th, td {
                    padding: 15px;
                    text-align: left;
                    border-bottom: 1px solid #a9d6e5;
                }
                th {
                    background-color: #0077b6;
                    color: white;
                    font-weight: bold;
                }
                td {
                    background-color: #e0f7ff;
                }
                tr:nth-child(even) td {
                    background-color: #caf0f8;
                }
                tr:hover td {
                    background-color: #ade8f4;
                }

                /* Footer Styling */
                footer {
                    background-color: #0077b6;
                    color: white;
                    text-align: center;
                    padding: 10px 0;
                    font-size: 1em;
                    position: fixed;
                    bottom: 0;
                    width: 100%;
                    box-shadow: 0px -2px 5px rgba(0, 0, 0, 0.1);
                }
            </style>
        </head>
        <body>
            <!-- Header Section -->
            <header>
                <h1>User Login/Logout Logs</h1>
                <a href="/dashboard">Back to Dashboard</a>
            </header>

            <!-- Main Content -->
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
        
        // Populate the table with logs
        logs.forEach(log => {
            logsHtml += `
                        <tr>
                            <td>${log.loginTime}</td>
                            <td>${log.logoutTime ? log.logoutTime : 'Still logged in'}</td>
                            <td>${log.device}</td>
                        </tr>`;
        });

        logsHtml += `
                    </tbody>
                </table>
            </main>

            <!-- Footer Section -->
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
