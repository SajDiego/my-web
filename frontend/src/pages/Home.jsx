import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Carousel from '../components/Carousel';
import './Home.css';

function Home() {
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [categoriaActiva, setCategoriaActiva] = useState('Todas');
    const navigate = useNavigate();

    const categorias = ['Todas', 'Recargas Directas', 'Pines', 'PC', 'Consolas'];

    useEffect(() => {
        const obtenerCatalogo = async () => {
            try {
                const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/products`);
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

    const productosFiltrados = Array.isArray(productos) 
        ? (categoriaActiva === 'Todas' ? productos : productos.filter(p => p.categoria === categoriaActiva))
        : [];

    return (
        <div className="main-content">
            {/* Carrusel de Novedades */}
            <Carousel />
            
            {/* Barra de Categorías */}
            <div className="categories-bar">
                {categorias.map(cat => (
                    <button 
                        key={cat} 
                        className={`category-chip ${categoriaActiva === cat ? 'active' : ''}`}
                        onClick={() => setCategoriaActiva(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grilla de juegos */}
            <section style={{ marginTop: '20px' }}>
                <h2 className="section-title">
                    {categoriaActiva === 'Todas' ? 'Catálogo' : categoriaActiva}
                </h2>
                {cargando ? (
                    <p className="loading-text">Cargando catálogo...</p>
                ) : productos.length === 0 ? (
                    <p className="loading-text">No hay productos disponibles.</p>
                ) : (
                    <div className="games-grid">
                        {productosFiltrados.map((juego) => (
                            <div
                                key={juego._id}
                                className="game-card"
                                onClick={() => navigate(`/game/${juego._id}`)}
                            >
                                <div className="game-card-img">
                                    {juego.imagenUrl ? (
                                        <img src={juego.imagenUrl} alt={juego.juego} />
                                    ) : (
                                        <span className="game-card-placeholder">{juego.juego[0]}</span>
                                    )}
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
