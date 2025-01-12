const cartController = {
    getCartPage: async (req, res) => {
        // Dữ liệu mẫu để demo UI
        const cartItems = [
            {
                _id: '1',
                product: {
                    product_name: 'Gradient Graphic T-shirt',
                    photos: ['/images/products/tshirt.jpg']
                },
                size: 'Large',
                color: 'White',
                quantity: 1,
                price: 145000,
                final_price: 145000,
                discount: 0
            },
            {
                _id: '2',
                product: {
                    product_name: 'Checkered Shirt',
                    photos: ['/images/products/checkered.jpg']
                },
                size: 'Medium',
                color: 'Red',
                quantity: 1,
                price: 180000,
                final_price: 180000,
                discount: 0
            },
            {
                _id: '3',
                product: {
                    product_name: 'Skinny Fit Jeans',
                    photos: ['/images/products/jeans.jpg']
                },
                size: 'Large',
                color: 'Blue',
                quantity: 1,
                price: 240000,
                final_price: 240000,
                discount: 0
            }
        ];

        const cart = {
            total_items: 3,
            total_price: 565000 // 145000 + 180000 + 240000
        };

        const discount = 20; // 20% discount

        res.render('cart/index', {
            title: 'Your Cart - SixT Store',
            cartItems,
            cart,
            discount,
            formatToVND: (price) => {
                return new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                }).format(price);
            }
        });
    }
};

module.exports = cartController;