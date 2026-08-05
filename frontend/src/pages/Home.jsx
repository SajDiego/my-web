import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Carousel from '../components/Carousel';
import { TrustBar } from '../components/TrustBar';
import { useCart } from '../context/CartContext';
import './Home.css';

function Home() {
    const { getPrecioCalculado, formatPrice } = useCart();
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const navigate = useNavigate();

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

    const productosDestacados = useMemo(() => {
        if (!productos || productos.length === 0) return [];
        
        const conf = [
            { juegoKey: ['free fire'], paqueteKey: '1166', titulo: '1166 Diamantes' },
            { juegoKey: ['mobile legends', 'mlbb'], paqueteKey: '575', titulo: '575 Diamantes' },
            { juegoKey: ['call of duty', 'cod', 'codm'], paqueteKey: '420', titulo: '420 CP' },
            { juegoKey: ['stumble guys', 'stumble'], paqueteKey: '', titulo: 'Recarga Stumble Guys' }
        ];

        const destacados = [];

        conf.forEach(c => {
            const juego = productos.find(p => c.juegoKey.some(key => p.juego.toLowerCase().includes(key)));
            if (juego) {
                let paquete = null;
                if (c.paqueteKey) {
                    paquete = juego.paquetes?.find(p => p.nombre.toLowerCase().includes(c.paqueteKey));
                }
                if (!paquete && juego.paquetes?.length > 0) {
                    paquete = juego.paquetes[0];
                }
                if (paquete) {
                    destacados.push({
                        juego: juego,
                        paquete: paquete,
                        titulo: c.titulo
                    });
                }
            }
        });

        return destacados;
    }, [productos]);

    if (cargando) {
        return (
            <div className="main-content">
                <p className="loading-text">Cargando catálogo...</p>
            </div>
        );
    }

    const masVendidos = productos.filter(p => p.isBestSeller).slice(0, 4);
    const nuevosLanzamientos = productos.filter(p => p.isNewRelease).slice(0, 4);

    return (
        <div className="home-container">
            <Helmet>
                <title>GamePin Store - Recargas de Juegos y Gift Cards</title>
                <meta name="description" content="La tienda más rápida para recargar diamantes, robux y pavos con entrega automática. ¡Explora nuestro catálogo!" />
                <meta name="keywords" content="recargas free fire, diamantes free fire baratos, robux argentina, recargas de juegos, free fire topup latam, gamepin store" />
            </Helmet>
            <Carousel />

            <TrustBar />

            <div className="home-sections" style={{ marginTop: '40px' }}>
                {productosDestacados.length > 0 && (
                    <section className="category-section" style={{ marginBottom: '60px' }}>
                        <div className="section-header" style={{ marginBottom: '25px' }}>
                            <h2 className="section-title" style={{ margin: 0, color: '#facc15' }}>Productos Destacados</h2>
                        </div>
                        <div className="featured-products-grid">
                            {productosDestacados.map((item, index) => {
                                const precioCalculadoValue = getPrecioCalculado(item.paquete);
                                const precioFinal = formatPrice(precioCalculadoValue);

                                return (
                                    <div key={index} className="featured-product-card" onClick={() => navigate(`/game/${item.juego._id}`)}>
                                        <div className="fp-image-container">
                                            {item.juego.imagenUrl ? <img src={item.juego.imagenUrl} alt={item.juego.juego} loading="lazy" /> : <div className="fp-placeholder">{item.juego.juego[0]}</div>}
                                        </div>
                                        <div className="fp-info">
                                            <h3 className="fp-title">{item.titulo}</h3>
                                            <p className="fp-game">{item.juego.juego}</p>
                                            <div className="fp-price">{precioFinal}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}
                {masVendidos.length > 0 && (
                    <section className="category-section" style={{ marginBottom: '60px' }}>
                        <div className="section-header" style={{ marginBottom: '25px' }}>
                            <h2 className="section-title" style={{ margin: 0, color: 'var(--accent)' }}>Más Vendidos</h2>
                        </div>
                        <div className="games-horizontal-scroll">
                            {masVendidos.map((juego) => (
                                <div key={juego._id} className="game-card" onClick={() => navigate(`/game/${juego._id}`)}>
                                    <div className="game-card-img">
                                        {juego.imagenUrl ? <img src={juego.imagenUrl} alt={juego.juego} loading="lazy" /> : <span className="game-card-placeholder">{juego.juego[0]}</span>}
                                    </div>
                                    <p className="game-card-name">{juego.juego}</p>
                                </div>
                            ))}
                            {/* 5ta tarjeta: Ver catálogo */}
                            <div className="game-card view-all-card" onClick={() => navigate('/catalogo')}>
                                <div className="game-card-img view-all-img">
                                    <span className="view-all-icon">→</span>
                                </div>
                                <p className="game-card-name" style={{ color: 'var(--accent)' }}>Ver Catálogo</p>
                            </div>
                        </div>
                    </section>
                )}

                {nuevosLanzamientos.length > 0 && (
                    <section className="category-section" style={{ marginBottom: '60px' }}>
                        <div className="section-header" style={{ marginBottom: '25px' }}>
                            <h2 className="section-title" style={{ margin: 0, color: '#38bdf8' }}>Nuevos Lanzamientos</h2>
                        </div>
                        <div className="games-horizontal-scroll">
                            {nuevosLanzamientos.map((juego) => (
                                <div key={juego._id} className="game-card" onClick={() => navigate(`/game/${juego._id}`)}>
                                    <div className="game-card-img">
                                        {juego.imagenUrl ? <img src={juego.imagenUrl} alt={juego.juego} loading="lazy" /> : <span className="game-card-placeholder">{juego.juego[0]}</span>}
                                    </div>
                                    <p className="game-card-name">{juego.juego}</p>
                                </div>
                            ))}
                            {/*  tarjeta: Ver catálogo */}
                            <div className="game-card view-all-card" onClick={() => navigate('/catalogo')}>
                                <div className="game-card-img view-all-img">
                                    <span className="view-all-icon">→</span>
                                </div>
                                <p className="game-card-name" style={{ color: '#38bdf8' }}>Ver Catálogo</p>
                            </div>
                        </div>
                    </section>
                )}

            </div>
        </div>
    );
}

export default Home;
