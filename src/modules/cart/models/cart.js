const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    total_items: {
        type: Number,
        default: 0
    },
    total_price: {
        type: Number,
        default: 0
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

// Middleware để tự động cập nhật updated_at
cartSchema.pre('save', function(next) {
    this.updated_at = new Date();
    next();
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;