const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('../app/models/product');

// MongoDB connection string
const MONGODB_URI = 'mongodb://localhost:27017/ecommerce';

async function importProducts() {
    try {
        // Kết nối MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Đọc file JSON
        const jsonPath = path.join(__dirname, '../mockdata.json');
        const productsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

        // Xóa tất cả sản phẩm cũ (tùy chọn)
        await Product.deleteMany({});
        console.log('Cleared existing products');

        // Chuyển đổi dữ liệu để phù hợp với schema
        const formattedProducts = productsData.map(item => ({
            product_id: item.product_id,
            product_name: item.product_name,
            description: item.description,
            category_id: item.category_id,
            manufacturer_id: item.manufacturer_id,
            creation_time: new Date(item.creation_time),
            specifications: item.specifications,
            photos: item.photos
        }));

        // Import dữ liệu mới
        const result = await Product.insertMany(formattedProducts);
        console.log(`Successfully imported ${result.length} products`);

    } catch (error) {
        console.error('Error importing products:', error);
    } finally {
        // Đóng kết nối
        await mongoose.connection.close();
        console.log('Closed MongoDB connection');
        process.exit(0);
    }
}

// Chạy import
importProducts();