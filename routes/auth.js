const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/authMiddleware');

// Ruta de Registro
router.post('/register', async (req, res) => {
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
router.post('/login', async (req, res) => {
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
                email: usuario.email
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta Protegida: ejecusion del middleware
router.get('/perfil', auth, async (req, res) => {
    try {
        // Buscamos al usuario en la base de datos .
        const usuario = await User.findById(req.usuario.id).select('-password');
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ error: "Hubo un error en el servidor al cargar tu perfil" });
    }
});

module.exports = router;