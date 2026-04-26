import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './Auth.css';

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError('Las contraseñas no coinciden');
        }

        setLoading(true);
        setError('');

        try {
            const resp = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password })
            });

            const data = await resp.json();
            if (!resp.ok) throw new Error(data.error || 'Error al restablecer contraseña');

            setMensaje('¡Contraseña actualizada con éxito! Ya podés iniciar sesión.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="auth-container">
                <div className="auth-card card-glass">
                    <p className="error-msg">Token de recuperación no encontrado o inválido.</p>
                    <Link to="/login" className="auth-link">Volver al inicio</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <Helmet>
                <title>Nueva Contraseña - GamePin Store</title>
            </Helmet>
            <div className="auth-card card-glass fade-in">
                <h2 className="auth-title">Nueva Contraseña</h2>
                
                {error && <p className="error-msg">{error}</p>}
                {mensaje && <p className="success-msg" style={{ color: '#22c55e', textAlign: 'center' }}>{mensaje}</p>}

                {!mensaje && (
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Nueva Contraseña</label>
                            <input 
                                type="password" 
                                placeholder="Mínimo 6 caracteres" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                                minLength="6"
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirmar Contraseña</label>
                            <input 
                                type="password" 
                                placeholder="Repetí tu nueva contraseña" 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                required 
                            />
                        </div>
                        <button type="submit" className="btn-select" disabled={loading}>
                            {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default ResetPassword;
