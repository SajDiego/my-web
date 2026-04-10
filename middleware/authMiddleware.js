const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ error: "No hay token, permiso denegado" });
    }

    try {
        const descifrado = jwt.verify(token, process.env.JWT_SECRET);

        req.usuario = descifrado;
        next();
    } catch (error) {
        res.status(401).json({ error: "El token no es válido" });
    }
};
