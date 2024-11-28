const express = require('express');
const config = require('./config');

const configureExpress = (app) => {
  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Security headers
  app.use((req, res, next) => {
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Basic route
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Welcome to the API',
      environment: config.env 
    });
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      error: 'Something went wrong!',
      message: config.env === 'development' ? err.message : undefined
    });
  });
};

module.exports = configureExpress;