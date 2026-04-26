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
        from: `"GamePin Orders" <${process.env.SMTP_USER}>`,
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
        from: `"GamePin Store" <${process.env.SMTP_USER}>`,
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

                ${['Transferencia Bancaria', 'Mercado Pago'].includes(orden.metodoPago) ? `
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 20px;">
                    <h3 style="color: #6366f1; margin-top: 0;">Datos para Transferencia (Diego Fernando Saj)</h3>
                    
                    <div style="margin-bottom: 15px;">
                        <strong>Banca: AstroPay</strong><br>
                        CVU: 0000177500092064038112<br>
                        Alias: gamepinstore
                    </div>

                    <div style="margin-bottom: 15px;">
                        <strong>Banca: NaranjaX</strong><br>
                        CBU: 4530000800015867566941<br>
                        Alias: DSAJ.NX.ARS
                    </div>

                    <div>
                        <strong>Banca: Brubank</strong><br>
                        CBU: 1430001713024552310013<br>
                        Alias: Diegosaj.bru
                    </div>
                    <div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px; text-align: center;">
                        <p style="font-size: 0.95em; margin-bottom: 12px;">Ante cualquier consulta contactanos:</p>
                        <a href="https://wa.me/5491133148649" style="background-color: #25d366; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                            Contactar por WhatsApp
                        </a>
                    </div>
                </div>
                ` : ''}

                ${orden.metodoPago === 'PagoFacil / Rapipago' ? `
                <div style="background-color: #fffbeb; padding: 15px; border-radius: 8px; border: 1px solid #fef3c7; margin-top: 20px;">
                    <h3 style="color: #d97706; margin-top: 0;">Instrucciones para Pago en Efectivo</h3>
                    
                    <div style="margin-bottom: 15px;">
                        <strong>📍 Pago Fácil:</strong><br>
                        Acercate a una sucursal, indicá que querés cargar <strong>ClaroPay</strong> y dictá el número: <strong>11-3314-8649</strong>.<br>
                        Monto total a pagar: <strong>$ ${orden.precioFinal}</strong>
                    </div>

                    <div>
                        <strong>📍 Rapipago:</strong><br>
                        Acercate a una sucursal e indicá que querés realizar una carga de <strong>$ ${orden.precioFinal}</strong> en <strong>PREX</strong> a la cuenta: <strong>14234836</strong>.
                    </div>

                    <div style="margin-top: 20px; border-top: 1px solid #fde68a; padding-top: 15px; text-align: center;">
                        <p style="font-size: 0.95em; margin-bottom: 12px;">Ante cualquier consulta contactanos:</p>
                        <a href="https://wa.me/5491133148649" style="background-color: #25d366; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                            Contactar por WhatsApp
                        </a>
                    </div>
                </div>
                ` : ''}

                ${orden.metodoPago === 'QR' ? `
                <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; border: 1px solid #bae6fd; margin-top: 20px;">
                    <h3 style="color: #009ee3; margin-top: 0;">Pago mediante QR</h3>
                    <p>Podés escanear el código QR que apareció al finalizar tu compra o utilizar los siguientes datos de transferencia si te resulta más cómodo:</p>
                    <div style="margin-top: 10px;">
                        <strong>Alias:</strong> gamepinstore<br>
                        <strong>CVU:</strong> 0000177500092064038112
                    </div>
                </div>
                ` : ''}

                ${orden.metodoPago === 'Binance Pay' ? `
                <div style="background-color: #fefce8; padding: 15px; border-radius: 8px; border: 1px solid #fef08a; margin-top: 20px;">
                    <h3 style="color: #ca8a04; margin-top: 0;">Binance Pay Instructions</h3>
                    <p><strong>English:</strong> You must make the payment from your Binance Pay app. Pay exact amount.</p>
                    <p><strong>Backup ID:</strong> 199828457 (Use this if you cannot scan the QR code).</p>
                    <p style="margin-top: 10px;">Total to pay: <strong>U$D ${orden.precioFinal}</strong></p>
                </div>
                ` : ''}

                ${!['Transferencia Bancaria', 'Mercado Pago', 'PagoFacil / Rapipago', 'QR', 'Binance Pay'].includes(orden.metodoPago) ? '<p>Si aún no realizaste el pago, por favor hazlo para que podamos procesar tu recarga.</p>' : ''}
                
                <br>
                <p>¡Gracias por elegir GamePin Store!</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error enviando email a Cliente:", error);
    }
};

const enviarEmailOrdenCompletada = async (orden, clienteEmail) => {
    const mailOptions = {
        from: `"GamePin Store" <${process.env.SMTP_USER}>`,
        to: clienteEmail,
        subject: `¡Orden Completada! #${orden.numeroOrden}`,
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #6366f1;">Estado de la orden: Completado</h2>
                <p>Tu pedido de <strong>${orden.juegoNombre}</strong> ha sido procesado con éxito.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p>Ante cualquier consulta, por favor comunicate por WhatsApp:</p>
                <div style="text-align: center; margin: 25px 0;">
                    <a href="https://wa.me/5491133148649" style="background-color: #25d366; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                        Contactar Soporte
                    </a>
                </div>
                <p>¡Gracias por tu compra!</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error enviando mail de completado:", error);
    }
};

const enviarEmailResetPassword = async (email, token) => {
    const resetUrl = `${process.env.FRONTEND_URL || 'https://gamepin.top'}/reset-password?token=${token}`;
    
    const mailOptions = {
        from: `"GamePin Store" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Recuperación de Contraseña - GamePin Store',
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #6366f1;">Restablecer tu contraseña</h2>
                <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en GamePin Store.</p>
                <p>Hacé clic en el siguiente botón para elegir una nueva contraseña. Este enlace es válido por 15 minutos.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #6366f1; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                        Restablecer Contraseña
                    </a>
                </div>
                <p style="font-size: 0.9em; color: #666;">Si no solicitaste este cambio, podés ignorar este correo de forma segura.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p>¡Gracias por elegir GamePin Store!</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error enviando mail de reset:", error);
    }
};

module.exports = { enviarEmailAdmin, enviarEmailCliente, enviarEmailOrdenCompletada, enviarEmailResetPassword };
