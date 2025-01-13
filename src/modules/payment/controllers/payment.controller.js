const paymentService = require('../services/payment.service');
const User = require('../../user/models/user');

class PaymentController {
  async initiatePayment(req, res) {
    try {
      const userId = req.user._id;
      const { phone, address } = req.body;

      console.log('Received payment request:', { userId, phone, address });

      // Validate phone
      if (!phone || phone.trim().length !== 10) {
        console.log('Invalid phone number:', phone);
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid phone number (10 digits)'
        });
      }

      // Validate address
      if (!address || address.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid shipping address'
        });
      }

      // Lấy thông tin user hiện tại
      const user = await User.findById(userId);

      // Chỉ cập nhật nếu user chưa có thông tin
      const updateFields = {};
      if (!user.phone) {
        updateFields.phone = phone.trim();
      }
      if (!user.address) {
        updateFields.address = address.trim();
      }

      // Chỉ update khi có field cần cập nhật
      if (Object.keys(updateFields).length > 0) {
        await User.findByIdAndUpdate(userId, updateFields);
        console.log('Updated user information:', updateFields);
      }

      const paymentLink = await paymentService.createPayment(userId);
      console.log('Created payment link:', paymentLink);

      res.json({
        success: true,
        paymentUrl: paymentLink.checkoutUrl
      });
    } catch (error) {
      console.error('Payment initiation error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'An error occurred while creating payment'
      });
    }
  }

  async handlePaymentCallback(req, res) {
    try {
      const { orderCode, status } = req.query;
      const userId = req.user._id;

      console.log('Payment callback received:', { orderCode, status });

      if (status === 'PAID') {
        await paymentService.handleSuccessfulPayment(userId, orderCode);
        res.redirect('/purchase');
      } else {
        res.redirect('/cart?error=payment_failed');
      }
    } catch (error) {
      console.error('Payment callback error:', error);
      res.redirect('/cart?error=payment_failed');
    }
  }
}

module.exports = new PaymentController();