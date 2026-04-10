const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const Product = require('../models/product');
const Counter = require('../models/counter');
const User = require('../models/user');
const { enviarEmailAdmin, enviarEmailCliente } = require('../utils/emailService');

async function getNextSequenceValue(sequenceName) {
    const sequenceDocument = await Counter.findOneAndUpdate(
        { id: sequenceName },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return sequenceDocument.seq;
}

// Orden para usuario registrado
router.post('/', auth, async (req, res) => {
    try {
        const producto = await Product.findOne({ juego: req.body.juegoNombre });
        if (!producto) return res.status(404).json({ error: "Juego no encontrado." });

        const paquete = producto.paquetes.find(p => p.nombre === req.body.paqueteElegido);
        if (!paquete) return res.status(404).json({ error: "Paquete no encontrado." });

        const numeroOrden = await getNextSequenceValue('ordenes');

        const nuevaOrden = new Order({
            numeroOrden,
            usuario: req.usuario.id,
            juegoNombre: producto.juego,
            paqueteElegido: paquete.nombre,
            moneda: req.body.moneda || 'ARS',
            precioFinal: req.body.moneda === 'USD' ? paquete.precioUSD : paquete.precioARS,
            uidJugador: req.body.uidJugador || '',
            regionJugador: req.body.regionJugador || '',
            tipoDatoEntrega: req.body.tipoDatoEntrega || '',
            datosEntrega: req.body.datosEntrega || {},
            metodoPago: req.body.metodoPago || 'No especificado'
        });

        await nuevaOrden.save();

        // Enviar correos
        const usuarioFull = await User.findById(req.usuario.id);
        if (usuarioFull) {
            enviarEmailAdmin(nuevaOrden, { nombre: usuarioFull.nombre, email: usuarioFull.email });
            enviarEmailCliente(nuevaOrden, usuarioFull.email);
        }

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

        const numeroOrden = await getNextSequenceValue('ordenes');

        const nuevaOrden = new Order({
            numeroOrden,
            usuarioInvitado: {
                nombre: req.body.nombreInvitado,
                email: req.body.emailInvitado,
                whatsapp: req.body.whatsappInvitado
            },
            juegoNombre: producto.juego,
            paqueteElegido: paquete.nombre,
            moneda: req.body.moneda || 'ARS',
            precioFinal: req.body.moneda === 'USD' ? paquete.precioUSD : paquete.precioARS,
            uidJugador: req.body.uidJugador || '',
            regionJugador: req.body.regionJugador || '',
            tipoDatoEntrega: req.body.tipoDatoEntrega || '',
            datosEntrega: req.body.datosEntrega || {},
            metodoPago: req.body.metodoPago || 'No especificado'
        });

        await nuevaOrden.save();

        // Enviar correos
        enviarEmailAdmin(nuevaOrden, { 
            nombre: req.body.nombreInvitado, 
            email: req.body.emailInvitado, 
            contacto: req.body.whatsappInvitado 
        });
        if (req.body.emailInvitado) {
            enviarEmailCliente(nuevaOrden, req.body.emailInvitado);
        }

        res.status(201).json({ mensaje: "¡Pedido registrado con éxito!", orden: nuevaOrden });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Listado de órdenes (panel admin)
router.get('/', auth, admin, async (req, res) => {
    try {
        const ordenes = await Order.find().populate('usuario', 'nombre email');
        res.json(ordenes);
    } catch (error) {
        res.status(500).json({ error: "Error al intentar obtener los pedidos." });
    }
});

// Cambio de estado de orden
router.patch('/:id/estado', auth, admin, async (req, res) => {
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
