const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const Product = require('../models/product');
const Counter = require('../models/counter');
const User = require('../models/user');
const Coupon = require('../models/coupon');
const { enviarEmailAdmin, enviarEmailCliente, enviarEmailOrdenCompletada } = require('../utils/emailService');
const { enviarNotificacionTelegram } = require('../utils/telegram');
const { getRates } = require('../utils/exchangeCache');
const WalletTransaction = require('../models/walletTransaction');

async function getNextSequenceValue(sequenceName) {
    const sequenceDocument = await Counter.findOneAndUpdate(
        { id: sequenceName },
        { $inc: { seq: 1 } },
        { returnDocument: 'after', upsert: true }
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

    let precioFinal;
    if (datos.moneda === 'USD') {
        precioFinal = (paquete.precioUSDDescuento != null && paquete.precioUSDDescuento > 0)
            ? paquete.precioUSDDescuento
            : paquete.precioUSD;
    } else if (datos.moneda === 'ARS') {
        precioFinal = (paquete.precioARSDescuento != null && paquete.precioARSDescuento > 0)
            ? paquete.precioARSDescuento
            : paquete.precioARS;
    } else {
        const baseUSD = (paquete.precioUSDDescuento != null && paquete.precioUSDDescuento > 0)
            ? paquete.precioUSDDescuento
            : paquete.precioUSD;
            
        const rates = await getRates();
        if (rates[datos.moneda]) {
            const config = rates[datos.moneda];
            const convert = baseUSD * config.tasa;
            if (convert < 10) precioFinal = Math.ceil(convert * 100) / 100;
            else if (convert < 100) precioFinal = Math.ceil(convert);
            else if (convert < 1000) precioFinal = Math.ceil(convert / 10) * 10;
            else precioFinal = Math.ceil(convert / config.factor_redondeo) * config.factor_redondeo;
        } else {
            precioFinal = baseUSD; 
        }
    }

    // APLICAR CUPÓN SI EXISTE
    let cuponAplicado = null;
    if (datos.codigoCupon) {
        cuponAplicado = await Coupon.findOne({ codigo: datos.codigoCupon.toUpperCase(), activo: true });
        if (cuponAplicado) {
            // Verificar limites
            const limiteValido = cuponAplicado.usoMaximo === null || cuponAplicado.usoActual < cuponAplicado.usoMaximo;
            
            // Verificar restricciones
            const cumpleJuego = !cuponAplicado.juegoRestringido || datos.juegoNombre.toLowerCase() === cuponAplicado.juegoRestringido.toLowerCase();
            const cumpleRegion = !cuponAplicado.regionRestringida || (datos.regionJugador || '').toLowerCase() === cuponAplicado.regionRestringida.toLowerCase();
            const cumplePaquete = !cuponAplicado.paqueteRestringido || datos.paqueteElegido.toLowerCase() === cuponAplicado.paqueteRestringido.toLowerCase();
            
            if (limiteValido && cumpleJuego && cumpleRegion && cumplePaquete) {
                precioFinal = precioFinal - (precioFinal * (cuponAplicado.descuentoPorcentaje / 100));
            } else {
                cuponAplicado = null; // No aplica a este item o caducó
            }
        }
    }

    // Redondear a decimales seguros para comparaciones
    precioFinal = (datos.moneda === 'USD' || datos.moneda === 'BRL' || datos.moneda === 'PEN') ? Number(precioFinal.toFixed(2)) : Math.round(precioFinal);

    // PROTECCIÓN CONTRA CACHÉ: Verificamos si el precio que el usuario vio en pantalla coincide con el del servidor
    if (datos.precioEsperado !== undefined) {
        if (Math.abs(precioFinal - datos.precioEsperado) > 0.05) {
            throw new Error("Los precios han cambiado debido a una actualización reciente. Por favor, recarga la página e inténtalo de nuevo.");
        }
    }

    if (datos.metodoPago === 'Mi Saldo' || datos.metodoPago === 'Billetera Virtual') {
        if (!usuarioReq) throw new Error("Debes iniciar sesión para usar tu billetera.");
        const usuarioDb = await User.findById(usuarioReq.id);
        if (!usuarioDb) throw new Error("Usuario no encontrado.");
        if (usuarioDb.wallet_currency !== datos.moneda) {
            throw new Error(`Tu saldo está en ${usuarioDb.wallet_currency}, pero la compra es en ${datos.moneda}. Las monedas deben coincidir.`);
        }
        if (usuarioDb.wallet_balance < precioFinal) {
            throw new Error("No tienes saldo suficiente en tu billetera virtual.");
        }
        // Usar Math.round para evitar errores de punto flotante
        usuarioDb.wallet_balance = Math.round((usuarioDb.wallet_balance - precioFinal) * 100) / 100;
        await usuarioDb.save();

        // Registrar transacción de consumo
        await new WalletTransaction({
            usuario: usuarioReq.id,
            tipo: 'consumo',
            monto: precioFinal,
            moneda: datos.moneda,
            descripcion: `Pago con saldo — ${datos.juegoNombre} ${datos.paqueteElegido}`
        }).save();
    }

    const configOrden = {
        numeroOrden,
        juegoNombre: producto.juego,
        paqueteElegido: paquete.nombre,
        moneda: datos.moneda || 'ARS',
        precioFinal,
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

    if (cuponAplicado) {
        cuponAplicado.usoActual += 1;
        await cuponAplicado.save();
    }

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

        const nombreCliente = infoUsuarioAdmin.nombre || 'Desconocido';
        
        let detallesJuego = '';
        if (configOrden.datosEntrega && Object.keys(configOrden.datosEntrega).length > 0) {
            for (const [key, value] of Object.entries(configOrden.datosEntrega)) {
                detallesJuego += `\n🔹 <b>${key}:</b> ${value}`;
            }
        } else {
            if (configOrden.uidJugador) detallesJuego += `\n🆔 <b>ID Jugador:</b> ${configOrden.uidJugador}`;
            if (configOrden.regionJugador) detallesJuego += `\n🌍 <b>Servidor:</b> ${configOrden.regionJugador}`;
        }

        const msgTelegram = `🔔 <b>¡Nueva Orden #${numeroOrden}!</b>\n\n🎮 <b>Juego:</b> ${configOrden.juegoNombre}\n📦 <b>Paquete:</b> ${configOrden.paqueteElegido}${detallesJuego}\n💰 <b>Monto:</b> $${configOrden.precioFinal} ${configOrden.moneda}\n👤 <b>Cliente:</b> ${nombreCliente}\n💳 <b>Pago:</b> ${configOrden.metodoPago}`;
        enviarNotificacionTelegram(msgTelegram);

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

router.get('/me', auth, async (req, res) => {
    try {
        const ordenes = await Order.find({ usuario: req.usuario.id }).sort({ fechaCompra: -1 });
        res.json(ordenes);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener tus pedidos." });
    }
});



router.get('/', auth, admin, async (req, res) => {
    try {
        // Poblamos también el campo whatsapp del usuario registrado
        const ordenes = await Order.find()
            .populate('usuario', 'nombre email whatsapp')
            .sort({ fechaCompra: -1 });
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
        ).populate('usuario', 'email nombre');

        if (!ordenActualizada) return res.status(404).json({ error: "Orden no encontrada" });

        // Si el estado es "Completada", enviar email automático
        if (estado === 'Completada') {
            const emailDestino = ordenActualizada.usuario ? ordenActualizada.usuario.email : ordenActualizada.usuarioInvitado?.email;
            if (emailDestino) {
                await enviarEmailOrdenCompletada(ordenActualizada, emailDestino);
            }
        }

        res.json({ mensaje: `Estado actualizado: ${estado}`, orden: ordenActualizada });
    } catch (error) {
        res.status(400).json({ error: "Error al cambiar estado." });
    }
});

module.exports = router;
