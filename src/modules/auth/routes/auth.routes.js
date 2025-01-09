const express = require('express');
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { isAuthenticated, isNotAuthenticated } = require("../../../middleware/auth.middleware");

// Render routes
router.get('/login', isNotAuthenticated, authController.renderLogin);
router.get('/register', isNotAuthenticated, authController.renderRegister);

// Action routes
router.post('/register', isNotAuthenticated, authController.register);
router.post('/login', isNotAuthenticated, authController.login);
router.get('/logout', isAuthenticated, authController.logout);
router.get('/activate/:token', authController.activate);

// Forgot Password routes
router.get('/forgot-password', isNotAuthenticated, authController.renderForgotPassword);
router.post('/forgot-password', isNotAuthenticated, authController.forgotPassword);
router.get('/reset-password/:token', isNotAuthenticated, authController.renderResetPassword);
router.post('/reset-password', isNotAuthenticated, authController.resetPassword);

module.exports = router;