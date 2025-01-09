const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  order_id: {
    type: String,
    required: true,
    unique: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shop_id: {
    type: String,
    required: true
  },
  items: [{
    product_id: {
      type: String,
      required: true
    },
    variant_id: {
      type: String,
      required: true  
    },
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipping', 'completed', 'cancelled'],
    default: 'pending'
  },
  total_amount: {
    type: Number,
    required: true
  },
  shipping_address: {
    type: String,
    required: true
  },
  payment_method: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;