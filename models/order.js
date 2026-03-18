const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    // usuario que compra
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Producto comprado
    juegoNombre: { type: String, required: true },       // Ej: "Free Fire"
    paqueteElegido: { type: String, required: true },    // Ej: "100+10 Diamantes"
    precioFinal: { type: Number, required: true },       // Lo que le tenemos que cobrar

    // ID
    uidJugador: { type: String, required: true },
    // Opcional por si juegas algunos títulos que piden Región
    regionJugador: { type: String, default: "" },

    // Etado del pedidos
    estado: {
        type: String,
        enum: ['Pendiente', 'Completada', 'Cancelada'],
        default: 'Pendiente'
    },

    fechaCompra: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);


