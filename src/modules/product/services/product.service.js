const Product = require("../models/product");
const Variant = require("../models/variant");

class ProductService {
  async getNewArrivals() {
    try {
      const products = await Product.find()
        .sort({ createdAt: -1 })
        .limit(4)
        .select('name description image price discount');
      return products;
    } catch (error) {
      throw new Error('Error fetching new arrivals: ' + error.message);
    }
  }

  async getTopSelling() {
    try {
      // Lấy variants trước
      const variants = await Variant.find().select('product_id price discount');
      const variantsByProduct = variants.reduce((acc, variant) => {
        if (!acc[variant.product_id]) {
          acc[variant.product_id] = [];
        }
        acc[variant.product_id].push(variant);
        return acc;
      }, {});

      // Lấy products
      const products = await Product.find()
        .limit(4)
        .select('product_id product_name description photos');

      const topProducts = products.map(product => {
        const productVariants = variantsByProduct[product.product_id] || [];
        const cheapestVariant = productVariants.reduce((min, curr) => 
          curr.price < min.price ? curr : min
        , productVariants[0]);

        console.log(cheapestVariant);

        return {
          id: product.product_id,
          name: product.product_name,
          description: product.description,
          image: product.photos[0],
          price: cheapestVariant ? cheapestVariant.price : null,
          discount: cheapestVariant ? cheapestVariant.discount : 0,
          finalPrice: cheapestVariant ? 
            cheapestVariant.price * (1 - cheapestVariant.discount/100) : null
        };
      });

      return topProducts;
    } catch (error) {
      throw new Error('Error fetching top selling products: ' + error.message);
    }
  }

  async getDressStyles() {
    try {
      const products = await Product.find({ category_id: 'CLOTHING' })
        .limit(6)
        .select('product_id product_name photos');

      const styles = products.map((product, index) => ({
        id: product.product_id,
        name: product.product_name,
        image: product.photos[0],
        cols: index === 0 ? 'col-span-6' : 'col-span-3'
      }));

      return styles;
    } catch (error) {
      throw new Error('Error fetching dress styles: ' + error.message);
    }
  }
}

module.exports = new ProductService();