const User = require("../../user/models/user");
const authService = require("../services/auth.service");
const { mergeCart } = require('../../../middleware/cart.middleware');

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
    if (req.isAuthenticated() && req.user.authProvider === 'google') {
      return res.redirect('/');
    }
    
    // Lưu cart session trước khi login
    const sessionCart = req.session.cartItems || [];
    
    // Login user
    const user = await authService.loginUser(req, res, next);
    
    // Merge cart sau khi login
    if (sessionCart.length > 0) {
      await mergeCart(user._id, sessionCart);
    }
    
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
      console.error('Logout error:', err);
      return res.status(500).render('error/500', {
        title: '500 - Server Error'
      });
    }
    res.redirect("/auth/login");
  });
};

exports.renderForgotPassword = (req, res) => {
    try {
        res.render('auth/forgot-password', {
            title: 'Forgot Password',
            error: req.flash('error'),
            success: req.flash('success'),
            meta: '',
            script: ''
        });
    } catch (error) {
        console.error('Render forgot password error:', error);
        res.status(500).render('error/500', {
            title: '500 - Server Error'
        });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        await authService.forgotPassword(email);
        
        return res.json({
            success: true,
            message: 'Password reset link has been sent to your email.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return res.status(500).json({
            success: false,
            message: 'An internal server error occurred'
        });
    }
};

exports.renderResetPassword = (req, res) => {
  res.render('auth/reset-password', {
      title: 'Reset Password',
      token: req.params.token,
      meta: '',
      script: ''
  });
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        await authService.resetPassword(token, password);
        
        return res.json({
            success: true,
            message: 'Your password has been updated successfully!'
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || 'An error occurred. Please try again.'
        });
    }
};

exports.googleCallback = (req, res) => {
  // Check if user is authenticated
  if (!req.user) {
    req.flash('error', 'Google authentication failed');
    return res.redirect('/auth/login');
  }

  // Redirect to home page after successful login
  req.flash('success', 'Successfully logged in with Google!');
  res.redirect('/');
};
