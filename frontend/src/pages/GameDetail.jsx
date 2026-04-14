import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './GameDetail.css';

function GameDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { agregarAlCarrito, moneda } = useCart();

    const [juego, setJuego] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [paqueteSeleccionado, setPaqueteSeleccionado] = useState(null);
    const [regionSeleccionada, setRegionSeleccionada] = useState('');
    const [datosEntrega, setDatosEntrega] = useState({});
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        const cargarJuego = async () => {
            try {
                const resp = await fetch(`${import.meta.env.VITE_API_URL}/products/${id}`);
                const data = await resp.json();
                setJuego(data);
                
                if(data.paquetes && data.paquetes.length > 0) {
                    const uniqueRegions = [...new Set(data.paquetes.map(p => p.region || 'Global'))];
                    setRegionSeleccionada(uniqueRegions[0]);
                }
            } catch (error) {
                console.error("Error cargando el juego:", error);
            } finally {
                setCargando(false);
            }
        };
        cargarJuego();
    }, [id]);

    const handleAgregarAlCarrito = (e) => {
        e.preventDefault();
        if (!paqueteSeleccionado) {
            setMensaje('Selecciona un paquete primero.');
            return;
        }

        const camposRequeridos = (juego.camposEntrega || []).filter(c => c.requerido);
        for (const campo of camposRequeridos) {
            if (!datosEntrega[campo.label] || datosEntrega[campo.label].trim() === '') {
                setMensaje(`El campo "${campo.label}" es requerido.`);
                return;
            }
        }

        const primerCampo = juego.camposEntrega && juego.camposEntrega.length > 0 ? juego.camposEntrega[0].label : 'UID';
        agregarAlCarrito({
            juegoNombre: juego.juego,
            paqueteElegido: paqueteSeleccionado.nombre,
            precioARS: paqueteSeleccionado.precioARS,
            precioUSD: paqueteSeleccionado.precioUSD,
            uidJugador: datosEntrega[primerCampo] || '',
            regionJugador: regionSeleccionada,
            datosEntrega: { ...datosEntrega },
            tipoDatoEntrega: primerCampo
        });
        setMensaje('¡Agregado al carrito!');
        setDatosEntrega({});
        setPaqueteSeleccionado(null);
    };

    if (cargando) return <div className="main-content"><p className="loading-text">Cargando...</p></div>;
    if (!juego) return <div className="main-content"><p className="loading-text">Juego no encontrado.</p></div>;

    return (
        <div className="main-content">
            <button className="btn-back" onClick={() => navigate('/')}>← Volver</button>

            <div className="game-detail-header">
                {juego.imagenUrl ? (
                    <img src={juego.imagenUrl} alt={juego.juego} className="game-detail-img" />
                ) : (
                    <div className="game-detail-icon">{juego.juego[0]}</div>
                )}
                <div>
                    <h1 className="hero-title" style={{ fontSize: '2rem', textAlign: 'left' }}>{juego.juego}</h1>
                    <p className="home-subtitle">{juego.descripcion || 'Recarga directa a tu cuenta.'}</p>
                </div>
            </div>

            <div className="game-detail-body single-panel card-glass">
                <div className="step-section">
                    <h3 className="minimal-step-title">1. Elige tu recarga</h3>
                    
                    {juego.paquetes && [...new Set(juego.paquetes.map(p => p.region || 'Global'))].length > 1 && (
                        <div className="region-selector-container" style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {[...new Set(juego.paquetes.map(p => p.region || 'Global'))].map(reg => (
                                <button
                                    key={reg}
                                    type="button"
                                    className={`region-chip ${regionSeleccionada === reg ? 'active' : ''}`}
                                    onClick={() => {
                                        setRegionSeleccionada(reg);
                                        setPaqueteSeleccionado(null);
                                    }}
                                >
                                    {reg}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="package-grid">
                        {juego.paquetes
                            .filter(p => (p.region || 'Global') === regionSeleccionada)
                            .map((paquete) => {
                                const sinStock = paquete.stock !== null && paquete.stock !== undefined && paquete.stock <= 0;
                                return (
                                    <div
                                        key={paquete._id}
                                        className={`package-minimal-item ${paqueteSeleccionado?._id === paquete._id ? 'active' : ''} ${sinStock ? 'out-of-stock' : ''}`}
                                        onClick={() => { if (!sinStock) { setPaqueteSeleccionado(paquete); setMensaje(''); } }}
                                        style={sinStock ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                                    >
                                        <div className="pack-info">
                                            <span className="pack-name">{paquete.nombre}</span>
                                            {paquete.bonoDetalle && <span className="pack-badge">{paquete.bonoDetalle}</span>}
                                            {sinStock && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600 }}>Sin stock</span>}
                                        </div>
                                        <div className="pack-price">
                                            {moneda === 'USD' ? `U$D ${paquete.precioUSD}` : `$ ${paquete.precioARS}`}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>

                {paqueteSeleccionado && (
                    <div className="step-section fade-in">
                        <hr className="minimal-divider" />
                        <h3 className="minimal-step-title">2. Datos de entrega</h3>
                        
                        <form className="minimal-uid-form" onSubmit={handleAgregarAlCarrito}>
                            {(juego.camposEntrega && juego.camposEntrega.length > 0) ? (
                                <div className="dynamic-fields-grid">
                                    {juego.camposEntrega.map((campo, idx) => (
                                        <div key={idx} className="input-group-col" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                                            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '5px', marginLeft: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {campo.label} {campo.requerido && <span style={{color: 'var(--accent)'}}>*</span>}
                                            </label>
                                            <input
                                                type={campo.tipo || 'text'}
                                                className="minimal-input"
                                                placeholder={campo.placeholder || `Ej: Ingresa tu ${campo.label}`}
                                                value={datosEntrega[campo.label] || ''}
                                                onChange={(e) => setDatosEntrega({ ...datosEntrega, [campo.label]: e.target.value })}
                                                required={campo.requerido !== false}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="input-group-row">
                                    <input type="text" className="minimal-input" placeholder="UID del Jugador" value={datosEntrega['UID'] || ''} onChange={(e) => setDatosEntrega({ ...datosEntrega, UID: e.target.value })} required />
                                </div>
                            )}

                            {mensaje && (
                                <p className={mensaje.includes('!') ? 'order-success fade-in' : 'error-msg fade-in'}>{mensaje}</p>
                            )}

                            <button type="submit" className="btn-select btn-minimal-submit">
                                Agregar al Carrito ( {moneda === 'USD' ? `U$D ${paqueteSeleccionado.precioUSD}` : `$ ${paqueteSeleccionado.precioARS}`} )
                            </button>

                            {paqueteSeleccionado.descripcion && (
                                <div className="package-description-note fade-in">
                                    {paqueteSeleccionado.descripcion}
                                </div>
                            )}
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

export default GameDetail;
