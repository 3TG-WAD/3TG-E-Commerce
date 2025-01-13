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
  shipping_address: {
    type: String,
    required: true
  },
  phone_number: {
    type: String,
    required: true
  },
  payment_method: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  total_amount: {
    type: Number,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);