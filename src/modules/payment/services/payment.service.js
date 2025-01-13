const payOS = require('../../../config/payos');
const Cart = require('../../cart/models/cart');
const CartItem = require('../../cart/models/cartItems');

class PaymentService {
  async createPayment(userId, cartData) {
    try {
      // Lấy thông tin giỏ hàng
      const cart = await Cart.findOne({ user_id: userId });
      if (!cart) {
        throw new Error('Không tìm thấy giỏ hàng');
      }

      const cartItems = await CartItem.find({ cart_id: cart._id });
      
      // Tạo mô tả ngắn gọn
      const itemCount = cartItems.length;
      const description = `Thanh toan ${itemCount} san pham`; // Giữ mô tả ngắn gọn dưới 25 ký tự

      // Tạo order code là số nguyên dương
      const orderCode = Math.floor(Date.now() / 1000); // Sử dụng timestamp chia 1000 để có số nhỏ hơn

      // Tạo payment data theo format của PayOS
      const paymentData = {
        orderCode: orderCode,
        amount: cart.total_price + 0, // Tổng tiền + phí ship
        description: description,
        cancelUrl: `${process.env.APP_URL}/cart`,
        returnUrl: `${process.env.APP_URL}/payment/callback`,
        items: cartItems.map(item => ({
          name: item.product_name,
          quantity: item.quantity,
          price: item.final_price
        }))
      };

      console.log('Payment Data:', paymentData); // Debug log

      // Tạo payment link qua PayOS
      const paymentLink = await payOS.createPaymentLink(paymentData);
      return paymentLink;

    } catch (error) {
      console.error('Payment creation error:', error);
      throw error;
    }
  }

  async verifyPayment(paymentId) {
    try {
      const paymentInfo = await payOS.getPaymentLinkInformation(paymentId);
      return paymentInfo;
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error; 
    }
  }
}

module.exports = new PaymentService();
