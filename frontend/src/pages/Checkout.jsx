import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../context/CartContext';
import { metodosPorMoneda } from '../data/paymentConfig';
import CheckoutSuccess from '../components/CheckoutSuccess';
import './Checkout.css';

function Checkout() {
    const { carrito, moneda, totalCarrito, vaciarCarrito, getPrecioNormal, getPrecioCalculado, formatPrice } = useCart();
    const navigate = useNavigate();

    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [metodoPago, setMetodoPago] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState('');
    const [exito, setExito] = useState(false);
    const [montoFinal, setMontoFinal] = useState(0);

    const [codigoCupon, setCodigoCupon] = useState('');
    const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(0);
    const [restriccionesCupon, setRestriccionesCupon] = useState(null);
    const [mensajeCupon, setMensajeCupon] = useState('');
    const [validandoCupon, setValidandoCupon] = useState(false);

    const [usuarioLogueado, setUsuarioLogueado] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const resp = await fetch(`${import.meta.env.VITE_API_URL}/auth/perfil`, {
                    headers: { 'x-auth-token': token }
                });
                if (resp.ok) {
                    const data = await resp.json();
                    setUsuarioLogueado(data);
                    setNombre(data.nombre || '');
                    setEmail(data.email || '');
                    setWhatsapp(data.whatsapp || '');
                }
            } catch (err) {
                console.error("Error al precargar datos del perfil:", err);
            }
        };

        fetchUserProfile();
    }, []);

    const metodos = [...(metodosPorMoneda[moneda] || [])];
    // La billetera se muestra para todos en monedas no-ARS (el panel interno maneja invitados y moneda incorrecta)
    if (moneda !== 'ARS' && !metodos.includes('Mi Saldo')) {
        metodos.push('Mi Saldo');
    }
    
    let totalFinalCalc = carrito.reduce((acc, item) => {
        let precioItem = getPrecioCalculado(item);
        
        if (descuentoPorcentaje > 0 && restriccionesCupon) {
            const cumpleJuego = !restriccionesCupon.juegoRestringido || item.juegoNombre.toLowerCase() === restriccionesCupon.juegoRestringido.toLowerCase();
            const cumpleRegion = !restriccionesCupon.regionRestringida || (item.regionJugador || '').toLowerCase() === restriccionesCupon.regionRestringida.toLowerCase();
            const cumplePaquete = !restriccionesCupon.paqueteRestringido || item.paqueteElegido.toLowerCase() === restriccionesCupon.paqueteRestringido.toLowerCase();

            if (cumpleJuego && cumpleRegion && cumplePaquete) {
                return acc + (precioItem * (1 - descuentoPorcentaje / 100));
            }
        }
        return acc + precioItem;
    }, 0);

    const totalFinal = (moneda === 'USD' || moneda === 'BRL' || moneda === 'PEN') ? Number(totalFinalCalc.toFixed(2)) : Math.round(totalFinalCalc);

    const handleAplicarCupon = async () => {
        if (!codigoCupon.trim()) return;
        setValidandoCupon(true);
        setMensajeCupon('');
        try {
            const resp = await fetch(`${import.meta.env.VITE_API_URL}/coupons/validate/${codigoCupon}`);
            const data = await resp.json();
            if (resp.ok) {
                const calificaAlguno = carrito.some(item => {
                    const cumpleJuego = !data.juegoRestringido || item.juegoNombre.toLowerCase() === data.juegoRestringido.toLowerCase();
                    const cumpleRegion = !data.regionRestringida || (item.regionJugador || '').toLowerCase() === data.regionRestringida.toLowerCase();
                    const cumplePaquete = !data.paqueteRestringido || item.paqueteElegido.toLowerCase() === data.paqueteRestringido.toLowerCase();
                    return cumpleJuego && cumpleRegion && cumplePaquete;
                });

                if (calificaAlguno) {
                    setDescuentoPorcentaje(data.descuentoPorcentaje);
                    setRestriccionesCupon(data);
                    setMensajeCupon(`¡Éxito! ${data.descuentoPorcentaje}% OFF aplicado.`);
                } else {
                    setDescuentoPorcentaje(0);
                    setRestriccionesCupon(null);
                    setMensajeCupon('El cupón es válido, pero no aplica a los productos en tu carrito.');
                }
            } else {
                setDescuentoPorcentaje(0);
                setRestriccionesCupon(null);
                setMensajeCupon(data.error || 'Cupón inválido');
            }
        } catch (err) {
            setMensajeCupon('Error al validar cupón');
        } finally {
            setValidandoCupon(false);
        }
    };

    const handleConfirmar = async (e) => {
        e.preventDefault();
        setError('');

        if (!nombre.trim() || !email.trim() || !whatsapp.trim()) {
            setError('Por favor, completa tus datos personales correctamente sin dejar espacios en blanco.');
            return;
        }

        if (whatsapp.trim().length < 6) {
            setError('Por favor, ingresa un número de teléfono/WhatsApp válido.');
            return;
        }

        if (!metodoPago) {
            setError('Selecciona un método de pago.');
            return;
        }

        const token = localStorage.getItem('token');
        const esInvitado = !token;

        if (metodoPago === 'Mi Saldo') {
            if (esInvitado) {
                setError('Debes iniciar sesión para usar tu Saldo.');
                return;
            }
            if (usuarioLogueado.wallet_balance < totalFinal) {
                setError('No tienes saldo suficiente en tu billetera.');
                return;
            }
        }

        setEnviando(true);
        try {
            for (const item of carrito) {
                const url = esInvitado
                    ? `${import.meta.env.VITE_API_URL}/orders/guest`
                    : `${import.meta.env.VITE_API_URL}/orders`;

                const headers = { 'Content-Type': 'application/json' };
                if (!esInvitado) headers['x-auth-token'] = token;

                let precioUnidad = getPrecioCalculado(item);
                if (descuentoPorcentaje > 0 && restriccionesCupon) {
                    const cumpleJuego = !restriccionesCupon.juegoRestringido || item.juegoNombre.toLowerCase() === restriccionesCupon.juegoRestringido.toLowerCase();
                    const cumpleRegion = !restriccionesCupon.regionRestringida || (item.regionJugador || '').toLowerCase() === restriccionesCupon.regionRestringida.toLowerCase();
                    const cumplePaquete = !restriccionesCupon.paqueteRestringido || item.paqueteElegido.toLowerCase() === restriccionesCupon.paqueteRestringido.toLowerCase();
                    if (cumpleJuego && cumpleRegion && cumplePaquete) {
                        precioUnidad = precioUnidad - (precioUnidad * (descuentoPorcentaje / 100));
                    }
                }
                const precioEsperado = (moneda === 'USD' || moneda === 'BRL' || moneda === 'PEN') ? Number(precioUnidad.toFixed(2)) : Math.round(precioUnidad);

                const body = {
                    juegoNombre: item.juegoNombre,
                    paqueteElegido: item.paqueteElegido,
                    uidJugador: item.uidJugador,
                    regionJugador: item.regionJugador || '',
                    moneda: moneda,
                    precioEsperado: precioEsperado,
                    codigoCupon: descuentoPorcentaje > 0 ? codigoCupon : '',
                    tipoDatoEntrega: item.tipoDatoEntrega || 'ID',
                    datosEntrega: item.datosEntrega || {},
                    metodoPago: metodoPago,
                    ...(esInvitado && {
                        nombreInvitado: nombre,
                        emailInvitado: email,
                        whatsappInvitado: whatsapp
                    })
                };

                const resp = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
                const data = await resp.json();
                if (!resp.ok) throw new Error(data.error || 'Error al procesar la orden.');
            }

            setMontoFinal(totalFinal);

            if (codigoCupon && descuentoPorcentaje > 0) {
                fetch(`${import.meta.env.VITE_API_URL}/coupons/use/${codigoCupon}`, { method: 'POST' })
                    .catch(() => {});
            }

            vaciarCarrito();
            setExito(true);
            window.scrollTo(0, 0);
        } catch (err) {
            setError(err.message);
        } finally {
            setEnviando(false);
        }
    };

    if (exito) {
        return <CheckoutSuccess metodoPago={metodoPago} montoFinal={montoFinal} moneda={moneda} />;
    }

    return (
        <div className="main-content">
            <Helmet>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            <button className="btn-back" onClick={() => navigate('/cart')}>← Volver al Carrito</button>
            <h1 className="section-title">Finalizar Compra</h1>

            <div className="checkout-layout">
                {/* Resumen del pedido */}
                <div className="card-glass checkout-summary">
                    <h3 className="checkout-section-title">Resumen</h3>
                    {carrito.map((item) => {
                        const precioNormalValue = getPrecioNormal(item);
                        const precioCalculadoValue = getPrecioCalculado(item);
                        const tieneDescuento = precioNormalValue > precioCalculadoValue;
                        const precioNormal = formatPrice(precioNormalValue);
                        const precioDesc = formatPrice(precioCalculadoValue);
                        return (
                            <div key={item.id} className="checkout-item">
                                <span>{item.juegoNombre} — {item.paqueteElegido}</span>
                                <strong>
                                    {tieneDescuento ? (
                                        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                                            <span style={{ textDecoration: 'line-through', opacity: 0.5, fontSize: '0.8rem', fontWeight: 400 }}>{precioNormal}</span>
                                            <span style={{ color: '#facc15' }}>{precioDesc}</span>
                                        </span>
                                    ) : precioNormal}
                                </strong>
                            </div>
                        );
                    })}
                    <div className="checkout-total">
                        <span>Total</span>
                        <div style={{ textAlign: 'right' }}>
                            {descuentoPorcentaje > 0 && (
                                <span style={{ textDecoration: 'line-through', opacity: 0.6, fontSize: '0.85rem', display: 'block' }}>
                                    {formatPrice(totalCarrito)}
                                </span>
                            )}
                            <strong>{formatPrice(totalFinal)}</strong>
                        </div>
                    </div>

                    <div className="coupon-section" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <h4 style={{ fontSize: '0.9rem', marginBottom: '10px', color: 'var(--text-muted)' }}>¿Tienes un cupón?</h4>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input 
                                type="text" 
                                className="minimal-input" 
                                placeholder="Código" 
                                value={codigoCupon}
                                onChange={(e) => setCodigoCupon(e.target.value.toUpperCase())}
                                style={{ flex: 1, padding: '8px 12px' }}
                            />
                            <button 
                                type="button" 
                                className="btn-select" 
                                onClick={handleAplicarCupon}
                                disabled={validandoCupon || !codigoCupon}
                                style={{ width: 'auto', padding: '8px 16px', fontSize: '0.9rem' }}
                            >
                                {validandoCupon ? '...' : 'Aplicar'}
                            </button>
                        </div>
                        {mensajeCupon && (
                            <p style={{ marginTop: '8px', fontSize: '0.85rem', color: mensajeCupon.includes('Éxito') ? '#22c55e' : '#ef4444' }}>
                                {mensajeCupon}
                            </p>
                        )}
                    </div>
                </div>

                {/* Formulario */}
                <form className="card-glass checkout-form" onSubmit={handleConfirmar}>
                    <h3 className="checkout-section-title">Tus Datos</h3>

                    <div className="form-group">
                        <label>Nombre completo</label>
                        <input type="text" placeholder="Juan Pérez" value={nombre}
                            onChange={(e) => setNombre(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" placeholder="tu@correo.com" value={email}
                            onChange={(e) => setEmail(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label>WhatsApp</label>
                        <input type="tel" placeholder="+54 9 11 1234-5678" value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value.replace(/[^0-9+\s]/g, ''))} required />
                    </div>

                    <div className="form-group">
                        <label>Método de Pago ({moneda})</label>
                        <div className="payment-methods">
                            {metodos.map((metodo) => (
                                <button
                                    key={metodo}
                                    type="button"
                                    className={`payment-btn ${metodoPago === metodo ? 'payment-btn-active' : ''}`}
                                    onClick={() => setMetodoPago(metodo)}
                                >
                                    {metodo}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {metodoPago === 'Mi Saldo' && (
                        <div className="wallet-info-box" style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                            {!usuarioLogueado ? (
                                <p style={{ fontSize: '0.9rem', textAlign: 'center', margin: 0 }}>
                                    Para usar tu Saldo debes <Link to="/login" style={{ color: 'var(--accent)' }}>Iniciar Sesión</Link> o <Link to="/login" style={{ color: 'var(--accent)' }}>Crear una Cuenta</Link>.
                                </p>
                            ) : usuarioLogueado.wallet_currency !== moneda ? (
                                <p style={{ color: '#f59e0b', fontSize: '0.9rem', margin: 0 }}>
                                    ⚠️ Tu saldo está en <strong>{usuarioLogueado.wallet_currency}</strong> pero estás comprando en <strong>{moneda}</strong>. Las monedas deben coincidir para usar tu saldo.
                                </p>
                            ) : (
                                <>
                                    <p style={{ margin: '0 0 10px 0', fontSize: '0.95rem' }}>
                                        Saldo actual: <strong>{formatPrice(usuarioLogueado.wallet_balance, usuarioLogueado.wallet_currency)}</strong>
                                    </p>
                                    {usuarioLogueado.wallet_balance >= totalFinal ? (
                                        <p style={{ color: '#22c55e', margin: 0, fontSize: '0.9rem' }}>✓ Tienes saldo suficiente para realizar esta compra.</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <p style={{ color: '#ef4444', margin: 0, fontSize: '0.9rem' }}>No tienes saldo suficiente.</p>
                                            <Link to="/cuenta?tab=billetera" className="btn-select" style={{ padding: '8px', width: 'auto', textAlign: 'center', background: '#3b82f6', color: 'white' }}>
                                                Recargar Billetera
                                            </Link>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {error && <p className="error-msg">{error}</p>}

                    <button type="submit" className="btn-select" disabled={enviando || (metodoPago === 'Billetera Virtual' && usuarioLogueado && usuarioLogueado.wallet_balance < totalFinal)}>
                        {enviando ? 'Procesando...' : 'Confirmar Pedido'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Checkout;
