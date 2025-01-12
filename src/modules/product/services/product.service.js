const Product = require("../models/product");
const Variant = require("../models/variant");
const { formatToVND } = require('../../../helpers/currencyFormatter');

class ProductService {
  async getNewArrivals() {
    try {
      const variants = await Variant.find().select('product_id price discount');
      console.log('Variants found:', variants.length); // Debug log

      const variantsByProduct = variants.reduce((acc, variant) => {
        if (!acc[variant.product_id]) {
          acc[variant.product_id] = [];
        }
        acc[variant.product_id].push(variant);
        return acc;
      }, {});

      const products = await Product.find()
        .sort({ creation_time: -1 })
        .limit(4)
        .select('product_id product_name description photos');
      console.log('Products found:', products.length);

      const newProducts = products.map(product => {
        const productVariants = variantsByProduct[product.product_id] || [];
        console.log(`Variants for product ${product.product_id}:`, productVariants.length);
        
        const cheapestVariant = productVariants.reduce((min, curr) => 
          curr.price < min.price ? curr : min
        , productVariants[0]);

        return {
          id: product.product_id,
          name: product.product_name,
          description: product.description,
          image: product.photos[0],
          price: cheapestVariant ? cheapestVariant.price : null,
          discount: cheapestVariant ? cheapestVariant.discount : 0,
          finalPrice: formatToVND(
            cheapestVariant ? 
            cheapestVariant.price * 1000 * (1 - cheapestVariant.discount/100) : null
          )
        };
      });

      return newProducts;
    } catch (error) {
      console.error('Error in getNewArrivals:', error);
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

        return {
          id: product.product_id,
          name: product.product_name,
          description: product.description,
          image: product.photos[0],
          price: cheapestVariant ? cheapestVariant.price : null,
          discount: cheapestVariant ? cheapestVariant.discount : 0,
          finalPrice: formatToVND(
            cheapestVariant ? 
            cheapestVariant.price * 1000 * (1 - cheapestVariant.discount/100) : null
          )
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

  calculateProductPrice(variants) {
    if (!variants || variants.length === 0) {
      return {
        price: 0,
        discount: 0,
        finalPrice: 0
      };
    }

    // Tìm variant có giá thấp nhất và discount cao nhất
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

    // Nếu không tìm thấy giá hợp lệ
    if (minPrice === Infinity || isNaN(minPrice)) {
      minPrice = 0;
    }

    const finalPrice = Math.round(minPrice * (1 - maxDiscount/100));

    return {
      price: minPrice,
      discount: maxDiscount,
      finalPrice: finalPrice
    };
  }
}

module.exports =  ProductService;