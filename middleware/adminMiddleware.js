const User = require('../models/user');

module.exports = async function (req, res, next) {
    try {
        const usuario = await User.findById(req.usuario.id);
        if (usuario && usuario.rol === 'admin') {
            next();
        } else {
            res.status(403).json({ error: "Acceso denegado. Se requieren permisos de administrador." });
        }
    } catch(err) {
        res.status(500).json({ error: "Error en la validación de administrador" });
    }
};
