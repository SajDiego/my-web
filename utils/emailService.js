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
        subject: `🚨 ¡NUEVO PEDIDO! #${orden.numPedido} - ${orden.juegoNombre}`,
        html: `
            <h2>Nuevo pedido recibido</h2>
            <p><strong>Cliente:</strong> ${clienteInfo.nombre}</p>
            <p><strong>Email:</strong> ${clienteInfo.email}</p>
            <p><strong>WhatsApp:</strong> ${clienteInfo.whatsapp || 'No especificado'}</p>
            <hr>
            <p><strong>Juego:</strong> ${orden.juegoNombre}</p>
            <p><strong>Paquete:</strong> ${orden.paqueteElegido}</p>
            <p><strong>UID/ID Jugador:</strong> ${orden.uidJugador}</p>
            <p><strong>Método de Pago:</strong> ${orden.metodoPago}</p>
            <p><strong>Total:</strong> ${orden.moneda} ${orden.precioEnMoneda}</p>
            <br>
            <p><em>Ingresá al panel de administración para gestionar este pedido.</em></p>
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
        subject: `Orden #${orden.numPedido} - ${orden.estado}`,
        html: `
            <h2>Hola ${orden.usuarioInvitado?.nombre || 'Jugador'},</h2>
            <p>${mensajePersonalizado || `Hemos recibido tu pedido de <strong>${orden.juegoNombre}</strong>.`}</p>
            <p><strong>Estado Actual:</strong> <span style="color: #var(--accent); font-weight: bold;">${orden.estado}</span></p>
            <hr>
            <p><strong>Detalles de tu compra:</strong></p>
            <ul>
                <li>Pack: ${orden.paqueteElegido}</li>
                <li>ID Jugador: ${orden.uidJugador}</li>
                <li>Total: ${orden.moneda} ${orden.precioEnMoneda}</li>
            </ul>
            <p>Si aún no realizaste el pago por <strong>${orden.metodoPago}</strong>, por favor hazlo para que podamos procesar tu recarga.</p>
            <br>
            <p>¡Gracias por elegir IntegralPro!</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error enviando email a Cliente:", error);
    }
};

module.exports = { enviarEmailAdmin, enviarEmailCliente };
