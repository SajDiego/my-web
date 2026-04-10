import { useState, useEffect } from 'react';
import './Carousel.css';

const slides = [
  { 
    id: 1, 
    title: '¡Novedades en Free Fire!', 
    subtitle: 'Nuevos skins disponibles.', 
    color: '#f97316',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070'
  },
  { 
    id: 2, 
    title: 'Roblox Premium', 
    subtitle: 'Recarga Robux al mejor precio.', 
    color: '#3b82f6',
    image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=1957'
  },
  { 
    id: 3, 
    title: 'Call of Duty Mobile', 
    subtitle: 'Puntos CP con entrega inmediata.', 
    color: '#22c55e',
    image: 'https://images.unsplash.com/photo-1614027164847-1b28014309be?q=80&w=1935'
  }
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
          style={{ 
            backgroundImage: `linear-gradient(45deg, rgba(9, 9, 11, 0.9), rgba(9, 9, 11, 0.2)), url(${slide.image})`,
            borderColor: slide.color
          }}
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
