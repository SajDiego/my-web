import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-section">
          <h3>IntegralPro</h3>
          <p>Tu tienda de confianza para recargas de juegos. Rápido, seguro y al mejor precio.</p>
        </div>
        <div className="footer-section">
          <h4>Navegación</h4>
          <Link to="/">Inicio</Link>
          <Link to="/about">Sobre Nosotros</Link>
          <Link to="/terms">Términos y Condiciones</Link>
          <Link to="/privacy">Política de Privacidad</Link>
        </div>
        <div className="footer-section">
          <h4>Contacto</h4>
          <p>Email: soporte@integralpro.com</p>
          <p>WhatsApp: +54 9 11 1234-5678</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} IntegralPro Store. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

export default Footer;
