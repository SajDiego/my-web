import { useState, useEffect } from 'react';

const slides = [
  { id: 1, title: '¡Novedades en Free Fire!', subtitle: 'Nuevos skins disponibles.', color: '#f97316' },
  { id: 2, title: 'Roblox Premium', subtitle: 'Recarga Robux al mejor precio.', color: '#3b82f6' },
  { id: 3, title: 'Call of Duty Mobile', subtitle: 'Puntos CP con entrega inmediata.', color: '#22c55e' }
];

function Carousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="carousel">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`carousel-slide ${index === current ? 'active' : ''}`}
          style={{ background: `linear-gradient(45deg, #09090b, ${slide.color}33)` }}
        >
          <div className="carousel-content">
            <h2 className="carousel-title">{slide.title}</h2>
            <p className="carousel-subtitle">{slide.subtitle}</p>
            <button className="btn-select" style={{ width: 'auto', padding: '10px 24px' }}>Ver más</button>
          </div>
        </div>
      ))}
      <div className="carousel-dots">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`dot ${index === current ? 'dot-active' : ''}`}
            onClick={() => setCurrent(index)}
          />
        ))}
      </div>
    </div>
  );
}

export default Carousel;
