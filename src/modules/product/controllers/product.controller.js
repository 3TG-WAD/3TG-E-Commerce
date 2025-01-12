const Product = require('../models/product');
const Manufacturer = require('../models/manufacturer');
const Category = require('../models/category');
const Variant = require('../models/variant');
const Review = require('../models/review');

const formatSpecKey = (key) => {
    return key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const getProductDetail = async (req, res) => {
    try {
        const productId = req.params.id;
        
        // 1. Get product details
        const product = await Product.findOne({ product_id: productId });
        if (!product) {
            return res.status(404).send('Product not found');
        }

        // 2. Get related data
        const manufacturer = await Manufacturer.findOne({ manufacturer_id: product.manufacturer_id });
        const category = await Category.findOne({ category_id: product.category_id });
        const variants = await Variant.find({ product_id: productId });

        // 3. Process variants and calculate prices
        const sizes = [...new Set(variants.map(v => v.size))].sort();
        const cheapestVariant = variants.reduce((min, curr) => {
            if (!min) return curr;
            const minFinalPrice = min.price * (1 - (min.discount || 0) / 100);
            const currFinalPrice = curr.price * (1 - (curr.discount || 0) / 100);
            return currFinalPrice < minFinalPrice ? curr : min;
        }, null);

        // Tính toán giá (giữ nguyên cách tính cũ)
        const originalPrice = (cheapestVariant?.price || 0) * 1000;
        const discount = cheapestVariant?.discount || 0;
        const finalPrice = originalPrice * (1 - discount / 100);

        // 4. Get reviews với phân trang đúng
        const reviewPage = parseInt(req.query.review_page) || 1;
        const reviewLimit = 3;
        const reviewSkip = (reviewPage - 1) * reviewLimit;

        const [reviews, totalReviews] = await Promise.all([
            Review.aggregate([
                { $match: { product_id: productId } },
                { $sort: { created_at: -1 } },
                { $skip: reviewSkip },
                { $limit: reviewLimit },
                {
                    $project: {
                        rating: 1,
                        comment: 1,
                        created_at: 1,
                        user_name: "Anonymous User"
                    }
                }
            ]),
            Review.countDocuments({ product_id: productId })
        ]);

        // 5. Get recommended products với phân trang riêng
        const recommendPage = parseInt(req.query.page) || 1;
        const recommendLimit = 4;
        const recommendSkip = (recommendPage - 1) * recommendLimit;

        const recommendedProducts = await Product.aggregate([
            {
                $match: {
                    category_id: product.category_id,
                    product_id: { $ne: productId }
                }
            },
            {
                $lookup: {
                    from: "variants",
                    localField: "product_id",
                    foreignField: "product_id",
                    as: "variants"
                }
            },
            {
                $addFields: {
                    cheapestPrice: {
                        $min: {
                            $map: {
                                input: "$variants",
                                as: "variant",
                                in: {
                                    $multiply: [
                                        { $multiply: ["$$variant.price", 1000] },
                                        { $subtract: [1, { $divide: ["$$variant.discount", 100] }] }
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    product_id: 1,
                    product_name: 1,
                    photos: 1,
                    price: { $multiply: [{ $min: "$variants.price" }, 1000] },
                    original_price: { $multiply: [{ $min: "$variants.price" }, 1000] },
                    discount: { $max: "$variants.discount" }
                }
            },
            { $skip: recommendSkip },
            { $limit: recommendLimit }
        ]);

        const totalRecommended = await Product.countDocuments({
            category_id: product.category_id,
            product_id: { $ne: productId }
        });

        // 6. Render view
        res.render('product/index', {
            title: `${product.product_name} - SixT Store`,
            product: {
                id: product.product_id,
                name: product.product_name,
                description: product.description,
                images: product.photos,
                specifications: product.specifications,
                price: originalPrice,
                original_price: originalPrice,
                discount: discount,
                finalPrice: finalPrice,
                manufacturer: manufacturer?.name,
                category: category?.category_name,
                category_slug: category?.slug,
                color: cheapestVariant?.color
            },
            variants: {
                sizes,
                all: variants
            },
            reviews: {
                items: reviews,
                currentPage: reviewPage,
                totalPages: Math.ceil(totalReviews / reviewLimit),
                totalReviews
            },
            recommended: {
                items: recommendedProducts.map(item => ({
                    ...item,
                    finalPrice: item.price
                })),
                currentPage: recommendPage,
                totalPages: Math.ceil(totalRecommended / recommendLimit)
            },
            user: req.user || null,
            formatToVND: (price) => {
                return new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                }).format(price);
            },
            formatSpecKey
        });

    } catch (error) {
        console.error('Error in getProductDetail:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = { getProductDetail };

