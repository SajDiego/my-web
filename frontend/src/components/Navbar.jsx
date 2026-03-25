import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiShoppingCart } from 'react-icons/fi';

function Navbar({ usuario, onLogout }) {
    const { carrito, moneda, setMoneda } = useCart();
    const navigate = useNavigate();

    return (
        <header className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="navbar-logo">IntegralPro</Link>

                <nav className="navbar-links">
                    <Link to="/">Inicio</Link>
                    <Link to="/cart" className="navbar-cart-link">
                        <FiShoppingCart size={22} />
                        {carrito.length > 0 && (
                            <span className="cart-badge">{carrito.length}</span>
                        )}
                    </Link>
                </nav>

                <div className="navbar-right">
                    <select
                        className="currency-selector"
                        value={moneda}
                        onChange={(e) => setMoneda(e.target.value)}
                    >
                        <option value="ARS">🇦🇷 ARS</option>
                        <option value="USD">🇺🇸 USD</option>
                    </select>

                    {usuario ? (
                        <div className="navbar-account">
                            <Link to="/cuenta" className="btn-nav">Mi Cuenta</Link>
                            <button onClick={onLogout} className="btn-nav btn-logout">Salir</button>
                        </div>
                    ) : (
                        <Link to="/login" className="btn-nav btn-accent">Ingresar</Link>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Navbar;
