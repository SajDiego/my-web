import { useState, useEffect } from 'react';
import './Perfil.css';

function Perfil() {
    const [user, setUser] = useState({ nombre: '', email: '', whatsapp: '' });
    const [password, setPassword] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [activeTab, setActiveTab] = useState('pedidos'); // 'pedidos', 'seguridad', 'usuario'

    const [ordenes, setOrdenes] = useState([]);
    const [cargandoOrdenes, setCargandoOrdenes] = useState(true);

    useEffect(() => {
        const fetchPerfil = async () => {
            const token = localStorage.getItem('token');
            const resp = await fetch(`${import.meta.env.VITE_API_URL}/auth/perfil`, {
                headers: { 'x-auth-token': token }
            });
            if (resp.ok) {
                const data = await resp.json();
                setUser(data);
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

        fetchPerfil();
        fetchMisPedidos();
    }, []);

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

    return (
        <div className="main-content">
            <div className="profile-container">
                <h1 className="section-title profile-title">Mi Cuenta</h1>

                <div className="profile-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'pedidos' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pedidos')}
                    >
                        Orders
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
                        <div className="orders-section">
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
                                                <span><strong>Total:</strong> {o.moneda} {o.precioEnMoneda}</span>
                                                <span><strong>ID:</strong> {o.uidJugador}</span>
                                                <span><strong>Fecha:</strong> {new Date(o.fechaCompra).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'usuario' && (
                        <form onSubmit={handleUpdate} className="auth-form">
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
                        <form onSubmit={handleUpdate} className="auth-form">
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
