import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

// Métodos de pago según moneda
const metodosPorMoneda = {
    ARS: ['Transferencia Bancaria', 'PagoFacil', 'QR'],
    USD: ['AstroPay', 'Binance Pay']
};

function Checkout() {
    const { carrito, moneda, convertirPrecio, totalCarrito, vaciarCarrito } = useCart();
    const navigate = useNavigate();

    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [metodoPago, setMetodoPago] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState('');
    const [exito, setExito] = useState(false);

    const metodos = metodosPorMoneda[moneda] || [];

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
            // Enviamos una orden por cada item del carrito
            for (const item of carrito) {
                const url = esInvitado
                    ? 'http://localhost:3000/api/orders/guest'
                    : 'http://localhost:3000/api/orders';

                const headers = { 'Content-Type': 'application/json' };
                if (!esInvitado) headers['x-auth-token'] = token;

                const body = {
                    juegoNombre: item.juegoNombre,
                    paqueteElegido: item.paqueteElegido,
                    uidJugador: item.uidJugador,
                    regionJugador: item.regionJugador || '',
                    ...(esInvitado && {
                        nombreInvitado: nombre,
                        contactoInvitado: `${email} | WA: ${whatsapp}`
                    })
                };

                const resp = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
                const data = await resp.json();
                if (!resp.ok) throw new Error(data.error || 'Error al procesar la orden.');
            }

            vaciarCarrito();
            setExito(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setEnviando(false);
        }
    };

    if (exito) {
        return (
            <div className="main-content auth-container" style={{ textAlign: 'center' }}>
                <div className="card-glass" style={{ padding: '40px' }}>
                    <h2 style={{ color: '#22c55e', marginBottom: '16px' }}>¡Pedido Confirmado!</h2>
                    <p className="home-subtitle">Nos contactaremos contigo a la brevedad para coordinar el pago y la entrega.</p>
                    <button className="btn-select" style={{ marginTop: '24px' }} onClick={() => navigate('/')}>
                        Volver al Inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="main-content">
            <button className="btn-back" onClick={() => navigate('/cart')}>← Volver al Carrito</button>
            <h1 className="section-title">Finalizar Compra</h1>

            <div className="checkout-layout">
                {/* Resumen del pedido */}
                <div className="card-glass checkout-summary">
                    <h3 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>Resumen</h3>
                    {carrito.map((item) => (
                        <div key={item.id} className="checkout-item">
                            <span>{item.juegoNombre} — {item.paqueteElegido}</span>
                            <strong>{moneda === 'USD' ? 'U$D' : '$'} {convertirPrecio(item.precioFinal)}</strong>
                        </div>
                    ))}
                    <div className="checkout-total">
                        <span>Total</span>
                        <strong>{moneda === 'USD' ? 'U$D' : '$'} {convertirPrecio(totalCarrito)}</strong>
                    </div>
                </div>

                {/* Formulario */}
                <form className="card-glass checkout-form" onSubmit={handleConfirmar}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>Tus Datos</h3>

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
                        <input type="text" placeholder="+54 9 11 1234-5678" value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)} required />
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
