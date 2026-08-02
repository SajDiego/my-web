import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { FiTrash2 } from 'react-icons/fi';
import './Cart.css';

function Cart() {
    const { carrito, eliminarDelCarrito, totalCarrito, moneda, getPrecioNormal, getPrecioCalculado, formatPrice } = useCart();
    const navigate = useNavigate();

    if (carrito.length === 0) {
        return (
            <div className="main-content" style={{ textAlign: 'center', paddingTop: '60px' }}>
                <h2 className="section-title">Tu carrito está vacío</h2>
                <p className="home-subtitle">Agrega productos desde el catálogo.</p>
                <button className="btn-select" style={{ marginTop: '20px', width: 'auto', padding: '12px 32px' }} onClick={() => navigate('/')}>
                    Ver Catálogo
                </button>
            </div>
        );
    }

    return (
        <div className="main-content">
            <h1 className="section-title">Tu Carrito</h1>

            <div className="cart-list">
                {carrito.map((item) => {
                    const precioNormalValue = getPrecioNormal(item);
                    const precioNormal = formatPrice(precioNormalValue);
                    const precioCalculadoValue = getPrecioCalculado(item);
                    const tieneDescuento = precioNormalValue > precioCalculadoValue;
                    const precioDesc = formatPrice(precioCalculadoValue);
                    return (
                        <div key={item.id} className="cart-item card-glass">
                            <div className="cart-item-info">
                                <p className="cart-item-game">{item.juegoNombre}</p>
                                <p className="cart-item-package">{item.paqueteElegido}</p>
                                <p className="cart-item-uid">
                                    {item.tipoDatoEntrega || 'UID'}: <strong>{item.uidJugador}</strong>
                                </p>
                                {(item.tipoDatoEntrega === 'ID' || !item.tipoDatoEntrega) && item.regionJugador && (
                                    <p className="cart-item-uid">Región: {item.regionJugador}</p>
                                )}
                            </div>
                            <div className="cart-item-right">
                                <p className="cart-item-price">
                                    {tieneDescuento ? (
                                        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                                            <span style={{ textDecoration: 'line-through', opacity: 0.5, fontSize: '0.8rem' }}>{precioNormal}</span>
                                            <span style={{ color: '#facc15', fontWeight: 700 }}>{precioDesc}</span>
                                        </span>
                                    ) : precioNormal}
                                </p>
                                <button className="cart-item-delete" onClick={() => eliminarDelCarrito(item.id)}>
                                    <FiTrash2 size={18} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="cart-summary card-glass">
                <div className="cart-total">
                    <span>Total</span>
                    <strong>{formatPrice(totalCarrito)}</strong>
                </div>
                <p style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '15px', textAlign: 'center' }}>
                    * Los precios en pesos argentinos son finales.
                </p>
                <button className="btn-select" onClick={() => navigate('/checkout')}>
                    Finalizar Compra
                </button>
            </div>
        </div>
    );
}

export default Cart;
