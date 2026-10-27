import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsappButton from './components/WhatsappButton';
import ScrollToTop from './components/ScrollToTop';
import AdminRoute from './components/AdminRoute';
import './index.css';

// Páginas principales — carga inmediata (usuario las visita al entrar)
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Login from './pages/Login';
import GameDetail from './pages/GameDetail';
import Register from './pages/Register';

// Páginas secundarias — lazy (se cargan solo cuando el usuario las visita)
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Perfil = lazy(() => import('./pages/Perfil'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));

// Páginas admin — lazy (usuarios normales NUNCA descargan este código)
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/AdminProducts'));
const AdminBanners = lazy(() => import('./pages/AdminBanners'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminExchangeRates = lazy(() => import('./pages/AdminExchangeRates'));

function App() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="app-container">
        <Navbar usuario={usuario} onLogout={handleLogout} />
        <div className="content-wrapper">
          <Suspense fallback={<div className="loading-text">Cargando...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalogo" element={<Catalog />} />
              <Route path="/login" element={<Login onLoginSuccess={(u) => setUsuario(u)} />} />
              <Route path="/game/:id" element={<GameDetail />} />
              <Route path="/product/:id" element={<GameDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/cuenta" element={<Perfil />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/gp-admin-panel" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/gp-admin-panel/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
              <Route path="/gp-admin-panel/banners" element={<AdminRoute><AdminBanners /></AdminRoute>} />
              <Route path="/gp-admin-panel/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
              <Route path="/gp-admin-panel/exchange-rates" element={<AdminRoute><AdminExchangeRates /></AdminRoute>} />
            </Routes>
          </Suspense>
        </div>
        <Footer />
        <WhatsappButton />
      </div>
    </BrowserRouter>
  );
}

export default App;
