import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './Auth.css';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMensaje('');

        try {
            const resp = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await resp.json();
            if (!resp.ok) throw new Error(data.error || 'Error al procesar solicitud');

            setMensaje('Si el correo está registrado, recibirás un enlace de recuperación en breve.');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container app-container">
            <Helmet>
                <title>Recuperar Contraseña - GamePin Store</title>
            </Helmet>
            <div className="auth-card card-glass fade-in">
                <h2 className="auth-title">Recuperar Contraseña</h2>
                <p style={{ textAlign: 'center', marginBottom: '20px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Ingresá tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                </p>

                {error && <p className="error-msg">{error}</p>}
                {mensaje && <p className="success-msg" style={{ color: '#22c55e', textAlign: 'center' }}>{mensaje}</p>}

                {!mensaje && (
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Correo Electrónico</label>
                            <input 
                                type="email" 
                                placeholder="tu@correo.com" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>
                        <button type="submit" className="btn-select" disabled={loading}>
                            {loading ? 'Enviando...' : 'Enviar enlace'}
                        </button>
                    </form>
                )}

                <p className="auth-footer">
                    <Link to="/login" className="auth-link">Volver al inicio de sesión</Link>
                </p>
            </div>
        </div>
    );
}

export default ForgotPassword;
