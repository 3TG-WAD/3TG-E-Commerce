const Cart = require('../modules/cart/models/cart');
const CartItem = require('../modules/cart/models/cartItems');

async function mergeCart(userId, sessionCart) {
    try {

        if (!sessionCart || !sessionCart.length) {
            console.log('No session cart items to merge');
            return;
        }

        // Tìm hoặc tạo cart cho user
        let userCart = await Cart.findOne({ user_id: userId }) ||
                      await Cart.create({ user_id: userId });

        // Merge từng item
        for (const sessionItem of sessionCart) {
            const existingItem = await CartItem.findOne({
                cart_id: userCart._id,
                product_id: sessionItem.product_id,
                size: sessionItem.size
            });

            if (existingItem) {
                existingItem.quantity += sessionItem.quantity;
                await existingItem.save();
            } else {
                const newItem = await CartItem.create({
                    cart_id: userCart._id,
                    product_id: sessionItem.product_id,
                    variant_id: sessionItem.variant_id,
                    quantity: sessionItem.quantity,
                    price: sessionItem.price,
                    final_price: sessionItem.final_price,
                    discount: sessionItem.discount,
                    size: sessionItem.size,
                    color: sessionItem.color,
                    product_name: sessionItem.product_name,
                    photos: sessionItem.photos
                });
            }
        }

        console.log('Cart merge completed');

        // Cập nhật tổng trong cart sau khi merge
        const allCartItems = await CartItem.find({ cart_id: userCart._id });
        const totals = allCartItems.reduce((acc, item) => ({
            total_items: acc.total_items + item.quantity,
            total_price: acc.total_price + (item.final_price * item.quantity)
        }), { total_items: 0, total_price: 0 });

        await Cart.findByIdAndUpdate(userCart._id, {
            total_items: totals.total_items,
            total_price: totals.total_price
        });

        return userCart;
    } catch (error) {
        console.error('Error merging cart:', error);
        throw error;
    }
}

module.exports = { mergeCart };