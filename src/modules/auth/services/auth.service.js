const User = require("../../user/models/user");
const crypto = require("crypto");
const passport = require("passport");
const mailer = require("../../../utilities/mailer");

class AuthService {
  async registerUser(userData) {
    // Check if username exists
    const existingUsername = await User.findOne({ username: userData.username });
    if (existingUsername) {
        throw new Error('Username already exists');
    }

    // Check if email exists
    const existingEmail = await User.findOne({ email: userData.email });
    if (existingEmail) {
        throw new Error('Email already exists');
    }

    // If both checks pass, create new user
    const user = new User({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        address: userData.address,
        activationToken: crypto.randomBytes(32).toString('hex'),
        activationTokenExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });

    await user.save();
    await this.sendActivationEmail(user.email, user.activationToken);
    return user;
  }

  async loginUser(req, res, next) {
    return new Promise((resolve, reject) => {
      passport.authenticate("local", (err, user, info) => {
        if (err) return reject(err);
        if (!user) return reject(new Error(info ? info.message : 'Authentication failed'));
        
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
      throw new Error("Invalid or expired activation link. Please register again.");
    }

    if (user.isActive) {
      throw new Error("This account has already been activated.");
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
