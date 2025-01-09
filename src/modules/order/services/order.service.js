const Order = require('../models/order');

class OrderService {
  async getOrdersByUser(userId, status = null) {
    try {
      let query = { user_id: userId };
      if (status && status !== 'all') {
        query.status = status;
      }

      const orders = await Order.find(query).sort({ created_at: -1 });
      console.log('Found orders:', orders); // Debug log

      return orders;
    } catch (error) {
      console.error('Error in getOrdersByUser:', error);
      throw error;
    }
  }

  async searchOrders(userId, searchTerm) {
    try {
      return await Order.find({
        user_id: userId,
        $or: [
          { order_id: { $regex: searchTerm, $options: 'i' } },
          { 'items.product_name': { $regex: searchTerm, $options: 'i' } }
        ]
      });
    } catch (error) {
      console.error('Error in searchOrders:', error);
      throw error;
    }
  }
}

module.exports = new OrderService();