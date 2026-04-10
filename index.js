require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

//middlewares
app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGO_URI, {
    maxPoolSize: 10, // para Google Cloud Run
    serverSelectionTimeoutMS: 5000,
})
    .then(() => console.log('Conectado a MongoDB Atlas'))
    .catch(err => console.error('Error de conexión:', err));

//rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));

//ruta de prueba
app.get('/', (req, res) => {
    res.send('Servidor funcionando');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});