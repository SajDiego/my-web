const express = require('express');
const router = express.Router();
const Coupon = require('../models/coupon');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

router.get('/validate/:codigo', async (req, res) => {
    try {
        const codigo = req.params.codigo.toUpperCase().trim();
        const cupon = await Coupon.findOne({ codigo });
        
        if (!cupon) return res.status(404).json({ error: "Cupón no encontrado." });
        if (!cupon.activo) return res.status(400).json({ error: "Este cupón ya no está activo." });
        if (cupon.usoMaximo !== null && cupon.usoActual >= cupon.usoMaximo) {
            return res.status(400).json({ error: "Este cupón ya alcanzó su límite de usos." });
        }
        
        res.json({ descuentoPorcentaje: cupon.descuentoPorcentaje });
    } catch (error) {
        res.status(500).json({ error: "Error al validar el cupón." });
    }
});

router.post('/use/:codigo', async (req, res) => {
    try {
        const codigo = req.params.codigo.toUpperCase().trim();
        const cupon = await Coupon.findOne({ codigo });
        if (!cupon) return res.status(404).json({ error: "Cupón no encontrado." });

        cupon.usoActual = (cupon.usoActual || 0) + 1;

        if (cupon.usoMaximo !== null && cupon.usoActual >= cupon.usoMaximo) {
            cupon.activo = false;
        }

        await cupon.save();
        res.json({ mensaje: "Uso registrado.", usoActual: cupon.usoActual });
    } catch (error) {
        res.status(500).json({ error: "Error al registrar uso." });
    }
});

router.get('/', auth, admin, async (req, res) => {
    try {
        const cupones = await Coupon.find().sort({ createdAt: -1 });
        res.json(cupones);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los cupones." });
    }
});

router.post('/', auth, admin, async (req, res) => {
    try {
        const { codigo, descuentoPorcentaje, usoMaximo } = req.body;
        
        if (!codigo || !descuentoPorcentaje) {
            return res.status(400).json({ error: "Código y porcentaje son obligatorios." });
        }

        const cuponExistente = await Coupon.findOne({ codigo: codigo.toUpperCase().trim() });
        if (cuponExistente) {
            return res.status(400).json({ error: "Ya existe un cupón con este código." });
        }

        const nuevoCupon = new Coupon({
            codigo,
            descuentoPorcentaje,
            usoMaximo: usoMaximo ? Number(usoMaximo) : null
        });
        await nuevoCupon.save();
        
        res.status(201).json({ mensaje: "Cupón creado exitosamente.", cupon: nuevoCupon });
    } catch (error) {
        res.status(500).json({ error: "Error al crear el cupón." });
    }
});

router.patch('/:id/reset', auth, admin, async (req, res) => {
    try {
        const cupon = await Coupon.findByIdAndUpdate(
            req.params.id,
            { usoActual: 0, activo: true },
            { new: true }
        );
        if (!cupon) return res.status(404).json({ error: "Cupón no encontrado." });
        res.json({ mensaje: "Contador reseteado.", cupon });
    } catch (error) {
        res.status(500).json({ error: "Error al resetear el cupón." });
    }
});

router.delete('/:id', auth, admin, async (req, res) => {
    try {
        const cupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!cupon) return res.status(404).json({ error: "El cupón no existe." });
        res.json({ mensaje: "Cupón eliminado correctamente." });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar el cupón." });
    }
});

module.exports = router;

