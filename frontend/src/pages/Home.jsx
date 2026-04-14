import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Carousel from '../components/Carousel';
import './Home.css';

function Home() {
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const navigate = useNavigate();

    // Orden de categorías deseado por el usuario
    const categoriasVisibles = ['TopUp', 'Pines', 'PC', 'Consolas'];

    useEffect(() => {
        const obtenerCatalogo = async () => {
            try {
                const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/products`);
                const datos = await respuesta.json();
                setProductos(Array.isArray(datos) ? datos : []);
            } catch (error) {
                console.error("Error en la comunicación:", error);
            } finally {
                setCargando(false);
            }
        };
        obtenerCatalogo();
    }, []);

    // Función para obtener productos por categoría (con mapeo de nombres)
    const getProductosPorCategoria = (nombreCategoria) => {
        const catReal = nombreCategoria === 'TopUp' ? 'Recargas Directas' : nombreCategoria;
        return productos.filter(p => p.categoria === catReal);
    };

    if (cargando) {
        return (
            <div className="main-content">
                <p className="loading-text">Cargando catálogo...</p>
            </div>
        );
    }

    return (
        <div className="main-content">
            {/* Carrusel de Novedades */}
            <Carousel />

            {/* Renderizado de Secciones por Categoría */}
            <div className="home-sections">
                {categoriasVisibles.map(cat => {
                    const productosSeccion = getProductosPorCategoria(cat);
                    
                    // Si no hay productos en esta categoría, no mostramos la sección
                    if (productosSeccion.length === 0) return null;

                    return (
                        <section key={cat} className="category-section" style={{ marginBottom: '60px' }}>
                            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                <h2 className="section-title" style={{ margin: 0 }}>{cat}</h2>
                                <span className="cat-count" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    {productosSeccion.length} {productosSeccion.length === 1 ? 'Producto' : 'Productos'}
                                </span>
                            </div>

                            <div className="games-grid">
                                {productosSeccion.map((juego) => (
                                    <div
                                        key={juego._id}
                                        className="game-card"
                                        onClick={() => navigate(`/game/${juego._id}`)}
                                    >
                                        <div className="game-card-img">
                                            {juego.imagenUrl ? (
                                                <img src={juego.imagenUrl} alt={juego.juego} loading="lazy" />
                                            ) : (
                                                <span className="game-card-placeholder">{juego.juego[0]}</span>
                                            )}
                                        </div>
                                        <p className="game-card-name">{juego.juego}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    );
                })}

                {productos.length === 0 && !cargando && (
                    <p className="loading-text">No hay productos disponibles actualmente.</p>
                )}
            </div>
        </div>
    );
}

export default Home;
