import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [carrito, setCarrito] = useState([]);
    const [moneda, setMoneda] = useState('ARS');

    const agregarAlCarrito = (item) => {
        setCarrito((prev) => [...prev, { ...item, id: Date.now() }]);
    };

    const eliminarDelCarrito = (id) => {
        setCarrito((prev) => prev.filter((item) => item.id !== id));
    };

    const vaciarCarrito = () => setCarrito([]);

    const totalCarrito = carrito.reduce((acc, item) => {
        const precio = moneda === 'USD' ? item.precioUSD : item.precioARS;
        return acc + (Number(precio) || 0);
    }, 0);

    return (
        <CartContext.Provider value={{
            carrito, moneda, setMoneda,
            agregarAlCarrito, eliminarDelCarrito, vaciarCarrito,
            totalCarrito
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
