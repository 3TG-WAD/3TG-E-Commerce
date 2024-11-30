const User = require("../models/User");
const authService = require("../services/auth.service");

exports.renderLogin = (req, res) => {
  const errorMessage = req.flash("error");
  const successMessage = req.flash("success");
  
  return res.render("auth/login", {
    title: "Login",
    error: errorMessage[0],
    success: successMessage[0]
  });
};

exports.renderRegister = (req, res) => {
  res.render("auth/register", {
    title: "Register",
    error: req.flash("error")
  });
};

exports.register = async (req, res) => {
  try {
    await authService.registerUser(req.body);
    req.flash('success', 'Registration successful. Please check your email to activate your account.');
    return res.redirect('/auth/register');
  } catch (error) {
    req.flash('error', error.message);
    return res.redirect('/auth/register');
  }
};

exports.login = async (req, res, next) => {
  try {
    await authService.loginUser(req, res, next);
    return res.redirect('/');
  } catch (error) {
    req.flash('error', error.message);
    return res.redirect('/auth/login');
  }
};

exports.activate = async (req, res) => {
  try {
    const { token } = req.params;
    await authService.activateAccount(token);
    
    return res.render('auth/activation-success', {
      title: 'Account Activated',
      message: 'Your account has been successfully activated! You can now login.'
    });
  } catch (error) {
    return res.render('auth/activation-error', {
      title: 'Activation Error',
      message: error.message || 'An error occurred during activation. Please try again.'
    });
  }
};

exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      req.flash("error", "Failed to logout");
    }
    res.redirect("/auth/login");
  });
};

exports.renderForgotPassword = (req, res) => {
    res.render('auth/forgot-password', {
        title: 'Forgot Password'
    });
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        await authService.forgotPassword(email);
        req.flash('success', 'Password reset link has been sent to your email.');
        return res.redirect('/auth/login');
    } catch (error) {
        req.flash('error', error.message || 'An error occurred. Please try again.');
        return res.redirect('/auth/forgot-password');
    }
};

exports.renderResetPassword = (req, res) => {
    res.render('auth/reset-password', {
        title: 'Reset Password',
        token: req.params.token 
    });
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        await authService.resetPassword(token, password);
        req.flash('success', 'Your password has been updated! You can now login with your new password.');
        return res.redirect('/auth/login');
    } catch (error) {
        req.flash('error', error.message || 'An error occurred. Please try again.');
        return res.redirect('/auth/forgot-password');
    }
};
