// app.js
const express = require('express');
const session = require('express-session');
const path = require('path');
const { connectToMongoDB, getDb } = require('./db'); // MongoDB connection functions

const app = express();

// Session middleware
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Import route files
const indexRoute = require('./Views/index');
const loginRoute = require('./Views/login');
const registerRoute = require('./Views/register');
const dashboardRoute = require('./Views/dashboard');
const userProfileRoute = require('./Views/userProfile');
const verifyRoute = require('./Views/verify');
const logsRoute = require('./Views/logs');


// Use imported routes
app.use('/', indexRoute);
app.use('/login', loginRoute);
app.use('/register', registerRoute);
app.use('/dashboard', dashboardRoute);
app.use('/userProfile', userProfileRoute);
app.use('/verify', verifyRoute);
app.use('/logs', logsRoute);

// Error handling for 404 - Not Found
app.use((req, res) => {
    res.status(404).send('<h1>404 - Not Found</h1><p>The page you are looking for does not exist.</p>');
});

// General error handling
app.use((err, req, res, next) => {
    console.error(err.stack); // Log error details for debugging
    res.status(500).send('<h1>500 - Internal Server Error</h1><p>Something went wrong!</p>');
});

// Connect to MongoDB before starting the server
connectToMongoDB().then(() => {
    console.log('MongoDB connected successfully!');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1); // Exit process if MongoDB connection fails
});

// Example route to check MongoDB connection
app.get('/', (req, res) => {
    try {
        const db = getDb(); // Get the MongoDB connection
        res.send('MongoDB connection is established');
    } catch (err) {
        res.status(500).send('Failed to retrieve the database connection');
    }
});
