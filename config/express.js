// config/express.js
const express = require('express');
const engine = require('ejs-mate');
const compression = require('compression');
const helmet = require('helmet');
const cache = require('../app/middleware/cache');
const landingRoutes = require('../app/routes/landing.routes');

const configureExpress = (app) => {
  // Template engine
  app.engine('ejs', engine);
  app.set('view engine', 'ejs');
  app.set('views', './app/views');

  // Middleware
  app.use(express.static('public'));
  app.use(compression());
  app.use(helmet({
    contentSecurityPolicy: false
  }));
  app.use(cache(86400)); // 24 hours cache

  // Landing page route
  app.use('/', landingRoutes);
};

module.exports = configureExpress;
