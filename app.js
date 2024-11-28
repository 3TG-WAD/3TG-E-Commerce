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
app.listen(config.server.port, () => {
  console.log(`Server running in ${config.env} mode`);
  console.log(`Server listening at http://${config.server.host}:${config.server.port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});