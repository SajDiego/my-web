require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

//middlewares
app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado a MongoDB Atlas'))
    .catch(err => console.error('Error de conexión:', err));


app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));

//ruta de prueba
app.get('/', (req, res) => {
    res.send('Servidor funcionando');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});