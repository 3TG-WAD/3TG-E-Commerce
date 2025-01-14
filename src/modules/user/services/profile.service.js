const User = require('../models/user');
const s3Service = require('../../../modules/s3/services/s3.service');
const cacheService = require('../../../modules/cache/redis.service');

class ProfileService {
  async updateProfile(userId, profileData) {
    const { username, email, phone, address, gender } = profileData;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Validate phone format (if provided)
    if (phone) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phone)) {
        throw new Error('Phone number must be 10 digits');
      }
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Kiểm tra email đã tồn tại chưa
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('Email already exists');
      }
    }

    // Cập nhật thông tin
    user.username = username || user.username;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.gender = gender || user.gender;

    await user.save();

    // Xóa cache khi update profile
    await cacheService.del(`user:${userId}`);

    return {
      username: user.username,
      email: user.email,
      phone: user.phone,
      address: user.address,
      gender: user.gender
    };
  }

  async updateAvatar(userId, file) {
    if (!file) {
      throw new Error('Please upload an image');
    }

    // Upload to S3
    const avatarUrl = await s3Service.uploadFile(file);

    // Update user avatar in database
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.avatar = avatarUrl;
    await user.save();

    return avatarUrl;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Kiểm tra nếu là tài khoản Google
    if (user.authProvider === 'google') {
      throw new Error('Google account cannot change password');
    }

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    await user.save();

    return true;
  }

  async getProfile(userId) {
    try {
      // Kiểm tra cache trước
      const cachedUser = await cacheService.get(`user:${userId}`);
      if (cachedUser) {
        console.log('User found in cache');
        return cachedUser;
      }

      // Nếu không có trong cache, query từ DB
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Lưu vào cache trong 1 giờ
      await cacheService.set(`user:${userId}`, user, 3600);

      return user;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ProfileService();
