const Product = require('../../product/models/product');
const Variant = require('../../product/models/variant');
const Cart = require('../models/cart');
const CartItem = require('../models/cartItems');

class CartService {
    async getCartData(userId, sessionCartItems) {
        let cartItems = [];
        let total_price = 0;
        let total_items = 0;
        let discount = 0;
        
        if (userId) {
            const userCart = await Cart.findOne({ user_id: userId });
            if (userCart) {
                cartItems = await CartItem.find({ cart_id: userCart._id });
                total_price = userCart.total_price;
                total_items = userCart.total_items;
                discount = userCart.discount || 0;
            }
        } else {
            cartItems = sessionCartItems || [];
            total_price = cartItems.reduce((sum, item) => sum + (item.final_price * item.quantity), 0);
            total_items = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        }

        return { cartItems, total_price, total_items, discount };
    }

    async addToCart(userId, productId, quantity, size, session) {
        const product = await Product.findOne({ product_id: productId });
        if (!product) {
            throw new Error('Product not found');
        }

        const variants = await Variant.find({ product_id: productId });
        const variant = variants[0];
        
        if (!variant) {
            throw new Error('Variant not found for this size');
        }

        const originalPrice = variant.price * 1000;
        const discount = variant.discount || 0;
        const finalPrice = originalPrice * (1 - discount / 100);

        if (userId) {
            return await this.addToUserCart(userId, product, variant, quantity, size, originalPrice, finalPrice, discount);
        } else {
            return await this.addToSessionCart(session, product, quantity, size, originalPrice, finalPrice, discount);
        }
    }

    async addToUserCart(userId, product, variant, quantity, size, originalPrice, finalPrice, discount) {
        let userCart = await Cart.findOne({ user_id: userId });
        
        if (!userCart) {
            userCart = await Cart.create({
                user_id: userId,
                total_items: 0,
                total_price: 0
            });
        }

        let existingItem = await CartItem.findOne({
            cart_id: userCart._id,
            product_id: product.product_id,
            size: size
        });

        if (existingItem) {
            existingItem.quantity += parseInt(quantity) || 1;
            await existingItem.save();
        } else {
            await CartItem.create({
                cart_id: userCart._id,
                product_id: product.product_id,
                variant_id: variant._id,
                quantity: parseInt(quantity) || 1,
                price: originalPrice,
                final_price: finalPrice,
                discount: discount,
                size: size,
                product_name: product.product_name,
                photos: product.photos || []
            });
        }

        const allCartItems = await CartItem.find({ cart_id: userCart._id });
        const totals = allCartItems.reduce((acc, item) => ({
            total_items: acc.total_items + item.quantity,
            total_price: acc.total_price + (item.final_price * item.quantity)
        }), { total_items: 0, total_price: 0 });

        await Cart.findByIdAndUpdate(userCart._id, {
            total_items: totals.total_items,
            total_price: totals.total_price
        });

        return true;
    }

    async addToSessionCart(session, product, quantity, size, originalPrice, finalPrice, discount) {
        const cartItem = {
            product_id: product.product_id,
            quantity: parseInt(quantity) || 1,
            size: size,
            price: originalPrice,
            final_price: finalPrice,
            discount: discount,
            product_name: product.product_name,
            photos: product.photos || []
        };

        if (!session.cartItems) {
            session.cartItems = [];
        }

        const existingItemIndex = session.cartItems.findIndex(item =>
            item.product_id === cartItem.product_id &&
            item.size === cartItem.size
        );

        if (existingItemIndex > -1) {
            session.cartItems[existingItemIndex].quantity += cartItem.quantity;
        } else {
            session.cartItems.push(cartItem);
        }

        return true;
    }

    async updateQuantity(userId, itemId, quantity, size, productId, session) {
        if (quantity < 1) {
            throw new Error('Quantity must be at least 1');
        }

        if (userId) {
            return await this.updateUserCartQuantity(userId, itemId, quantity);
        } else {
            return await this.updateSessionCartQuantity(session, productId, size, quantity);
        }
    }

    async updateUserCartQuantity(userId, itemId, quantity) {
        const cart = await Cart.findOne({ user_id: userId });
        if (!cart) {
            throw new Error('Cart not found');
        }

        const cartItem = await CartItem.findById(itemId);
        if (!cartItem) {
            throw new Error('Cart item not found');
        }

        cartItem.quantity = parseInt(quantity);
        await cartItem.save();

        const allCartItems = await CartItem.find({ cart_id: cart._id });
        const totals = allCartItems.reduce((acc, item) => ({
            total_items: acc.total_items + item.quantity,
            total_price: acc.total_price + (item.final_price * item.quantity)
        }), { total_items: 0, total_price: 0 });

        cart.total_items = totals.total_items;
        cart.total_price = totals.total_price;
        await cart.save();

        return { total_items: cart.total_items, total_price: cart.total_price };
    }

    async updateSessionCartQuantity(session, productId, size, quantity) {
        if (!session.cartItems) {
            throw new Error('Cart not found');
        }

        const itemIndex = session.cartItems.findIndex(item => 
            item.product_id === productId && item.size === size
        );

        if (itemIndex === -1) {
            throw new Error('Item not found in cart');
        }

        session.cartItems[itemIndex].quantity = parseInt(quantity);

        const totals = session.cartItems.reduce((acc, item) => ({
            total_items: acc.total_items + item.quantity,
            total_price: acc.total_price + (item.final_price * item.quantity)
        }), { total_items: 0, total_price: 0 });

        return totals;
    }

    async removeItem(userId, itemId, session) {
        const cart = await Cart.findOne({ user_id: userId });
        if (!cart) {
            throw new Error('Cart not found');
        }

        const cartItem = await CartItem.findOneAndDelete({
            _id: itemId,
            cart_id: cart._id
        });

        if (!cartItem) {
            throw new Error('Item not found in cart');
        }

        const allItems = await CartItem.find({ cart_id: cart._id });
        const totals = allItems.reduce((acc, item) => ({
            total_items: acc.total_items + item.quantity,
            total_price: acc.total_price + (item.final_price * item.quantity)
        }), { total_items: 0, total_price: 0 });

        cart.total_items = totals.total_items;
        cart.total_price = totals.total_price;
        await cart.save();

        if (!userId && session) {
            session.cart = allItems.map(item => ({
                product_id: item.product_id,
                variant_id: item.variant_id,
                quantity: item.quantity,
                price: item.price,
                final_price: item.final_price,
                discount: item.discount,
                size: item.size,
                product_name: item.product_name,
                photos: item.photos
            }));
            await session.save();
        }

        return { total_items: cart.total_items, total_price: cart.total_price };
    }

    async getCartCount(userId, session) {
        let count = 0;
        
        if (userId) {
            const userCart = await Cart.findOne({ user_id: userId });
            if (userCart) {
                count = userCart.total_items;
            }
        } else {
            const cartItems = session.cartItems || [];
            count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        }
        
        return count;
    }
}

module.exports = new CartService();
