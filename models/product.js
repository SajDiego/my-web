const mongoose = require('mongoose');

const paqueteSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    precioARS: { type: Number },
    precioUSD: { type: Number },
    bonoDetalle: { type: String, default: "" },
    descripcion: { type: String, default: "" }
});


const productSchema = new mongoose.Schema({
    juego: { type: String, required: true, unique: true },
    descripcion: { type: String },
    imagenUrl: { type: String },
    requiereDato: { 
        type: String, 
        enum: ['ID', 'Email'], 
        default: 'ID' 
    },

    paquetes: [paqueteSchema],

    categoria: {
        type: String,
        enum: ['Recargas Directas', 'Pines', 'PC', 'Consolas'],
        default: 'Recargas Directas'
    },

    fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
