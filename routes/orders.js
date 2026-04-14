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

async function procesarCreacionOrden(datos, usuarioReq = null) {
    const producto = await Product.findOne({ juego: datos.juegoNombre });
    if (!producto) throw new Error("Juego no encontrado.");

    const paquete = producto.paquetes.find(p => p.nombre === datos.paqueteElegido);
    if (!paquete) throw new Error("Paquete no encontrado.");

    if (paquete.stock !== null && paquete.stock !== undefined && paquete.stock <= 0) {
        throw new Error("Este paquete no tiene stock disponible.");
    }

    if (paquete.stock !== null && paquete.stock !== undefined && paquete.stock > 0) {
        await Product.findOneAndUpdate(
            { _id: producto._id, 'paquetes._id': paquete._id },
            { $inc: { 'paquetes.$.stock': -1 } }
        );
    }

    const numeroOrden = await getNextSequenceValue('ordenes');

    const configOrden = {
        numeroOrden,
        juegoNombre: producto.juego,
        paqueteElegido: paquete.nombre,
        moneda: datos.moneda || 'ARS',
        precioFinal: datos.moneda === 'USD' ? paquete.precioUSD : paquete.precioARS,
        uidJugador: datos.uidJugador || '',
        regionJugador: datos.regionJugador || '',
        tipoDatoEntrega: datos.tipoDatoEntrega || '',
        datosEntrega: datos.datosEntrega || {},
        metodoPago: datos.metodoPago || 'No especificado'
    };

    if (usuarioReq) {
        configOrden.usuario = usuarioReq.id;
    } else {
        configOrden.usuarioInvitado = {
            nombre: datos.nombreInvitado,
            email: datos.emailInvitado,
            whatsapp: datos.whatsappInvitado
        };
    }

    const nuevaOrden = new Order(configOrden);
    await nuevaOrden.save();

    try {
        let emailCliente = '';
        let infoUsuarioAdmin = {};

        if (usuarioReq) {
            const usuarioFull = await User.findById(usuarioReq.id);
            if (usuarioFull) {
                emailCliente = usuarioFull.email;
                infoUsuarioAdmin = { nombre: usuarioFull.nombre, email: usuarioFull.email };
            }
        } else {
            emailCliente = datos.emailInvitado;
            infoUsuarioAdmin = { 
                nombre: datos.nombreInvitado, 
                email: datos.emailInvitado, 
                contacto: datos.whatsappInvitado 
            };
        }

        if (emailCliente || infoUsuarioAdmin.email) {
            const promesas = [enviarEmailAdmin(nuevaOrden, infoUsuarioAdmin)];
            if (emailCliente) promesas.push(enviarEmailCliente(nuevaOrden, emailCliente));
            await Promise.all(promesas);
        }
    } catch (mailErr) {
        console.error("Error envío correos:", mailErr);
    }

    return nuevaOrden;
}

router.post('/', auth, async (req, res) => {
    try {
        const orden = await procesarCreacionOrden(req.body, req.usuario);
        res.status(201).json({ mensaje: "¡Pedido registrado con éxito!", orden });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/guest', async (req, res) => {
    try {
        const orden = await procesarCreacionOrden(req.body);
        res.status(201).json({ mensaje: "¡Pedido registrado con éxito!", orden });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/', auth, admin, async (req, res) => {
    try {
        const ordenes = await Order.find().populate('usuario', 'nombre email');
        res.json(ordenes);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener pedidos." });
    }
});

router.patch('/:id/estado', auth, admin, async (req, res) => {
    try {
        const { estado } = req.body;
        const ordenActualizada = await Order.findByIdAndUpdate(
            req.params.id,
            { estado },
            { returnDocument: 'after' }
        );
        if (!ordenActualizada) return res.status(404).json({ error: "Orden no encontrada" });
        res.json({ mensaje: `Estado actualizado: ${estado}`, orden: ordenActualizada });
    } catch (error) {
        res.status(400).json({ error: "Error al cambiar estado." });
    }
});

module.exports = router;
