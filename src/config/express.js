const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const flash = require('express-flash');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const authService = require('../modules/auth/services/auth.service');
const dataMiddleware = require('../middleware/data.middleware');
const categoryController = require('../modules/product/controllers/category.controller');
const Category = require('../modules/product/models/category');
const Manufacturer = require('../modules/product/models/manufacturer');
const sessionMiddleware = require('./session');

const configureExpress = (app) => {
  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(sessionMiddleware);
  // View engine setup
  app.use(expressLayouts);
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '..', 'views'));
  app.set('layout', 'layouts/main');
  app.set('layout extractScripts', true);
  app.set('layout extractStyles', true);

  // Passport configuration
  app.use(passport.initialize());
  app.use(passport.session());
  require('./passport')(app);  // Thêm cấu hình passport
  require('./passport')(app);

  // Google OAuth
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.APP_URL + '/authenticate',
      },
      async function (accessToken, refreshToken, profile, done) {
        try {
          const user = await authService.handleGoogleAuth(profile);
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  // Flash messages
  app.use(flash());

  // Static files
  app.use(express.static(path.join(__dirname, '..', 'public')));
  app.use('/css', express.static(path.join(__dirname, '..', 'public', 'css')));
  app.use(express.static('src/public'));

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

  // Sử dụng middleware
  app.use(dataMiddleware);

  // Routes
  const landingRoutes = require('../modules/home/routes/home.routes.js');
  const authRoutes = require('../modules/auth/routes/auth.routes.js');
  const oauth2Routes = require('../modules/auth/routes/oauth2.routes.js');
  const authController = require('../modules/auth/controllers/auth.controller.js'); 
  const orderRoutes = require('../modules/order/routes/order.routes');
  const profileRoutes = require('../modules/user/routes/profile.routes');
  const categoryRoutes = require('../modules/product/routes/category.routes');
  const productRoutes = require('../modules/product/routes/product.routes');
  const cartRoutes = require('../modules/cart/routes/cart.routes');
  const paymentRoutes = require('../modules/payment/routes/payment.routes');
  app.use('/', paymentRoutes);
  app.use('/', productRoutes);
  app.use('/', categoryRoutes);
  app.use('/', profileRoutes);
  app.use('/', landingRoutes);
  app.use('/auth', authRoutes);
  app.use('/oauth2', oauth2Routes);
  app.use('/', cartRoutes);
  app.use('/', orderRoutes);
  // Add Google callback route at root level
  app.get('/authenticate', 
    passport.authenticate('google', { 
      failureRedirect: '/auth/login',
      failureFlash: true 
    }),
    authController.googleCallback
  );

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

  // 403 handler
  app.use((req, res, next) => {
    res.status(403).render('error/403', {
      title: '403 - Forbidden'
    });
  });
};

module.exports = configureExpress;