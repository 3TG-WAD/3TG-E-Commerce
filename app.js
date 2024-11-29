const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const config = require('./config/config');
const connectDB = require('./config/database');
const localsMiddleware = require('./app/middleware/locals.middleware');
const flash = require('express-flash');

const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'app', 'views'));
app.set('layout', 'layouts/main');
app.use(expressLayouts); 

// Static files
app.use(express.static('public'));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false, // Don't save session if it's not modified
    saveUninitialized: false, // Don't create session until something is stored
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Only send cookie over HTTPS 
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport configuration
require('./config/passport')(app);
app.use(localsMiddleware);

// After session middleware
app.use(flash());

// Routes
app.use('/', require('./app/routes/home.routes'));
app.use('/auth', require('./app/routes/auth.routes'));

// Connect to Database
connectDB();

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        title: 'Error',
        message: config.env === 'development' ? err.message : 'Something went wrong!',
        user: req.user || null
    });
});

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