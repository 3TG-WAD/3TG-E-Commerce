const profileService = require('../services/profile.service');
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
      const updatedProfile = await profileService.updateProfile(req.user._id, req.body);
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedProfile
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(400).json({
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

        try {
          const avatarUrl = await profileService.updateAvatar(req.user._id, req.file);
          
          res.json({
            success: true,
            message: 'Avatar updated successfully',
            avatarUrl
          });
        } catch (error) {
          res.status(400).json({
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
      
      await profileService.changePassword(req.user._id, currentPassword, newPassword);
      
      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'An error occurred while changing password'
      });
    }
  }
}

module.exports = new ProfileController();