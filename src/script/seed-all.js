const mongoose = require('mongoose');
const { exec } = require('child_process');
const path = require('path');

const MONGODB_URI = 'mongodb://localhost:27017/ecommerce';

// Danh sách các file seed theo thứ tự
const seedFiles = [
    'seed-categories.js',
    'seed-manufacturers.js',
    'seed-products.js',
    'seed-variants.js',
    'seed-reviews.js',
    'seed-order.js'
];

async function runSeedFiles() {
    try {
        // Kết nối MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Chạy từng file seed tuần tự
        for (const file of seedFiles) {
            console.log(`\nRunning ${file}...`);
            const filePath = path.join(__dirname, file);
            
            try {
                // Sử dụng require để chạy file trực tiếp
                await require(filePath);
                console.log(`✓ ${file} completed successfully`);
            } catch (error) {
                console.error(`✗ Error in ${file}:`, error);
            }
        }

    } catch (error) {
        console.error('Database connection error:', error);
    } finally {
        // Đóng kết nối
        await mongoose.connection.close();
        console.log('\nDatabase seeding completed');
        process.exit(0);
    }
}

// Chạy script
runSeedFiles();