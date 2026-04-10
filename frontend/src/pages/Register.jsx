import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

function Register() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.includes('@') || email.length < 5) {
            setError('Por favor, ingresa un correo válido.');
            return;
        }

        try {
            const resp = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, password })
            });

            const data = await resp.json();
            if (!resp.ok) throw new Error(data.error || 'Error al registrarse');

            alert("¡Cuenta creada exitosamente! Ya podés iniciar sesión.");
            navigate('/login');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="main-content auth-container">
            <div className="card-glass">
                <h2 className="auth-title">Crear Cuenta</h2>
                {error && <p className="error-msg">{error}</p>}

                <form className="auth-form" onSubmit={handleRegister}>
                    <div className="form-group">
                        <label>Nombre Completo</label>
                        <input type="text" placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Correo Electrónico</label>
                        <input type="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Contraseña</label>
                        <input type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="6" />
                    </div>
                    <button type="submit" className="btn-select">Registrarme</button>
                </form>

                <p className="auth-footer">
                    ¿Ya tenés cuenta? <Link to="/login" className="auth-link">Iniciá sesión acá</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
