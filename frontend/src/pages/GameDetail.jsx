import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './GameDetail.css';

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
            precioARS: paqueteSeleccionado.precioARS,
            precioUSD: paqueteSeleccionado.precioUSD,
            uidJugador: uid,
            regionJugador: (juego.requiereDato === 'ID') ? region : "",
            tipoDatoEntrega: juego.requiereDato || 'ID'
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

            <div className="game-detail-body single-panel card-glass">
                <div className="step-section">
                    <h3 className="minimal-step-title">1. Elige tu recarga</h3>
                    <div className="package-grid">
                        {juego.paquetes.map((paquete) => (
                            <div
                                key={paquete._id}
                                className={`package-minimal-item ${paqueteSeleccionado?._id === paquete._id ? 'active' : ''}`}
                                onClick={() => { setPaqueteSeleccionado(paquete); setMensaje(''); }}
                            >
                                <div className="pack-info">
                                    <span className="pack-name">{paquete.nombre}</span>
                                    {paquete.bonoDetalle && <span className="pack-badge">{paquete.bonoDetalle}</span>}
                                </div>
                                <div className="pack-price">
                                    {moneda === 'USD' ? `U$D ${paquete.precioUSD}` : `$ ${paquete.precioARS}`}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {paqueteSeleccionado && (
                    <div className="step-section fade-in">
                        <hr className="minimal-divider" />
                        <h3 className="minimal-step-title">2. Datos de entrega</h3>
                        
                        <form className="minimal-uid-form" onSubmit={handleAgregarAlCarrito}>
                            <div className="input-group-row">
                                <input
                                    type={juego.requiereDato === 'Email' ? 'email' : 'text'}
                                    className="minimal-input"
                                    placeholder={
                                        juego.requiereDato === 'Email' ? 'Recibirás tu PIN en este Email' : 
                                        'UID del Jugador'
                                    }
                                    value={uid}
                                    onChange={(e) => setUid(e.target.value)}
                                    required
                                />

                                {juego.requiereDato === 'ID' && (
                                    <input
                                        type="text"
                                        className="minimal-input"
                                        placeholder="Región (Opcional)"
                                        value={region}
                                        onChange={(e) => setRegion(e.target.value)}
                                    />
                                )}
                            </div>

                            {mensaje && (
                                <p className={mensaje.includes('!') ? 'order-success fade-in' : 'error-msg fade-in'}>{mensaje}</p>
                            )}

                            <button type="submit" className="btn-select btn-minimal-submit">
                                Agregar al Carrito ( {moneda === 'USD' ? `U$D ${paqueteSeleccionado.precioUSD}` : `$ ${paqueteSeleccionado.precioARS}`} )
                            </button>

                            {paqueteSeleccionado.descripcion && (
                                <div className="package-description-note fade-in">
                                    {paqueteSeleccionado.descripcion}
                                </div>
                            )}
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

export default GameDetail;
