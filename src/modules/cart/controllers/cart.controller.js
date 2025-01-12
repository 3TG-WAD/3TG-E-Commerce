const Product = require('../../product/models/product');
const Variant = require('../../product/models/variant');

class CartController {
    async getCartPage(req, res) {
        try {
            const cartItems = req.session.cartItems || [];
            
            // Lấy thông tin chi tiết cho mỗi sản phẩm trong cart
            const cartItemsWithDetails = await Promise.all(
                cartItems.map(async (item) => {
                    const product = await Product.findOne({ product_id: item.product_id });
                    const variants = await Variant.find({ product_id: item.product_id });
                    
                    // Tính toán giá như trong product detail
                    const cheapestVariant = variants.reduce((min, curr) => {
                        if (!min) return curr;
                        const minFinalPrice = min.price * (1 - (min.discount || 0) / 100);
                        const currFinalPrice = curr.price * (1 - (curr.discount || 0) / 100);
                        return currFinalPrice < minFinalPrice ? curr : min;
                    }, null);

                    const originalPrice = (cheapestVariant?.price || 0) * 1000;
                    const discount = cheapestVariant?.discount || 0;
                    const finalPrice = originalPrice * (1 - discount / 100);

                    return {
                        ...item,
                        product: {
                            id: product.product_id,
                            name: product.product_name,
                            images: product.photos,
                            price: originalPrice,
                            original_price: originalPrice,
                            discount: discount,
                            finalPrice: finalPrice
                        }
                    };
                })
            );

            const totalPrice = cartItemsWithDetails.reduce(
                (sum, item) => sum + (item.product.finalPrice * item.quantity), 
                0
            );

            res.render('cart/index', {
                title: 'Your Cart - SixT Store',
                cartItems: cartItemsWithDetails,
                cart: {
                    total_items: cartItems.length,
                    total_price: totalPrice
                },
                discount: 0,
                formatToVND: (price) => {
                    return new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                    }).format(price);
                }
            });
        } catch (error) {
            console.error('Cart error:', error);
            res.status(500).render('error/500', {
                title: '500 - Server Error'
            });
        }
    }

    async addToCart(req, res) {
        try {
            const { product_id, quantity, size } = req.body;
            
            if (!product_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Product ID is required'
                });
            }

            const product = await Product.findOne({ product_id: product_id });
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            // Lấy variants để tính giá
            const variants = await Variant.find({ product_id: product_id });
            const cheapestVariant = variants.reduce((min, curr) => {
                if (!min) return curr;
                const minFinalPrice = min.price * (1 - (min.discount || 0) / 100);
                const currFinalPrice = curr.price * (1 - (curr.discount || 0) / 100);
                return currFinalPrice < minFinalPrice ? curr : min;
            }, null);

            const originalPrice = (cheapestVariant?.price || 0) * 1000;
            const discount = cheapestVariant?.discount || 0;
            const finalPrice = originalPrice * (1 - discount / 100);

            const cartItem = {
                product_id: product.product_id,
                quantity: parseInt(quantity),
                size,
                price: originalPrice,
                final_price: finalPrice,
                product_name: product.product_name,
                photos: product.photos?.[0] || ''
            };

            if (!req.session.cartItems) {
                req.session.cartItems = [];
            }

            const existingItemIndex = req.session.cartItems.findIndex(item => 
                item.product_id === cartItem.product_id && item.size === cartItem.size
            );

            if (existingItemIndex > -1) {
                req.session.cartItems[existingItemIndex].quantity += cartItem.quantity;
            } else {
                req.session.cartItems.push(cartItem);
            }

            res.json({
                success: true,
                cartItem,
                message: 'Item added to cart successfully'
            });

        } catch (error) {
            console.error('Add to cart error:', error);
            res.status(500).json({
                success: false,
                message: 'Error adding item to cart'
            });
        }
    }

    async updateQuantity(req, res) {
        try {
            const { item_id } = req.params;
            const { quantity } = req.body;

            res.json({
                success: true,
                quantity: parseInt(quantity)
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating quantity'
            });
        }
    }

    async removeItem(req, res) {
        try {
            const { item_id } = req.params;
            
            res.json({
                success: true,
                message: 'Item removed successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error removing item'
            });
        }
    }

    async getCartCount(req, res) {
        try {
            const cartItems = req.session.cartItems || [];
            const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            
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