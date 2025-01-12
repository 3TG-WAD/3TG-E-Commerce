const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    cart_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart',
        required: true
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    variant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Variant',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    price: {
        type: Number,
        required: true
    },
    final_price: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    size: {
        type: String,
        required: true
    },
    color: {
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

// Middleware để tự động cập nhật updated_at
cartItemSchema.pre('save', function(next) {
    this.updated_at = new Date();
    next();
});

// Middleware để cập nhật tổng số lượng và giá trong Cart
cartItemSchema.post('save', async function() {
    const Cart = mongoose.model('Cart');
    const cartItems = await this.constructor.find({ cart_id: this.cart_id });
    
    const totals = cartItems.reduce((acc, item) => ({
        total_items: acc.total_items + item.quantity,
        total_price: acc.total_price + (item.final_price * item.quantity)
    }), { total_items: 0, total_price: 0 });

    await Cart.findByIdAndUpdate(this.cart_id, {
        total_items: totals.total_items,
        total_price: totals.total_price
    });
});

const CartItem = mongoose.model('CartItem', cartItemSchema);
module.exports = CartItem;