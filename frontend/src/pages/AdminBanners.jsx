import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';
import './AdminProducts.css';

function AdminBanners() {
    const navigate = useNavigate();
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);

    const [cupones, setCupones] = useState([]);
    const [nuevoCodigo, setNuevoCodigo] = useState('');
    const [nuevoDescuento, setNuevoDescuento] = useState('');
    const [nuevoLimite, setNuevoLimite] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        image: '',
        color: '#6d28d9',
        link: ''
    });

    useEffect(() => {
        fetchBanners();
        fetchCupones();
    }, []);

    const fetchCupones = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/coupons`, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            if (res.ok) setCupones(await res.json());
        } catch (err) { console.error(err); }
    };

    const handleCrearCupon = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/coupons`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': localStorage.getItem('token') },
                body: JSON.stringify({ codigo: nuevoCodigo, descuentoPorcentaje: nuevoDescuento, usoMaximo: nuevoLimite || null })
            });
            if (res.ok) { setNuevoCodigo(''); setNuevoDescuento(''); setNuevoLimite(''); fetchCupones(); }
            else { const d = await res.json(); alert(d.error || 'Error al crear'); }
        } catch { alert('Error de conexión'); }
    };

    const handleEliminarCupon = async (id) => {
        if (!window.confirm('¿Eliminar cupón?')) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/coupons/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            if (res.ok) fetchCupones();
        } catch { alert('Error al eliminar'); }
    };

    const handleResetarCupon = async (id) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/coupons/${id}/reset`, {
                method: 'PATCH',
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            if (res.ok) fetchCupones();
        } catch { alert('Error al resetear'); }
    };

    const fetchBanners = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/banners`);
            const data = await res.json();
            setBanners(data);
            setLoading(false);
        } catch (err) {
            setError('Error al cargar banners');
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingImage(true);
        try {
            const fileRef = ref(storage, `banners/${Date.now()}_${file.name}`);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);
            setFormData({ ...formData, image: url });
        } catch (error) {
            setError('Error al subir imagen');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.image) return setError('La imagen es obligatoria');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/banners`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': localStorage.getItem('token')
                },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setFormData({ title: '', subtitle: '', image: '', color: '#6d28d9', link: '' });
                fetchBanners();
            }
        } catch (err) {
            setError('Error de conexión');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este banner?')) return;
        
        const bannerABorrar = banners.find(b => b._id === id);
        
        try {
            // 1. Intentar borrar la imagen de Firebase si existe
            if (bannerABorrar && bannerABorrar.image) {
                try {
                    const imageRef = ref(storage, bannerABorrar.image);
                    await deleteObject(imageRef);
                } catch (storageError) {
                    console.error("Error al borrar imagen de Storage (posiblemente ya no existe):", storageError);
                    // Continuamos para borrar el registro de la DB aunque la imagen falle
                }
            }

            // 2. Borrar el registro de la base de datos
            const res = await fetch(`${import.meta.env.VITE_API_URL}/banners/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });

            if (res.ok) {
                fetchBanners();
            } else {
                const data = await res.json();
                setError(data.error || 'Error al eliminar registro');
            }
        } catch (err) {
            setError('Error de conexión al eliminar');
        }
    };

    if (loading) return <div className="loading-text">Cargando banners...</div>;

    return (
        <div className="admin-products-container app-container">
            <div className="admin-menu card-glass" style={{ margin: '20px 0', padding: '15px' }}>
                <div className="admin-nav-group">
                    <button className="btn-nav" onClick={() => navigate('/gp-admin-panel')}>Órdenes</button>
                    <button className="btn-nav" onClick={() => navigate('/gp-admin-panel/products')}>Productos</button>
                    <button className="btn-nav active-admin">Banners</button>
                </div>
            </div>

            <div className="card-glass" style={{ padding: '20px', marginBottom: '30px' }}>
                <h2 className="modal-title">Nuevo Banner</h2>
                <form onSubmit={handleSubmit} className="auth-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    <div className="form-group">
                        <label>Título (Opcional)</label>
                        <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Subtítulo (Opcional)</label>
                        <input type="text" value={formData.subtitle} onChange={e => setFormData({ ...formData, subtitle: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Link de destino (Opcional)</label>
                        <input type="text" value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} placeholder="Ej: /game/ID..." />
                    </div>
                    <div className="form-group">
                        <label>Imagen Recomendada: 1000x360 (Foco al centro)</label>
                        <input type="file" onChange={handleImageUpload} disabled={uploadingImage} />
                        {formData.image && <img src={formData.image} style={{ width: '100px', marginTop: '10px', borderRadius: '8px' }} alt="Preview" />}
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <button type="submit" className="btn-select" style={{ width: 'auto' }} disabled={uploadingImage}>Crear Banner</button>
                    </div>
                </form>
            </div>

            {error && <p className="error-msg">{error}</p>}


            <div className="card-glass" style={{ padding: '20px', marginBottom: '30px' }}>
                <h2 className="modal-title">Cupones de Descuento</h2>
                <form onSubmit={handleCrearCupon} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '20px' }}>
                    <div className="form-group" style={{ flex: '1 1 160px', marginBottom: 0 }}>
                        <label>Código</label>
                        <input type="text" className="admin-form-input" placeholder="Ej: VERANO26" value={nuevoCodigo} onChange={(e) => setNuevoCodigo(e.target.value.toUpperCase().replace(/\s+/g, ''))} required />
                    </div>
                    <div className="form-group" style={{ flex: '0 1 100px', marginBottom: 0 }}>
                        <label>% Descuento</label>
                        <input type="number" className="admin-form-input" placeholder="15" min="1" max="100" value={nuevoDescuento} onChange={(e) => setNuevoDescuento(e.target.value)} required />
                    </div>
                    <div className="form-group" style={{ flex: '0 1 120px', marginBottom: 0 }}>
                        <label>Límite de usos</label>
                        <input type="number" className="admin-form-input" placeholder="20 (0 = ∞)" min="0" value={nuevoLimite} onChange={(e) => setNuevoLimite(e.target.value)} />
                    </div>
                    <button type="submit" className="btn-select" style={{ width: 'auto', padding: '10px 20px' }}>+ Crear</button>
                </form>

                <table className="admin-table">
                    <thead><tr><th>Código</th><th>Descuento</th><th>Usos</th><th>Estado</th><th>Acciones</th></tr></thead>
                    <tbody>
                        {cupones.map(c => (
                            <tr key={c._id}>
                                <td><strong style={{ letterSpacing: '1px' }}>{c.codigo}</strong></td>
                                <td>{c.descuentoPorcentaje}%</td>
                                <td>
                                    <span style={{ fontWeight: 'bold' }}>{c.usoActual || 0}</span>
                                    <span style={{ opacity: 0.6 }}> / {c.usoMaximo ?? '∞'}</span>
                                </td>
                                <td>{c.activo ? <span style={{ color: '#22c55e', fontWeight: 'bold' }}>Activo</span> : <span style={{ color: '#ef4444' }}>Agotado</span>}</td>
                                <td style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => handleResetarCupon(c._id)} className="btn-action" style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>↺ Reset</button>
                                    <button onClick={() => handleEliminarCupon(c._id)} className="btn-action btn-cancel">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {cupones.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '15px' }}>No hay cupones creados.</p>}
            </div>

            <div className="admin-products-grid">
                {banners.map(b => (
                    <div key={b._id} className="card-glass product-admin-card">
                        <img src={b.image} alt="Banner" className="product-admin-img" style={{ height: '120px' }} />
                        <h3 className="product-admin-title" style={{ fontSize: '1rem' }}>{b.title || 'Sin título'}</h3>
                        <button className="btn-action btn-cancel" onClick={() => handleDelete(b._id)}>Eliminar</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AdminBanners;
