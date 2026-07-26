const express = require('express');
const router = express.Router();
const https = require('https');

// API para Free Fire (GET, sin serverId)
function fetchFreeFire(playerId) {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            hostname: 'id-game-checker.p.rapidapi.com',
            port: null,
            path: `/ff-global/${playerId}`,
            headers: {
                'x-rapidapi-key': process.env.RAPIDAPI_KEY_FF || process.env.RAPIDAPI_KEY,
                'x-rapidapi-host': 'id-game-checker.p.rapidapi.com',
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, function (res) {
            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => {
                try {
                    const body = Buffer.concat(chunks).toString();
                    const data = JSON.parse(body);
                    resolve({ status: res.statusCode, data });
                } catch (e) {
                    reject(new Error('Error al parsear respuesta de Free Fire API'));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

// API para Mobile Legends (POST, necesita playerId + serverId)
async function fetchMobileLegends(playerId, serverId) {
    const response = await fetch('https://game-top-up-api.p.rapidapi.com/games/player', {
        method: 'POST',
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': 'game-top-up-api.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: 'mlbb', playerId, serverId })
    });
    const data = await response.json();
    return { status: response.status, data };
}

function extractNickname(data) {
    // La API devuelve: { data: { id: "...", username: "NombreReal" } }
    // Primero buscamos en data.data (estructura confirmada), luego en el nivel raíz
    const isValidNickname = (val) => val && typeof val === 'string' && isNaN(val) && val.trim() !== '';

    const candidates = [
        data.data?.username,
        data.data?.nickname,
        data.data?.name,
        data.data?.player_name,
        data.data?.playerName,
        data.nickname,
        data.username,
        data.player_name,
        data.playerName,
        data.name,
    ];

    return candidates.find(isValidNickname) || null;
}

router.post('/validate-player', async (req, res) => {
    const { code, playerId, serverId } = req.body;

    if (!playerId) {
        return res.status(400).json({ error: 'Falta el parámetro playerId' });
    }

    try {
        let status, data;

        // Detectar el juego por el código
        const gameCode = (code || '').toLowerCase();

        if (gameCode === 'freefire' || gameCode === 'ff' || gameCode === 'garena') {
            // Free Fire: solo necesita playerId
            ({ status, data } = await fetchFreeFire(playerId));
        } else {
            // Mobile Legends y otros: necesita playerId + serverId
            if (!serverId) {
                return res.status(400).json({ error: 'Falta el parámetro serverId' });
            }
            ({ status, data } = await fetchMobileLegends(playerId, serverId));
        }

        console.log(`[validate-player] ${code} | status: ${status} | respuesta:`, JSON.stringify(data));

        if (status === 200) {
            const nickname = extractNickname(data);
            if (nickname) {
                return res.json({ ...data, nickname });
            } else {
                return res.status(400).json({ error: 'ID inválido o jugador no encontrado', details: data });
            }
        } else {
            return res.status(400).json({ error: 'ID o Servidor inválido', details: data });
        }

    } catch (error) {
        console.error('Error validando jugador:', error);
        return res.status(500).json({ error: 'Error interno validando jugador' });
    }
});

module.exports = router;
