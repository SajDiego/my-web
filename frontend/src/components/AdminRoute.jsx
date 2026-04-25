import { Navigate } from 'react-router-dom';

function AdminRoute({ children }) {
    const token = localStorage.getItem('token');
    const usuarioString = localStorage.getItem('usuario');
    const usuario = usuarioString ? JSON.parse(usuarioString) : null;

    if (!token || !usuario || usuario.rol !== 'admin') {
        // Si no hay token o el rol no es admin, redirigir al login o home
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default AdminRoute;
