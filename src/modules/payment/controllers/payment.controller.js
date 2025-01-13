const paymentService = require('../services/payment.service');
const User = require('../../user/models/user');

class PaymentController {
  async initiatePayment(req, res) {
    try {
      const userId = req.user._id;
      const { phone } = req.body;

      console.log('Received payment request:', { userId, phone });

      if (!phone || phone.trim().length !== 10) {
        console.log('Invalid phone number:', phone);
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập số điện thoại hợp lệ (10 số)'
        });
      }

      // Cập nhật số điện thoại cho user
      await User.findByIdAndUpdate(userId, { phone: phone.trim() });
      console.log('Updated user phone number');

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
        message: error.message || 'Có lỗi xảy ra khi tạo thanh toán'
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