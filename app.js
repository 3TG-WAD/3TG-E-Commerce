const express = require('express');
const config = require('./config/config');
const connectDB = require('./config/database');
const configureExpress = require('./config/express');

const app = express();

// Configure Express
configureExpress(app);

// Connect to Database
connectDB();

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;