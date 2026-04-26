import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
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

                if (data.paquetes && data.paquetes.length > 0) {
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
        <div className="game-detail-container">
            <Helmet>
                <title>{`Recargar ${juego.juego} - Entrega Inmediata | GamePin Store`}</title>
                <meta name="description" content={`Compra ${juego.juego} al mejor precio. ${juego.descripcion || 'Recargas rápidas y seguras con entrega automática en minutos.'}`} />
                <meta property="og:title" content={`Recargas para ${juego.juego} - GamePin Store`} />
                <meta property="og:description" content={`¡No te quedes sin jugar! Recarga ${juego.juego} de forma rápida y segura aquí.`} />
                {juego.imagenUrl && <meta property="og:image" content={juego.imagenUrl} />}
            </Helmet>

            <button className="btn-back" onClick={() => navigate('/')}>← Volver</button>

            <div className="game-detail-body single-panel card-glass">
                <div className="game-detail-header">
                    {juego.imagenUrl ? (
                        <img src={juego.imagenUrl} alt={juego.juego} className="game-detail-img" />
                    ) : (
                        <div className="game-detail-icon">{juego.juego[0]}</div>
                    )}
                    <div>
                        <h1 className="hero-title-detail">{juego.juego}</h1>
                        <p className="home-subtitle">{juego.descripcion || 'Recarga directa a tu cuenta.'}</p>
                    </div>
                </div>

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
                                            {sinStock && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600 }}>Sin stock</span>}
                                        </div>
                                        <div className="pack-price">
                                            {moneda === 'USD' ? `U$D ${Number(paquete.precioUSD).toFixed(2)}` : `$ ${paquete.precioARS}`}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                    <p style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '10px', textAlign: 'center' }}>
                        * Los precios en pesos argentinos son finales, no tenés que sumarle nada.
                    </p>
                </div>

                {paqueteSeleccionado && (
                    <div className="step-section fade-in">
                        <form className="minimal-uid-form" onSubmit={handleAgregarAlCarrito}>
                            {(juego.camposEntrega && juego.camposEntrega.length > 0) ? (
                                <div className="dynamic-fields-grid">
                                    {juego.camposEntrega.map((campo, idx) => (
                                        <div key={idx} className="input-group-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', textAlign: 'center' }}>
                                                {campo.label} {campo.requerido && <span style={{ color: 'var(--accent)' }}>*</span>}
                                            </label>
                                            {campo.tipo === 'select' ? (
                                                <select
                                                    className="minimal-input"
                                                    value={datosEntrega[campo.label] || ''}
                                                    onChange={(e) => setDatosEntrega({ ...datosEntrega, [campo.label]: e.target.value })}
                                                    required={campo.requerido !== false}
                                                    style={{ appearance: 'auto', background: 'rgba(255,255,255,0.05)' }}
                                                >
                                                    <option value="">Selecciona {campo.label}</option>
                                                    {campo.opciones && campo.opciones.map((opt, i) => (
                                                        <option key={i} value={opt} style={{ background: '#1a1a1a' }}>{opt}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    type={campo.tipo || 'text'}
                                                    className="minimal-input"
                                                    placeholder={campo.placeholder || `Ej: Ingresa tu ${campo.label}`}
                                                    value={datosEntrega[campo.label] || ''}
                                                    onChange={(e) => setDatosEntrega({ ...datosEntrega, [campo.label]: e.target.value })}
                                                    required={campo.requerido !== false}
                                                />
                                            )}
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
                                Agregar • {moneda === 'USD' ? `U$D ${Number(paqueteSeleccionado.precioUSD).toFixed(2)}` : `$ ${paqueteSeleccionado.precioARS}`}
                            </button>

                            {paqueteSeleccionado.bonoDetalle && (
                                <div className="pack-badge fade-in" style={{ width: 'fit-content', margin: '15px auto 10px', fontSize: '0.85rem' }}>
                                    {paqueteSeleccionado.bonoDetalle}
                                </div>
                            )}

                            {juego.descripcionesRegionales?.[regionSeleccionada] && (
                                <div className="package-description-note fade-in">
                                    {juego.descripcionesRegionales[regionSeleccionada]}
                                </div>
                            )}
                        </form>
                    </div>
                )}
            </div>

            {juego.infoExtra && (
                <div className="region-disclaimer fade-in">
                    {juego.infoExtra}
                </div>
            )}
        </div>
    );
}

export default GameDetail;
