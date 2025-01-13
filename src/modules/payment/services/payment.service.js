const Cart = require('../../cart/models/cart');
const CartItem = require('../../cart/models/cartItems');
const Order = require('../../order/models/order');
const User = require('../../user/models/user');
const payOS = require('../../../config/payos');

class PaymentService {
  async createPayment(userId) {
    try {
      const cart = await Cart.findOne({ user_id: userId });
      if (!cart) {
        throw new Error('Không tìm thấy giỏ hàng');
      }

      const cartItems = await CartItem.find({ cart_id: cart._id });
      const itemCount = cartItems.length;
      const description = `Thanh toan ${itemCount} san pham`;
      const orderCode = Math.floor(Date.now() / 1000);

      const paymentData = {
        orderCode: orderCode,
        amount: cart.total_price + 0,
        description: description,
        cancelUrl: `${process.env.APP_URL}/cart`,
        returnUrl: `${process.env.APP_URL}/payment/callback`,
        items: cartItems.map(item => ({
          name: item.product_name,
          quantity: item.quantity,
          price: item.final_price
        }))
      };

      const paymentLink = await payOS.createPaymentLink(paymentData);
      return paymentLink;
    } catch (error) {
      console.error('Payment creation error:', error);
      throw error;
    }
  }

  async handleSuccessfulPayment(userId, orderCode) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const cart = await Cart.findOne({ user_id: userId });
      if (!cart) {
        throw new Error('Cart not found');
      }

      const cartItems = await CartItem.find({ cart_id: cart._id });
      if (!cartItems.length) {
        throw new Error('Cart is empty');
      }

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
        shipping_address: user.address || "Have not updated",
        payment_method: "PayOS",
        status: "pending",
        total_amount: cart.total_price,
        created_at: new Date()
      });

      await CartItem.deleteMany({ cart_id: cart._id });
      await Cart.findByIdAndDelete(cart._id);

      return newOrder;
    } catch (error) {
      console.error('Handle successful payment error:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();
