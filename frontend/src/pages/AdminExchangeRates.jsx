import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

function AdminExchangeRates() {
    const navigate = useNavigate();
    const [rates, setRates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchRates();
    }, []);

    const fetchRates = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/exchange-rates`);
            if (!res.ok) throw new Error('Error al cargar las tasas de cambio');
            const data = await res.json();
            
            // Convert the object returned by API { "ARS": {tasa, factor_redondeo}, "MXN": {...} } to an array for the form
            const ratesArray = Object.keys(data).map(moneda => ({
                moneda,
                tasa: data[moneda].tasa,
                factor_redondeo: data[moneda].factor_redondeo
            }));
            
            // Ensure USD is not in the list to be edited since it's the base
            setRates(ratesArray.filter(r => r.moneda !== 'USD'));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRateChange = (index, field, value) => {
        const newRates = [...rates];
        newRates[index][field] = parseFloat(value) || 0;
        setRates(newRates);
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccessMsg('');
        
        // Validate
        for (let r of rates) {
            if (!r.moneda.trim() || r.tasa <= 0 || r.factor_redondeo <= 0) {
                setError('Todas las monedas deben tener un nombre, tasa mayor a 0 y factor de redondeo mayor a 0.');
                setSaving(false);
                return;
            }
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/exchange-rates`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': localStorage.getItem('token')
                },
                body: JSON.stringify({ rates })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al guardar');
            
            setSuccessMsg('Tasas guardadas exitosamente.');
            setTimeout(() => setSuccessMsg(''), 5000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
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
                <button className="btn-nav" onClick={() => navigate('/gp-admin-panel/users')}>Usuarios / Billetera</button>
                <button className="btn-nav active-admin">Monedas</button>
            </div>

            <div className="card-glass" style={{ padding: '20px', marginBottom: '20px' }}>
                <h2 style={{ marginBottom: '15px' }}>Tasas de Cambio (Base: USD)</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>
                    Aquí puedes configurar a cuánto equivale 1 USD en cada moneda, y cómo se redondean los precios en la tienda.
                </p>

                {error && <p className="error-msg">{error}</p>}
                {successMsg && <p className="success-msg" style={{ color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '10px', borderRadius: '5px', marginBottom: '20px', textAlign: 'center' }}>{successMsg}</p>}

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>Cargando tasas...</div>
                ) : (
                    <div>
                        <div className="info-grid">
                            {rates.map((rate, i) => (
                                <div key={i} className="form-group card-glass" style={{ padding: '15px', position: 'relative' }}>
                                    <label style={{ color: '#fff', fontSize: '0.85rem' }}>Moneda</label>
                                    <input 
                                        type="text" 
                                        className="minimal-input" 
                                        value={rate.moneda}
                                        disabled
                                        style={{ background: 'rgba(255,255,255,0.05)', color: '#888', cursor: 'not-allowed' }}
                                    />
                                    
                                    <label style={{ color: '#fff', fontSize: '0.85rem', marginTop: '10px' }}>Valor (1 USD = X)</label>
                                    <input 
                                        type="number" 
                                        className="minimal-input" 
                                        value={rate.tasa}
                                        onChange={(e) => handleRateChange(i, 'tasa', e.target.value)}
                                        min="0.001"
                                        step="0.001"
                                    />
                                    
                                    <label style={{ color: '#fff', fontSize: '0.85rem', marginTop: '10px' }}>Redondear a múltiplos de:</label>
                                    <input 
                                        type="number" 
                                        className="minimal-input" 
                                        value={rate.factor_redondeo}
                                        onChange={(e) => handleRateChange(i, 'factor_redondeo', e.target.value)}
                                        min="0.01"
                                        step="0.01"
                                    />
                                </div>
                            ))}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                            <button 
                                className="btn-select" 
                                style={{ flex: 1 }}
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? 'Guardando...' : 'Guardar Tasas'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminExchangeRates;
