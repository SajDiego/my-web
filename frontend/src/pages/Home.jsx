import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
    const [searchTerm, setSearchTerm] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const searchResults = useMemo(() => {
        if (!searchTerm.trim() || searchTerm.length < 2) return [];
        return productos
            .filter(p => p.juego.toLowerCase().includes(searchTerm.toLowerCase()))
            .slice(0, 6);
    }, [searchTerm, productos]);

    const handleSearchSelect = useCallback((id) => {
        setSearchTerm('');
        setSearchOpen(false);
        navigate(`/game/${id}`);
    }, [navigate]);

    useEffect(() => {
        const CACHE_KEY = 'gp_products_cache';
        const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

        const obtenerCatalogo = async () => {
            try {
                // Intentar usar cache si está vigente
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    const { data, ts } = JSON.parse(cached);
                    if (Date.now() - ts < CACHE_TTL) {
                        setProductos(data);
                        setCargando(false);
                        return;
                    }
                }
                // Sin cache válido: hacer fetch al backend
                const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/products`);
                const datos = await respuesta.json();
                const lista = Array.isArray(datos) ? datos : [];
                setProductos(lista);
                localStorage.setItem(CACHE_KEY, JSON.stringify({ data: lista, ts: Date.now() }));
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
            { juegoKey: ['free fire'], paqueteKeys: ['1060', '1166'], titulo: '1166 Diamantes' },
            { juegoKey: ['mobile legends', 'mlbb'], paqueteKeys: ['500+75', '500+70', '575', '500'], titulo: '575 Diamantes' },
            { juegoKey: ['call of duty', 'cod', 'codm'], paqueteKeys: ['420'], titulo: '420 CP' },
            { juegoKey: ['stumble guys', 'stumble'], paqueteKeys: ['1600', 'gems'], titulo: '1600 Gemas' }
        ];

        const destacados = [];

        conf.forEach(c => {
            const juego = productos.find(p => c.juegoKey.some(key => p.juego.toLowerCase().includes(key)));
            if (juego) {
                let paquete = null;
                const keys = c.paqueteKeys || (c.paqueteKey ? [c.paqueteKey] : []);
                for (const k of keys) {
                    paquete = juego.paquetes?.find(p => p.nombre.toLowerCase().includes(k.toLowerCase()));
                    if (paquete) break;
                }

                const fallbackUsado = !paquete;
                if (!paquete && juego.paquetes?.length > 0) {
                    paquete = juego.paquetes[0];
                }
                if (paquete) {
                    destacados.push({
                        juego: juego,
                        paquete: paquete,
                        titulo: fallbackUsado ? paquete.nombre : (c.titulo || paquete.nombre)
                    });
                }
            }
        });

        return destacados;
    }, [productos]);

    const marqueeItems = useMemo(() => {
        if (!productosDestacados || productosDestacados.length === 0) return [];
        let items = [...productosDestacados];
        while (items.length < 8) {
            items = [...items, ...productosDestacados];
        }
        return [...items, ...items];
    }, [productosDestacados]);

    if (cargando) {
        return (
            <div className="main-content">
                <p className="loading-text">Cargando catálogo...</p>
            </div>
        );
    }

    const obtenerRegion = (juego) => {
        if (juego.region) return juego.region;
        if (juego.paquetes && juego.paquetes.length > 0) {
            const unique = [...new Set(juego.paquetes.map(p => p.region).filter(Boolean))];
            if (unique.length > 0) return unique.join(' / ');
        }
        return 'Global';
    };

    const masVendidos = productos.filter(p => p.isBestSeller).slice(0, 8);
    const nuevosLanzamientos = productos.filter(p => p.isNewRelease).slice(0, 8);

    return (
        <div className="home-container">
            <Helmet>
                <title>GamePin Store - Recargas de Juegos y Gift Cards</title>
                <meta name="description" content="La tienda más rápida para recargar diamantes, robux y pavos con entrega automática. ¡Explora nuestro catálogo!" />
                <meta name="keywords" content="recargas free fire, diamantes free fire baratos, robux argentina, recargas de juegos, free fire topup latam, gamepin store, mobile legends diamantes" />
                <link rel="canonical" href="https://gamepin.top/" />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://gamepin.top/" />
                <meta property="og:title" content="GamePin Store - Recargas de Juegos y Gift Cards" />
                <meta property="og:description" content="La tienda más rápida para recargar diamantes, robux y pavos con entrega automática." />
                <meta property="og:image" content="https://gamepin.top/logo.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="GamePin Store - Recargas de Juegos" />
                <meta name="twitter:description" content="La tienda más rápida para recargar diamantes, robux y pavos con entrega automática." />
                <meta name="twitter:image" content="https://gamepin.top/logo.png" />
            </Helmet>
            <Carousel />

            {/* Buscador */}
            <div className="home-search-wrapper" ref={searchRef}>
                <div className="home-search-bar">
                    <span className="home-search-icon">🔍</span>
                    <input
                        id="home-search-input"
                        type="text"
                        className="home-search-input"
                        placeholder="Buscar juego o recarga..."
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setSearchOpen(true); }}
                        onFocus={() => setSearchOpen(true)}
                        autoComplete="off"
                    />
                    {searchTerm && (
                        <button className="home-search-clear" onClick={() => { setSearchTerm(''); setSearchOpen(false); }}>✕</button>
                    )}
                </div>
                {searchOpen && searchResults.length > 0 && (
                    <div className="home-search-dropdown">
                        {searchResults.map(juego => (
                            <div
                                key={juego._id}
                                className="home-search-result"
                                onClick={() => handleSearchSelect(juego._id)}
                            >
                                {juego.imagenUrl && (
                                    <img src={juego.imagenUrl} alt={juego.juego} className="home-search-result-img" />
                                )}
                                <span className="home-search-result-name">{juego.juego}</span>
                                <span className="home-search-result-arrow">→</span>
                            </div>
                        ))}
                        <div className="home-search-see-all" onClick={() => { navigate('/catalogo'); setSearchOpen(false); }}>
                            Ver todos los resultados en el catálogo →
                        </div>
                    </div>
                )}
                {searchOpen && searchTerm.length >= 2 && searchResults.length === 0 && (
                    <div className="home-search-dropdown">
                        <div className="home-search-empty">No se encontraron juegos para "{searchTerm}"</div>
                    </div>
                )}
            </div>

            <div className="home-sections" style={{ marginTop: '40px' }}>
                {productosDestacados.length > 0 && (
                    <section className="category-section featured-marquee-section" style={{ marginBottom: '60px' }}>
                        <div className="section-header" style={{ marginBottom: '20px' }}>
                            <h2 className="section-title" style={{ margin: 0, color: '#facc15' }}>Productos Destacados</h2>
                        </div>
                        <div className="featured-marquee-wrapper">
                            <div className="featured-marquee-track">
                                {marqueeItems.map((item, index) => {
                                    const precioCalculadoValue = getPrecioCalculado(item.paquete);
                                    const precioFinal = formatPrice(precioCalculadoValue);

                                    return (
                                        <div
                                            key={`${item.juego._id}-${item.paquete._id}-${index}`}
                                            className="featured-product-card"
                                            onClick={() => navigate(`/game/${item.juego._id}`, {
                                                state: { paqueteId: item.paquete._id, region: item.paquete.region }
                                            })}
                                        >
                                            <div className="fp-image-container">
                                                {item.juego.imagenUrl ? (
                                                    <img src={item.juego.imagenUrl} alt={item.juego.juego} loading="lazy" />
                                                ) : (
                                                    <div className="fp-placeholder">{item.juego.juego[0]}</div>
                                                )}
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
                        </div>
                    </section>
                )}
                {masVendidos.length > 0 && (
                    <section className="category-section section-best-sellers" style={{ marginBottom: '60px' }}>
                        <div className="section-header" style={{ marginBottom: '25px' }}>
                            <h2 className="section-title" style={{ margin: 0, color: 'var(--accent)' }}>Más Vendidos</h2>
                        </div>
                        <div className="products-horizontal-grid">
                            {masVendidos.map((juego) => {
                                const region = obtenerRegion(juego);
                                return (
                                    <div
                                        key={juego._id}
                                        className="product-horizontal-card"
                                        onClick={() => navigate(`/game/${juego._id}`)}
                                    >
                                        <div className="ph-image-container">
                                            {juego.imagenUrl ? (
                                                <img src={juego.imagenUrl} alt={juego.juego} loading="lazy" />
                                            ) : (
                                                <div className="ph-placeholder">{juego.juego[0]}</div>
                                            )}
                                        </div>
                                        <div className="ph-info">
                                            <h3 className="ph-name" title={juego.juego}>{juego.juego}</h3>
                                            <p className="ph-region" title={region}>{region}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="section-view-all-container">
                            <button
                                className="btn-view-all-catalog"
                                onClick={() => navigate('/catalogo')}
                            >
                                <span>Ver Catálogo Completo</span>
                                <span className="view-all-arrow">→</span>
                            </button>
                        </div>
                    </section>
                )}

                {nuevosLanzamientos.length > 0 && (
                    <section className="category-section section-new-releases" style={{ marginBottom: '60px' }}>
                        <div className="section-header" style={{ marginBottom: '25px' }}>
                            <h2 className="section-title" style={{ margin: 0, color: '#38bdf8' }}>Nuevos Lanzamientos</h2>
                        </div>
                        <div className="products-horizontal-grid">
                            {nuevosLanzamientos.map((juego) => {
                                const region = obtenerRegion(juego);
                                return (
                                    <div
                                        key={juego._id}
                                        className="product-horizontal-card"
                                        onClick={() => navigate(`/game/${juego._id}`)}
                                    >
                                        <div className="ph-image-container">
                                            {juego.imagenUrl ? (
                                                <img src={juego.imagenUrl} alt={juego.juego} loading="lazy" />
                                            ) : (
                                                <div className="ph-placeholder">{juego.juego[0]}</div>
                                            )}
                                        </div>
                                        <div className="ph-info">
                                            <h3 className="ph-name" title={juego.juego}>{juego.juego}</h3>
                                            <p className="ph-region" title={region}>{region}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="section-view-all-container">
                            <button
                                className="btn-view-all-catalog"
                                onClick={() => navigate('/catalogo')}
                            >
                                <span>Ver Catálogo Completo</span>
                                <span className="view-all-arrow">→</span>
                            </button>
                        </div>
                    </section>
                )}

            </div>

            <TrustBar />
        </div>
    );
}

export default Home;
