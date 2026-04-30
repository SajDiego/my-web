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

  const displaySlides = slides.length > 0 ? slides : [{
    _id: 'fallback',
    title: 'BIENVENIDOS A GAMEPIN',
    subtitle: 'Tu tienda líder en recargas y gift cards',
    color: '#6d28d9',
    isFallback: true
  }];

  return (
    <div className="carousel" style={{ '--current-index': current }}>
      <div className="carousel-track">
        {displaySlides.map((slide, index) => (
          <div
            key={slide._id || slide.id}
            className={`carousel-slide ${index === current ? 'active' : ''}`}
            onClick={() => setCurrent(index)}
            style={{
              backgroundImage: slide.isFallback
                ? `linear-gradient(135deg, #18181b 0%, #6d28d9 100%)`
                : `url(${slide.image})`,
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
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = slide.link;
                  }}
                >
                  Ver más
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
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
