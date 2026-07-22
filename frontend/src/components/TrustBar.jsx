import React from 'react';
import './TrustBar.css';

export function TrustBar() {
    return (
        <div className="trust-bar">
            <div className="trust-item">
                <span className="trust-icon">⚡</span>
                <div>
                    <p className="trust-title">Entrega Inmediata</p>
                    <p className="trust-sub">Recargas procesadas al instante</p>
                </div>
            </div>
            <div className="trust-divider" />
            <div className="trust-item">
                <span className="trust-icon">🔒</span>
                <div>
                    <p className="trust-title">Pagos Seguros</p>
                    <p className="trust-sub">Transacciones 100% protegidas</p>
                </div>
            </div>
            <div className="trust-divider" />
            <div className="trust-item">
                <span className="trust-icon">🎧</span>
                <div>
                    <p className="trust-title">Soporte Disponible</p>
                    <p className="trust-sub">Te ayudamos en cualquier momento</p>
                </div>
            </div>
            <div className="trust-divider" />
            <div className="trust-item">
                <span className="trust-icon">✅</span>
                <div>
                    <p className="trust-title">100% Oficial</p>
                    <p className="trust-sub">Productos y precios garantizados</p>
                </div>
            </div>
        </div>
    );
}
