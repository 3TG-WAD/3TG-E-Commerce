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