const Category = require('../modules/product/models/category');
const Manufacturer = require('../modules/product/models/manufacturer');

const dataMiddleware = async (req, res, next) => {
    try {
        // Chỉ lấy data cho non-API routes
        if (!req.xhr && !req.path.startsWith('/api/')) {
            const [categories, manufacturers] = await Promise.all([
                Category.find({}),
                Manufacturer.find({})
            ]);
            res.locals.categories = categories;
            res.locals.manufacturers = manufacturers;
        }
        next();
    } catch (error) {
        console.error('Error fetching data:', error);
        res.locals.categories = [];
        res.locals.manufacturers = [];
        next();
    }
};

module.exports = dataMiddleware; 