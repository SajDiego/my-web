import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { FiTrash2 } from 'react-icons/fi';
import './Cart.css';

function Cart() {
    const { carrito, eliminarDelCarrito, convertirPrecio, totalCarrito, moneda } = useCart();
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
                {carrito.map((item) => (
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
                                {moneda === 'USD' ? `U$D ${item.precioUSD}` : `$ ${item.precioARS}`}
                            </p>
                            <button className="cart-item-delete" onClick={() => eliminarDelCarrito(item.id)}>
                                <FiTrash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="cart-summary card-glass">
                <div className="cart-total">
                    <span>Total</span>
                    <strong>{moneda === 'USD' ? `U$D ${totalCarrito}` : `$ ${totalCarrito}`}</strong>
                </div>
                <button className="btn-select" onClick={() => navigate('/checkout')}>
                    Finalizar Compra
                </button>
            </div>
        </div>
    );
}

export default Cart;
