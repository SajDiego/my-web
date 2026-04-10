const rateLimit = require('express-rate-limit');

// Límite general para toda la API
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos por 100 intentos
    max: 100,
    message: { error: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo en 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Límite estricto para rutas sensibles como Login/Registro 
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Demasiados intentos de acceso sospechosos, por favor espera 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { apiLimiter, authLimiter };
