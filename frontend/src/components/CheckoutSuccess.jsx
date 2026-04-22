import { useNavigate } from 'react-router-dom';
import { bankAccounts, cashInstructions, qr, binancePay } from '../data/paymentConfig';

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

    return (
        <div className="main-content auth-container" style={{ textAlign: 'center' }}>
            <div className="card-glass checkout-success-card">
                <h2 className="success-title">¡Pedido Confirmado!</h2>
                
                <p className="success-msg">
                    {isTransfer || isCash || isQR || isBinancePay
                        ? (
                            <>
                                Realizá tu pago de <strong style={{ color: '#22c55e', fontSize: '1.4rem' }}>{moneda === 'USD' ? 'U$D' : '$'} {montoFinal}</strong> siguiendo estas instrucciones:
                            </>
                        )
                        : 'Tu orden está pendiente de pago. Por favor seguí las instrucciones para realizar el pago.'
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
                    <a
                        href={`https://wa.me/5491133148649?text=${encodeURIComponent('Hola IntegralPro! Acabo de realizar un pedido. Adjunto el comprobante.')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-whatsapp-success"
                    >
                        Informar Pago por WhatsApp
                    </a>
                    <button className="btn-back-home" onClick={() => navigate('/')}>
                        Volver al Inicio
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CheckoutSuccess;
