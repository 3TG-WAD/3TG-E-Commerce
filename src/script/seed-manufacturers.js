const mongoose = require('mongoose');
const Manufacturer = require('../modules/product/models/manufacturer');

const manufacturers = [
    {
        manufacturer_id: 'NIKE',
        name: 'Nike',
        logo: 'https://banner2.cleanpng.com/20180723/uoe/5113e759fa651bad75fbb7c36a8264e3.webp',
        description: 'Just Do It',
        slug: 'nike'
    },
    {
        manufacturer_id: 'ADIDAS',
        name: 'Adidas',
        logo: 'https://banner2.cleanpng.com/20180426/bhw/ave6by86s.webp',
        description: 'Impossible is Nothing',
        slug: 'adidas'
    },
    {
        manufacturer_id: 'PUMA',
        name: 'Puma',
        logo: 'https://banner2.cleanpng.com/20180712/krs/kisspng-herzogenaurach-puma-adidas-logo-puma-cat-5b47e6a25cb561.0517934515314387543797.jpg',
        description: 'Forever Faster',
        slug: 'puma'
    },
    {
        manufacturer_id: 'ASICS',
        name: 'Asics',
        logo: 'https://download.logo.wine/logo/Asics/Asics-Logo.wine.png',
        description: 'For All',
        slug: 'asics'
    },
    {
        manufacturer_id: 'NEW_BALANCE',
        name: 'New Balance',
        logo: 'https://banner2.cleanpng.com/20180329/bxq/aviypqq6e.webp',
        description: 'Made in USA',
        slug: 'new-balance'
    }
];

async function seedManufacturers() {
    try {
        await mongoose.connect('mongodb://localhost:27017/ecommerce');
        console.log('Connected to MongoDB');
        // Xóa dữ liệu cũ
        await Manufacturer.deleteMany({});
        
        // Thêm dữ liệu mới
        await Manufacturer.insertMany(manufacturers);
        
        console.log('Manufacturers seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding manufacturers:', error);
        process.exit(1);
    }
}

seedManufacturers(); 