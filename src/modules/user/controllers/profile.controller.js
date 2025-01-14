const User = require('../models/user');
const s3Service = require('../../../modules/s3/services/s3.service');
const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // giới hạn 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  },
});

class ProfileController {
  async getProfilePage(req, res) {
    try {
      res.render('user/profile', {
        title: 'My Profile',
        user: req.user
      });
    } catch (error) {
      res.status(500).render('error/500', {
        message: error.message
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const { username, email, phone, address, gender } = req.body;
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      // Validate phone format (if provided)
      if (phone) {
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone)) {
          return res.status(400).json({
            success: false,
            message: 'Phone number must be 10 digits'
          });
        }
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Kiểm tra email đã tồn tại chưa
      if (email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Email already exists'
          });
        }
      }

      // Cập nhật thông tin
      user.username = username || user.username;
      user.email = email || user.email;
      user.phone = phone || user.phone;
      user.address = address || user.address;
      user.gender = gender || user.gender;

      await user.save();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          username: user.username,
          email: user.email,
          phone: user.phone,
          address: user.address,
          gender: user.gender
        }
      });

    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error updating profile'
      });
    }
  }

  async updateAvatar(req, res) {
    try {
      upload.single('avatar')(req, res, async (err) => {
        if (err) {
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }

        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: 'Please upload an image'
          });
        }

        try {
          // Upload to S3
          const avatarUrl = await s3Service.uploadFile(req.file);

          // Update user avatar in database
          const user = await User.findById(req.user._id);
          user.avatar = avatarUrl;
          await user.save();

          res.json({
            success: true,
            message: 'Avatar updated successfully',
            avatarUrl
          });
        } catch (error) {
          res.status(500).json({
            success: false,
            message: error.message
          });
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user._id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Kiểm tra nếu là tài khoản Google
      if (user.authProvider === 'google') {
        return res.status(400).json({
          success: false,
          message: 'Google account cannot change password'
        });
      }

      // Kiểm tra mật khẩu hiện tại
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Cập nhật mật khẩu mới
      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'An error occurred while changing password'
      });
    }
  }
}

module.exports = new ProfileController();