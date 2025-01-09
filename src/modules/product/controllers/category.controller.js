const Category = require('../models/category');
const Product = require('../models/product');
const Variant = require('../models/variant');
const { formatToVND } = require('../../../helpers/currencyFormatter');

const categoryController = {
  getAllCategories: async (req, res, next) => {
    try {
      const categories = await Category.find().sort({ category_name: 1 });
      
      // Nếu được gọi từ API endpoint
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.json({
          success: true,
          data: categories
        });
      }
      
      // Nếu được gọi từ middleware
      return categories;
      
    } catch (error) {
      console.error('Error fetching categories:', error);
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }
      throw error;
    }
  },

  getCategoryPage: async (req, res) => {
    try {
      const { slug } = req.params;
      const { sort = 'popular', page = 1 } = req.query;
      const limit = 9;
      
      // Lấy thông tin category
      const category = await Category.findOne({ slug });
      if (!category) {
        return res.status(404).render('error/404', { title: 'Category Not Found' });
      }

      // Lấy tất cả categories cho sidebar
      const categories = await Category.find().sort({ category_name: 1 });

      // Lấy unique manufacturers từ products
      const manufacturers = await Product.distinct('manufacturer_id');
      const formattedManufacturers = manufacturers.map(id => ({
        id,
        name: id.split('_').map(word => 
          word.charAt(0) + word.slice(1).toLowerCase()
        ).join(' ')
      }));

      // Query sản phẩm với filters
      const query = { category_id: category.category_id };
      
      // Tính total và phân trang
      const total = await Product.countDocuments(query);
      const totalPages = Math.ceil(total / limit);

      // Sort options
      const sortOptions = {
        'popular': { creation_time: -1 },
        'newest': { creation_time: -1 },
        'price-asc': { price: 1 },
        'price-desc': { price: -1 }
      };

      // Lấy sản phẩm
      const products = await Product.find(query)
        .sort(sortOptions[sort])
        .skip((page - 1) * limit)
        .limit(limit);

      // Format sản phẩm với variants
      const productIds = products.map(p => p.product_id);
      const variants = await Variant.find({
        product_id: { $in: productIds }
      });

      const variantsByProduct = variants.reduce((acc, variant) => {
        if (!acc[variant.product_id]) {
          acc[variant.product_id] = [];
        }
        acc[variant.product_id].push(variant);
        return acc;
      }, {});

      const formattedProducts = products.map(product => {
        const productVariants = variantsByProduct[product.product_id] || [];
        const cheapestVariant = productVariants.length > 0 
          ? productVariants.reduce((min, curr) => curr.price < min.price ? curr : min, productVariants[0])
          : null;

        return {
          ...product.toObject(),
          price: cheapestVariant?.price || 0,
          discount: cheapestVariant?.discount || 0,
          finalPrice: cheapestVariant ? 
            cheapestVariant.price * (1 - cheapestVariant.discount/100) : 0
        };
      });

      res.render('category/index', {
        title: `${category.category_name} - Shop.co`,
        category,
        categories,  // Thêm categories cho sidebar
        manufacturers: formattedManufacturers, // Thêm manufacturers
        products: formattedProducts,
        pagination: {
          current: parseInt(page),
          total: totalPages
        },
        filters: {
          sort,
          manufacturers: req.query.manufacturers?.split(',') || []
        },
        total,
        formatToVND
      });

    } catch (error) {
      console.error('Error in getCategoryPage:', error);
      res.status(500).render('error/500', {
        title: 'Error',
        message: error.message
      });
    }
  },

  searchProducts: async (req, res) => {
    try {
      const { 
        category_id,
        manufacturers,
        sort = 'popular',
        page = 1 
      } = req.body;
      
      const limit = 9;
      const query = {};
      
      // Add category filter
      if (category_id) {
        query.category_id = category_id;
      }

      // Add manufacturer filter
      if (manufacturers && manufacturers.length > 0) {
        query.manufacturer_id = { $in: manufacturers };
      }

      // Sort options
      const sortOptions = {
        'popular': { creation_time: -1 },
        'newest': { creation_time: -1 },
        'price-asc': { price: 1 },
        'price-desc': { price: -1 }
      };

      // Count total products
      const total = await Product.countDocuments(query);
      const totalPages = Math.ceil(total / limit);

      // Get products
      const products = await Product.find(query)
        .sort(sortOptions[sort])
        .skip((page - 1) * limit)
        .limit(limit);

      // Format products with variants
      const productIds = products.map(p => p.product_id);
      const variants = await Variant.find({
        product_id: { $in: productIds }
      });

      const variantsByProduct = variants.reduce((acc, variant) => {
        if (!acc[variant.product_id]) {
          acc[variant.product_id] = [];
        }
        acc[variant.product_id].push(variant);
        return acc;
      }, {});

      const formattedProducts = products.map(product => {
        const productVariants = variantsByProduct[product.product_id] || [];
        const cheapestVariant = productVariants.length > 0 
          ? productVariants.reduce((min, curr) => curr.price < min.price ? curr : min, productVariants[0])
          : null;

        return {
          ...product.toObject(),
          price: cheapestVariant?.price || 0,
          discount: cheapestVariant?.discount || 0,
          finalPrice: cheapestVariant ? 
            cheapestVariant.price * (1 - cheapestVariant.discount/100) : 0
        };
      });

      res.json({
        products: formattedProducts,
        pagination: {
          current: parseInt(page),
          total: totalPages
        },
        total
      });

    } catch (error) {
      console.error('Error in searchProducts:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = categoryController;