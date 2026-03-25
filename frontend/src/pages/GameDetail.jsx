import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function GameDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { agregarAlCarrito, convertirPrecio, moneda } = useCart();

    const [juego, setJuego] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [paqueteSeleccionado, setPaqueteSeleccionado] = useState(null);
    const [uid, setUid] = useState('');
    const [region, setRegion] = useState('');
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        const cargarJuego = async () => {
            try {
                const resp = await fetch(`http://localhost:3000/api/products/${id}`);
                const data = await resp.json();
                setJuego(data);
            } catch (error) {
                console.error("Error cargando el juego:", error);
            } finally {
                setCargando(false);
            }
        };
        cargarJuego();
    }, [id]);

    const handleAgregarAlCarrito = (e) => {
        e.preventDefault();
        if (!paqueteSeleccionado) {
            setMensaje('Selecciona un paquete primero.');
            return;
        }
        agregarAlCarrito({
            juegoNombre: juego.juego,
            paqueteElegido: paqueteSeleccionado.nombre,
            precioFinal: paqueteSeleccionado.precio,
            uidJugador: uid,
            regionJugador: region
        });
        setMensaje('¡Agregado al carrito!');
        setUid('');
        setRegion('');
        setPaqueteSeleccionado(null);
    };

    if (cargando) return <div className="main-content"><p className="loading-text">Cargando...</p></div>;
    if (!juego) return <div className="main-content"><p className="loading-text">Juego no encontrado.</p></div>;

    return (
        <div className="main-content">
            <button className="btn-back" onClick={() => navigate('/')}>← Volver</button>

            <div className="game-detail-header">
                <div className="game-detail-icon">{juego.juego[0]}</div>
                <div>
                    <h1 className="hero-title" style={{ fontSize: '2rem', textAlign: 'left' }}>{juego.juego}</h1>
                    <p className="home-subtitle">{juego.descripcion || 'Recarga directa a tu cuenta.'}</p>
                </div>
            </div>

            <div className="game-detail-body">
                {/* Lista de paquetes */}
                <div className="packages-panel card-glass">
                    <h3 className="section-title">Selecciona un paquete</h3>
                    <div className="package-list">
                        {juego.paquetes.map((paquete) => (
                            <div
                                key={paquete._id}
                                className={`package-item ${paqueteSeleccionado?._id === paquete._id ? 'package-active' : ''}`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => { setPaqueteSeleccionado(paquete); setMensaje(''); }}
                            >
                                <span>
                                    {paquete.nombre}
                                    {paquete.bonoDetalle && <small className="package-badge">{paquete.bonoDetalle}</small>}
                                </span>
                                <strong>{moneda === 'USD' ? 'U$D' : '$'} {convertirPrecio(paquete.precio)}</strong>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Formulario de UID */}
                <form className="uid-panel card-glass" onSubmit={handleAgregarAlCarrito}>
                    <h3 className="section-title">Datos de entrega</h3>

                    {paqueteSeleccionado && (
                        <p className="home-subtitle">
                            Paquete: <strong style={{ color: 'var(--accent)' }}>{paqueteSeleccionado.nombre}</strong>
                            {' — '}{moneda === 'USD' ? 'U$D' : '$'} {convertirPrecio(paqueteSeleccionado.precio)}
                        </p>
                    )}

                    <div className="form-group">
                        <label>UID del Jugador</label>
                        <input
                            type="text"
                            placeholder="ID en el juego"
                            value={uid}
                            onChange={(e) => setUid(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Región (opcional)</label>
                        <input
                            type="text"
                            placeholder="Ej: Sudamérica"
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                        />
                    </div>

                    {mensaje && (
                        <p className={mensaje.includes('!') ? 'order-success' : 'error-msg'}>{mensaje}</p>
                    )}

                    <button type="submit" className="btn-select">Agregar al Carrito</button>
                </form>
            </div>
        </div>
    );
}

export default GameDetail;
