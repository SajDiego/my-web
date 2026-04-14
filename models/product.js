const mongoose = require('mongoose');

const campoEntregaSchema = new mongoose.Schema({
    label: { type: String, required: true },   // Ej: "UID del Jugador", "Email", "Servidor"
    tipo: { type: String, default: 'text' },    // 'text' o 'email'
    requerido: { type: Boolean, default: true },
    placeholder: { type: String, default: '' } // Texto de ayuda dentro del input
});

const paqueteSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    precioARS: { type: Number },
    precioUSD: { type: Number },
    region: { type: String, default: 'Global' }, // Nuevo campo
    bonoDetalle: { type: String, default: '' },
    descripcion: { type: String, default: '' }
});


const productSchema = new mongoose.Schema({
    juego: { type: String, required: true, unique: true },
    descripcion: { type: String },
    imagenUrl: { type: String },
    paquetes: [paqueteSchema],
    camposEntrega: [campoEntregaSchema],

    categoria: {
        type: String,
        enum: ['Recargas Directas', 'Pines', 'PC', 'Consolas'],
        default: 'Recargas Directas'
    },

    fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
