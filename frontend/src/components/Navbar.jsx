import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';
import './Navbar.css';

function Navbar({ usuario, onLogout }) {
    const { carrito, moneda, setMoneda } = useCart();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMenu = () => setIsMobileMenuOpen(false);

    return (
        <header className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="navbar-brand" onClick={closeMenu}>
                    <img src="/logo.png" alt="IntegralPro Icon" className="navbar-logo-icon" />
                    <span className="navbar-logo-text">IntegralPro</span>
                </Link>

                <div className="mobile-quick-actions">
                    <select className="currency-selector" value={moneda} onChange={(e) => setMoneda(e.target.value)}>
                        <option value="ARS">🇦🇷 ARS</option>
                        <option value="USD">🇺🇸 USD</option>
                    </select>
                    <Link to="/cart" className="navbar-cart-link" onClick={closeMenu}>
                        <FiShoppingCart size={22} />
                        {carrito.length > 0 && <span className="cart-badge">{carrito.length}</span>}
                    </Link>
                </div>

                <button className="mobile-menu-toggle" onClick={toggleMenu}>
                    {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>

                <div className={`navbar-collapse ${isMobileMenuOpen ? 'open' : ''}`}>
                    <nav className="navbar-links">
                        <Link to="/" onClick={closeMenu}>Inicio</Link>
                        <Link to="/cart" className="navbar-cart-link desktop-only" onClick={closeMenu}>
                        <FiShoppingCart size={22} />
                        {carrito.length > 0 && (
                            <span className="cart-badge">{carrito.length}</span>
                        )}
                    </Link>
                </nav>

                <div className="navbar-right">
                    <select
                        className="currency-selector desktop-only"
                        value={moneda}
                        onChange={(e) => setMoneda(e.target.value)}
                    >
                        <option value="ARS">🇦🇷 ARS</option>
                        <option value="USD">🇺🇸 USD</option>
                    </select>

                    {usuario ? (
                        <div className="navbar-account">
                            {usuario.rol === 'admin' && (
                                <Link to="/admin" className="btn-nav" onClick={closeMenu}>Panel Admin</Link>
                            )}
                            <Link to="/cuenta" className="btn-nav" onClick={closeMenu}>Mi Cuenta</Link>
                            <button onClick={() => { onLogout(); closeMenu(); }} className="btn-nav btn-logout">Salir</button>
                        </div>
                    ) : (
                        <Link to="/login" className="btn-nav btn-accent" onClick={closeMenu}>Ingresar</Link>
                    )}
                </div>
                </div>
            </div>
        </header>
    );
}

export default Navbar;
