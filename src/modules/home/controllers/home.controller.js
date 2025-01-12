const ProductService = require('../../product/services/product.service');
const productService = new ProductService();
const Product = require('../../product/models/product');
const Category = require('../../product/models/category');

exports.getHomePage = async (req, res) => {
    try {
        // Lấy dữ liệu từ service
        const [newArrivals, topSelling, dressStyles] = await Promise.all([
            productService.getNewArrivals(),
            productService.getTopSelling(),
            productService.getDressStyles()
        ]);

        // Lấy categories
        const categories = await Category.find({});

        res.render('landing/index', {
            title: 'SixT Store - Your Fashion Destination',
            user: req.user || null,
            newArrivals,
            topSelling,
            dressStyles,
            categories
        });
    } catch (error) {
        console.error('Home page error:', error);
        res.status(500).render('error/500', {
            title: 'Error',
            message: error.message
        });
    }
}; 