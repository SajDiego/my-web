import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Carousel from '../components/Carousel';

function Home() {
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const obtenerCatalogo = async () => {
            try {
                const respuesta = await fetch('http://localhost:3000/api/products');
                const datos = await respuesta.json();
                setProductos(datos);
            } catch (error) {
                console.error("Error en la comunicación:", error);
            } finally {
                setCargando(false);
            }
        };
        obtenerCatalogo();
    }, []);

    return (
        <div className="main-content">
            {/* Carrusel de Novedades */}
            <Carousel />

            {/* Grilla de juegos */}
            <section>
                <h2 className="section-title">Catálogo</h2>
                {cargando ? (
                    <p className="loading-text">Cargando catálogo...</p>
                ) : productos.length === 0 ? (
                    <p className="loading-text">No hay productos disponibles.</p>
                ) : (
                    <div className="games-grid">
                        {productos.map((juego) => (
                            <div
                                key={juego._id}
                                className="game-card"
                                onClick={() => navigate(`/game/${juego._id}`)}
                            >
                                <div className="game-card-img">
                                    <span className="game-card-placeholder">{juego.juego[0]}</span>
                                </div>
                                <p className="game-card-name">{juego.juego}</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Home;
