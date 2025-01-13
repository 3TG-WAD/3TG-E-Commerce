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

    // Validate password match
    if (userData.password !== userData.confirmPassword) {
        throw new Error('Passwords do not match');
    }

    // If all checks pass, create new user
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

        // Lưu user vào session
        req.session.user = {
            _id: user._id,
            email: user.email,
            username: user.username
        };
        console.log('User saved to session:', req.session.user); // Debug log
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
  async handleGoogleAuth(profile) {
    try {
        console.log('Handling Google auth for email:', profile.emails[0].value);
        
        let user = await User.findOne({ email: profile.emails[0].value });
        console.log('Existing user found:', user?._id);
        
        if (!user) {
            console.log('Creating new user for Google auth');
            // Tạo user mới nếu chưa tồn tại
            user = await User.create({
                username: profile.displayName,
                email: profile.emails[0].value,
                password: crypto.randomBytes(16).toString('hex'),
                isActive: true,
                authProvider: 'google',
                googleId: profile.id,
                avatar: profile.photos[0]?.value || null
            });
            console.log('New user created:', user._id);
        } else if (!user.googleId) {
            console.log('Updating existing user with Google info');
            // Cập nhật thông tin Google nếu user đã tồn tại
            user.googleId = profile.id;
            user.authProvider = 'google';
            user.avatar = profile.photos[0]?.value || user.avatar;
            await user.save();
            console.log('User updated with Google info');
        }

        return user;
    } catch (error) {
        console.error('Handle Google auth error:', error);
        console.error('Error details:', error.stack);
        throw new Error('Failed to process Google authentication');
    }
  }
}

module.exports = new AuthService();
