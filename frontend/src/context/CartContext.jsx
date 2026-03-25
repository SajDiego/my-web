import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [carrito, setCarrito] = useState([]);
    const [moneda, setMoneda] = useState('ARS');

    // Tipo de cambio fijo (actualizar cuando sea necesario)
    const tipoCambio = { ARS: 1, USD: 0.001 };

    const convertirPrecio = (precioARS) => {
        const valor = precioARS * tipoCambio[moneda];
        return moneda === 'USD' ? valor.toFixed(2) : Math.round(valor);
    };

    const agregarAlCarrito = (item) => {
        setCarrito((prev) => [...prev, { ...item, id: Date.now() }]);
    };

    const eliminarDelCarrito = (id) => {
        setCarrito((prev) => prev.filter((item) => item.id !== id));
    };

    const vaciarCarrito = () => setCarrito([]);

    const totalCarrito = carrito.reduce((acc, item) => acc + item.precioFinal, 0);

    return (
        <CartContext.Provider value={{
            carrito, moneda, setMoneda,
            agregarAlCarrito, eliminarDelCarrito, vaciarCarrito,
            convertirPrecio, totalCarrito
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
