import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';
import './Navbar.css';

function Navbar({ usuario, onLogout }) {
    const { carrito, moneda, setMoneda, walletBalance, walletCurrency } = useCart();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMenu = () => setIsMobileMenuOpen(false);

    return (
        <header className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="navbar-brand" onClick={closeMenu}>
                    <img src="/logo.png" alt="GamePin Store Icon" className="navbar-logo-icon" />
                    <span className="navbar-logo-text">GamePin</span>
                </Link>

                <div className="mobile-quick-actions">
                    <select className="currency-selector" value={moneda} onChange={(e) => setMoneda(e.target.value)}>
                        <option value="ARS">🇦🇷 ARS</option>
                        <option value="USD">🇺🇸 USD</option>
                        <option value="MXN">🇲🇽 MXN</option>
                        <option value="COP">🇨🇴 COP</option>
                        <option value="CLP">🇨🇱 CLP</option>
                        <option value="BRL">🇧🇷 BRL</option>
                        <option value="PEN">🇵🇪 PEN</option>
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
                        <Link to="/catalogo" onClick={closeMenu}>Catálogo</Link>
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
                            <option value="MXN">🇲🇽 MXN</option>
                            <option value="COP">🇨🇴 COP</option>
                            <option value="CLP">🇨🇱 CLP</option>
                            <option value="BRL">🇧🇷 BRL</option>
                            <option value="PEN">🇵🇪 PEN</option>
                        </select>

                        {usuario ? (
                            <div className="navbar-account">
                                <div className="navbar-wallet-balance" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', borderRadius: '20px', color: '#22c55e', fontWeight: 'bold' }}>
                                    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path></svg>
                                    <span>{walletBalance} {walletCurrency}</span>
                                </div>
                                {usuario.rol === 'admin' && (
                                    <Link to="/gp-admin-panel" className="btn-nav" onClick={closeMenu}>Panel Admin</Link>
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
