const Product = require("../models/product");
const Variant = require("../models/variant");
const { formatToVND } = require('../../../helpers/currencyFormatter');

class ProductService {
    /**
     * Get new arrival products
     */
    async getNewArrivals() {
        try {
            const variants = await this._getVariants();
            const variantsByProduct = this._groupVariantsByProduct(variants);
            const products = await this._getNewProducts();
            return this._mapProductsWithPricing(products, variantsByProduct);
        } catch (error) {
            console.error('Error in getNewArrivals:', error);
            throw new Error('Error fetching new arrivals: ' + error.message);
        }
    }

    /**
     * Get top selling products
     */
    async getTopSelling() {
        try {
            const variants = await this._getVariants();
            const variantsByProduct = this._groupVariantsByProduct(variants);
            const products = await this._getTopProducts();
            return this._mapProductsWithPricing(products, variantsByProduct);
        } catch (error) {
            throw new Error('Error fetching top selling products: ' + error.message);
        }
    }

    /**
     * Get dress styles
     */
    async getDressStyles() {
        try {
            const products = await Product.find({ category_id: 'CLOTHING' })
                .limit(6)
                .select('product_id product_name photos');

            return products.map((product, index) => ({
                id: product.product_id,
                name: product.product_name,
                image: product.photos[0],
                cols: index === 0 ? 'col-span-6' : 'col-span-3'
            }));
        } catch (error) {
            throw new Error('Error fetching dress styles: ' + error.message);
        }
    }

    /**
     * Calculate product price from variants
     */
    calculateProductPrice(variants) {
        if (!variants?.length) {
            return { price: 0, discount: 0, finalPrice: 0 };
        }

        const { minPrice, maxDiscount } = this._findMinPriceAndMaxDiscount(variants);
        const finalPrice = Math.round(minPrice * (1 - maxDiscount/100));

        return { price: minPrice, discount: maxDiscount, finalPrice };
    }

    /**
     * Private helper methods
     */
    async _getVariants() {
        return await Variant.find().select('product_id price discount');
    }

    async _getNewProducts() {
        return await Product.find()
            .sort({ creation_time: -1 })
            .limit(4)
            .select('product_id product_name description photos');
    }

    async _getTopProducts() {
        return await Product.find()
            .limit(4)
            .select('product_id product_name description photos');
    }

    _groupVariantsByProduct(variants) {
        return variants.reduce((acc, variant) => {
            if (!acc[variant.product_id]) {
                acc[variant.product_id] = [];
            }
            acc[variant.product_id].push(variant);
            return acc;
        }, {});
    }

    _findMinPriceAndMaxDiscount(variants) {
        let minPrice = Infinity;
        let maxDiscount = 0;

        variants.forEach(variant => {
            const price = Number(variant.price) * 1000;
            if (!isNaN(price) && price < minPrice) {
                minPrice = price;
            }
            
            const discount = Number(variant.discount);
            if (!isNaN(discount) && discount > maxDiscount) {
                maxDiscount = discount;
            }
        });

        return {
            minPrice: minPrice === Infinity ? 0 : minPrice,
            maxDiscount
        };
    }

    _mapProductsWithPricing(products, variantsByProduct) {
        return products.map(product => {
            const productVariants = variantsByProduct[product.product_id] || [];
            const cheapestVariant = productVariants.reduce((min, curr) => 
                curr.price < min.price ? curr : min
            , productVariants[0]);

            return {
                id: product.product_id,
                name: product.product_name,
                description: product.description,
                image: product.photos[0],
                price: cheapestVariant?.price || null,
                discount: cheapestVariant?.discount || 0,
                finalPrice: formatToVND(
                    cheapestVariant ? 
                    cheapestVariant.price * 1000 * (1 - cheapestVariant.discount/100) : null
                )
            };
        });
    }
}

module.exports = ProductService;