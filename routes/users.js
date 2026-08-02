const express = require('express');
const router = express.Router();
const User = require('../models/user');
const WalletTransaction = require('../models/walletTransaction');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// Buscar usuarios por email (Admin)
router.get('/search', auth, admin, async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ error: 'Proporcione un email para buscar' });
        }
        
        // Búsqueda parcial o exacta
        const users = await User.find({ email: { $regex: email, $options: 'i' } }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error al buscar usuarios' });
    }
});

// Recargar billetera a un usuario (Admin)
router.post('/:id/recharge', auth, admin, async (req, res) => {
    try {
        const { amount } = req.body;
        
        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ error: 'Monto inválido' });
        }

        const usuario = await User.findById(req.params.id);
        
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        const { getRates } = require('../utils/exchangeCache');
        const rates = await getRates();
        
        let rateConfig = rates[usuario.wallet_currency];
        if (!rateConfig && usuario.wallet_currency !== 'USD') {
             return res.status(400).json({ error: 'Moneda del usuario no configurada' });
        }
        
        let maxLimit = 100;
        if (usuario.wallet_currency !== 'USD' && rateConfig) {
             maxLimit = 100 * rateConfig.tasa;
             maxLimit = Math.ceil(maxLimit / rateConfig.factor_redondeo) * rateConfig.factor_redondeo;
        }

        if ((usuario.wallet_balance + amount) > maxLimit) {
            return res.status(400).json({ error: `La recarga supera el límite máximo permitido de ${maxLimit} ${usuario.wallet_currency}` });
        }

        usuario.wallet_balance = Math.round((usuario.wallet_balance + amount) * 100) / 100;
        await usuario.save();

        // Registrar transacción de recarga
        await new WalletTransaction({
            usuario: usuario._id,
            tipo: 'recarga',
            monto: amount,
            moneda: usuario.wallet_currency,
            descripcion: `Recarga de saldo por administrador`
        }).save();
        
        res.json({ 
            mensaje: 'Recarga exitosa', 
            nuevo_saldo: usuario.wallet_balance,
            moneda: usuario.wallet_currency 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al recargar billetera' });
    }
});

// Corregir/Setear saldo manualmente (Admin)
router.post('/:id/set-balance', auth, admin, async (req, res) => {
    try {
        const { amount } = req.body;
        
        if (amount === undefined || isNaN(amount) || amount < 0) {
            return res.status(400).json({ error: 'Monto inválido' });
        }

        const usuario = await User.findById(req.params.id);
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

        const montoAnterior = usuario.wallet_balance;
        usuario.wallet_balance = Math.round(parseFloat(amount) * 100) / 100;
        await usuario.save();

        // Registrar corrección en historial
        await new WalletTransaction({
            usuario: usuario._id,
            tipo: amount >= montoAnterior ? 'recarga' : 'consumo',
            monto: Math.abs(Math.round((amount - montoAnterior) * 100) / 100),
            moneda: usuario.wallet_currency,
            descripcion: `Corrección de saldo por administrador (${montoAnterior} → ${usuario.wallet_balance})`
        }).save();

        res.json({ 
            mensaje: 'Saldo actualizado', 
            nuevo_saldo: usuario.wallet_balance,
            moneda: usuario.wallet_currency 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al corregir saldo' });
    }
});


// Historial de transacciones del usuario logueado
router.get('/me/wallet-transactions', auth, async (req, res) => {
    try {
        const transacciones = await WalletTransaction.find({ usuario: req.usuario.id })
            .sort({ fecha: -1 })
            .limit(50);
        res.json(transacciones);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener historial de saldo' });
    }
});

module.exports = router;
