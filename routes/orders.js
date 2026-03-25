const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const auth = require('../middleware/authMiddleware');
const Product = require('../models/product');

// Orden para usuario registrado
router.post('/', auth, async (req, res) => {
    try {
        const producto = await Product.findOne({ juego: req.body.juegoNombre });
        if (!producto) return res.status(404).json({ error: "Juego no encontrado." });

        const paquete = producto.paquetes.find(p => p.nombre === req.body.paqueteElegido);
        if (!paquete) return res.status(404).json({ error: "Paquete no encontrado." });

        const nuevaOrden = new Order({
            usuario: req.usuario.id,
            juegoNombre: producto.juego,
            paqueteElegido: paquete.nombre,
            precioFinal: paquete.precio,
            uidJugador: req.body.uidJugador,
            regionJugador: req.body.regionJugador || ""
        });

        await nuevaOrden.save();
        res.status(201).json({ mensaje: "¡Pedido registrado con éxito!", orden: nuevaOrden });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Orden para invitado (sin token)
router.post('/guest', async (req, res) => {
    try {
        const producto = await Product.findOne({ juego: req.body.juegoNombre });
        if (!producto) return res.status(404).json({ error: "Juego no encontrado." });

        const paquete = producto.paquetes.find(p => p.nombre === req.body.paqueteElegido);
        if (!paquete) return res.status(404).json({ error: "Paquete no encontrado." });

        const nuevaOrden = new Order({
            usuarioInvitado: {
                nombre: req.body.nombreInvitado,
                contacto: req.body.contactoInvitado
            },
            juegoNombre: producto.juego,
            paqueteElegido: paquete.nombre,
            precioFinal: paquete.precio,
            uidJugador: req.body.uidJugador,
            regionJugador: req.body.regionJugador || ""
        });

        await nuevaOrden.save();
        res.status(201).json({ mensaje: "¡Pedido registrado con éxito!", orden: nuevaOrden });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Listado de órdenes (panel admin)
router.get('/', auth, async (req, res) => {
    try {
        const ordenes = await Order.find().populate('usuario', 'nombre email');
        res.json(ordenes);
    } catch (error) {
        res.status(500).json({ error: "Error al intentar obtener los pedidos." });
    }
});

// Cambio de estado de orden
router.patch('/:id/estado', auth, async (req, res) => {
    try {
        const { estado } = req.body;
        const ordenActualizada = await Order.findByIdAndUpdate(
            req.params.id,
            { estado: estado },
            { returnDocument: 'after' }
        );
        if (!ordenActualizada) return res.status(404).json({ error: "Boleto no encontrado" });
        res.json({ mensaje: `El estado de la orden ahora es: ${estado}`, orden: ordenActualizada });
    } catch (error) {
        res.status(400).json({ error: "Hubo un error al intentar cambiar el estado." });
    }
});

module.exports = router;
