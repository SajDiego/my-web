import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [enviando, setEnviando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMensaje('');

        if (newPassword !== confirm) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        if (newPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setEnviando(true);
        try {
            const resp = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword })
            });
            const data = await resp.json();

            if (resp.ok) {
                setMensaje('✅ Contraseña actualizada con éxito. Redirigiendo...');
                setTimeout(() => navigate('/login'), 2500);
            } else {
                setError(data.error || 'El enlace es inválido o ha expirado.');
            }
        } catch {
            setError('Error al conectar con el servidor.');
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="main-content">
            <div style={{ maxWidth: '420px', margin: '60px auto', padding: '0 20px' }}>
                <h1 className="section-title" style={{ textAlign: 'center', marginBottom: '30px' }}>
                    Nueva Contraseña
                </h1>

                <div className="card-glass" style={{ padding: '2rem' }}>
                    {!token ? (
                        <p style={{ color: '#ef4444', textAlign: 'center' }}>
                            El enlace de recuperación es inválido o ha expirado.
                        </p>
                    ) : (
                        <form onSubmit={handleSubmit} className="auth-form">
                            {mensaje && (
                                <p style={{ color: '#22c55e', textAlign: 'center', marginBottom: '15px', fontWeight: '500' }}>
                                    {mensaje}
                                </p>
                            )}
                            {error && (
                                <p className="error-msg" style={{ marginBottom: '15px' }}>
                                    {error}
                                </p>
                            )}

                            <div className="form-group">
                                <label>Nueva Contraseña</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Confirmar Contraseña</label>
                                <input
                                    type="password"
                                    value={confirm}
                                    onChange={e => setConfirm(e.target.value)}
                                    placeholder="Repetí la nueva clave"
                                    required
                                />
                            </div>

                            <button type="submit" className="btn-select" disabled={enviando} style={{ marginTop: '10px' }}>
                                {enviando ? 'Guardando...' : 'Cambiar Contraseña'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;