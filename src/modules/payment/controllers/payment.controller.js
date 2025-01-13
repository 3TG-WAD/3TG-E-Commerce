const paymentService = require('../services/payment.service');

class PaymentController {
  async initiatePayment(req, res) {
    try {
      const userId = req.user._id;
      const paymentLink = await paymentService.createPayment(userId);

      res.json({
        success: true,
        paymentUrl: paymentLink.checkoutUrl
      });
    } catch (error) {
      console.error('Payment initiation error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async handlePaymentCallback(req, res) {
    try {
      const { paymentId } = req.query;
      const paymentInfo = await paymentService.verifyPayment(paymentId);

      if (paymentInfo.status === 'PAID') {
        // Xử lý khi thanh toán thành công
        // TODO: Cập nhật trạng thái đơn hàng
        res.redirect('/payment/success');
      } else {
        res.redirect('/payment/failed');
      }
    } catch (error) {
      console.error('Payment callback error:', error);
      res.redirect('/payment/failed');
    }
  }
}

module.exports = new PaymentController();