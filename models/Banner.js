const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    image: { type: String, required: true },
    color: { type: String, default: '#6d28d9' },
    link: { type: String, default: '' },
    fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Banner', bannerSchema);
