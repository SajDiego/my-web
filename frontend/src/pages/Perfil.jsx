import { useState, useEffect } from 'react';
import './Perfil.css';

function Perfil() {
    const [user, setUser] = useState({ nombre: '', email: '' });
    const [password, setPassword] = useState('');
    const [mensaje, setMensaje] = useState('');

    const [ordenes, setOrdenes] = useState([]);
    const [cargandoOrdenes, setCargandoOrdenes] = useState(true);

    useEffect(() => {
        const fetchPerfil = async () => {
            const token = localStorage.getItem('token');
            const resp = await fetch(`${import.meta.env.VITE_API_URL}/auth/perfil`, {
                headers: { 'x-auth-token': token }
            });
            const data = await resp.json();
            setUser(data);
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
                body: JSON.stringify({ nombre: user.nombre, password })
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

                <div className="card-glass profile-card">
                    {mensaje && <p className="profile-update-msg">{mensaje}</p>}

                    <form onSubmit={handleUpdate}>
                        <div className="profile-section">
                            <h4 className="profile-section-title">Información Personal</h4>

                            <div className="form-group profile-section">
                                <label className="profile-email-label">Correo Electrónico</label>
                                <p className="profile-email-value">{user.email}</p>
                            </div>

                            <div className="form-group">
                                <label>Nombre Completo</label>
                                <input type="text" value={user.nombre} onChange={e => setUser({ ...user, nombre: e.target.value })} required />
                            </div>
                        </div>

                        <div className="profile-section">
                            <h4 className="profile-section-title">Seguridad</h4>

                            <div className="form-group">
                                <label>Nueva Contraseña</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Dejar vacío para no cambiar"
                                    className="password-input"
                                />
                                <small className="profile-help-text">
                                    Solo completá este campo si querés cambiar tu clave actual.
                                </small>
                            </div>
                        </div>

                        <button type="submit" className="btn-select">Guardar Cambios</button>
                    </form>
                </div>
            </div>

            <div className="profile-container" style={{ marginTop: '30px' }}>
                <h1 className="section-title profile-title">Historial de Pedidos</h1>
                
                <div className="card-glass profile-card" style={{ padding: '0', overflow: 'hidden' }}>
                    {cargandoOrdenes ? (
                        <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando pedidos...</p>
                    ) : ordenes.length === 0 ? (
                        <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Aún no tenés pedidos registrados en tu cuenta.</p>
                    ) : (
                        <div className="orders-list-profile">
                            {ordenes.map(o => (
                                <div key={o._id} style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-main)' }}>
                                            #{o.numeroOrden || o._id.substring(o._id.length - 6).toUpperCase()} - {o.juegoNombre}
                                        </h3>
                                        <span className={`status-badge status-${(o.estado || 'pendiente').toLowerCase()}`} style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px' }}>
                                            {o.estado || 'Pendiente'}
                                        </span>
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '10px' }}>{o.paqueteElegido}</p>
                                    <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem', color: '#999', flexWrap: 'wrap' }}>
                                        <span><strong>Total:</strong> {o.moneda} {o.precioEnMoneda}</span>
                                        <span><strong>ID:</strong> {o.uidJugador}</span>
                                        <span><strong>Fecha:</strong> {new Date(o.fechaCompra).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Perfil;
