const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    numeroOrden: { type: Number, unique: true },
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    usuarioInvitado: {
        nombre: { type: String },
        email: { type: String },
        whatsapp: { type: String }
    },


    juegoNombre: { type: String, required: true },
    paqueteElegido: { type: String, required: true },
    precioFinal: { type: Number, required: true },
    moneda: { type: String, default: 'ARS' },
    metodoPago: { type: String, default: 'No especificado' },

    uidJugador: { type: String, default: '' },
    regionJugador: { type: String, default: '' },
    tipoDatoEntrega: { type: String, default: 'ID' },
    datosEntrega: { type: Map, of: String, default: {} }, // sistema flexible

    estado: {
        type: String,
        enum: ['Pendiente', 'Completada', 'Cancelada'],
        default: 'Pendiente'
    },

    fechaCompra: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);


