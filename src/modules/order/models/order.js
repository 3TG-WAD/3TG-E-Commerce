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
    product_id: String,
    variant_id: String,
    product_name: String,
    product_image: String,
    color: String,
    size: String,
    quantity: Number,
    price: Number,
    discount: Number
  }],
  shipping_address: String,
  payment_method: String,
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipping', 'completed', 'cancelled'],
    default: 'pending'
  },
  total_amount: Number,
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);