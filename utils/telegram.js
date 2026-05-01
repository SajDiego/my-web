const https = require('https');

const enviarNotificacionTelegram = (mensaje) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if(!token || !chatId) return;

    const data = JSON.stringify({
        chat_id: chatId,
        text: mensaje,
        parse_mode: 'HTML'
    });

    const options = {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${token}/sendMessage`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    const req = https.request(options);
    req.on('error', () => {}); 
    req.write(data);
    req.end();
};

module.exports = { enviarNotificacionTelegram };
