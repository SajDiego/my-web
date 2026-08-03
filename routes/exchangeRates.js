const express = require('express');
const router = express.Router();
const ExchangeRate = require('../models/exchangeRate');
const { getRates, loadRates } = require('../utils/exchangeCache');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

router.get('/', async (req, res) => {
    try {
        const rates = await getRates();
        res.json(rates);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener tasas de cambio' });
    }
});

router.put('/', auth, admin, async (req, res) => {
    try {
        const { rates } = req.body; 
        if (!Array.isArray(rates)) {
            return res.status(400).json({ error: 'Formato inválido' });
        }
        
        for (const rate of rates) {
            await ExchangeRate.findOneAndUpdate(
                { moneda: rate.moneda },
                { tasa: rate.tasa, factor_redondeo: rate.factor_redondeo },
                { upsert: true, returnDocument: 'after' }
            );
        }
        
        await loadRates();
        
        res.json({ mensaje: 'Tasas de cambio actualizadas correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar tasas de cambio' });
    }
});

module.exports = router;
