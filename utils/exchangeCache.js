const ExchangeRate = require('../models/exchangeRate');

let ratesCache = null;

const getRates = async () => {
    if (ratesCache) return ratesCache;
    await loadRates();
    return ratesCache;
};

const loadRates = async () => {
    try {
        const rates = await ExchangeRate.find({});
        const newCache = {};
        rates.forEach(r => {
            newCache[r.moneda] = { tasa: r.tasa, factor_redondeo: r.factor_redondeo };
        });
        
        if (Object.keys(newCache).length === 0) {
            newCache['COP'] = { tasa: 3100, factor_redondeo: 100 };
            newCache['MXN'] = { tasa: 17.50, factor_redondeo: 10 };
            newCache['CLP'] = { tasa: 950, factor_redondeo: 10 };
            newCache['BRL'] = { tasa: 5.60, factor_redondeo: 1 };
            newCache['PEN'] = { tasa: 3.75, factor_redondeo: 1 };
            
            for (const [moneda, config] of Object.entries(newCache)) {
                await ExchangeRate.create({ moneda, tasa: config.tasa, factor_redondeo: config.factor_redondeo });
            }
        }
        
        ratesCache = newCache;
        console.log('Exchange rates loaded to cache');
    } catch (err) {
        console.error('Error loading exchange rates:', err);
    }
};

module.exports = {
    getRates,
    loadRates
};
