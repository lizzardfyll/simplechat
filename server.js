const express = require('express');
const WebSocket = require('ws');
const path = require('path');

// Создаем HTTP-сервер
const app = express();
const server = app.listen(8080, () => {
    console.log('HTTP сервер запущен на http://localhost:8080');
});

// Обслуживаем статические файлы (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Создаем WebSocket-сервер
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'login') {
            broadcast({ username: data.username, message: 'присоединился к чату' });
        } else if (data.type === 'message') {
            broadcast(data);
        }
    });
});

function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}