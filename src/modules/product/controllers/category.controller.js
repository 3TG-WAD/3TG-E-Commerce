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
            
            // Add price range to filters
            const minPrice = req.query.minPrice ? parseInt(req.query.minPrice) : null;
            const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice) : null;

            let category;
            if (slug === 'all') {
                category = {
                    category_id: 'all',
                    category_name: 'All Products',
                    slug: 'all'
                };
            } else {
                category = await Category.findOne({ slug });
                if (!category) {
                    return res.status(404).render('error/404', {
                        title: '404 - Page Not Found'
                    });
                }
            }

            const manufacturers = await Manufacturer.find({});
            const categories = await Category.find({});
            const currentSort = req.query.sort || 'popular';
            
            // Xử lý manufacturers filter
            const selectedManufacturers = Array.isArray(req.query.manufacturer) ? 
                req.query.manufacturer : 
                req.query.manufacturer ? [req.query.manufacturer] : [];

            // Điều chỉnh query dựa trên việc có phải "all" hay không
            const baseQuery = slug === 'all' ? {} : { category_id: category.category_id };
            if (selectedManufacturers.length > 0) {
                baseQuery.manufacturer_id = { $in: selectedManufacturers };
            }
            
            const products = await Product.find(baseQuery);

            // 2. Lấy variants cho sản phẩm đã filter
            const productIds = products.map(p => p.product_id);
            const variants = await Variant.find({
                product_id: { $in: productIds }
            });

            // 3. Tính giá và apply sort
            let productsWithPrices = await Promise.all(products.map(async (product) => {
                const productVariants = variants.filter(v => v.product_id === product.product_id);
                const priceInfo = categoryController._calculateProductPrice(productVariants);
                return {
                    ...product.toObject(),
                    price: priceInfo.price,
                    discount: priceInfo.discount,
                    finalPrice: priceInfo.finalPrice
                };
            }));

            // Apply price range filter
            if (minPrice !== null || maxPrice !== null) {
                productsWithPrices = productsWithPrices.filter(product => {
                    if (!product) return false;
                    const price = product.finalPrice;
                    if (minPrice !== null && price < minPrice) return false;
                    if (maxPrice !== null && price > maxPrice) return false;
                    return true;
                });
            }

            // 4. Sort sản phẩm đã filter
            let sortedProducts = [...productsWithPrices]; // Create a copy to avoid mutation
            switch(currentSort) {
                case 'name-asc':
                    sortedProducts = sortedProducts.sort((a, b) => a.product_name.localeCompare(b.product_name));
                    break;
                case 'name-desc':
                    sortedProducts = sortedProducts.sort((a, b) => b.product_name.localeCompare(a.product_name));
                    break;
                case 'price-asc':
                    sortedProducts = sortedProducts.sort((a, b) => a.finalPrice - b.finalPrice);
                    break;
                case 'price-desc':
                    sortedProducts = sortedProducts.sort((a, b) => b.finalPrice - a.finalPrice);
                    break;
            }

            // 5. Phân trang sau khi đã filter và sort
            const total = sortedProducts.length;
            const paginatedProducts = sortedProducts.slice((page - 1) * limit, page * limit);

            // 6. Format sản phẩm cho view
            const formattedProducts = paginatedProducts.map(product => ({
                id: product.product_id,
                name: product.product_name,
                image: product.photos[0],
                price: product.price,
                discount: product.discount,
                finalPrice: product.finalPrice
            }));

            res.render('category/index', {
                title: `${category.category_name} - SixT Store`,
                category,
                categories,
                products: formattedProducts,
                manufacturers,
                filters: {
                    sort: currentSort,
                    manufacturers: selectedManufacturers,
                    minPrice,
                    maxPrice
                },
                pagination: {
                    current: page,
                    total: Math.ceil(total / limit)
                },
                total,
                formatToVND: (price) => {
                    return new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                    }).format(price);
                }
            });

        } catch (error) {
            console.error('Category error:', error);
            res.status(500).render('error/500', {
                title: '500 - Server Error'
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
    },

    sortProducts: async (req, res) => {
        try {
            const { categoryId } = req.params;
            const { sort = 'popular' } = req.query;

            // Lấy category theo slug
            const category = await Category.findOne({ slug: categoryId });
            if (!category) {
                console.log('Category not found:', categoryId);
                return res.status(404).json({ message: 'Category not found' });
            }

            // Xác định cách sắp xếp
            let sortQuery = {};
            switch(sort) {
                case 'price-asc':
                    sortQuery = { base_price: 1 };
                    break;
                case 'price-desc':
                    sortQuery = { base_price: -1 };
                    break;
                case 'newest':
                    sortQuery = { creation_time: -1 };
                    break;
                case 'popular':
                default:
                    sortQuery = { sold_quantity: -1 };
            }
            console.log('Sort query:', sortQuery);

            // Query sản phẩm với sort
            const products = await Product.find({ 
                category_id: category.category_id 
            }).sort(sortQuery);

            console.log('First few products base prices:', products.slice(0, 3).map(p => ({
                name: p.product_name,
                base_price: p.base_price
            })));

            // Format sản phẩm với giá và discount
            const formattedProducts = await Promise.all(products.map(async (product) => {
                const variants = await Variant.find({ product_id: product.product_id });
                console.log(`Variants for product ${product.product_name}:`, variants.map(v => ({
                    price: v.price,
                    discount: v.discount
                })));

                const cheapestVariant = variants.reduce((min, variant) => 
                    (!min || variant.price < min.price) ? variant : min
                , null);

                const finalPrice = cheapestVariant ? 
                    cheapestVariant.price * (1 - cheapestVariant.discount/100) : 0;

                console.log(`Final price for ${product.product_name}:`, {
                    original: cheapestVariant?.price,
                    discount: cheapestVariant?.discount,
                    final: finalPrice
                });

                return {
                    id: product.product_id,
                    name: product.product_name,
                    image: product.photos[0],
                    price: cheapestVariant ? cheapestVariant.price : 0,
                    discount: cheapestVariant ? cheapestVariant.discount : 0,
                    finalPrice: finalPrice
                };
            }));

            // Log final sorted products
            console.log('Sorted products:', formattedProducts.map(p => ({
                name: p.name,
                price: p.price,
                finalPrice: p.finalPrice
            })));

            res.json({
                success: true,
                products: formattedProducts
            });

        } catch (error) {
            console.error('Sort error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error sorting products',
                error: error.message 
            });
        }
    },

    getBySlug: async (req, res) => {
        try {
            const { categoryId } = req.params;
            const { page = 1, sort = 'popular' } = req.query;  // Lấy sort từ query params

            console.log('Category request:', { categoryId, sort }); // Debug log

            const category = await Category.findOne({ slug: categoryId });
            if (!category) {
                return res.status(404).render('404');
            }

            // Xác định cách sắp xếp
            let sortQuery = {};
            switch(sort) {
                case 'price-asc':
                    sortQuery = { base_price: 1 };
                    break;
                case 'price-desc':
                    sortQuery = { base_price: -1 };
                    break;
                case 'newest':
                    sortQuery = { creation_time: -1 };
                    break;
                case 'popular':
                default:
                    sortQuery = { sold_quantity: -1 };
            }
            console.log('Sort query:', sortQuery); // Debug log

            // Query với sort
            const products = await Product.find({ 
                category_id: category.category_id 
            }).sort(sortQuery);

            console.log('Products after sort:', products.map(p => ({
                name: p.product_name,
                base_price: p.base_price
            })));

            const formattedProducts = await Promise.all(products.map(async (product) => {
                const variants = await Variant.find({ product_id: product.product_id });
                const cheapestVariant = variants.reduce((min, variant) => 
                    (!min || variant.price < min.price) ? variant : min
                , null);

                return {
                    id: product.product_id,
                    name: product.product_name,
                    image: product.photos[0],
                    price: cheapestVariant ? cheapestVariant.price : 0,
                    discount: cheapestVariant ? cheapestVariant.discount : 0,
                    finalPrice: cheapestVariant ? 
                        cheapestVariant.price * (1 - cheapestVariant.discount/100) : 0
                };
            }));

            res.render('category/index', {
                category,
                products: formattedProducts,
                filters: { sort },
            });

        } catch (error) {
            console.error('Category error:', error);
            res.status(500).render('500');
        }
    },

    _calculateProductPrice(variants) {
        if (!variants?.length) return { price: 0, discount: 0, finalPrice: 0 };
        
        const cheapestVariant = variants.reduce((min, curr) => 
            (!min || curr.price < min.price) ? curr : min
        , null);

        const price = cheapestVariant ? cheapestVariant.price * 1000 : 0;
        const discount = cheapestVariant ? cheapestVariant.discount : 0;
        const finalPrice = price * (1 - discount/100);

        return { price, discount, finalPrice };
    }
};

module.exports = categoryController;