import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Carousel from '../components/Carousel';
import './Home.css';

function Home() {
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const navigate = useNavigate();

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

    const getProductosPorCategoria = (nombreCategoria) => {
        return productos.filter(p => p.categoria === nombreCategoria);
    };

    if (cargando) {
        return (
            <div className="main-content">
                <p className="loading-text">Cargando catálogo...</p>
            </div>
        );
    }

    const scrollToSection = (cat) => {
        const el = document.getElementById(`section-${cat}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const categoriasConProductos = categoriasVisibles.filter(
        cat => getProductosPorCategoria(cat).length > 0
    );

    return (
        <div className="home-container">
            <Helmet>
                <title>GamePin Store - Recargas de Juegos y Gift Cards</title>
                <meta name="description" content="La tienda más rápida para recargar diamantes, robux y pavos con entrega automática. ¡Explora nuestro catálogo!" />
            </Helmet>
            <Carousel />

            {categoriasConProductos.length > 0 && (
                <div className="categories-bar">
                    {categoriasConProductos.map(cat => (
                        <button
                            key={cat}
                            className="category-chip"
                            onClick={() => scrollToSection(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            <div className="home-sections">
                {categoriasVisibles.map(cat => {
                    const productosSeccion = getProductosPorCategoria(cat);
                    
                    if (productosSeccion.length === 0) return null;

                    return (
                        <section key={cat} id={`section-${cat}`} className="category-section" style={{ marginBottom: '60px' }}>
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
