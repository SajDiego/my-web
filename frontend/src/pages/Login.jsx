import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault()
        setError('');

        try {
            const resp = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await resp.json();

            if (!resp.ok) {
                throw new Error(data.error || 'Error al iniciar sesión');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));

            if (onLoginSuccess) onLoginSuccess(data.usuario);
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="main-content auth-container">
            <div className="card-glass">
                <h2 className="product-title" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Iniciar Sesión</h2>

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
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-select">Ingresar a mi Cuenta</button>
                </form>
            </div>
        </div>
    );
}

export default Login;
