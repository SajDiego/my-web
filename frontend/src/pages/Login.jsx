import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './Auth.css';

function Login({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const resp = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await resp.json();
            if (!resp.ok) throw new Error(data.error || 'Error al iniciar sesión');

            // Guardar token y datos
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));

            if (onLoginSuccess) {
                onLoginSuccess(data.usuario);
            }

            if (data.usuario.rol === 'admin') {
                navigate('/gp-admin-panel');
            } else {
                navigate('/cuenta');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-container">
            <Helmet>
                <title>Iniciar Sesión - GamePin Store</title>
            </Helmet>
            <div className="auth-card card-glass fade-in">
                <h2 className="auth-title">Iniciar Sesión</h2>
                {error && <p className="error-msg">{error}</p>}

                <form className="auth-form" onSubmit={handleLogin}>
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
                    <div className="form-group">
                        <label>Contraseña</label>
                        <input 
                            type="password" 
                            placeholder="Tu contraseña" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                        <div style={{ textAlign: 'right', marginTop: '5px' }}>
                            <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none' }}>
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>
                    </div>
                    <button type="submit" className="btn-select">Ingresar</button>
                </form>

                <p className="auth-footer">
                    ¿No tenés cuenta? <Link to="/register" className="auth-link">Registrate acá</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;