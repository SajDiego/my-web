import { useState, useEffect } from 'react';

function CustomCursor() {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const mouseMove = (e) => {
            setPosition({ x: e.clientX, y: e.clientY });
        };
        
        const mouseOver = (e) => {
            if (['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', mouseMove);
        window.addEventListener('mouseover', mouseOver);
        
        return () => {
            window.removeEventListener('mousemove', mouseMove);
            window.removeEventListener('mouseover', mouseOver);
        };
    }, []);

    return (
        <div 
            className={`custom-cursor ${isHovering ? 'cursor-expand' : ''}`}
            style={{ 
                left: `${position.x}px`, 
                top: `${position.y}px` 
            }}
        />
    );
}

export default CustomCursor;
