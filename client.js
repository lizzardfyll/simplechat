const socket = new WebSocket('wss://simplechat-1huj.onrender.com');

const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const loginModal = document.getElementById('login-modal');
const usernameInput = document.getElementById('username-input');
const loginButton = document.getElementById('login-button');

let username = '';

// Обработка входа
loginButton.addEventListener('click', () => {
    username = usernameInput.value.trim();
    if (username) {
        loginModal.style.display = 'none';
        messageInput.disabled = false;
        sendButton.disabled = false;
        socket.send(JSON.stringify({ type: 'login', username }));
    }
});

// Отправка сообщения
sendButton.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message) {
        socket.send(JSON.stringify({ type: 'message', username, message }));
        messageInput.value = '';
    }
});

// Получение сообщений от сервера
socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    const messageElement = document.createElement('div');
    messageElement.textContent = `${data.username}: ${data.message}`;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});
