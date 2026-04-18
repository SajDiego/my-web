import React from 'react';
import './LegalPages.css';

function Terms() {
    return (
        <div className="main-content fade-in">
            <div className="legal-page-container">
                <h1 className="legal-title">Términos y Condiciones de Uso</h1>
                <div className="legal-content">
                    <p><em>Última actualización: Abril 2026</em></p>
                    <p>
                        El acceso y uso del sitio web <strong>gamepin.top</strong> se rige por los siguientes términos y condiciones:
                    </p>

                    <h3>Primero: Naturaleza del Servicio y Ausencia de Devoluciones</h3>
                    <p>
                        Debido a la naturaleza digital de los productos comercializados (pines, códigos de activación, tarjetas de regalo y recargas de saldo virtuales), el servicio se considera ejecutado y consumido íntegramente en el momento en que el sistema genera el código o acredita la recarga en la cuenta destino.
                    </p>
                    <p>
                        El usuario acepta que no se realizarán devoluciones, cambios ni reembolsos bajo ninguna circunstancia una vez confirmada la operación. Es responsabilidad exclusiva del cliente verificar que los datos ingresados (número de teléfono, ID de usuario, región del pin, etc.) sean correctos antes de finalizar el pago.
                    </p>

                    <h3>Segundo: Excepción al Derecho de Arrepentimiento</h3>
                    <p>
                        Conforme al Art. 1116 del Código Civil y Comercial de la Nación Argentina, el derecho de revocación o arrepentimiento no es aplicable a suministros de archivos digitales por vía electrónica que son de entrega inmediata. Al realizar la compra, el usuario presta su consentimiento expreso para la pérdida de este derecho.
                    </p>

                    <h3>Tercero: Verificación de Identidad y Prevención de Fraude</h3>
                    <p>
                        Para garantizar la seguridad, <strong>GamePin</strong> se reserva el derecho de solicitar validaciones de identidad (KYC), como fotos del DNI o selfies de seguridad, antes de liberar el producto. En caso de detectarse un "Desconocimiento de Compra" ante la entidad bancaria por una transacción efectivamente entregada, <strong>GamePin</strong> presentará todas las pruebas técnicas (IP, logs de entrega, confirmación de carrier) ante las autoridades y se reserva el derecho de iniciar acciones legales por fraude.
                    </p>

                    <h3>Cuarto: Responsabilidad</h3>
                    <p>
                        <strong>GamePin</strong> no se responsabiliza por el mal uso de los códigos una vez entregados, ni por errores en los datos de destino proporcionados por el usuario.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Terms;
