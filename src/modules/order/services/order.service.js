const Order = require('../models/order');
const mongoose = require('mongoose');

class OrderService {
  async getOrdersByUser(userId, status = null) {
    try {
      // Convert string userId to ObjectId
      const objectId = new mongoose.Types.ObjectId(userId);
      
      let query = { user_id: objectId };
      if (status && status !== 'all') {
        query.status = status;
      }

      const orders = await Order.find(query)
        .sort({ created_at: -1 });
      

      return orders;
    } catch (error) {
      throw error;
    }
  }

  async searchOrders(userId, searchTerm) {
    try {
      const objectId = new mongoose.Types.ObjectId(userId);
      
      return await Order.find({
        user_id: objectId,
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

  async getOrderById(orderId) {
    try {
      const order = await Order.findOne({ order_id: orderId });
      if (!order) {
        throw new Error('Order not found');
      }
      return order;
    } catch (error) {
      console.error('Error in getOrderById:', error);
      throw error;
    }
  }
}

module.exports = new OrderService();