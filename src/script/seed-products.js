const Product = require('../modules/product/models/product');
const fs = require('fs');
const path = require('path');

async function seedProducts(connection) {
    try {
        const jsonPath = path.join(__dirname, '../../productdata.json');
        const productsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        
        await Product.deleteMany({});
        const result = await Product.insertMany(productsData);
        console.log(`Successfully imported ${result.length} products`);
    } catch (error) {
        throw error;
    }
}

module.exports = seedProducts;