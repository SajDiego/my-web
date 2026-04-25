import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsappButton from './components/WhatsappButton';
import ScrollToTop from './components/ScrollToTop';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import GameDetail from './pages/GameDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminBanners from './pages/AdminBanners';
import Perfil from './pages/Perfil';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AboutUs from './pages/AboutUs';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import './index.css';
import './App.css';

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
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login onLoginSuccess={(u) => setUsuario(u)} />} />
            <Route path="/game/:id" element={<GameDetail />} />
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
          </Routes>
        </div>
        <Footer />
        <WhatsappButton />
      </div>
    </BrowserRouter>
  );
}

export default App;
