const authService = require("../services/auth.service");

exports.renderLogin = (req, res) => {
  res.render("auth/login", {
    title: "Login",
    error: req.flash("error"),
  });
};

exports.renderRegister = (req, res) => {
  res.render("auth/register", {
    title: "Register",
    error: req.flash("error"),
  });
};

exports.register = async (req, res) => {
  try {
    await authService.registerUser(req.body);
    res.json({
      success: true,
      message:
        "Registration successful. Please check your email to activate your account.",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    await authService.loginUser(req, res, next);
    res.redirect("/");
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/auth/login");
  }
};

exports.activate = async (req, res) => {
  try {
    await authService.activateAccount(req.params.token);
    res.render("auth/activation-success", {
      title: "Account Activated",
      message:
        "Your account has been successfully activated! You can now login.",
    });
  } catch (error) {
    res.render("auth/activation-error", {
      title: "Activation Error",
      message: error.message,
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
        await authService.forgotPassword(req.body.email);
        res.json({
            success: true,
            message: 'Password reset email has been sent. Please check your email.'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
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
        res.json({
            success: true,
            message: 'Password has been reset successfully.'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
