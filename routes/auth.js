const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimit');

// Ruta de Registro
router.post('/register', authLimiter, async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const nuevoUsuario = new User({
            nombre,
            email,
            password: hashedPassword
        });

        await nuevoUsuario.save();
        res.status(201).json({ mensaje: "Usuario creado en Atlas" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta de Inicio de Sesión
router.post('/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;


        const usuario = await User.findOne({ email });
        if (!usuario) {
            return res.status(400).json({ error: "El usuario no existe" });
        }

        const constrasenaValida = await bcrypt.compare(password, usuario.password);
        if (!constrasenaValida) {
            return res.status(400).json({ error: "Contraseña incorrecta" });
        }

        // 3. Crear el Token JWT 
        const token = jwt.sign(
            { id: usuario._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            mensaje: "¡Inicio de sesión exitoso!",
            token: token,
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta Protegida: ejecusion del middleware
router.get('/perfil', auth, async (req, res) => {
    try {

        const usuario = await User.findById(req.usuario.id).select('-password');
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ error: "Hubo un error en el servidor al cargar tu perfil" });
    }
});

// Actualizar Perfil
router.put('/perfil', auth, async (req, res) => {
    try {
        const { nombre, whatsapp, password } = req.body;
        const updates = { nombre, whatsapp };

        if (password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(password, salt);
        }

        const usuario = await User.findByIdAndUpdate(
            req.usuario.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        res.json(usuario);
    } catch (error) {
        res.status(400).json({ error: "Error al actualizar perfil" });
    }
});

const { enviarEmailResetPassword } = require('../utils/emailService');

// Olvidé mi contraseña (genera link)
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const usuario = await User.findOne({ email });
        
        if (!usuario) {
            return res.status(404).json({ error: "No existe un usuario con ese correo electrónico" });
        }

        // Token válido por 15 minutos
        const resetToken = jwt.sign(
            { id: usuario._id, type: 'reset' },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        await enviarEmailResetPassword(email, resetToken);
        res.json({ mensaje: "Email de recuperación enviado" });
    } catch (error) {
        res.status(500).json({ error: "Error al procesar la solicitud" });
    }
});

// Restablecer contraseña (usa el token)
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.type !== 'reset') throw new Error("Token inválido");

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });
        
        res.json({ mensaje: "Contraseña actualizada con éxito" });
    } catch (error) {
        res.status(400).json({ error: "El enlace ha expirado o es inválido" });
    }
});

module.exports = router;