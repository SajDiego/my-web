import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyOrders.css';

function MyOrders() {
    const [ordenes, setOrdenes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMisPedidos = async () => {
            const token = localStorage.getItem('token');
            if (!token) { navigate('/login'); return; }
            try {
                const resp = await fetch(`${import.meta.env.VITE_API_URL}/orders/me`, {
                    headers: { 'x-auth-token': token }
                });
                const data = await resp.json();
                setOrdenes(data);
            } catch (err) { console.error(err); } finally { setCargando(false); }
        };
        fetchMisPedidos();
    }, [navigate]);

    return (
        <div className="main-content">
            <h1 className="section-title">Mis Pedidos</h1>
            <p className="home-subtitle">Historial de tus recargas.</p>
            <div className="orders-list">
                {cargando ? <p className="loading-text">Cargando...</p> : ordenes.length === 0 ? <p>No tenés pedidos aún.</p> :
                    ordenes.map(o => (
                        <div key={o._id} className="card-glass order-card-my">
                            <div className="order-header-my">
                                <h3 className="order-title-my">
                                    #{o.numeroOrden || o._id.substring(o._id.length - 6).toUpperCase()} - {o.juegoNombre}
                                </h3>
                                <span className={`status-badge status-${o.estado.toLowerCase()}`}>{o.estado}</span>
                            </div>
                            
                            <p className="home-subtitle">{o.paqueteElegido}</p>
                            
                            <hr className="order-divider" />
                            
                            <div className="order-details-footer">
                                <span>Total: {o.moneda} {o.precioEnMoneda}</span>
                                <span>ID: <strong>{o.uidJugador}</strong></span>
                                <span>Fecha: {new Date(o.fechaCompra).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
}

export default MyOrders;
