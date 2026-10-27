import { useState, useEffect } from 'react';
import './Carousel.css';

function Carousel() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const CACHE_KEY = 'gp_banners_cache';
    const CACHE_TTL = 10 * 60 * 1000; // 10 minutos

    const fetchBanners = async () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, ts } = JSON.parse(cached);
          if (Date.now() - ts < CACHE_TTL) {
            if (Array.isArray(data)) setSlides(data);
            setLoading(false);
            return;
          }
        }
        const res = await fetch(`${import.meta.env.VITE_API_URL}/banners`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setSlides(data);
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
        }
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
    }, 10000);
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

            </div>
          </div>
        ))}
      </div>
      
      {displaySlides[current]?.link && (
        <button
          className="btn-select carousel-link-btn"
          onClick={() => { window.location.href = displaySlides[current].link; }}
        >
          Ver más
        </button>
      )}

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
