import { Link } from 'react-router-dom';
import { FaInstagram } from 'react-icons/fa';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-section">
          <h3>GamePin</h3>
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
          <p>Email: soporte@gamepin.top</p>
          <p>WhatsApp: +54 9 11 3314-8649</p>
          <div className="footer-socials">
            <a href="https://instagram.com/gamepin.top" target="_blank" rel="noopener noreferrer" className="social-icon" title="Síguenos en Instagram">
              <FaInstagram size={24} />
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p style={{ opacity: 0.7, marginBottom: '10px', fontSize: '0.85rem' }}>
          * Los precios en pesos argentinos son finales, no tenés que sumarle nada.
        </p>
        <p>&copy; {new Date().getFullYear()} GamePin Store. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

export default Footer;
