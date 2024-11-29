const User = require("../models/User");
const crypto = require("crypto");
const passport = require("passport");
const mailer = require("../utilities/mailer");

class AuthService {
  async registerUser(userData) {
    const activationToken = crypto.randomBytes(32).toString("hex");
    
    const existingUser = await User.findOne({ 
      $or: [
        { email: userData.email },
        { username: userData.username }
      ]
    });

    if (existingUser) {
      throw new Error('Username or email already exists');
    }

    const user = new User({
      ...userData,
      activationToken,
      activationTokenExpires: Date.now() + 24 * 60 * 60 * 1000,
    });

    await user.save();
    await this.sendActivationEmail(user.email, activationToken);
    
    return user;
  }

  async loginUser(req, res, next) {
    return new Promise((resolve, reject) => {
      passport.authenticate("local", (err, user, info) => {
        if (err) return reject(err);
        if (!user) return reject(new Error(info.message));
        
        req.logIn(user, (err) => {
          if (err) return reject(err);
          resolve(user);
        });
      })(req, res, next);
    });
  }

  async activateAccount(token) {
    const user = await User.findOne({
      activationToken: token,
      activationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new Error("Invalid or expired activation token");
    }

    user.isActive = true;
    user.activationToken = undefined;
    user.activationTokenExpires = undefined;
    await user.save();
    
    return user;
  }

  async sendActivationEmail(email, token) {
    const activationUrl = `${process.env.APP_URL}/auth/activate/${token}`;
    await mailer.sendMail({
      to: email,
      subject: "Account Activation",
      template: 'activation-email',
      context: { activationUrl }
    });
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('No account with that email address exists.');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.APP_URL}/auth/reset-password/${resetToken}`;
    await mailer.sendMail({
        to: user.email,
        subject: 'Password Reset Request',
        template: 'reset-password-email',
        context: { resetUrl }
    });

    return true;
  }

  async resetPassword(token, newPassword) {
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        throw new Error('Password reset token is invalid or has expired.');
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return user;
  }
}

module.exports = new AuthService();
