const express = require('express');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = app.listen(process.env.PORT || 8080, () => {
    console.log('Сервер запущен на порту', server.address().port);
});

// Обслуживаем статические файлы
app.use(express.static(path.join(__dirname)));

// WebSocket сервер
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Новое соединение установлено');

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'login') {
            // Уведомление о новом пользователе
            broadcast({ username: data.username, message: 'присоединился к чату' });
        } else if (data.type === 'message') {
            // Пересылка сообщения всем клиентам
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
