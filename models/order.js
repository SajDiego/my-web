const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    usuarioInvitado: {
        nombre: { type: String },
        contacto: { type: String }
    },


    juegoNombre: { type: String, required: true },
    paqueteElegido: { type: String, required: true },
    precioFinal: { type: Number, required: true },
    moneda: { type: String, default: 'ARS' },

    uidJugador: { type: String, required: true },
    regionJugador: { type: String, default: "" },
    tipoDatoEntrega: { type: String, default: "ID" },

    estado: {
        type: String,
        enum: ['Pendiente', 'Completada', 'Cancelada'],
        default: 'Pendiente'
    },

    fechaCompra: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);


