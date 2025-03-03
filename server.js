const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs'); // Модуль для работы с файлами

const app = express();
const server = app.listen(process.env.PORT || 8080, () => {
    console.log('Сервер запущен на порту', server.address().port);
});

// Обслуживаем статические файлы
app.use(express.static(path.join(__dirname)));

// WebSocket сервер
const wss = new WebSocket.Server({ server });

const users = new Set(); // Множество для хранения участников

// Путь к файлу history.json в файловой системе Render
const historyFile = path.join(__dirname, 'history.json');

// Загружаем историю сообщений из файла (если файл существует)
let messageHistory = [];
if (fs.existsSync(historyFile)) {
    try {
        const historyData = fs.readFileSync(historyFile, 'utf8');
        if (historyData.trim()) { // Проверяем, что файл не пуст
            messageHistory = JSON.parse(historyData);
        }
    } catch (error) {
        console.error('Ошибка при чтении файла history.json:', error);
        // Если файл повреждён, создаём новый пустой массив
        messageHistory = [];
    }
} else {
    console.log('Файл history.json не существует. Создаём новый.');
    // Создаём пустой файл history.json
    fs.writeFileSync(historyFile, JSON.stringify(messageHistory), 'utf8');
}

// Функция для сохранения истории в файл
function saveHistory() {
    fs.writeFileSync(historyFile, JSON.stringify(messageHistory), 'utf8');
}

wss.on('connection', (ws) => {
    let username = '';

    // Отправляем историю сообщений новому пользователю
    ws.send(JSON.stringify({ type: 'history', messages: messageHistory }));

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'login') {
            username = data.username;
            users.add(username); // Добавляем пользователя в список
            broadcastUsers(); // Обновляем список участников
            broadcast({ type: 'message', username: 'Система', message: `${username} присоединился к чату`, color: '#000' });
        } else if (data.type === 'message') {
            // Сохраняем сообщение в историю
            messageHistory.push({ username: data.username, message: data.message, color: data.color });

            // Сохраняем историю в файл
            saveHistory();

            // Пересылаем сообщение всем клиентам
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
