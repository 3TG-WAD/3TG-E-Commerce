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
            
            // Kiểm tra user đã authenticate (bao gồm cả Google OAuth)
            const userId = req.user?._id || req.session?.passport?.user;
            console.log('Current user ID:', userId);

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

            // Kiểm tra authentication bao gồm cả Google OAuth
            if (userId) {
                console.log('User is authenticated:', userId);
                
                // Tìm hoặc tạo cart cho user
                let userCart = await Cart.findOne({ user_id: userId });
                console.log('Found existing cart:', userCart);
                
                if (!userCart) {
                    userCart = await Cart.create({
                        user_id: userId,
                        total_items: 0,
                        total_price: 0
                    });
                    console.log('Created new cart:', userCart);
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
                } else {
                    await CartItem.create({
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
                }

                // Log trước khi cập nhật tổng
                console.log('Updating cart totals for cart:', userCart._id);
                const allCartItems = await CartItem.find({ cart_id: userCart._id });
                console.log('All cart items:', allCartItems);

                const totals = allCartItems.reduce((acc, item) => ({
                    total_items: acc.total_items + item.quantity,
                    total_price: acc.total_price + (item.final_price * item.quantity)
                }), { total_items: 0, total_price: 0 });

                console.log('New totals:', totals);
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
            res.status(500).json({
                success: false,
                message: 'Error adding item to cart'
            });
        }
    }

    async updateQuantity(req, res) {
        try {
            const { itemId } = req.params;
            const { quantity, size, product_id } = req.body;
            
            if (quantity < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Quantity must be at least 1'
                });
            }

            const userId = req.user?._id || req.session?.passport?.user;

            if (userId) {
                // Xử lý cho authenticated users
                const cart = await Cart.findOne({ user_id: userId });
                if (!cart) {
                    return res.status(404).json({
                        success: false,
                        message: 'Cart not found'
                    });
                }

                const cartItem = await CartItem.findById(itemId);
                if (!cartItem) {
                    return res.status(404).json({
                        success: false,
                        message: 'Cart item not found'
                    });
                }

                // Cập nhật số lượng
                cartItem.quantity = parseInt(quantity);
                await cartItem.save();

                // Tính toán lại tổng
                const allCartItems = await CartItem.find({ cart_id: cart._id });
                const totals = allCartItems.reduce((acc, item) => ({
                    total_items: acc.total_items + item.quantity,
                    total_price: acc.total_price + (item.final_price * item.quantity)
                }), { total_items: 0, total_price: 0 });

                // Cập nhật cart
                cart.total_items = totals.total_items;
                cart.total_price = totals.total_price;
                await cart.save();

                return res.json({
                    success: true,
                    message: 'Quantity updated',
                    cart: {
                        total_items: cart.total_items,
                        total_price: cart.total_price
                    }
                });
            } else {
                // Phần xử lý cho guest users
                if (!req.session.cartItems) {
                    return res.status(404).json({
                        success: false,
                        message: 'Cart not found'
                    });
                }

                // Tìm và cập nhật item trong session
                const itemIndex = req.session.cartItems.findIndex(item => 
                    item.product_id === product_id && item.size === size
                );

                if (itemIndex === -1) {
                    return res.status(404).json({
                        success: false,
                        message: 'Item not found in cart'
                    });
                }

                req.session.cartItems[itemIndex].quantity = parseInt(quantity);

                // Tính toán lại tổng
                const totals = req.session.cartItems.reduce((acc, item) => ({
                    total_items: acc.total_items + item.quantity,
                    total_price: acc.total_price + (item.final_price * item.quantity)
                }), { total_items: 0, total_price: 0 });

                res.json({
                    success: true,
                    message: 'Quantity updated',
                    cart: {
                        total_items: totals.total_items,
                        total_price: totals.total_price
                    }
                });
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            res.status(500).json({
                success: false,
                message: 'Could not update quantity'
            });
        }
    }

    async removeItem(req, res) {
        try {
            const { itemId } = req.params;
            const userId = req.user?._id || req.session?.passport?.user;
            const cart = await Cart.findOne({ user_id: userId });

            if (!cart) {
                return res.status(404).json({
                    success: false,
                    message: 'Cart not found'
                });
            }

            const cartItem = await CartItem.findOneAndDelete({
                _id: itemId,
                cart_id: cart._id
            });

            if (!cartItem) {
                return res.status(404).json({
                    success: false,
                    message: 'Item not found in cart'
                });
            }

            // Recalculate cart totals
            const allItems = await CartItem.find({ cart_id: cart._id });
            const totals = allItems.reduce((acc, item) => ({
                total_items: acc.total_items + item.quantity,
                total_price: acc.total_price + (item.final_price * item.quantity)
            }), { total_items: 0, total_price: 0 });

            cart.total_items = totals.total_items;
            cart.total_price = totals.total_price;
            await cart.save();

            // Lưu lại session nếu user chưa đăng nhập
            if (!userId) {
                req.session.cart = allItems.map(item => ({
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
                await req.session.save();
            }

            res.json({
                success: true,
                message: 'Item removed from cart',
                cart: {
                    total_items: cart.total_items,
                    total_price: cart.total_price
                }
            });

        } catch (error) {
            console.error('Error removing item:', error);
            res.status(500).json({
                success: false,
                message: 'Could not remove item'
            });
        }
    }

    async getCartCount(req, res) {
        try {
            let count = 0;
            
            // Kiểm tra user đã authenticate (bao gồm cả Google OAuth)
            const userId = req.user?._id || req.session?.passport?.user;
            console.log('Getting cart count for user:', userId);
            
            if (userId) {
                // Nếu user đã đăng nhập, lấy count từ database
                const userCart = await Cart.findOne({ user_id: userId });
                console.log('User cart from DB:', userCart);
                
                if (userCart) {
                    count = userCart.total_items;
                    console.log('Cart count from DB:', count);
                } else {
                    console.log('No cart found in DB for user');
                }
            } else {
                // Nếu chưa đăng nhập, lấy count từ session
                const cartItems = req.session.cartItems || [];
                count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
                console.log('Cart count from session:', count);
            }
            
            console.log('Final cart count:', count);
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