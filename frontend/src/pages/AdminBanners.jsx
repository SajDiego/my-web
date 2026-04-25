import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import './AdminProducts.css';

function AdminBanners() {
    const navigate = useNavigate();
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        image: '',
        color: '#6d28d9',
        link: ''
    });

    useEffect(() => {
        fetchBanners();
    }, []);

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
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/banners/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            if (res.ok) fetchBanners();
        } catch (err) {
            setError('Error al eliminar');
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
                        <label>Imagen 1200x300, 150kb</label>
                        <input type="file" onChange={handleImageUpload} disabled={uploadingImage} />
                        {formData.image && <img src={formData.image} style={{ width: '100px', marginTop: '10px', borderRadius: '8px' }} alt="Preview" />}
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <button type="submit" className="btn-select" style={{ width: 'auto' }} disabled={uploadingImage}>Crear Banner</button>
                    </div>
                </form>
            </div>

            {error && <p className="error-msg">{error}</p>}

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
