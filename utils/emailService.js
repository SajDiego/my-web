const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const enviarEmailAdmin = async (orden, clienteInfo) => {
    const mailOptions = {
        from: `"IntegralPro Order" <${process.env.SMTP_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `🚨 ¡NUEVO PEDIDO! #${orden.numeroOrden} - ${orden.juegoNombre}`,
        html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color: #6366f1;">Nuevo pedido recibido</h2>
                <p><strong>Cliente:</strong> ${clienteInfo.nombre}</p>
                <p><strong>Email:</strong> ${clienteInfo.email}</p>
                <p><strong>Contacto:</strong> ${clienteInfo.contacto || 'No especificado'}</p>
                <hr style="border: 0; border-top: 1px solid #eee;">
                <p><strong>Juego:</strong> ${orden.juegoNombre}</p>
                <p><strong>Paquete:</strong> ${orden.paqueteElegido}</p>
                <p><strong>ID Jugador:</strong> ${orden.uidJugador}</p>
                <p><strong>Método de Pago:</strong> ${orden.metodoPago}</p>
                <p><strong>Total:</strong> ${orden.moneda} ${orden.precioFinal}</p>
                <br>
                <p style="font-size: 0.9em; color: #666;"><em>Ingresá al panel de administración para gestionar este pedido.</em></p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error enviando email a Admin:", error);
    }
};

const enviarEmailCliente = async (orden, clienteEmail, mensajePersonalizado = "") => {
    const mailOptions = {
        from: `"IntegralPro Gaming" <${process.env.SMTP_USER}>`,
        to: clienteEmail,
        subject: `Orden #${orden.numeroOrden} - ${orden.estado}`,
        html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color: #6366f1;">Hola ${orden.usuarioInvitado?.nombre || 'Jugador'},</h2>
                <p>${mensajePersonalizado || `Hemos recibido tu pedido de <strong>${orden.juegoNombre}</strong>.`}</p>
                <p><strong>Estado Actual:</strong> <span style="color: #6366f1; font-weight: bold;">${orden.estado}</span></p>
                <hr style="border: 0; border-top: 1px solid #eee;">
                <p><strong>Detalles de tu compra:</strong></p>
                <ul>
                    <li>Pack: ${orden.paqueteElegido}</li>
                    <li>ID Jugador: ${orden.uidJugador}</li>
                    <li>Total: ${orden.moneda} ${orden.precioFinal}</li>
                    <li>Método elegido: ${orden.metodoPago}</li>
                </ul>
                <p>Si aún no realizaste el pago, por favor hazlo para que podamos procesar tu recarga.</p>
                <br>
                <p>¡Gracias por elegir IntegralPro!</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error enviando email a Cliente:", error);
    }
};

module.exports = { enviarEmailAdmin, enviarEmailCliente };
