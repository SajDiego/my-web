import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();

const DEFAULT_RATES = {
  COP: { tasa: 3100, factor_redondeo: 100 },
  MXN: { tasa: 17.50, factor_redondeo: 10 },
  CLP: { tasa: 950, factor_redondeo: 10 },
  BRL: { tasa: 5.60, factor_redondeo: 1 },
  PEN: { tasa: 3.75, factor_redondeo: 1 }
};

export function CartProvider({ children }) {
  const [carrito, setCarrito] = useState([]);
  const [moneda, setMoneda] = useState('ARS');
  const [exchangeRates, setExchangeRates] = useState(DEFAULT_RATES);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletCurrency, setWalletCurrency] = useState('USD');

  useEffect(() => {
    const CACHE_KEY = 'gp_exchange_rates_cache';
    const CACHE_TTL = 15 * 60 * 1000; // 15 minutos

    const fetchRates = async () => {
      try {
        // Usar cache si está vigente
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, ts } = JSON.parse(cached);
          if (Date.now() - ts < CACHE_TTL) {
            setExchangeRates(prev => ({ ...prev, ...data }));
            return;
          }
        }
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const endpoint = API_URL.endsWith('/api') ? `${API_URL}/exchange-rates` : `${API_URL}/api/exchange-rates`;
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          if (data && typeof data === 'object') {
            setExchangeRates(prev => ({ ...prev, ...data }));
            localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
          }
        }
      } catch (err) {
        console.error('Error fetching exchange rates', err);
      }
    };
    fetchRates();
  }, []);

  const refreshWallet = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const resp = await fetch(`${API_URL}/auth/perfil`, {
        headers: { 'x-auth-token': token }
      });
      if (resp.ok) {
        const data = await resp.json();
        setWalletBalance(data.wallet_balance || 0);
        setWalletCurrency(data.wallet_currency || 'USD');
      }
    } catch (err) {
      console.error('Error fetching wallet', err);
    }
  }, []);

  // Fetch wallet on mount
  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  const agregarAlCarrito = (item) => {
    setCarrito((prev) => [...prev, { ...item, id: Date.now() }]);
  };

  const eliminarDelCarrito = (id) => {
    setCarrito((prev) => prev.filter((item) => item.id !== id));
  };

  const vaciarCarrito = () => setCarrito([]);

  const getPrecioCalculado = (item, tempMoneda = moneda) => {
    if (tempMoneda === 'USD') {
      return (item.precioUSDDescuento != null && item.precioUSDDescuento > 0)
        ? Number(item.precioUSDDescuento)
        : Number(item.precioUSD);
    } else if (tempMoneda === 'ARS') {
      return (item.precioARSDescuento != null && item.precioARSDescuento > 0)
        ? Number(item.precioARSDescuento)
        : Number(item.precioARS);
    } else {
      const baseUSD = (item.precioUSDDescuento != null && item.precioUSDDescuento > 0)
        ? Number(item.precioUSDDescuento)
        : Number(item.precioUSD);

      if (!exchangeRates || !exchangeRates[tempMoneda]) return baseUSD;

      const { tasa, factor_redondeo } = exchangeRates[tempMoneda];
      const precioConvertido = baseUSD * tasa;

      if (precioConvertido < 10) {
        return Math.ceil(precioConvertido * 100) / 100;
      } else if (precioConvertido < 100) {
        return Math.ceil(precioConvertido);
      } else if (precioConvertido < 1000) {
        return Math.ceil(precioConvertido / 10) * 10;
      } else {
        return Math.ceil(precioConvertido / factor_redondeo) * factor_redondeo;
      }
    }
  };

  const getPrecioNormal = (item, tempMoneda = moneda) => {
    if (tempMoneda === 'USD') return Number(item.precioUSD);
    if (tempMoneda === 'ARS') return Number(item.precioARS);

    const baseUSD = Number(item.precioUSD);
    if (!exchangeRates || !exchangeRates[tempMoneda]) return baseUSD;
    const { tasa, factor_redondeo } = exchangeRates[tempMoneda];
    const precioConvertido = baseUSD * tasa;

    if (precioConvertido < 10) return Math.ceil(precioConvertido * 100) / 100;
    if (precioConvertido < 100) return Math.ceil(precioConvertido);
    if (precioConvertido < 1000) return Math.ceil(precioConvertido / 10) * 10;
    return Math.ceil(precioConvertido / factor_redondeo) * factor_redondeo;
  };

  const formatPrice = (value, tempMoneda = moneda) => {
    if (tempMoneda === 'USD') return `U$D ${Number(value).toFixed(2)}`;
    if (tempMoneda === 'BRL') return `R$ ${value}`;
    if (tempMoneda === 'PEN') return `S/ ${value}`;
    return `$ ${value}`;
  };

  const totalCarrito = carrito.reduce((acc, item) => acc + getPrecioCalculado(item), 0);

  return (
    <CartContext.Provider value={{
      carrito, moneda, setMoneda, exchangeRates,
      agregarAlCarrito, eliminarDelCarrito, vaciarCarrito,
      totalCarrito, getPrecioCalculado, getPrecioNormal, formatPrice,
      walletBalance, walletCurrency, setWalletBalance, setWalletCurrency, refreshWallet
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}