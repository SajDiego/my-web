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
    },
    // Restricciones opcionales
    juegoRestringido: { type: String, default: null },
    regionRestringida: { type: String, default: null },
    paqueteRestringido: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);

