const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// Obtener banners
router.get('/', async (req, res) => {
    try {
        const banners = await Banner.find().sort({ fechaCreacion: -1 });
        res.json(banners);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener banners" });
    }
});

// Crear banner (yo)
router.post('/', auth, admin, async (req, res) => {
    try {
        const nuevoBanner = new Banner(req.body);
        await nuevoBanner.save();
        res.status(201).json(nuevoBanner);
    } catch (error) {
        res.status(400).json({ error: "Error al crear banner" });
    }
});

// Eliminar banner (yo)
router.delete('/:id', auth, admin, async (req, res) => {
    try {
        await Banner.findByIdAndDelete(req.params.id);
        res.json({ mensaje: "Banner eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar banner" });
    }
});

module.exports = router;
