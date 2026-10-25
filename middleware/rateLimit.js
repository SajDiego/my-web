const rateLimit = require('express-rate-limit');

const isLocalhost = (req) => {
    const ip = req.ip || req.connection?.remoteAddress;
    return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
};

// Límite general para toda la API
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos por 100 intentos
    max: 100,
    message: { error: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo en 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: isLocalhost,
    validate: { trustProxy: false },
});

// Límite estricto para rutas sensibles como Login/Registro 
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Demasiados intentos de acceso sospechosos, por favor espera 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: isLocalhost,
    validate: { trustProxy: false },
});

// Límite para pedidos de invitados
const orderLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: { error: 'Demasiados pedidos desde esta IP, por favor espera 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: isLocalhost,
    validate: { trustProxy: false },
});

// Límite para recuperación de contraseña
const forgotLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { error: 'Demasiadas solicitudes de recuperación, intenta en 1 hora.' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: isLocalhost,
    validate: { trustProxy: false },
});

module.exports = { apiLimiter, authLimiter, orderLimiter, forgotLimiter };
