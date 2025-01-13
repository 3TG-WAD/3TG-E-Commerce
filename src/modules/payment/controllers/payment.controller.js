const paymentService = require('../services/payment.service');
const Order = require('../../order/models/order');
const Cart = require('../../cart/models/cart');
const CartItem = require('../../cart/models/cartItems');

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
      // PayOS trả về orderCode và status trong query params
      const { orderCode, status } = req.query;
      const userId = req.user._id;

      console.log('Payment callback received:', { orderCode, status });

      if (status === 'PAID') {
        // 1. Lấy thông tin giỏ hàng
        const cart = await Cart.findOne({ user_id: userId });
        if (!cart) {
          throw new Error('Cart not found');
        }

        const cartItems = await CartItem.find({ cart_id: cart._id });
        if (!cartItems.length) {
          throw new Error('Cart is empty');
        }

        // 2. Tạo order mới
        const newOrder = await Order.create({
          order_id: orderCode,
          user_id: userId,
          items: cartItems.map(item => ({
            product_id: item.product_id,
            variant_id: item.variant_id,
            product_name: item.product_name,
            product_image: item.photos[0],
            color: item.color,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
            discount: item.discount
          })),
          shipping_address: req.user.address || "Have not updated",
          payment_method: "PayOS",
          status: "pending",
          total_amount: cart.total_price,
          created_at: new Date()
        });

        // 3. Xóa items trong giỏ hàng
        await CartItem.deleteMany({ cart_id: cart._id });
        
        // 4. Xóa cart
        await Cart.findByIdAndDelete(cart._id);

        // 5. Chuyển hướng đến trang purchase
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