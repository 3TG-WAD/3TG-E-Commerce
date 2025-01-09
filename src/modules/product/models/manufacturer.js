const mongoose = require('mongoose');
const slugify = require('slugify');

const manufacturerSchema = new mongoose.Schema({
    manufacturer_id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        unique: true
    },
    logo: {
        type: String
    },
    description: String
}, {
    timestamps: true
});

// Tự động tạo slug trước khi lưu
manufacturerSchema.pre('save', function(next) {
    if (!this.slug) {
        this.slug = slugify(this.name, { lower: true });
    }
    next();
});

const Manufacturer = mongoose.model('Manufacturer', manufacturerSchema);

module.exports = Manufacturer; 