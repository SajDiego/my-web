import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

function AdminUsers() {
    const navigate = useNavigate();
    const [emailSearch, setEmailSearch] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [rechargeAmount, setRechargeAmount] = useState({});
    const [correctAmount, setCorrectAmount] = useState({});
    const [correcting, setCorrecting] = useState({});

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!emailSearch.trim()) return;
        setLoading(true);
        setError('');
        setSuccessMsg('');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/users/search?email=${encodeURIComponent(emailSearch)}`, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            if (!res.ok) throw new Error('Error al buscar usuarios');
            const data = await res.json();
            setUsers(data);
            if (data.length === 0) {
                setError('No se encontraron usuarios con ese email.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRecharge = async (userId, currency) => {
        const amount = parseFloat(rechargeAmount[userId]);
        if (!amount || amount <= 0) {
            alert('Ingrese un monto válido mayor a 0');
            return;
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}/recharge`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': localStorage.getItem('token')
                },
                body: JSON.stringify({ amount })
            });
            
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al recargar');
            
            setSuccessMsg(`Recarga exitosa. Nuevo saldo: ${data.nuevo_saldo} ${data.moneda}`);
            setUsers(users.map(u => u._id === userId ? { ...u, wallet_balance: data.nuevo_saldo } : u));
            setRechargeAmount({ ...rechargeAmount, [userId]: '' });
            setTimeout(() => setSuccessMsg(''), 5000);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleSetBalance = async (userId) => {
        const amount = parseFloat(correctAmount[userId]);
        if (amount === undefined || isNaN(amount) || amount < 0) {
            alert('Ingrese un monto válido (puede ser 0)');
            return;
        }
        if (!window.confirm(`¿Seguro que quieres cambiar el saldo a ${amount}?`)) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}/set-balance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': localStorage.getItem('token')
                },
                body: JSON.stringify({ amount })
            });
            
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al corregir saldo');
            
            setSuccessMsg(`Saldo corregido. Nuevo saldo: ${data.nuevo_saldo} ${data.moneda}`);
            setUsers(users.map(u => u._id === userId ? { ...u, wallet_balance: data.nuevo_saldo } : u));
            setCorrectAmount({ ...correctAmount, [userId]: '' });
            setCorrecting({ ...correcting, [userId]: false });
            setTimeout(() => setSuccessMsg(''), 5000);
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="admin-dashboard-container">
            <Helmet>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            <h1 className="home-title">Panel de Administración</h1>

            <div className="admin-menu-tabs card-glass" style={{ margin: '20px 0', padding: '15px' }}>
                <button className="btn-nav" onClick={() => navigate('/gp-admin-panel')}>Órdenes</button>
                <button className="btn-nav" onClick={() => navigate('/gp-admin-panel/products')}>Productos</button>
                <button className="btn-nav" onClick={() => navigate('/gp-admin-panel/banners')}>Banners</button>
                <button className="btn-nav active-admin">Usuarios / Billetera</button>
                <button className="btn-nav" onClick={() => navigate('/gp-admin-panel/exchange-rates')}>Monedas</button>
            </div>

            <div className="card-glass" style={{ padding: '20px', marginBottom: '20px' }}>
                <h2 style={{ marginBottom: '15px' }}>Buscar Usuario</h2>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                        type="text" 
                        className="minimal-input" 
                        placeholder="Email del usuario..." 
                        value={emailSearch}
                        onChange={(e) => setEmailSearch(e.target.value)}
                        style={{ flex: 1 }}
                    />
                    <button type="submit" className="btn-select" style={{ width: 'auto' }} disabled={loading}>
                        {loading ? 'Buscando...' : 'Buscar'}
                    </button>
                </form>
            </div>

            {error && <p className="error-msg">{error}</p>}
            {successMsg && <p className="success-msg" style={{ color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '10px', borderRadius: '5px', marginBottom: '20px', textAlign: 'center' }}>{successMsg}</p>}

            {users.length > 0 && (
                <div className="card-glass admin-dashboard-card">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>WhatsApp</th>
                                <th>Moneda Billetera</th>
                                <th>Saldo Actual</th>
                                <th>Recargar (Monto)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td><strong>{user.nombre}</strong></td>
                                    <td>{user.email}</td>
                                    <td>{user.whatsapp || 'N/A'}</td>
                                    <td>{user.wallet_currency || 'USD'}</td>
                                    <td>
                                        <span style={{ color: '#22c55e', fontWeight: 'bold' }}>
                                            {user.wallet_balance || 0} {user.wallet_currency || 'USD'}
                                        </span>
                                    </td>
                                    <td style={{ verticalAlign: 'top' }}>
                                        {/* RECARGAR */}
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                            <input 
                                                type="number" 
                                                className="minimal-input" 
                                                placeholder="+Monto" 
                                                style={{ width: '80px', padding: '5px' }}
                                                value={rechargeAmount[user._id] || ''}
                                                onChange={(e) => setRechargeAmount({ ...rechargeAmount, [user._id]: e.target.value })}
                                                min="0.1"
                                                step="0.01"
                                            />
                                            <button 
                                                className="btn-select" 
                                                style={{ padding: '5px 12px', width: 'auto', background: '#22c55e' }}
                                                onClick={() => handleRecharge(user._id, user.wallet_currency)}
                                            >
                                                + Cargar
                                            </button>
                                        </div>
                                        {/* CORREGIR */}
                                        {!correcting[user._id] ? (
                                            <button 
                                                className="btn-select" 
                                                style={{ padding: '4px 10px', width: 'auto', fontSize: '0.78rem', background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#ef4444' }}
                                                onClick={() => setCorrecting({ ...correcting, [user._id]: true })}
                                            >
                                                ✏️ Corregir saldo
                                            </button>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <input 
                                                    type="number" 
                                                    className="minimal-input" 
                                                    placeholder="Nuevo saldo" 
                                                    style={{ width: '90px', padding: '5px', borderColor: '#ef4444' }}
                                                    value={correctAmount[user._id] ?? ''}
                                                    onChange={(e) => setCorrectAmount({ ...correctAmount, [user._id]: e.target.value })}
                                                    min="0"
                                                    step="0.01"
                                                />
                                                <button 
                                                    className="btn-select" 
                                                    style={{ padding: '5px 10px', width: 'auto', fontSize: '0.78rem', background: '#ef4444' }}
                                                    onClick={() => handleSetBalance(user._id)}
                                                >
                                                    Guardar
                                                </button>
                                                <button 
                                                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}
                                                    onClick={() => setCorrecting({ ...correcting, [user._id]: false })}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default AdminUsers;
