import { FaWhatsapp } from 'react-icons/fa';

function WhatsappButton() {
  const numero = "5491133148649"; // Reemplaza con tu número real
  const mensaje = "Hola IntegralPro! Necesito ayuda con una recarga.";
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

  return (
    <a
      href={url}
      className="whatsapp-float"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
    >
      <FaWhatsapp className="whatsapp-icon" />
    </a>
  );
}

export default WhatsappButton;
