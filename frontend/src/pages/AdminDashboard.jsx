import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

function AdminDashboard() {
    const navigate = useNavigate();
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchOrdenes();
    }, []);

    const fetchOrdenes = async () => {
        try {
            const res = await fetch('/api/orders', {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            if (!res.ok) throw new Error('No autorizado');
            const data = await res.json();
            setOrdenes(data.sort((a, b) => new Date(b.fechaCompra) - new Date(a.fechaCompra)));
            setLoading(false);
        } catch (err) {
            setError('Error al cargar órdenes. Asegúrate de ser administrador.');
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, nuevoEstado) => {
        try {
            const res = await fetch(`/api/orders/${id}/estado`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': localStorage.getItem('token')
                },
                body: JSON.stringify({ estado: nuevoEstado })
            });
            if (res.ok) fetchOrdenes();
        } catch (err) {
            alert('Error al actualizar el estado');
        }
    };

    if (loading) return <div className="loading-text app-container">Cargando panel...</div>;

    return (
        <div className="admin-dashboard-container app-container">
            <h1 className="home-title">Panel de Administración</h1>

            <div className="admin-menu-tabs card-glass" style={{ margin: '20px 0', padding: '15px' }}>
                <button className="btn-nav active-admin">Órdenes</button>
                <button className="btn-nav" onClick={() => navigate('/admin/products')}>Productos</button>
            </div>

            {error && <p className="error-msg">{error}</p>}

            <div className="card-glass admin-dashboard-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Nº Orden</th>
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th>Juego / Paquete</th>
                            <th>UID / Región</th>
                            <th>Precio</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ordenes.map((ord, idx) => (
                            <tr key={ord._id}>
                                <td className="order-number">#{ord._id.slice(-6).toUpperCase()}</td>
                                <td>{new Date(ord.fechaCompra).toLocaleDateString()}</td>
                                <td>
                                    {ord.usuario ? (
                                        <>
                                            <strong>{ord.usuario.nombre}</strong><br/>
                                            <small>{ord.usuario.email}</small>
                                        </>
                                    ) : (
                                        <>
                                            <strong>{ord.usuarioInvitado?.nombre}</strong><br/>
                                            <small>{ord.usuarioInvitado?.contacto}</small>
                                        </>
                                    )}
                                </td>
                                <td>
                                    <strong>{ord.juegoNombre}</strong><br/>
                                    {ord.paqueteElegido}
                                </td>
                                <td>
                                    {ord.tipoDatoEntrega || 'ID'}: {ord.uidJugador}<br/>
                                    {(ord.tipoDatoEntrega === 'ID' || !ord.tipoDatoEntrega) && ord.regionJugador && (
                                        <small>Región: {ord.regionJugador}</small>
                                    )}
                                </td>
                                <td>{ord.moneda === 'USD' ? 'U$D' : '$'} {ord.precioFinal}</td>
                                <td>
                                    <span className={`status-badge status-${ord.estado.toLowerCase()}`}>
                                        {ord.estado}
                                    </span>
                                </td>
                                <td className="order-actions-cell">
                                    <select 
                                        value={ord.estado}
                                        onChange={(e) => handleUpdateStatus(ord._id, e.target.value)}
                                        className="admin-form-textarea"
                                        style={{ minHeight: 'auto', padding: '6px 10px', marginTop: 0, cursor: 'pointer' }}
                                    >
                                        <option value="Pendiente" style={{ background: '#09090b', color: '#fff' }}>Pendiente</option>
                                        <option value="Completada" style={{ background: '#09090b', color: '#fff' }}>Completada</option>
                                        <option value="Cancelada" style={{ background: '#09090b', color: '#fff' }}>Cancelada</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {ordenes.length === 0 && <p style={{ textAlign: 'center', padding: '2rem' }}>No hay pedidos registrados.</p>}
            </div>
        </div>
    );
}

export default AdminDashboard;
