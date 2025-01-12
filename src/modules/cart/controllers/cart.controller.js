const Product = require('../../product/models/product');
const Variant = require('../../product/models/variant');
const Cart = require('../models/cart');
const CartItem = require('../models/cartItems');
const { isAuthenticated } = require('../../../middleware/auth.middleware');

class CartController {
    async getCartPage(req, res) {
        try {
            let cartItems = [];
            let total_price = 0;
            let total_items = 0;
            let discount = 0;
            
            if (req.session && req.session.passport && req.session.passport.user) {
                const userCart = await Cart.findOne({ user_id: req.session.passport.user });
                if (userCart) {
                    cartItems = await CartItem.find({ cart_id: userCart._id });
                    total_price = userCart.total_price;
                    total_items = userCart.total_items;
                    discount = userCart.discount || 0;
                }
            } else {
                cartItems = req.session.cartItems || [];
                total_price = cartItems.reduce((sum, item) => sum + (item.final_price * item.quantity), 0);
                total_items = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            }

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

            const formatToVND = (value) => {
                return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
            };

            res.render('cart/index', {
                title: 'Shopping Cart',
                cartItems: formattedCartItems,
                total_price: total_price,
                total_items: total_items,
                discount: discount,
                formatToVND: formatToVND
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
            console.log('Session state:', req.session);
            console.log('Passport user:', req.session.passport?.user);

            if (!product_id || !size) {
                return res.status(400).json({
                    success: false,
                    message: 'Product ID and Size are required'
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
            const variant = variants[0];
            
            if (!variant) {
                return res.status(404).json({
                    success: false,
                    message: 'Variant not found for this size'
                });
            }

            const originalPrice = variant.price * 1000;
            const discount = variant.discount || 0;
            const finalPrice = originalPrice * (1 - discount / 100);

            // Kiểm tra authentication qua passport
            if (req.session && req.session.passport && req.session.passport.user) {
                const userId = req.session.passport.user;
                console.log('User is authenticated:', userId);
                
                // Tìm hoặc tạo cart cho user
                let userCart = await Cart.findOne({ user_id: userId });
                if (!userCart) {
                    userCart = await Cart.create({
                        user_id: userId,
                        total_items: 0,
                        total_price: 0
                    });
                }

                // Tìm item trong database
                let existingItem = await CartItem.findOne({
                    cart_id: userCart._id,
                    product_id: product_id,
                    size: size
                });

                if (existingItem) {
                    existingItem.quantity += parseInt(quantity) || 1;
                    await existingItem.save();
                    console.log('Updated existing item:', existingItem);
                } else {
                    const newItem = await CartItem.create({
                        cart_id: userCart._id,
                        product_id: product_id,
                        variant_id: variant._id,
                        quantity: parseInt(quantity) || 1,
                        price: originalPrice,
                        final_price: finalPrice,
                        discount: discount,
                        size: size,
                        product_name: product.product_name,
                        photos: product.photos || []
                    });
                    console.log('Created new item:', newItem);
                }

                // Cập nhật tổng trong cart
                const allCartItems = await CartItem.find({ cart_id: userCart._id });
                const totals = allCartItems.reduce((acc, item) => ({
                    total_items: acc.total_items + item.quantity,
                    total_price: acc.total_price + (item.final_price * item.quantity)
                }), { total_items: 0, total_price: 0 });

                await Cart.findByIdAndUpdate(userCart._id, {
                    total_items: totals.total_items,
                    total_price: totals.total_price
                });

            } else {
                console.log('User is not authenticated, using session cart');
                // Nếu chưa đăng nhập, lưu vào session
                console.log('Adding to session cart');
                
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

                if (!req.session.cartItems) {
                    req.session.cartItems = [];
                }

                const existingItemIndex = req.session.cartItems.findIndex(item =>
                    item.product_id === cartItem.product_id &&
                    item.size === cartItem.size
                );

                if (existingItemIndex > -1) {
                    req.session.cartItems[existingItemIndex].quantity += cartItem.quantity;
                } else {
                    req.session.cartItems.push(cartItem);
                }
                
                console.log('Session cart after update:', req.session.cartItems);
            }

            res.json({
                success: true,
                message: 'Item added to cart successfully'
            });

        } catch (error) {
            console.error('Add to cart error:', error);
            console.error('Session state at error:', req.session);
            res.status(500).json({
                success: false,
                message: 'Error adding item to cart'
            });
        }
    }

    async updateQuantity(req, res) {
        try {
            const { itemId } = req.params;
            const { change } = req.body;
            
            if (!req.session.cartItems) {
                return res.status(404).json({
                    success: false,
                    message: 'Cart not found'
                });
            }

            // Tìm item dựa trên product_id và size
            const itemIndex = req.session.cartItems.findIndex(
                item => item.product_id === itemId && item.size === req.body.size
            );

            if (itemIndex === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Item not found in cart'
                });
            }

            // Cập nhật số lượng
            const newQuantity = req.session.cartItems[itemIndex].quantity + change;
            
            if (newQuantity <= 0) {
                // Xóa item nếu số lượng = 0
                req.session.cartItems.splice(itemIndex, 1);
            } else {
                req.session.cartItems[itemIndex].quantity = newQuantity;
            }

            res.json({
                success: true,
                message: 'Quantity updated successfully'
            });
        } catch (error) {
            console.error('Update quantity error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating quantity'
            });
        }
    }

    async removeItem(req, res) {
        try {
            const { itemId } = req.params;
            
            if (!req.session.cartItems) {
                return res.status(404).json({
                    success: false,
                    message: 'Cart not found'
                });
            }

            // Tìm và xóa item dựa trên product_id và size
            const itemIndex = req.session.cartItems.findIndex(
                item => item.product_id === itemId && item.size === req.body.size
            );

            if (itemIndex === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Item not found in cart'
                });
            }

            req.session.cartItems.splice(itemIndex, 1);
            
            res.json({
                success: true,
                message: 'Item removed successfully'
            });
        } catch (error) {
            console.error('Remove item error:', error);
            res.status(500).json({
                success: false,
                message: 'Error removing item'
            });
        }
    }

    async getCartCount(req, res) {
        try {
            let count = 0;
            
            if (req.session && req.session.passport && req.session.passport.user) {
                // Nếu user đã đăng nhập, lấy count từ database
                const userCart = await Cart.findOne({ user_id: req.session.passport.user });
                if (userCart) {
                    count = userCart.total_items;
                }
            } else {
                // Nếu chưa đăng nhập, lấy count từ session
                const cartItems = req.session.cartItems || [];
                count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            }
            
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