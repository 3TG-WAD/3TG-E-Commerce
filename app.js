const express = require('express');
const config = require('./src/config/config');
const connectDB = require('./src/config/database');
const configureExpress = require('./src/config/express');

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