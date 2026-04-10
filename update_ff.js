const mongoose = require('mongoose');
const Product = require('./models/product');

const MONGO_URI = "mongodb://localhost:27017/integralpro";

async function update() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Conectado a la base de datos...");

        const resultado = await Product.findOneAndUpdate(
            { juego: { $regex: /Free Fire/i } },
            { imagenUrl: "https://imgur.com/a/Xl18pUc" },
            { new: true }
        );

        if (resultado) {
            console.log("✅ Imagen actualizada con éxito para:", resultado.juego);
        } else {
            console.log("❌ No se encontró el producto 'Free Fire' en la base de datos.");
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
}

update();
