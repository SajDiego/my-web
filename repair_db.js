const mongoose = require('mongoose');
require('dotenv').config();

async function repair() {
    try {
        console.log('Conectando a MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Conectado a la base de datos:', mongoose.connection.name);

        const UserSchema = new mongoose.Schema({ email: String, rol: String }, { strict: false });
        const User = mongoose.models.User || mongoose.model('User', UserSchema);

        const email = 'sajdiego@yahoo.com.ar';
        const user = await User.findOneAndUpdate(
            { email: email },
            { rol: 'admin' },
            { new: true }
        );

        if (user) {
            console.log(`✅ Rol de administrador restaurado para: ${user.email}`);
        } else {
            console.log(`❌ No se encontró ningún usuario con el correo: ${email}`);
        }

        const ProductSchema = new mongoose.Schema({ juego: String, imagenUrl: String }, { strict: false });
        const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
        const products = await Product.find();
        console.log(`📦 Productos encontrados en DB: ${products.length}`);
        products.forEach(p => console.log(` - ${p.juego}: ${p.imagenUrl}`));

        process.exit(0);
    } catch (err) {
        console.error('🔴 Error en la reparación:', err);
        process.exit(1);
    }
}

repair();
