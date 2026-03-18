const mongoose = require('mongoose');

//sub paquetes
const paqueteSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    monedasTotal: { type: Number, required: true },
    precio: { type: Number, required: true },
    bonoDetalle: { type: String, default: "" }
});

//principal

const productSchema = new mongoose.Schema({
    juego: { type: String, required: true, unique: true },
    descripcion: { type: String },
    imagenUrl: { type: String },

    //array de variables
    paquetes: [paqueteSchema],

    fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
