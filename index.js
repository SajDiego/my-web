require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const { apiLimiter } = require('./middleware/rateLimit');

const app = express();

// cloud run proxy inverso
app.set('trust proxy', 1);

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
app.use((req, res, next) => {
    if (req.body) req.body = mongoSanitize.sanitize(req.body);
    if (req.params) req.params = mongoSanitize.sanitize(req.params);
    next();
});
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
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/games', require('./routes/games'));
app.use('/api/exchange-rates', require('./routes/exchangeRates'));
app.use('/api/users', require('./routes/users'));

const { loadRates } = require('./utils/exchangeCache');
loadRates();

// Sitemap dinámico con todos los productos
const Product = require('./models/product');
app.get('/sitemap.xml', async (req, res) => {
    try {
        const productos = await Product.find({}, '_id updatedAt').lean();
        const today = new Date().toISOString().split('T')[0];

        const staticUrls = [
            { loc: 'https://gamepin.top/', priority: '1.0', changefreq: 'daily' },
            { loc: 'https://gamepin.top/about', priority: '0.6', changefreq: 'monthly' },
            { loc: 'https://gamepin.top/terms', priority: '0.5', changefreq: 'monthly' },
            { loc: 'https://gamepin.top/privacy', priority: '0.5', changefreq: 'monthly' },
        ];

        const productUrls = productos.map(p => ({
            loc: `https://gamepin.top/product/${p._id}`,
            priority: '0.9',
            changefreq: 'weekly',
            lastmod: p.updatedAt ? p.updatedAt.toISOString().split('T')[0] : today,
        }));

        const allUrls = [...staticUrls, ...productUrls];

        const urlTags = allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod || today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n');

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlTags}
</urlset>`;

        res.setHeader('Content-Type', 'application/xml');
        res.send(xml);
    } catch (err) {
        res.status(500).send('Error generando sitemap');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});