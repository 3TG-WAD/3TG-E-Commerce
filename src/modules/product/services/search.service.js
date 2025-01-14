const Fuse = require('fuse.js');
const Product = require('../models/product');
const Variant = require('../models/variant');

class SearchService {
    constructor() {
        this.fuse = null;
        this.initializeFuse();
    }

    async initializeFuse() {
        try {
            // Lấy tất cả sản phẩm và variants
            const products = await Product.find({});
            const variants = await Variant.find({});

            // Tính giá cho mỗi sản phẩm
            const productsWithPrices = products.map(product => {
                const productVariants = variants.filter(v => v.product_id === product.product_id);
                const cheapestVariant = productVariants.reduce((min, curr) => 
                    (!min || curr.price < min.price) ? curr : min
                , null);

                return {
                    id: product.product_id,
                    name: product.product_name,
                    description: product.description,
                    image: product.photos[0],
                    price: cheapestVariant ? cheapestVariant.price * 1000 : 0,
                    discount: cheapestVariant ? cheapestVariant.discount : 0,
                    finalPrice: cheapestVariant ? 
                        cheapestVariant.price * 1000 * (1 - cheapestVariant.discount/100) : 0
                };
            });

            // Cấu hình Fuse.js
            const options = {
                keys: ['name', 'description'],
                threshold: 0.3,
                distance: 100
            };

            this.fuse = new Fuse(productsWithPrices, options);
        } catch (error) {
            console.error('Error initializing Fuse:', error);
        }
    }

    search(query, limit = 5) {
        if (!this.fuse) return [];
        return this.fuse.search(query).slice(0, limit).map(result => result.item);
    }

    // Refresh search index
    async refreshIndex() {
        await this.initializeFuse();
    }
}

module.exports = new SearchService();
