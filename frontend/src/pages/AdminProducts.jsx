import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import './AdminProducts.css';

function AdminProducts() {
    const navigate = useNavigate();
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    const [regionFilter, setRegionFilter] = useState('Todas');
    const [uploadingImage, setUploadingImage] = useState(false);

    const [formData, setFormData] = useState({
        juego: '',
        imagenUrl: '',
        categoria: 'TopUp',
        descripcion: '',
        infoExtra: '',
        camposEntrega: [{ label: 'UID del Jugador', tipo: 'text', requerido: true, placeholder: 'Ingresa tu UID', opciones: '' }],
        paquetes: [],
        descripcionesRegionales: {}
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
                imagenUrl: prod.imagenUrl,
                categoria: prod.categoria || 'TopUp',
                descripcion: prod.descripcion || '',
                infoExtra: prod.infoExtra || '',
                camposEntrega: prod.camposEntrega.map(c => ({
                    ...c,
                    opciones: Array.isArray(c.opciones) ? c.opciones.join(', ') : c.opciones
                })),
                paquetes: prod.paquetes || [],
                descripcionesRegionales: prod.descripcionesRegionales || {}
            });
        } else {
            setEditingId(null);
            setFormData({
                juego: '',
                imagenUrl: '',
                categoria: 'TopUp',
                descripcion: '',
                infoExtra: '',
                camposEntrega: [{ label: 'UID del Jugador', tipo: 'text', requerido: true, placeholder: 'Ingresa tu UID', opciones: '' }],
                paquetes: [],
                descripcionesRegionales: {}
            });
        }
        setRegionFilter('Todas');
        setError('');
        setShowModal(true);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', 'gamepin_preset'); // Usamos preset genérico o el que tengas

        try {
            // Nota: Aquí podrías usar Firebase o Cloudinary. 
            // Si no tienes configurado Cloudinary, esto fallará. 
            // El usuario suele pegar la URL manual de Firebase.
            // Dejaré el campo manual como prioridad.
            setUploadingImage(false);
        } catch (err) {
            setError('Error al subir imagen');
            setUploadingImage(false);
        }
    };

    const handleAddPackage = () => {
        const newRegion = regionFilter !== 'Todas' ? regionFilter : 'Global';
        setFormData({ ...formData, paquetes: [...formData.paquetes, { nombre: '', precioARS: '', precioUSD: '', region: newRegion, stock: '', bonoDetalle: '', descripcion: '' }] });
    };

    const handleCampoChange = (index, field, value) => {
        const newCampos = [...formData.camposEntrega];
        newCampos[index][field] = value;
        setFormData({ ...formData, camposEntrega: newCampos });
    };

    const handleAddCampo = () => {
        setFormData({ ...formData, camposEntrega: [...formData.camposEntrega, { label: '', tipo: 'text', requerido: true, placeholder: '', opciones: '' }] });
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
        const newPaquetes = [...formData.paquetes];
        newPaquetes.splice(index + 1, 0, pkgToDuplicate);
        setFormData({ 
            ...formData, 
            paquetes: newPaquetes 
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formattedFormData = {
            ...formData,
            camposEntrega: formData.camposEntrega.map(c => ({
                ...c,
                opciones: c.tipo === 'select' 
                    ? c.opciones.split(',').map(opt => opt.trim()).filter(opt => opt !== '') 
                    : []
            }))
        };

        const url = editingId ? `${import.meta.env.VITE_API_URL}/products/${editingId}` : `${import.meta.env.VITE_API_URL}/products`;
        const method = editingId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': localStorage.getItem('token')
                },
                body: JSON.stringify(formattedFormData)
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
        if (!window.confirm('¿Estás seguro de eliminar este juego?')) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/products/${id}`, {
                method: 'DELETE',
                headers: {
                    'x-auth-token': localStorage.getItem('token')
                }
            });

            if (res.ok) {
                fetchProductos();
            }
        } catch (err) {
            setError('Error al eliminar');
        }
    };

    if (loading) return <div className="loading-text">Cargando gestión de productos...</div>;

    return (
        <div className="admin-container">
            <h1 className="section-title">Gestión de Productos</h1>
            
            <div className="admin-menu card-glass" style={{ margin: '20px 0', padding: '15px' }}>
                <div className="admin-nav-group">
                    <button className="btn-nav" onClick={() => navigate('/gp-admin-panel')}>Órdenes</button>
                    <button className="btn-nav active-admin">Productos</button>
                    <button className="btn-nav" onClick={() => navigate('/gp-admin-panel/banners')}>Banners</button>
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
                                        <option value="select">Selección</option>
                                    </select>
                                    {campo.tipo === 'select' && (
                                        <input
                                            style={{ flex: 3 }}
                                            placeholder="Opciones (ej: Op1, Op2)"
                                            value={campo.opciones}
                                            onChange={(e) => handleCampoChange(idx, 'opciones', e.target.value)}
                                            required
                                        />
                                    )}
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
                                <label>Descripción general</label>
                                <textarea 
                                    className="admin-form-textarea"
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Mensaje / Info Extra (Ej: Notas de la región)</label>
                                <textarea 
                                    className="admin-form-textarea"
                                    placeholder="⚠️ Este juego tiene restricciones en ciertos países..."
                                    value={formData.infoExtra}
                                    onChange={(e) => setFormData({...formData, infoExtra: e.target.value})}
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

                             <div className="packages-header" style={{ marginTop: '20px' }}>
                                 <h3>Descripciones por Región</h3>
                                 <div className="region-tabs" style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '10px' }}>
                                    {['Todas', ...new Set(formData.paquetes.map(p => p.region || 'Global'))].map(reg => (
                                        <button 
                                            key={reg}
                                            type="button"
                                            className={`btn-nav ${regionFilter === reg ? 'active-admin' : ''}`}
                                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                                            onClick={() => setRegionFilter(reg)}
                                        >
                                            {reg}
                                        </button>
                                    ))}
                                 </div>
                             </div>
                             <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px', marginTop: '5px' }}>
                                 Información que verá el cliente al seleccionar la región.
                             </p>
                             {[...new Set(formData.paquetes.map(p => p.region || 'Global'))]
                                .filter(reg => regionFilter === 'Todas' || regionFilter === reg)
                                .map(reg => (
                                 <div key={reg} className="form-group" style={{ marginBottom: '10px' }}>
                                     <label style={{ fontSize: '0.85rem' }}>Descripción para Región: <strong>{reg}</strong></label>
                                     <textarea
                                         className="admin-form-textarea"
                                         style={{ minHeight: '60px' }}
                                         placeholder={`Información específica para ${reg}...`}
                                         value={formData.descripcionesRegionales?.[reg] || ''}
                                         onChange={(e) => setFormData({
                                             ...formData,
                                             descripcionesRegionales: {
                                                 ...formData.descripcionesRegionales,
                                                 [reg]: e.target.value
                                             }
                                         })}
                                     />
                                 </div>
                             ))}

                             <div className="packages-header">
                                 <h3>Paquetes / Precios</h3>
                                 <button type="button" className="btn-action" onClick={handleAddPackage}>+ Añadir</button>
                             </div>

                            <div style={{ maxHeight: '400px', overflowY: 'auto', marginTop: '10px', paddingRight: '5px' }}>
                                {formData.paquetes.map((pkg, idx) => {
                                    if (regionFilter !== 'Todas' && (pkg.region || 'Global') !== regionFilter) return null;
                                    return (
                                        <div key={idx} className="package-input-row-block" style={{ marginBottom: '15px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid var(--accent)' }}>
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
                                        </div>
                                    );
                                })}
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
