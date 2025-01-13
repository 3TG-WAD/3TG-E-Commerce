const Product = require('../models/product');
const Manufacturer = require('../models/manufacturer');
const Category = require('../models/category');
const Variant = require('../models/variant');
const Review = require('../models/review');

class ProductController {
    formatSpecKey = (key) => {
        return key
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    getProductDetail = async (req, res) => {
        try {
            const productId = req.params.id;
            
            const [
                productData,
                reviewData,
                recommendedData
            ] = await Promise.all([
                this._getProductData(productId),
                this._getReviewData(productId, req.query),
                this._getRecommendedData(productId, req.query)
            ]);

            if (!productData.product) {
                return res.status(404).send('Product not found');
            }

            res.render('product/index', {
                title: `${productData.product.product_name} - SixT Store`,
                ...productData,
                ...reviewData,
                ...recommendedData,
                user: req.user || null,
                formatToVND,
                formatSpecKey: this.formatSpecKey
            });

        } catch (error) {
            console.error('Error in getProductDetail:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    getReviewsPartial = async (req, res) => {
        try {
            const { id } = req.params;
            const page = parseInt(req.query.page) || 1;
            const reviewData = await this._getReviewData(id, { review_page: page });

            await this._renderPartial(res, 'product/partials/review-list', {
                reviews: reviewData.reviews
            });

        } catch (error) {
            console.error('Error in getReviewsPartial:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    getRecommendedPartial = async (req, res) => {
        try {
            const { id } = req.params;
            const page = parseInt(req.query.page) || 1;
            const recommendedData = await this._getRecommendedData(id, { page });

            await this._renderPartial(res, 'product/partials/recommended-list', {
                recommended: recommendedData.recommended,
                formatToVND
            });

        } catch (error) {
            console.error('Error in getRecommendedPartial:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    _getProductData = async (productId) => {
        const product = await Product.findOne({ product_id: productId });
        if (!product) return { product: null };

        const [manufacturer, category, variants] = await Promise.all([
            Manufacturer.findOne({ manufacturer_id: product.manufacturer_id }),
            Category.findOne({ category_id: product.category_id }),
            Variant.find({ product_id: productId })
        ]);

        const sizes = [...new Set(variants.map(v => v.size))].sort();
        const cheapestVariant = this._findCheapestVariant(variants);

        const originalPrice = (cheapestVariant?.price || 0) * 1000;
        const discount = cheapestVariant?.discount || 0;
        const finalPrice = originalPrice * (1 - discount / 100);

        return {
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
            }
        };
    }

    _getReviewData = async (productId, query) => {
        const page = parseInt(query.review_page) || 1;
        const limit = 3;
        const skip = (page - 1) * limit;

        const [reviews, totalReviews] = await Promise.all([
            Review.aggregate([
                { $match: { product_id: productId } },
                { $sort: { created_at: -1 } },
                { $skip: skip },
                { $limit: limit },
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

        return {
            reviews: {
                items: reviews,
                currentPage: page,
                totalPages: Math.ceil(totalReviews / limit),
                totalReviews
            }
        };
    }

    _getRecommendedData = async (productId, query) => {
        const product = await Product.findOne({ product_id: productId });
        if (!product) throw new Error('Product not found');

        const page = parseInt(query.page) || 1;
        const limit = 4;
        const skip = (page - 1) * limit;

        const [recommendedProducts, totalRecommended] = await Promise.all([
            this._getRecommendedProducts(product.category_id, productId, skip, limit),
            Product.countDocuments({
                category_id: product.category_id,
                product_id: { $ne: productId }
            })
        ]);

        return {
            recommended: {
                items: recommendedProducts.map(item => ({
                    ...item,
                    finalPrice: item.price
                })),
                currentPage: page,
                totalPages: Math.ceil(totalRecommended / limit)
            }
        };
    }

    _getRecommendedProducts = async (categoryId, productId, skip, limit) => {
        return Product.aggregate([
            {
                $match: {
                    category_id: categoryId,
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
            { $skip: skip },
            { $limit: limit }
        ]);
    }

    _findCheapestVariant = (variants) => {
        return variants.reduce((min, curr) => {
            if (!min) return curr;
            const minFinalPrice = min.price * (1 - (min.discount || 0) / 100);
            const currFinalPrice = curr.price * (1 - (curr.discount || 0) / 100);
            return currFinalPrice < minFinalPrice ? curr : min;
        }, null);
    }

    _renderPartial = async (res, view, data) => {
        return res.render(view, {
            layout: false,
            ...data
        }, (err, html) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            return res.json({ success: true, html });
        });
    }
}

const formatToVND = (price) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
};

const productController = new ProductController();
module.exports = productController;

