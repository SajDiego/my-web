const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    codigo: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    descuentoPorcentaje: {
        type: Number,
        required: true,
        min: 1,
        max: 100
    },
    usoMaximo: {
        type: Number,
        default: null
    },
    usoActual: {
        type: Number,
        default: 0
    },
    activo: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);

