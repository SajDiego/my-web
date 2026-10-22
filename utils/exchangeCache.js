const ExchangeRate = require('../models/exchangeRate');

const DEFAULT_RATES = {
    COP: { tasa: 3100, factor_redondeo: 100 },
    MXN: { tasa: 17.50, factor_redondeo: 10 },
    CLP: { tasa: 950, factor_redondeo: 10 },
    BRL: { tasa: 5.60, factor_redondeo: 1 },
    PEN: { tasa: 3.75, factor_redondeo: 1 }
};

let ratesCache = { ...DEFAULT_RATES };

const getRates = async () => {
    if (ratesCache && Object.keys(ratesCache).length > 0) return ratesCache;
    await loadRates();
    return ratesCache || DEFAULT_RATES;
};

const loadRates = async () => {
    try {
        const rates = await ExchangeRate.find({});
        const newCache = { ...DEFAULT_RATES };
        const foundCurrencies = new Set();
        
        rates.forEach(r => {
            newCache[r.moneda] = { tasa: r.tasa, factor_redondeo: r.factor_redondeo };
            foundCurrencies.add(r.moneda);
        });
        
        for (const [moneda, config] of Object.entries(DEFAULT_RATES)) {
            if (!foundCurrencies.has(moneda)) {
                try {
                    await ExchangeRate.findOneAndUpdate(
                        { moneda },
                        { tasa: config.tasa, factor_redondeo: config.factor_redondeo },
                        { upsert: true }
                    );
                } catch (e) {
                    // Ignorar error si ya existe
                }
            }
        }
        
        ratesCache = newCache;
        console.log('Exchange rates loaded to cache');
    } catch (err) {
        console.error('Error loading exchange rates:', err);
        if (!ratesCache) ratesCache = { ...DEFAULT_RATES };
    }
};

module.exports = {
    DEFAULT_RATES,
    getRates,
    loadRates
};
