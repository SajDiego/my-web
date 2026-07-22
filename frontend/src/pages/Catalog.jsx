import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { TrustBar } from '../components/TrustBar';
import './Catalog.css';

function Catalog() {
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const navigate = useNavigate();

    const categoriasVisibles = ['Todas', 'TopUp', 'Pines', 'PC', 'Consolas'];

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

    const filteredProducts = productos.filter(p => {
        const matchesSearch = p.juego.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todas' || p.categoria === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (cargando) {
        return (
            <div className="main-content">
                <p className="loading-text">Cargando catálogo...</p>
            </div>
        );
    }

    return (
        <div className="catalog-container">
            <Helmet>
                <title>Catálogo | GamePin Store</title>
                <meta name="description" content="Explora todo nuestro catálogo de juegos, recargas y gift cards." />
            </Helmet>

            <div className="catalog-header">
                <h1 className="catalog-title">Nuestro Catálogo</h1>
                
                <div className="catalog-filters">
                    <input 
                        type="text" 
                        className="catalog-search" 
                        placeholder="🔍 Buscar juego o producto..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    
                    <div className="catalog-categories">
                        {categoriasVisibles.map(cat => (
                            <button
                                key={cat}
                                className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="games-grid">
                {filteredProducts.map((juego) => (
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

            {filteredProducts.length === 0 && (
                <div className="no-results">
                    <p>No se encontraron productos que coincidan con tu búsqueda.</p>
                    <button className="btn-action" onClick={() => {setSearchTerm(''); setSelectedCategory('Todas');}}>Limpiar Filtros</button>
                </div>
            )}

            <TrustBar />
        </div>
    );
}

export default Catalog;
