import React from 'react';
import './LegalPages.css';

function AboutUs() {
    return (
        <div className="main-content fade-in">
            <div className="legal-page-container">
                <h1 className="legal-title">Sobre Nosotros</h1>
                <div className="legal-content">
                    <h2>Bienvenidos a GamePin</h2>
                    <p>
                        En <strong>GamePin</strong> (gamepin.top), somos apasionados por la tecnología y el entretenimiento digital. Nacimos con el objetivo de convertirnos en el puente más rápido y seguro entre los usuarios y sus plataformas favoritas de juegos, servicios de streaming y comunicaciones.
                    </p>
                    <p>
                        Nuestra plataforma está diseñada para ofrecer una experiencia de compra inmediata. Entendemos que cuando buscás un pin o una recarga, lo necesitás ahora; por eso, optimizamos nuestros procesos para que la acreditación sea instantánea y sin complicaciones.
                    </p>

                    <h2>¿Por qué elegir GamePin?</h2>
                    <ul>
                        <li><strong>Velocidad:</strong> Sistema automatizado de entrega de códigos y procesamiento de recargas.</li>
                        <li><strong>Seguridad:</strong> Utilizamos estándares de cifrado y verificación para proteger cada una de tus transacciones.</li>
                        <li><strong>Confianza Local:</strong> Somos una plataforma pensada para el usuario gamer global, ofreciendo soporte y soluciones adaptadas a nuestro mercado.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default AboutUs;
