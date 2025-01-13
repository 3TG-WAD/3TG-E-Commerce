const cartService = require('../services/cart.service');
const { formatToVND } = require('../../../helpers/currencyFormatter');

class CartController {
    async getCartPage(req, res) {
        try {
            const userId = req.session?.passport?.user;
            const { cartItems, total_price, total_items, discount } = 
                await cartService.getCartData(userId, req.session.cartItems);

            // Tính toán các khoản phí
            const DELIVERY_FEE = 15000;
            const discountAmount = discount ? (total_price * discount / 100) : 0;
            const finalTotal = total_price - discountAmount + DELIVERY_FEE;

            const formattedCartItems = cartItems.map(item => ({
                id: item._id || item.product_id,
                product: {
                    name: item.product_name,
                    images: item.photos || [],
                },
                quantity: item.quantity,
                size: item.size,
                price: item.price,
                final_price: item.final_price,
                discount: item.discount
            }));

            res.render('cart/index', {
                title: 'Shopping Cart',
                cartItems: formattedCartItems,
                user: req.user,
                total_price,
                total_items,
                discount,
                discountAmount,
                deliveryFee: DELIVERY_FEE,
                finalTotal,
                formatToVND
            });
        } catch (error) {
            console.error('Get cart error:', error);
            res.status(500).render('error/500', {
                title: '500 - Server Error'
            });
        }
    }

    async addToCart(req, res) {
        try {
            const { product_id, quantity, size } = req.body;
            const userId = req.user?._id || req.session?.passport?.user;

            if (!product_id || !size) {
                return res.status(400).json({
                    success: false,
                    message: 'Product ID and Size are required'
                });
            }

            await cartService.addToCart(userId, product_id, quantity, size, req.session);

            res.json({
                success: true,
                message: 'Item added to cart successfully'
            });
        } catch (error) {
            console.error('Add to cart error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error adding item to cart'
            });
        }
    }

    async updateQuantity(req, res) {
        try {
            const { itemId } = req.params;
            const { quantity, size, product_id } = req.body;
            const userId = req.user?._id || req.session?.passport?.user;

            const totals = await cartService.updateQuantity(
                userId, 
                itemId, 
                quantity, 
                size, 
                product_id, 
                req.session
            );

            res.json({
                success: true,
                message: 'Quantity updated',
                cart: totals
            });
        } catch (error) {
            console.error('Error updating quantity:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Could not update quantity'
            });
        }
    }

    async removeItem(req, res) {
        try {
            const { itemId } = req.params;
            const userId = req.user?._id || req.session?.passport?.user;

            const totals = await cartService.removeItem(userId, itemId, req.session);

            res.json({
                success: true,
                message: 'Item removed from cart',
                cart: totals
            });
        } catch (error) {
            console.error('Error removing item:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Could not remove item'
            });
        }
    }

    async getCartCount(req, res) {
        try {
            const userId = req.user?._id || req.session?.passport?.user;
            const count = await cartService.getCartCount(userId, req.session);
            
            res.json({
                success: true,
                count: count
            });
        } catch (error) {
            console.error('Error getting cart count:', error);
            res.status(500).json({
                success: false,
                count: 0
            });
        }
    }
}

module.exports = new CartController();