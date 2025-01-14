const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const { isAuthenticated } = require('../../../middleware/auth.middleware');

router.get('/profile', isAuthenticated, profileController.getProfilePage);
router.post('/profile/update', isAuthenticated, profileController.updateProfile);
router.post('/profile/update-avatar', isAuthenticated, profileController.updateAvatar);
router.post('/profile/change-password', isAuthenticated, profileController.changePassword);

module.exports = router;