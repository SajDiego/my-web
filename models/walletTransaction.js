const mongoose = require('mongoose');

const WalletTransactionSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tipo: { type: String, enum: ['recarga', 'consumo'], required: true },
    monto: { type: Number, required: true },
    moneda: { type: String, required: true },
    descripcion: { type: String, default: '' },
    fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WalletTransaction', WalletTransactionSchema);
