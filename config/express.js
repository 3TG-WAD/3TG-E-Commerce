const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const flash = require('express-flash');

const configureExpress = (app) => {
  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // View engine setup
  app.use(expressLayouts);
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '..', 'app', 'views'));
  app.set('layout', 'layouts/main');
  app.set('layout extractScripts', true);
  app.set('layout extractStyles', true);

  // Session configuration - Cần thiết cho auth
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Passport configuration
  app.use(passport.initialize());
  app.use(passport.session());
  require('./passport')(app);  // Thêm cấu hình passport

  // Flash messages
  app.use(flash());

  // Static files
  app.use(express.static('public'));

  // Security headers
  app.use((req, res, next) => {
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Add this middleware before routes
  app.use((req, res, next) => {
    res.locals.isAuthenticated = () => req.isAuthenticated();
    next();
  });

  // Routes
  const landingRoutes = require('../app/routes/landing.routes');
  const authRoutes = require('../app/routes/auth.routes');

  app.use('/', landingRoutes);
  app.use('/auth', authRoutes);

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      error: 'Something went wrong!',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).render('error/404', {
      title: '404 - Page Not Found'
    });
  });

  // 500 handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error/500', {
      title: '500 - Server Error'
    });
  });
};

module.exports = configureExpress;