import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

            setMontoFinal(totalCarrito);
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
        return <CheckoutSuccess metodoPago={metodoPago} montoFinal={montoFinal} />;
    }

    return (
        <div className="main-content">
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
                        <strong>{moneda === 'USD' ? `U$D ${Number(totalCarrito).toFixed(2)}` : `$ ${totalCarrito}`}</strong>
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
