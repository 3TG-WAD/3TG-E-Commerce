const Product = require('../models/product');
const Variant = require('../models/variant');
const Category = require('../models/category');
const Manufacturer = require('../models/manufacturer');
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
            
            const products = await Product.find(baseQuery)
                .sort({ creation_time: -1 })
                .skip((page - 1) * limit)
                .limit(limit);

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

            // Debug log
            console.log('Query:', query);

            // Lấy sản phẩm với filters
            const products = await Product.find(query);
            
            // Debug log
            console.log('Found products:', products.length);

            // Lấy variants cho các sản phẩm
            const productIds = products.map(p => p.product_id);
            const variants = await Variant.find({
                product_id: { $in: productIds }
            });

            // Gom variants theo product_id
            const variantsByProduct = variants.reduce((acc, variant) => {
                if (!acc[variant.product_id]) {
                    acc[variant.product_id] = [];
                }
                acc[variant.product_id].push(variant);
                return acc;
            }, {});

            // Format kết quả trả về
            const formattedProducts = products.map(product => {
                const productVariants = variantsByProduct[product.product_id] || [];
                
                // Tính giá và discount
                let minPrice = Infinity;
                let maxDiscount = 0;

                productVariants.forEach(variant => {
                    if (variant.price < minPrice) {
                        minPrice = variant.price;
                    }
                    if (variant.discount > maxDiscount) {
                        maxDiscount = variant.discount;
                    }
                });

                if (minPrice === Infinity) {
                    minPrice = 0;
                }

                return {
                    ...product.toObject(),
                    finalPrice: minPrice * (1 - maxDiscount/100),
                    price: minPrice,
                    maxDiscount: maxDiscount,
                    photos: product.photos || []
                };
            });

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