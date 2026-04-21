import { useState, useEffect } from 'react';
import './Carousel.css';

function Carousel() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/banners`);
        const data = await res.json();
        if (Array.isArray(data)) setSlides(data);
      } catch (error) {
        console.error("Error cargando banners:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides]);

  if (loading) return null;

  // Si no hay banners, mostramos uno por defecto (CSS puro, cero datos de imagen)
  const displaySlides = slides.length > 0 ? slides : [{
    _id: 'fallback',
    title: 'BIENVENIDOS A GAMEPIN',
    subtitle: 'Tu tienda líder en recargas y gift cards',
    color: '#6d28d9',
    isFallback: true
  }];

  return (
    <div className="carousel">
      {displaySlides.map((slide, index) => (
        <div
          key={slide._id || slide.id}
          className={`carousel-slide ${index === current ? 'active' : ''}`}
          style={{
            backgroundImage: slide.isFallback
              ? `linear-gradient(135deg, #18181b 0%, #6d28d9 100%)`
              : `linear-gradient(45deg, rgba(9, 9, 11, 0.9), rgba(9, 9, 11, 0.2)), url(${slide.image})`,
            borderColor: slide.color || '#6d28d9'
          }}
        >
          <div className="carousel-content">
            {slide.title && <h2 className="carousel-title">{slide.title}</h2>}
            {slide.subtitle && <p className="carousel-subtitle">{slide.subtitle}</p>}
            {slide.link && (
              <button
                className="btn-select"
                style={{ width: 'auto', padding: '10px 24px' }}
                onClick={() => window.location.href = slide.link}
              >
                Ver más
              </button>
            )}
          </div>
        </div>
      ))}
      {slides.length > 1 && (
        <div className="carousel-dots">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`dot ${index === current ? 'dot-active' : ''}`}
              onClick={() => setCurrent(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Carousel;
