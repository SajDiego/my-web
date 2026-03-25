const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const auth = require('../middleware/authMiddleware');

// listar productos
router.get('/', async (req, res) => {
    try {
        const productos = await Product.find();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el catálogo de juegos" });
    }
});

// obtener producto por ID
router.get('/:id', async (req, res) => {
    try {
        const producto = await Product.findById(req.params.id);
        if (!producto) return res.status(404).json({ error: "Juego no encontrado." });
        res.json(producto);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el juego." });
    }
});


//crear nuevo producto
router.post('/', auth, async (req, res) => {
    try {
        const nuevoProducto = new Product(req.body);
        await nuevoProducto.save();
        res.status(201).json({ mensaje: "¡Juego y variables subidos con éxito!", producto: nuevoProducto });
    } catch (error) {
        res.status(400).json({ error: "Error al subir tu producto, revisa los campos", detalle: error.message });
    }
});



// EDITAR un Producto por ID
router.put('/:id', auth, async (req, res) => {
    try {
        const productoActualizado = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { returnDocument: 'after' }
        );
        if (!productoActualizado) {
            return res.status(404).json({ error: "Juego no encontrado." });
        }
        res.json({ mensaje: "¡Precios y paquetes actualizados exitosamente!", producto: productoActualizado });
    } catch (error) {
        res.status(500).json({ error: "Hubo un error al intentar actualizar." });
    }
});

// ELIMINAR un Juego del catálogo completo
router.delete('/:id', auth, async (req, res) => {
    try {
        const productoEliminado = await Product.findByIdAndDelete(req.params.id);
        if (!productoEliminado) {
            return res.status(404).json({ error: "Ups, este juego ya no existe o ya fue borrado." });
        }
        res.json({ mensaje: "¡Juego eliminado de forma permanente de tu catálogo!" });
    } catch (error) {
        res.status(500).json({ error: "Hubo un error al intentar eliminar el juego." });
    }
});
module.exports = router;
