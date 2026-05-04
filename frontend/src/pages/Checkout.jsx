import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../context/CartContext';
import { metodosPorMoneda } from '../data/paymentConfig';
import CheckoutSuccess from '../components/CheckoutSuccess';
import './Checkout.css';

function Checkout() {
    const { carrito, moneda, totalCarrito, vaciarCarrito } = useCart();
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
    const [mensajeCupon, setMensajeCupon] = useState('');
    const [validandoCupon, setValidandoCupon] = useState(false);

    const metodos = metodosPorMoneda[moneda] || [];
    const totalFinal = descuentoPorcentaje > 0 ? (totalCarrito * (1 - descuentoPorcentaje / 100)) : totalCarrito;

    const handleAplicarCupon = async () => {
        if (!codigoCupon.trim()) return;
        setValidandoCupon(true);
        setMensajeCupon('');
        try {
            const resp = await fetch(`${import.meta.env.VITE_API_URL}/coupons/validate/${codigoCupon}`);
            const data = await resp.json();
            if (resp.ok) {
                setDescuentoPorcentaje(data.descuentoPorcentaje);
                setMensajeCupon(`¡Éxito! ${data.descuentoPorcentaje}% OFF aplicado.`);
            } else {
                setDescuentoPorcentaje(0);
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

        if (!metodoPago) {
            setError('Selecciona un método de pago.');
            return;
        }

        const token = localStorage.getItem('token');
        const esInvitado = !token;

        setEnviando(true);
        try {
            for (const item of carrito) {
                const url = esInvitado
                    ? `${import.meta.env.VITE_API_URL}/orders/guest`
                    : `${import.meta.env.VITE_API_URL}/orders`;

                const headers = { 'Content-Type': 'application/json' };
                if (!esInvitado) headers['x-auth-token'] = token;

                const body = {
                    juegoNombre: item.juegoNombre,
                    paqueteElegido: item.paqueteElegido,
                    uidJugador: item.uidJugador,
                    regionJugador: item.regionJugador || '',
                    moneda: moneda,
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
                    {carrito.map((item) => (
                        <div key={item.id} className="checkout-item">
                            <span>{item.juegoNombre} — {item.paqueteElegido}</span>
                            <strong>{moneda === 'USD' ? `U$D ${Number(item.precioUSD).toFixed(2)}` : `$ ${item.precioARS}`}</strong>
                        </div>
                    ))}
                    <div className="checkout-total">
                        <span>Total</span>
                        <div style={{ textAlign: 'right' }}>
                            {descuentoPorcentaje > 0 && (
                                <span style={{ textDecoration: 'line-through', opacity: 0.6, fontSize: '0.85rem', display: 'block' }}>
                                    {moneda === 'USD' ? `U$D ${Number(totalCarrito).toFixed(2)}` : `$ ${totalCarrito}`}
                                </span>
                            )}
                            <strong>{moneda === 'USD' ? `U$D ${Number(totalFinal).toFixed(2)}` : `$ ${Math.round(totalFinal)}`}</strong>
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

                    {error && <p className="error-msg">{error}</p>}

                    <button type="submit" className="btn-select" disabled={enviando}>
                        {enviando ? 'Procesando...' : 'Confirmar Pedido'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Checkout;
