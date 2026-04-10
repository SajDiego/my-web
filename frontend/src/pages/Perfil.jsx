import { useState, useEffect } from 'react';
import './Perfil.css';

function Perfil() {
    const [user, setUser] = useState({ nombre: '', email: '' });
    const [password, setPassword] = useState('');
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        const fetchPerfil = async () => {
            const token = localStorage.getItem('token');
            const resp = await fetch('http://localhost:3000/api/auth/perfil', {
                headers: { 'x-auth-token': token }
            });
            const data = await resp.json();
            setUser(data);
        };
        fetchPerfil();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const resp = await fetch('http://localhost:3000/api/auth/perfil', {
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
        </div>
    );
}

export default Perfil;
