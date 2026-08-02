const mongoose = require('mongoose');

const exchangeRateSchema = new mongoose.Schema({
    moneda: { type: String, required: true, unique: true },
    tasa: { type: Number, required: true },
    factor_redondeo: { type: Number, required: true }
});

module.exports = mongoose.model('ExchangeRate', exchangeRateSchema);
