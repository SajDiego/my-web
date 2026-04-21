import { useState, useEffect } from 'react';
import './Perfil.css';

function Perfil() {
    const [user, setUser] = useState({ nombre: '', email: '', whatsapp: '' });
    const [password, setPassword] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [activeTab, setActiveTab] = useState('pedidos'); // pedidos, datos, cuenta

    const [ordenes, setOrdenes] = useState([]);
    const [cargandoOrdenes, setCargandoOrdenes] = useState(true);

    useEffect(() => {
        const fetchPerfil = async () => {
            const token = localStorage.getItem('token');
            try {
                const resp = await fetch(`${import.meta.env.VITE_API_URL}/auth/perfil`, {
                    headers: { 'x-auth-token': token }
                });
                const data = await resp.json();
                setUser(data);
            } catch (err) {
                console.error("Error al cargar perfil", err);
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
                    password 
                })
            });
            const data = await resp.json();
            if (resp.ok) {
                setMensaje("✅ ¡Perfil actualizado con éxito!");
                setPassword('');
                setUser(data); // Actualizar con los datos que devuelve el server
                setTimeout(() => setMensaje(''), 3000);
            } else {
                setMensaje("❌ Error: " + (data.error || "No se pudo actualizar"));
            }
        } catch (err) { 
            setMensaje("❌ Error de conexion"); 
        }
    };

    return (
        <div className="main-content">
            <div className="profile-container">
                <h1 className="section-title profile-title">Mi Cuenta</h1>

                {/* Navegación por pestañas */}
                <div className="profile-tabs-nav">
                    <button 
                        className={`tab-btn ${activeTab === 'pedidos' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pedidos')}
                    >
                        Mis Pedidos
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'datos' ? 'active' : ''}`}
                        onClick={() => setActiveTab('datos')}
                    >
                        Mis Datos
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'cuenta' ? 'active' : ''}`}
                        onClick={() => setActiveTab('cuenta')}
                    >
                        Seguridad
                    </button>
                </div>

                <div className="card-glass profile-card">
                    {mensaje && <p className="profile-update-msg">{mensaje}</p>}

                    {/* SECCIÓN: PEDIDOS */}
                    {activeTab === 'pedidos' && (
                        <div className="fade-in">
                            <h4 className="profile-section-title">Historial de Pedidos</h4>
                            {cargandoOrdenes ? (
                                <p style={{ textAlign: 'center', margin: '40px 0', color: 'var(--text-muted)' }}>Cargando tus pedidos...</p>
                            ) : ordenes.length === 0 ? (
                                <div style={{ textAlign: 'center', margin: '40px 0' }}>
                                    <p style={{ color: 'var(--text-muted)' }}>Todavía no has realizado ninguna compra.</p>
                                </div>
                            ) : (
                                <div className="orders-list-profile">
                                    {ordenes.map(o => (
                                        <div key={o._id} style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--text-main)' }}>
                                                    #{o.numeroOrden || o._id.substring(o._id.length - 6).toUpperCase()} - {o.juegoNombre}
                                                </h3>
                                                <span className={`status-badge status-${(o.estado || 'pendiente').toLowerCase()}`} style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '12px' }}>
                                                    {o.estado || 'Pendiente'}
                                                </span>
                                            </div>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '10px' }}>{o.paqueteElegido}</p>
                                            <div style={{ display: 'flex', gap: '15px', fontSize: '0.8rem', color: '#888', flexWrap: 'wrap' }}>
                                                <span><strong>Total:</strong> {o.moneda} {o.moneda === 'USD' ? Number(o.precioFinal).toFixed(2) : o.precioFinal}</span>
                                                <span><strong>ID:</strong> {o.uidJugador}</span>
                                                <span><strong>Fecha:</strong> {new Date(o.fechaCompra).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* SECCIÓN: DATOS PERSONALES */}
                    {activeTab === 'datos' && (
                        <form className="fade-in" onSubmit={handleUpdate}>
                            <h3 className="profile-section-title">Información Personal</h3>
                            
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label>Nombre Completo</label>
                                <input 
                                    type="text" 
                                    placeholder="Tu nombre"
                                    value={user.nombre} 
                                    onChange={e => setUser({ ...user, nombre: e.target.value })} 
                                    required 
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label>WhatsApp (Sin símbolos)</label>
                                <input 
                                    type="text" 
                                    placeholder="Ej: 549111234456"
                                    value={user.whatsapp || ''} 
                                    onChange={e => setUser({ ...user, whatsapp: e.target.value })} 
                                />
                                <small className="profile-help-text">
                                    Esto nos ayuda a contactarte más rápido por tu pedido.
                                </small>
                            </div>

                            <div style={{ marginTop: '30px' }}>
                                <button type="submit" className="btn-select">Guardar Cambios</button>
                            </div>
                        </form>
                    )}

                    {/* SECCIÓN: CUENTA / SEGURIDAD */}
                    {activeTab === 'cuenta' && (
                        <form className="fade-in" onSubmit={handleUpdate}>
                            <h3 className="profile-section-title">Seguridad de la Cuenta</h3>
                            
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label className="profile-email-label">Correo Electrónico (No editable)</label>
                                <p className="profile-email-value">{user.email}</p>
                            </div>

                            <div className="form-group">
                                <label>Nueva Contraseña</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                    className="password-input"
                                />
                                <small className="profile-help-text">
                                    Dejar vacío si no querés cambiar tu contraseña actual.
                                </small>
                            </div>

                            <div style={{ marginTop: '30px' }}>
                                <button type="submit" className="btn-select">Actualizar Seguridad</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Perfil;
