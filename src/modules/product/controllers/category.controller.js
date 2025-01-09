const Product = require('../models/product');
const Variant = require('../models/variant');
const Category = require('../models/category');
const Manufacturer = require('../models/manufacturer');
const ProductService = require('../services/product.service');
const { formatToVND } = require('../../../helpers/currencyFormatter');

const categoryController = {
    getAllCategories: async (req) => {
        try {
            const categories = await Category.find({});
            return categories;
        } catch (error) {
            console.error('Error getting categories:', error);
            return [];
        }
    },

    getCategoryPage: async (req, res) => {
        try {
            const { slug } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = 9;
            
            const category = await Category.findOne({ slug });
            if (!category) {
                return res.status(404).render('error/404', {
                    title: '404 - Page Not Found'
                });
            }

            const manufacturers = await Manufacturer.find({});

            const currentSort = req.query.sort || 'popular';
            const selectedManufacturers = Array.isArray(req.query.manufacturer) ? 
                req.query.manufacturer : 
                req.query.manufacturer ? [req.query.manufacturer] : [];

            const baseQuery = { category_id: category.category_id };
            if (selectedManufacturers.length > 0) {
                baseQuery.manufacturer_id = { $in: selectedManufacturers };
            }

            const total = await Product.countDocuments(baseQuery);
            
            const rawProducts = await Product.find(baseQuery)
                .sort({ creation_time: -1 })
                .skip((page - 1) * limit)
                .limit(limit);

            const productService = new ProductService();
            const products = await Promise.all(rawProducts.map(async (product) => {
                const variants = await Variant.find({ product_id: product.product_id });
                const priceInfo = productService.calculateProductPrice(variants);

                console.log('Price info for product:', product.product_name, priceInfo);

                return {
                    ...product.toObject(),
                    id: product.product_id,
                    name: product.product_name,
                    description: product.description,
                    image: product.photos[0],
                    price: priceInfo.price,
                    discount: priceInfo.discount,
                    finalPrice: priceInfo.finalPrice
                };
            }));

            console.log('Final products data:', products.map(p => ({
                name: p.name,
                price: p.price,
                finalPrice: p.finalPrice,
                discount: p.discount
            })));

            res.render('category/index', {
                title: `${category.category_name} - SixT Store`,
                category,
                manufacturers,
                products,
                filters: {
                    sort: currentSort,
                    manufacturers: selectedManufacturers
                },
                pagination: {
                    current: page,
                    total: Math.ceil(total / limit)
                },
                total,
                formatToVND
            });

        } catch (error) {
            console.error('Category page error:', error);
            res.status(500).render('error/500', {
                title: 'Error - SixT Store'
            });
        }
    },

    filterProducts: async (req, res) => {
        try {
            const { categoryId } = req.params;
            const { manufacturers, sort = 'popular' } = req.body;
            
            console.log('Filter request received:', {
                categoryId,
                manufacturers,
                sort
            });

            // Tìm category dựa trên slug
            const category = await Category.findOne({ slug: categoryId });
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }

            // Query cơ bản với category
            const query = { category_id: category.category_id };

            // Thêm filter theo manufacturers nếu có
            if (manufacturers && manufacturers.length > 0) {
                query.manufacturer_id = { $in: manufacturers };
            }

            // Định nghĩa các option sort
            const sortOptions = {
                'popular': { sold_quantity: -1 },
                'newest': { creation_time: -1 },
                'price-asc': { base_price: 1 },
                'price-desc': { base_price: -1 }
            };

            // Lấy sản phẩm với filters và sort
            const products = await Product.find(query)
                .sort(sortOptions[sort] || sortOptions.popular);

            // Lấy variants và tính giá sử dụng ProductService
            const productService = new ProductService();
            const formattedProducts = await Promise.all(products.map(async (product) => {
                const variants = await Variant.find({ product_id: product.product_id });
                const priceInfo = productService.calculateProductPrice(variants);

                return {
                    ...product.toObject(),
                    id: product.product_id,
                    name: product.product_name,
                    description: product.description,
                    image: product.photos[0],
                    price: priceInfo.price,
                    discount: priceInfo.discount,
                    finalPrice: formatToVND(priceInfo.finalPrice)
                };
            }));

            // Sort lại theo giá nếu cần
            if (sort === 'price-asc' || sort === 'price-desc') {
                formattedProducts.sort((a, b) => {
                    return sort === 'price-asc' 
                        ? a.finalPrice - b.finalPrice 
                        : b.finalPrice - a.finalPrice;
                });
            }

            res.json({
                success: true,
                data: {
                    products: formattedProducts,
                    pagination: {
                        totalProducts: products.length
                    }
                }
            });

        } catch (error) {
            console.error('Filter products error:', error);
            res.status(500).json({
                success: false,
                message: 'Error filtering products',
                error: error.message
            });
        }
    },

    searchProducts: async (req, res) => {
        try {
            const { query } = req.body;
            const products = await Product.find({
                $or: [
                    { product_name: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } }
                ]
            });
            res.json({ success: true, products });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = categoryController;