import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import './AdminProducts.css';

function AdminProducts() {
    const navigate = useNavigate();
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);

    const [formData, setFormData] = useState({
        juego: '',
        descripcion: '',
        imagenUrl: '',
        categoria: 'TopUp',
        camposEntrega: [],
        paquetes: [{ nombre: '', precioARS: '', precioUSD: '', region: 'Global', stock: '', bonoDetalle: '', descripcion: '' }]
    });

    useEffect(() => {
        fetchProductos();
    }, []);

    const fetchProductos = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/products`);
            const data = await res.json();
            setProductos(data);
            setLoading(false);
        } catch (err) {
            setError('Error al cargar productos');
            setLoading(false);
        }
    };

    const handleOpenModal = (prod = null) => {
        if (prod) {
            setEditingId(prod._id);
            setFormData({
                juego: prod.juego,
                descripcion: prod.descripcion || '',
                imagenUrl: prod.imagenUrl || '',
                categoria: prod.categoria || 'TopUp',
                camposEntrega: prod.camposEntrega ? prod.camposEntrega.map(c => ({ 
                    label: c.label || '', 
                    tipo: c.tipo || 'text', 
                    requerido: c.requerido !== false, 
                    placeholder: c.placeholder || '' 
                })) : [],
                paquetes: prod.paquetes.length > 0 ? prod.paquetes.map(p => ({
                    nombre: p.nombre || '',
                    precioARS: p.precioARS || '',
                    precioUSD: p.precioUSD || '',
                    region: p.region || 'Global',
                    stock: p.stock != null ? p.stock : '',
                    bonoDetalle: p.bonoDetalle || '',
                    descripcion: p.descripcion || ''
                })) : [{ nombre: '', precioARS: '', precioUSD: '', region: 'Global', stock: '', bonoDetalle: '', descripcion: '' }]
            });
        } else {
            setEditingId(null);
            setFormData({
                juego: '',
                descripcion: '',
                imagenUrl: '',
                categoria: 'TopUp',
                camposEntrega: [],
                paquetes: [{ nombre: '', precioARS: '', precioUSD: '', region: 'Global', stock: '', bonoDetalle: '', descripcion: '' }]
            });
        }
        setShowModal(true);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const fileRef = ref(storage, `productos/${Date.now()}_${file.name}`);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);
            setFormData({ ...formData, imagenUrl: url });
            setError('');
        } catch (error) {
            console.error("Firebase upload error:", error);
            setError('Error al subir imagen a Firebase');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleAddPackage = () => {
        setFormData({ ...formData, paquetes: [...formData.paquetes, { nombre: '', precioARS: '', precioUSD: '', region: 'Global', stock: '', bonoDetalle: '', descripcion: '' }] });
    };

    const handleCampoChange = (index, field, value) => {
        const newCampos = [...formData.camposEntrega];
        newCampos[index][field] = value;
        setFormData({ ...formData, camposEntrega: newCampos });
    };

    const handleAddCampo = () => {
        setFormData({ ...formData, camposEntrega: [...formData.camposEntrega, { label: '', tipo: 'text', requerido: true, placeholder: '' }] });
    };

    const handleRemoveCampo = (index) => {
        const newCampos = formData.camposEntrega.filter((_, i) => i !== index);
        setFormData({ ...formData, camposEntrega: newCampos });
    };

    const handlePackageChange = (index, field, value) => {
        const newPaquetes = [...formData.paquetes];
        newPaquetes[index][field] = value;
        setFormData({ ...formData, paquetes: newPaquetes });
    };

    const handleRemovePackage = (index) => {
        const newPaquetes = formData.paquetes.filter((_, i) => i !== index);
        setFormData({ ...formData, paquetes: newPaquetes });
    };

    const handleDuplicatePackage = (index) => {
        const pkgToDuplicate = { ...formData.paquetes[index] };
        setFormData({ 
            ...formData, 
            paquetes: [...formData.paquetes, pkgToDuplicate] 
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editingId ? `${import.meta.env.VITE_API_URL}/products/${editingId}` : `${import.meta.env.VITE_API_URL}/products`;
        const method = editingId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': localStorage.getItem('token')
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setShowModal(false);
                fetchProductos();
            } else {
                const data = await res.json();
                setError(data.error || 'Error al guardar');
            }
        } catch (err) {
            setError('Error de conexión');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Seguro que quieres borrar este juego?')) {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/products/${id}`, {
                    method: 'DELETE',
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                if (res.ok) fetchProductos();
            } catch (err) {
                setError('No se pudo eliminar');
            }
        }
    };

    if (loading) return <div className="loading-text">Cargando catálogo...</div>;

    return (
        <div className="admin-products-container app-container">
            <div className="admin-menu card-glass" style={{ margin: '20px 0', padding: '15px' }}>
                <div className="admin-nav-group">
                    <button className="btn-nav" onClick={() => navigate('/admin')}>Órdenes</button>
                    <button className="btn-nav active-admin">Productos</button>
                    <button className="btn-nav" onClick={() => navigate('/admin/banners')}>Banners</button>
                </div>
                <button className="btn-select btn-new-game" onClick={() => handleOpenModal()}>+ Nuevo Juego</button>
            </div>

            {error && <p className="error-msg">{error}</p>}

            <div className="admin-products-grid">
                {productos.map(prod => (
                    <div key={prod._id} className="card-glass product-admin-card">
                        <img src={prod.imagenUrl} alt={prod.juego} className="product-admin-img" />
                        <h3 className="product-admin-title">{prod.juego}</h3>
                        <p className="product-admin-info">{prod.paquetes.length} paquetes activos</p>
                        <div className="product-admin-actions">
                            <button className="btn-action" onClick={() => handleOpenModal(prod)}>Editar</button>
                            <button className="btn-action btn-cancel" onClick={() => handleDelete(prod._id)}>Borrar</button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="card-glass modal-card">
                        <h2 className="modal-title">{editingId ? 'Editar Juego' : 'Nuevo Juego'}</h2>
                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label>Nombre del Juego</label>
                                <input 
                                    type="text" 
                                    value={formData.juego} 
                                    onChange={(e) => setFormData({...formData, juego: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div className="packages-header" style={{ marginTop: '1rem' }}>
                                <h3>Campos de Entrega</h3>
                                <button type="button" className="btn-action" onClick={handleAddCampo}>+ Añadir Campo</button>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                Define qué datos le pedirás al cliente (ej: "UID del Jugador", "Email", "Servidor")
                            </p>
                            {formData.camposEntrega.map((campo, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
                                    <input
                                        style={{ flex: 2 }}
                                        placeholder="Nombre del campo"
                                        value={campo.label}
                                        onChange={(e) => handleCampoChange(idx, 'label', e.target.value)}
                                        required
                                    />
                                    <input
                                        style={{ flex: 2 }}
                                        placeholder="Placeholder"
                                        value={campo.placeholder}
                                        onChange={(e) => handleCampoChange(idx, 'placeholder', e.target.value)}
                                    />
                                    <select
                                        style={{ width: '90px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px', borderRadius: '8px' }}
                                        value={campo.tipo}
                                        onChange={(e) => handleCampoChange(idx, 'tipo', e.target.value)}
                                    >
                                        <option value="text">Texto</option>
                                        <option value="email">Email</option>
                                        <option value="number">Número</option>
                                    </select>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                        <input type="checkbox" checked={campo.requerido} onChange={(e) => handleCampoChange(idx, 'requerido', e.target.checked)} />
                                        Req.
                                    </label>
                                    <button type="button" className="btn-action btn-cancel" onClick={() => handleRemoveCampo(idx)}>X</button>
                                </div>
                            ))}
                            <div className="form-group">
                                <label>Categoría</label>
                                <select 
                                    value={formData.categoria} 
                                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                                    className="admin-form-textarea"
                                    style={{ minHeight: 'auto', padding: '10px' }}
                                >
                                    <option value="TopUp">TopUp</option>
                                    <option value="Pines">Pines</option>
                                    <option value="PC">PC</option>
                                    <option value="Consolas">Consolas</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Descripción</label>
                                <textarea 
                                    className="admin-form-textarea"
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Imagen (Firebase)</label>
                                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                                <input 
                                    type="text" 
                                    placeholder="O ingresa URL manual"
                                    value={formData.imagenUrl} 
                                    onChange={(e) => setFormData({...formData, imagenUrl: e.target.value})} 
                                />
                                {formData.imagenUrl && (
                                    <div className="preview-container">
                                        <img src={formData.imagenUrl} className="image-preview" alt="Preview" />
                                    </div>
                                )}
                            </div>

                            <div className="packages-header">
                                <h3>Paquetes / Precios</h3>
                                <button type="button" className="btn-action" onClick={handleAddPackage}>+ Añadir</button>
                            </div>

                            <div style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '10px' }}>
                                {formData.paquetes.map((pkg, idx) => (
                                    <div key={idx} className="package-input-row-block" style={{ marginBottom: '15px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                            <input style={{flex: 1}} placeholder="Nombre" value={pkg.nombre} onChange={(e) => handlePackageChange(idx, 'nombre', e.target.value)} required />
                                            <button type="button" className="btn-action" style={{ background: 'var(--accent)', color: 'white' }} onClick={() => handleDuplicatePackage(idx)} title="Duplicar Paquete">📑</button>
                                            <button type="button" className="btn-action btn-cancel" onClick={() => handleRemovePackage(idx)} title="Eliminar Paquete">X</button>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                            <input style={{flex: 1}} placeholder="Bono" value={pkg.bonoDetalle} onChange={(e) => handlePackageChange(idx, 'bonoDetalle', e.target.value)} />
                                            <input style={{width: '90px'}} placeholder="Región" value={pkg.region} onChange={(e) => handlePackageChange(idx, 'region', e.target.value)} />
                                            <input style={{width: '70px'}} placeholder="Stock" type="number" value={pkg.stock} onChange={(e) => handlePackageChange(idx, 'stock', e.target.value === '' ? '' : Number(e.target.value))} title="Vacío = ilimitado" />
                                            <input style={{width: '90px'}} placeholder="$ ARS" type="number" value={pkg.precioARS} onChange={(e) => handlePackageChange(idx, 'precioARS', e.target.value)} required />
                                            <input style={{width: '90px'}} placeholder="U$D" type="number" step="0.01" value={pkg.precioUSD} onChange={(e) => handlePackageChange(idx, 'precioUSD', e.target.value)} required />
                                        </div>
                                        <input style={{width: '100%'}} placeholder="Descripción corta" value={pkg.descripcion || ''} onChange={(e) => handlePackageChange(idx, 'descripcion', e.target.value)} />
                                    </div>
                                ))}
                            </div>

                            <div className="modal-footer-actions">
                                <button type="submit" className="btn-select" disabled={uploadingImage}>Guardar</button>
                                <button type="button" className="btn-nav" onClick={() => setShowModal(false)}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminProducts;