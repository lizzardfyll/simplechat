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

const users = new Set(); // Множество для хранения участников

wss.on('connection', (ws) => {
    let username = '';

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'login') {
            username = data.username;
            users.add(username); // Добавляем пользователя в список
            broadcastUsers(); // Обновляем список участников
            broadcast({ type: 'message', username: 'Система', message: `${username} присоединился к чату`, color: '#000' });
        } else if (data.type === 'message') {
            broadcast(data);
        }
    });

    ws.on('close', () => {
        if (username) {
            users.delete(username); // Удаляем пользователя из списка
            broadcastUsers(); // Обновляем список участников
            broadcast({ type: 'message', username: 'Система', message: `${username} покинул чат`, color: '#000' });
        }
    });
});

// Функция для отправки обновлённого списка участников
function broadcastUsers() {
    const userList = Array.from(users);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'updateUsers', users: userList }));
        }
    });
}

// Функция для отправки сообщений всем клиентам
function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}