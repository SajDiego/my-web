import { useNavigate } from 'react-router-dom';
import { bankAccounts, cashInstructions, qr, binancePay, astroPayQR } from '../data/paymentConfig';

function CheckoutSuccess({ metodoPago, montoFinal, moneda }) {
    const navigate = useNavigate();

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert(`Copiado: ${text}`);
    };

    const isTransfer = ['Transferencia Bancaria', 'Mercado Pago'].includes(metodoPago);
    const isCash = metodoPago === 'PagoFacil / Rapipago';
    const isQR = metodoPago === 'QR';
    const isBinancePay = metodoPago === 'Binance Pay';
    const isAstroPayQR = metodoPago === 'AstroPay QR';

    return (
        <div className="main-content auth-container" style={{ textAlign: 'center' }}>
            <div className="card-glass checkout-success-card">
                <h2 className="success-title">¡Pedido Confirmado!</h2>
                
                <p className="success-msg">
                    {isTransfer || isCash || isQR || isBinancePay || isAstroPayQR
                        ? (
                            <>
                                Realizá tu pago de <strong style={{ color: '#22c55e', fontSize: '1.4rem' }}>{moneda === 'USD' ? 'U$D' : '$'} {montoFinal}</strong> siguiendo estas instrucciones:
                            </>
                        )
                        : '🚀 Tu orden está en proceso. En minutos recibirás tu recarga. ¡Gracias por tu compra!'
                    }
                </p>

                {/* Bloque de QR */}
                {isQR && (
                    <div className="qr-container" style={{ marginBottom: '40px' }}>
                        <div className="bank-card" style={{ borderTop: `4px solid ${qr.color}`, textAlign: 'center' }}>
                            <div className="bank-card-header">
                                <strong style={{ color: qr.color }}>📍 {qr.nombre}</strong>
                            </div>
                            <div className="bank-card-body" style={{ alignItems: 'center' }}>
                                <p style={{ fontSize: '0.95rem', marginBottom: '20px' }}>
                                    {qr.instruccion}
                                </p>
                                <img 
                                    src={qr.imagen} 
                                    alt="QR de Pago" 
                                    style={{ maxWidth: '250px', borderRadius: '12px', border: '5px solid white' }} 
                                />
                                <p style={{ marginTop: '20px', fontSize: '1rem' }}>
                                    Total a pagar: <strong style={{ color: '#22c55e' }}>$ {montoFinal}</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bloque de Binance Pay */}
                {isBinancePay && (
                    <div className="qr-container" style={{ marginBottom: '40px' }}>
                        <div className="bank-card" style={{ borderTop: `4px solid ${binancePay.color}`, textAlign: 'center' }}>
                            <div className="bank-card-header">
                                <strong style={{ color: binancePay.color }}>📍 {binancePay.nombre}</strong>
                            </div>
                            <div className="bank-card-body" style={{ alignItems: 'center' }}>
                                <p style={{ fontSize: '0.95rem', marginBottom: '20px', fontWeight: 'bold' }}>
                                    {binancePay.instruccion}
                                </p>
                                <img 
                                    src={binancePay.imagen} 
                                    alt="Binance Pay QR" 
                                    style={{ maxWidth: '250px', borderRadius: '12px', border: '5px solid white' }} 
                                />
                                <div style={{ marginTop: '20px' }}>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        If you cannot scan the QR code, pay via Binance Pay ID:
                                    </p>
                                    <div className="copy-field" style={{ justifyContent: 'center' }}>
                                        <span>ID: {binancePay.payId}</span>
                                        <button type="button" onClick={() => copyToClipboard(binancePay.payId)} className="btn-copy">📋</button>
                                    </div>
                                </div>
                                <p style={{ marginTop: '20px', fontSize: '1rem' }}>
                                    Total to pay: <strong style={{ color: '#22c55e' }}>U$D {montoFinal}</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bloque de AstroPay QR */}
                {isAstroPayQR && (
                    <div className="qr-container" style={{ marginBottom: '40px' }}>
                        <div className="bank-card" style={{ borderTop: `4px solid ${astroPayQR.color}`, textAlign: 'center' }}>
                            <div className="bank-card-header">
                                <strong style={{ color: astroPayQR.color }}>📍 {astroPayQR.nombre}</strong>
                            </div>
                            <div className="bank-card-body" style={{ alignItems: 'center' }}>
                                <p style={{ fontSize: '0.95rem', marginBottom: '20px', fontWeight: 'bold' }}>
                                    {astroPayQR.instruccion}
                                </p>
                                <img 
                                    src={astroPayQR.imagen} 
                                    alt="AstroPay QR" 
                                    style={{ maxWidth: '250px', borderRadius: '12px', border: '5px solid white' }} 
                                />
                                <p style={{ marginTop: '20px', fontSize: '1rem' }}>
                                    Total a pagar: <strong style={{ color: '#22c55e' }}>U$D {montoFinal}</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bloque de Bancos (Transferencia / Mercado Pago) */}
                {isTransfer && (
                    <div className="bank-accounts-grid">
                        {bankAccounts.map((acc) => (
                            <div key={acc.banco} className="bank-card">
                                <div className="bank-card-header">
                                    <strong>{acc.banco}</strong>
                                    <span className="bank-titular">{acc.titular}</span>
                                </div>
                                <div className="bank-card-body">
                                    <div className="copy-field">
                                        <span>{acc.tipo}: {acc.numero}</span>
                                        <button type="button" onClick={() => copyToClipboard(acc.numero)} className="btn-copy" title="Copiar">📋</button>
                                    </div>
                                    <div className="copy-field">
                                        <span>Alias: {acc.alias}</span>
                                        <button type="button" onClick={() => copyToClipboard(acc.alias)} className="btn-copy" title="Copiar">📋</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Bloque de Efectivo (Pago Fácil / Rapipago) */}
                {isCash && (
                    <div className="cash-instructions" style={{ marginBottom: '40px' }}>
                        {Object.values(cashInstructions).map((inst) => (
                            <div key={inst.nombre} className="bank-card" style={{ borderLeft: `4px solid ${inst.color}`, marginBottom: '20px' }}>
                                <div className="bank-card-header">
                                    <strong style={{ color: inst.color }}>📍 {inst.nombre}</strong>
                                </div>
                                <div className="bank-card-body">
                                    <p style={{ fontSize: '0.95rem', marginBottom: '10px' }}>{inst.instruccion}</p>
                                    <div className="copy-field">
                                        <span>{inst.dato}</span>
                                        <button type="button" onClick={() => copyToClipboard(inst.dato)} className="btn-copy" title="Copiar">📋</button>
                                    </div>
                                    <p style={{ marginTop: '12px', fontSize: '1rem' }}>
                                        Monto a entregar: <strong style={{ color: '#22c55e' }}>$ {montoFinal}</strong>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="success-actions">
                    {metodoPago !== 'Billetera Virtual' && (
                        <a
                            href={`https://wa.me/5491133148649?text=${encodeURIComponent('Hola GamePin Store! Acabo de realizar un pedido. Adjunto el comprobante.')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-whatsapp-success"
                        >
                            Informar Pago por WhatsApp
                        </a>
                    )}
                    <button className="btn-back-home" onClick={() => navigate('/')}>
                        Volver al Inicio
                    </button>
                </div>

                <div style={{ marginTop: '30px', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '12px' }}>¿Necesitás ayuda? Comunicate con nosotros</p>
                    <a
                        href={`https://wa.me/5491133148649?text=${encodeURIComponent('Hola! Necesito ayuda con mi pedido.')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#25D366', color: 'white', padding: '10px 20px', borderRadius: '25px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}
                    >
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="18" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
                        Escribinos por WhatsApp
                    </a>
                </div>
            </div>
        </div>
    );
}

export default CheckoutSuccess;
