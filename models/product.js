const mongoose = require('mongoose');

const campoEntregaSchema = new mongoose.Schema({
    label: { type: String, required: true },
    tipo: { type: String, default: 'text' },
    requerido: { type: Boolean, default: true },
    placeholder: { type: String, default: '' }
});

const paqueteSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    precioARS: { type: Number },
    precioUSD: { type: Number },
    region: { type: String, default: 'Global' },
    stock: { type: Number, default: null },
    bonoDetalle: { type: String, default: '' },
    descripcion: { type: String, default: '' }
});

const productSchema = new mongoose.Schema({
    juego: { type: String, required: true, unique: true },
    descripcion: { type: String },
    imagenUrl: { type: String },
    infoExtra: { type: String, default: '' },
    paquetes: [paqueteSchema],
    camposEntrega: [campoEntregaSchema],
    categoria: {
        type: String,
        enum: ['TopUp', 'Pines', 'PC', 'Consolas'],
        default: 'TopUp'
    },
    fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
