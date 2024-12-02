const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Variant = require('../app/models/variant');

// MongoDB connection string
const MONGODB_URI = 'mongodb://localhost:27017/ecommerce';

async function importVariants() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Read JSON file
        const jsonPath = path.join(__dirname, '../variantsdata.json');
        const variantsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

        // Clear existing variants (optional)
        await Variant.deleteMany({});
        console.log('Cleared existing variants');

        // Import new variant data
        const result = await Variant.insertMany(variantsData);
        console.log(`Successfully imported ${result.length} variants`);

    } catch (error) {
        console.error('Error importing variants:', error);
    } finally {
        // Close connection
        await mongoose.connection.close();
        console.log('Closed MongoDB connection');
        process.exit(0);
    }
}

// Run import
importVariants();