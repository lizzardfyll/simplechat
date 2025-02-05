const socket = new WebSocket('wss://simplechat-1huj.onrender.com');

const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const loginModal = document.getElementById('login-modal');
const usernameInput = document.getElementById('username-input');
const loginButton = document.getElementById('login-button');

let username = '';
let userColor = generateRandomColor(); // Генерация случайного цвета для пользователя

// Функция для генерации случайного цвета
function generateRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Обработка входа
loginButton.addEventListener('click', () => {
    username = usernameInput.value.trim();
    if (username) {
        loginModal.style.display = 'none';
        messageInput.disabled = false;
        sendButton.disabled = false;
        socket.send(JSON.stringify({ type: 'login', username, color: userColor }));
    }
});

// Отправка сообщения
sendButton.addEventListener('click', sendMessage);

// Отправка сообщения по нажатию Enter
messageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault(); // Предотвращаем перенос строки
        sendMessage();
    }
});

// Автоматическое расширение поля ввода
messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = `${messageInput.scrollHeight}px`;
});

function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        socket.send(JSON.stringify({ type: 'message', username, message, color: userColor }));
        messageInput.value = '';
        messageInput.style.height = 'auto'; // Сбрасываем высоту поля ввода
    }
}

// Получение сообщений от сервера
socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    const messageElement = document.createElement('div');
    messageElement.innerHTML = `<strong style="color: ${data.color};">${data.username}:</strong> ${data.message}`;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Прокрутка вниз
});