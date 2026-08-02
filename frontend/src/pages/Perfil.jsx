import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Perfil.css';

function Perfil() {
    const { exchangeRates, formatPrice, setWalletBalance, setWalletCurrency } = useCart();
    const [searchParams] = useSearchParams();
    const [user, setUser] = useState({ nombre: '', email: '', whatsapp: '', wallet_currency: 'USD', wallet_balance: 0 });
    const [monedaOriginal, setMonedaOriginal] = useState(null);
    const [isEditingCurrency, setIsEditingCurrency] = useState(false);
    const [password, setPassword] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'pedidos');

    const [ordenes, setOrdenes] = useState([]);
    const [cargandoOrdenes, setCargandoOrdenes] = useState(true);
    const [transacciones, setTransacciones] = useState([]);

    const montosUSD = [2, 5.50, 7.50, 15, 25, 50, 100];

    useEffect(() => {
        const fetchPerfil = async () => {
            const token = localStorage.getItem('token');
            const resp = await fetch(`${import.meta.env.VITE_API_URL}/auth/perfil`, {
                headers: { 'x-auth-token': token }
            });
            if (resp.ok) {
                const data = await resp.json();
                setUser(data);
                if (data.wallet_currency) setMonedaOriginal(data.wallet_currency);
                // Sync to global context so Navbar shows correct values
                setWalletBalance(data.wallet_balance || 0);
                setWalletCurrency(data.wallet_currency || 'USD');
            }
        };

        const fetchMisPedidos = async () => {
            const token = localStorage.getItem('token');
            try {
                const resp = await fetch(`${import.meta.env.VITE_API_URL}/orders/me`, {
                    headers: { 'x-auth-token': token }
                });
                const data = await resp.json();
                setOrdenes(Array.isArray(data) ? data : []);
            } catch (err) { 
                console.error("Error cargando pedidos", err); 
            } finally { 
                setCargandoOrdenes(false); 
            }
        };

        const fetchTransacciones = async () => {
            const token = localStorage.getItem('token');
            try {
                const resp = await fetch(`${import.meta.env.VITE_API_URL}/users/me/wallet-transactions`, {
                    headers: { 'x-auth-token': token }
                });
                const data = await resp.json();
                setTransacciones(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error cargando transacciones", err);
            }
        };

        fetchPerfil();
        fetchMisPedidos();
        fetchTransacciones();
    }, []);

    // Se guarda la info del usuario al vuelo cuando cambian la moneda
    useEffect(() => {
        if (!user.email) return; // evitar primer render
        const updateCurrency = async () => {
            const token = localStorage.getItem('token');
            try {
                await fetch(`${import.meta.env.VITE_API_URL}/auth/perfil`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                    body: JSON.stringify({ 
                        nombre: user.nombre, 
                        whatsapp: user.whatsapp,
                        wallet_currency: user.wallet_currency
                    })
                });
                if (user.wallet_currency && user.wallet_currency !== 'USD') {
                    setMonedaOriginal(user.wallet_currency);
                }
                // Sync to Navbar
                setWalletCurrency(user.wallet_currency || 'USD');
            } catch (err) {
                console.error(err);
            }
        };
        updateCurrency();
    }, [user.wallet_currency]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const resp = await fetch(`${import.meta.env.VITE_API_URL}/auth/perfil`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ 
                    nombre: user.nombre, 
                    whatsapp: user.whatsapp,
                    wallet_currency: user.wallet_currency,
                    password: password || undefined 
                })
            });
            if (resp.ok) {
                setMensaje("✅ ¡Perfil actualizado con éxito!");
                setPassword('');
                setTimeout(() => setMensaje(''), 3000);
            }
        } catch (err) { alert("Error al conectar con el servidor"); }
    };

    const calcularMontoLocal = (usd) => {
        if (user.wallet_currency === 'USD') return formatPrice(usd, 'USD');
        if (!exchangeRates || !exchangeRates[user.wallet_currency]) return formatPrice(usd, 'USD');
        
        const { tasa, factor_redondeo } = exchangeRates[user.wallet_currency];
        const convertido = usd * tasa;
        
        let final = convertido;
        if (convertido < 10) final = Math.ceil(convertido * 100) / 100;
        else if (convertido < 100) final = Math.ceil(convertido);
        else if (convertido < 1000) final = Math.ceil(convertido / 10) * 10;
        else final = Math.ceil(convertido / factor_redondeo) * factor_redondeo;
        
        return formatPrice(final, user.wallet_currency);
    };

    return (
        <div className="main-content">
            <div className="profile-container">
                <h1 className="section-title profile-title">Mi Cuenta</h1>

                <div className="profile-tabs" style={{ flexWrap: 'wrap', gap: '5px' }}>
                    <button 
                        className={`tab-btn ${activeTab === 'pedidos' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pedidos')}
                    >
                        Orders
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'billetera' ? 'active' : ''}`}
                        onClick={() => setActiveTab('billetera')}
                    >
                        Saldo
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'usuario' ? 'active' : ''}`}
                        onClick={() => setActiveTab('usuario')}
                    >
                        User
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'seguridad' ? 'active' : ''}`}
                        onClick={() => setActiveTab('seguridad')}
                    >
                        Security
                    </button>
                </div>

                <div className="card-glass profile-card">
                    {mensaje && <p className="profile-update-msg">{mensaje}</p>}

                    {activeTab === 'pedidos' && (
                        <div className="orders-section fade-in">
                            <h2 className="profile-section-title">Order History</h2>
                            {cargandoOrdenes ? (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Cargando tus pedidos...</p>
                            ) : ordenes.length === 0 ? (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Aún no tienes pedidos registrados.</p>
                            ) : (
                                <div className="orders-list-profile">
                                    {ordenes.map(o => (
                                        <div key={o._id} className="order-item-card">
                                            <div className="order-header">
                                                <div>
                                                    <h3 className="order-title">
                                                        #{o.numeroOrden || o._id.substring(o._id.length - 6).toUpperCase()}
                                                    </h3>
                                                    <span style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: '600' }}>
                                                        {o.juegoNombre}
                                                    </span>
                                                </div>
                                                <span className={`status-badge status-${(o.estado || 'pendiente').toLowerCase()}`}>
                                                    {o.estado || 'Pendiente'}
                                                </span>
                                            </div>
                                            <p style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '10px' }}>{o.paqueteElegido}</p>
                                            <div className="order-meta">
                                                <span><strong>Total:</strong> {o.moneda} {o.precioFinal || o.precioEnMoneda}</span>
                                                <span><strong>ID:</strong> {o.uidJugador}</span>
                                                <span><strong>Fecha:</strong> {new Date(o.fechaCompra).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'billetera' && (
                        <div className="orders-section fade-in">
                            <h2 className="profile-section-title">Mi Saldo</h2>
                            
                            <div className="wallet-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', textAlign: 'center', marginBottom: '20px' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '5px' }}>Saldo Actual</p>
                                <h3 style={{ fontSize: '2rem', color: '#22c55e', margin: '0 0 8px 0' }}>
                                    {user.wallet_balance !== undefined ? user.wallet_balance : 0} {user.wallet_currency || 'USD'}
                                </h3>
                                <p style={{ fontSize: '0.78rem', color: '#f59e0b', margin: '0 0 18px 0' }}>
                                    ⚠️ Una vez hecha una recarga de saldo, no podrás cambiar de moneda.
                                </p>

                                <div className="form-group" style={{ maxWidth: '350px', margin: '0 auto 20px auto', textAlign: 'left' }}>
                                    <label style={{ fontSize: '0.85rem' }}>Moneda de tu saldo</label>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '5px' }}>
                                        <select 
                                            value={user.wallet_currency || 'USD'} 
                                            onChange={e => {
                                                setUser({ ...user, wallet_currency: e.target.value });
                                                setIsEditingCurrency(false);
                                            }}
                                            disabled={user.wallet_balance > 0 || (!isEditingCurrency && monedaOriginal && monedaOriginal !== 'USD')}
                                            className="minimal-input"
                                            style={{ 
                                                appearance: 'auto', 
                                                background: 'rgba(0,0,0,0.5)', 
                                                opacity: (user.wallet_balance > 0 || (!isEditingCurrency && monedaOriginal && monedaOriginal !== 'USD')) ? 0.6 : 1,
                                                cursor: (user.wallet_balance > 0 || (!isEditingCurrency && monedaOriginal && monedaOriginal !== 'USD')) ? 'not-allowed' : 'pointer',
                                                flex: 1
                                            }}
                                        >
                                            <option style={{ background: '#1a1a1a' }} value="USD">USD</option>
                                            <option style={{ background: '#1a1a1a' }} value="MXN">MXN</option>
                                            <option style={{ background: '#1a1a1a' }} value="COP">COP</option>
                                            <option style={{ background: '#1a1a1a' }} value="CLP">CLP</option>
                                            <option style={{ background: '#1a1a1a' }} value="BRL">BRL</option>
                                            <option style={{ background: '#1a1a1a' }} value="PEN">PEN</option>
                                        </select>
                                        
                                        {!isEditingCurrency && monedaOriginal && monedaOriginal !== 'USD' && user.wallet_balance === 0 && (
                                            <button 
                                                type="button" 
                                                onClick={() => setIsEditingCurrency(true)}
                                                className="btn-select"
                                                style={{ width: 'auto', padding: '10px 15px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)' }}
                                            >
                                                ✏️ Cambiar
                                            </button>
                                        )}
                                    </div>
                                    {user.wallet_balance > 0 && (
                                        <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '5px' }}>
                                            No puedes cambiar la moneda mientras tengas saldo a favor.
                                        </p>
                                    )}
                                </div>

                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', marginTop: '10px' }}>
                                    <h4 style={{ marginBottom: '15px', color: '#fff' }}>Opciones de recarga</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                                        {montosUSD.map(monto => (
                                            <a 
                                                key={monto}
                                                href={`https://wa.me/5491133148649?text=Hola,%20quiero%20recargar%20${calcularMontoLocal(monto)}%20en%20mi%20saldo.%20Mi%20email%20es%20${user.email}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="btn-select"
                                                style={{ background: '#25D366', color: 'white', display: 'inline-block', width: 'auto', padding: '8px 16px', textDecoration: 'none', fontSize: '0.9rem' }}
                                            >
                                                +{calcularMontoLocal(monto)}
                                            </a>
                                        ))}
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '15px' }}>
                                        * Serás redirigido a WhatsApp para completar el pago. El saldo máximo permitido es de 100 USD (o su equivalente).
                                    </p>
                                </div>

                                {transacciones.length > 0 && (
                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', marginTop: '20px', textAlign: 'left' }}>
                                        <h4 style={{ marginBottom: '15px', color: '#fff' }}>Historial de Saldo</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {transacciones.map((t, i) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '8px', background: t.tipo === 'recarga' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${t.tipo === 'recarga' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                                                    <div>
                                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#fff' }}>{t.descripcion}</p>
                                                        <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(t.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                    <span style={{ fontWeight: 'bold', fontSize: '1rem', color: t.tipo === 'recarga' ? '#22c55e' : '#ef4444', whiteSpace: 'nowrap', marginLeft: '10px' }}>
                                                        {t.tipo === 'recarga' ? '+' : '-'}{t.monto} {t.moneda}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'usuario' && (
                        <form onSubmit={handleUpdate} className="auth-form fade-in">
                            <h2 className="profile-section-title">User Details</h2>
                            
                            <div className="profile-email-box" style={{ marginBottom: '20px' }}>
                                <label className="profile-email-label">Correo Electrónico (No modificable)</label>
                                <p className="profile-email-value">{user.email}</p>
                            </div>

                            <div className="info-grid">
                                <div className="form-group">
                                    <label>Nombre Completo</label>
                                    <input 
                                        type="text" 
                                        value={user.nombre} 
                                        onChange={e => setUser({ ...user, nombre: e.target.value })} 
                                        required 
                                        placeholder="Tu nombre"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>WhatsApp / Celular</label>
                                    <input 
                                        type="text" 
                                        value={user.whatsapp || ''} 
                                        onChange={e => setUser({ ...user, whatsapp: e.target.value })} 
                                        placeholder="Ej: +54 9 11 1234 5678"
                                    />
                                </div>
                            </div>
                            
                            <div style={{ marginTop: '30px' }}>
                                <button type="submit" className="btn-select">Guardar Información</button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'seguridad' && (
                        <form onSubmit={handleUpdate} className="auth-form fade-in">
                            <h2 className="profile-section-title">Security Settings</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                                Desde aquí puedes actualizar tu contraseña de acceso.
                            </p>
                            
                            <div className="form-group">
                                <label>Nueva Contraseña</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Ingresa la nueva clave"
                                    className="password-input"
                                />
                                <small className="profile-help-text">
                                    Dejar en blanco si no deseas cambiarla.
                                </small>
                            </div>

                            <div style={{ marginTop: '30px' }}>
                                <button type="submit" className="btn-select">Cambiar Contraseña</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Perfil;
