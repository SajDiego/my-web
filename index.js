require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const { apiLimiter } = require('./middleware/rateLimit');

const app = express();

const origenesPermitidos = [
    'https://gamepin.top',
    'https://www.gamepin.top',
    'http://localhost:5173',
    'http://localhost:3000'
];

app.use(helmet());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || origenesPermitidos.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(mongoSanitize());
app.use('/api/', apiLimiter);

mongoose.connect(process.env.MONGO_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
})
    .then(() => console.log('Conectado a MongoDB Atlas'))
    .catch(err => console.error('Error de conexión:', err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/banners', require('./routes/banners'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});