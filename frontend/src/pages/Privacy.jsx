import React from 'react';
import './LegalPages.css';

function Privacy() {
    return (
        <div className="main-content fade-in">
            <div className="legal-page-container">
                <h1 className="legal-title">Política de Privacidad</h1>
                <div className="legal-content">
                    <p><strong>Compromiso de Confidencialidad</strong></p>
                    <p>
                        En <strong>GamePin</strong>, protegemos tus datos personales conforme a la Ley N° 25.326 de Protección de Datos Personales de la República Argentina.
                    </p>

                    <h3>Recolección de Datos</h3>
                    <p>
                        Recopilamos información básica (nombre, correo electrónico, teléfono) necesaria para procesar tus compras y garantizar la seguridad de la cuenta.
                    </p>

                    <h3>Uso de la Información</h3>
                    <p>Tus datos se utilizan únicamente para:</p>
                    <ul>
                        <li>Procesar y entregar tus pedidos.</li>
                        <li>Verificar la legitimidad de las transacciones y prevenir fraudes.</li>
                        <li>Brindar soporte técnico y atención al cliente.</li>
                    </ul>

                    <h3>Seguridad</h3>
                    <p>
                        Implementamos protocolos de seguridad técnica para evitar el acceso no autorizado, pérdida o alteración de tu información.
                    </p>

                    <h3>No Divulgación</h3>
                    <p>
                        No compartimos, vendemos ni cedemos datos personales a terceros, excepto a procesadores de pago autorizados o por requerimiento de autoridad judicial competente.
                    </p>

                    <h3>Derechos de los Usuarios</h3>
                    <p>
                        Como titular de los datos, tenés derecho a acceder, rectificar o solicitar la eliminación de tu información de nuestra base de datos enviando un correo a nuestro canal de soporte oficial.
                    </p>

                    <h3>Cookies</h3>
                    <p>
                        Utilizamos cookies para mejorar tu experiencia de navegación y recordar tus preferencias dentro de <strong>gamepin.top</strong>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Privacy;
