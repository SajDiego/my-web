import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../context/CartContext';
import { TrustBar } from '../components/TrustBar';
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
    const [validando, setValidando] = useState(false);
    const [nicknameValidado, setNicknameValidado] = useState('');

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

    const nombreJuego = juego?.juego?.toLowerCase() || '';
    const isMobileLegends = nombreJuego.includes('mobile legends');
    const isFreeFire = nombreJuego.includes('free fire') || nombreJuego.includes('freefire');
    const mostrarVerificar = (isMobileLegends || isFreeFire) && regionSeleccionada !== 'Indonesia';

    const handleValidarJugador = async () => {
        // Free Fire solo necesita ID, Mobile Legends necesita ID y Server
        if (!datosEntrega['ID']) {
            setMensaje('Por favor ingresa tu ID para validar.');
            return;
        }
        if (isMobileLegends && !datosEntrega['Server']) {
            setMensaje('Por favor ingresa ID y Server para validar.');
            return;
        }

        setValidando(true);
        setMensaje('');
        setNicknameValidado('');

        try {
            const body = {
                code: isFreeFire ? 'freefire' : 'mlbb',
                playerId: datosEntrega['ID'],
            };
            if (!isFreeFire) {
                body.serverId = datosEntrega['Server'];
            }

            const resp = await fetch(`${import.meta.env.VITE_API_URL}/games/validate-player`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await resp.json();
            
            if (resp.ok && data.nickname) {
                setNicknameValidado(data.nickname);
                setMensaje(''); // Solo se muestra el ✓ Nickname arriba, sin texto extra
            } else {
                setMensaje(data.error || 'ID incorrecto o jugador no encontrado.');
            }
        } catch (error) {
            console.error('Error al validar:', error);
            setMensaje('Hubo un error al validar el jugador.');
        } finally {
            setValidando(false);
        }
    };

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
            precioARSDescuento: paqueteSeleccionado.precioARSDescuento ?? null,
            precioUSDDescuento: paqueteSeleccionado.precioUSDDescuento ?? null,
            uidJugador: datosEntrega[primerCampo] || '',
            regionJugador: regionSeleccionada,
            datosEntrega: { ...datosEntrega },
            tipoDatoEntrega: primerCampo
        });
        setMensaje('¡Agregado al carrito!');
        setDatosEntrega({});
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
                            .map((paquete, index) => {
                                const sinStock = paquete.stock !== null && paquete.stock !== undefined && paquete.stock <= 0;

                                // Determinar precios normales y con descuento
                                const precioNormal = moneda === 'USD'
                                    ? `U$D ${Number(paquete.precioUSD).toFixed(2)}`
                                    : `$ ${Math.round(Number(paquete.precioARS))}`;

                                const tieneDescuento = moneda === 'USD'
                                    ? (paquete.precioUSDDescuento != null && paquete.precioUSDDescuento > 0)
                                    : (paquete.precioARSDescuento != null && paquete.precioARSDescuento > 0);

                                const precioDescuento = moneda === 'USD'
                                    ? `U$D ${Number(paquete.precioUSDDescuento).toFixed(2)}`
                                    : `$ ${Math.round(Number(paquete.precioARSDescuento))}`;

                                // Calcular porcentaje de descuento
                                const pctDescuento = tieneDescuento
                                    ? Math.round((1 - (moneda === 'USD'
                                        ? Number(paquete.precioUSDDescuento) / Number(paquete.precioUSD)
                                        : Number(paquete.precioARSDescuento) / Number(paquete.precioARS))) * 100)
                                    : 0;

                                return (
                                    <div
                                        key={`${paquete._id}-${index}`}
                                        className={`package-minimal-item ${paqueteSeleccionado === paquete ? 'active' : ''} ${sinStock ? 'out-of-stock' : ''}`}
                                        onClick={() => { if (!sinStock) { setPaqueteSeleccionado(paquete); setMensaje(''); } }}
                                        style={sinStock ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                                    >
                                        {tieneDescuento && (
                                            <span className="discount-badge">-{pctDescuento}% OFF</span>
                                        )}
                                        <div className="pack-info">
                                            <span className="pack-name">{paquete.nombre}</span>
                                            {sinStock && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600 }}>Sin stock</span>}
                                        </div>
                                        <div className="pack-price">
                                            {tieneDescuento ? (
                                                <>
                                                    <span style={{ textDecoration: 'line-through', opacity: 0.5, fontSize: '0.8rem', display: 'block', lineHeight: 1 }}>{precioNormal}</span>
                                                    <span>{precioDescuento}</span>
                                                </>
                                            ) : (
                                                precioNormal
                                            )}
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

                            {mostrarVerificar && paqueteSeleccionado && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '15px', marginTop: '10px' }}>
                                    <button 
                                        type="button" 
                                        className="btn-select" 
                                        onClick={handleValidarJugador}
                                        disabled={validando}
                                        style={{ background: '#3b82f6', color: '#fff', width: 'auto', padding: '8px 20px', fontSize: '0.9rem', marginBottom: '5px' }}
                                    >
                                        {validando ? 'Verificando...' : 'Verificar ID'} <span style={{ fontSize: '0.75rem', opacity: 0.6, fontWeight: 'normal' }}>(opcional)</span>
                                    </button>
                                    {nicknameValidado && <span style={{ color: '#22c55e', fontSize: '0.9rem', fontWeight: 'bold' }}>✓ Nickname: {nicknameValidado}</span>}
                                </div>
                            )}

                            {mensaje && (
                                <div className={mensaje === '¡Agregado al carrito!' ? 'order-success fade-in' : (mensaje.includes('Jugador') ? 'success-msg fade-in' : 'error-msg fade-in')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                                    <span style={{ color: mensaje.includes('Jugador') ? '#22c55e' : 'inherit' }}>{mensaje}</span>
                                    {mensaje === '¡Agregado al carrito!' && (
                                        <button type="button" className="btn-select" style={{ background: '#22c55e', color: '#fff', width: 'auto', padding: '10px 25px', fontSize: '1rem', fontWeight: 'bold' }} onClick={() => navigate('/cart')}>
                                            Ir al Carrito 🛒
                                        </button>
                                    )}
                                </div>
                            )}

                            {mensaje !== '¡Agregado al carrito!' && (
                                <button type="submit" className="btn-select btn-minimal-submit">
                                    {(() => {
                                        const tieneDescuento = moneda === 'USD'
                                            ? (paqueteSeleccionado.precioUSDDescuento != null && paqueteSeleccionado.precioUSDDescuento > 0)
                                            : (paqueteSeleccionado.precioARSDescuento != null && paqueteSeleccionado.precioARSDescuento > 0);
                                        const precio = tieneDescuento
                                            ? (moneda === 'USD' ? `U$D ${Number(paqueteSeleccionado.precioUSDDescuento).toFixed(2)}` : `$ ${Math.round(Number(paqueteSeleccionado.precioARSDescuento))}`)
                                            : (moneda === 'USD' ? `U$D ${Number(paqueteSeleccionado.precioUSD).toFixed(2)}` : `$ ${Math.round(Number(paqueteSeleccionado.precioARS))}`);
                                        return `Agregar • ${precio}`;
                                    })()}
                                </button>
                            )}

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

            <TrustBar />
        </div>
    );
}

export default GameDetail;
