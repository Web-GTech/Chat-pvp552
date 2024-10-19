const socket = new WebSocket('ws://localhost:8080'); // Certifique-se de ajustar a URL se necessário

const onlineList = document.querySelector('.online-users');
const onlineToggle = document.getElementById('online-toggle');
const loginForm = document.querySelector('.login__form');
const chatSection = document.querySelector('.chat');
const loginSection = document.querySelector('.login');
const chatInput = document.querySelector('.chat__input');
const chatForm = document.querySelector('.chat__form');
const chatMessages = document.querySelector('.chat__messages');
const typingIndicator = document.createElement('div'); // Cria o elemento do indicador de digitação
typingIndicator.classList.add('typing-indicator');
chatMessages.appendChild(typingIndicator); // Adiciona o indicador ao chat
let userName = '';

// Alternar visibilidade da lista de usuários online
if (onlineToggle) {
  onlineToggle.addEventListener('click', () => {
    if (onlineList.style.display === 'none' || onlineList.style.display === '') {
      onlineList.style.display = 'block';
    } else {
      onlineList.style.display = 'none';
    }
  });
}

// Função para mostrar o pop-up estilizado
function showPopup(message) {
  if (!message) return; // Verifica se há mensagem antes de exibir

  const popup = document.createElement('div');
  popup.classList.add('popup');
  popup.innerText = message;
  document.body.appendChild(popup);

  // Mostrar o popup com animação
  setTimeout(() => popup.classList.add('show'), 100);

  // Esconder o popup após 3 segundos
  setTimeout(() => {
    popup.classList.remove('show');
    popup.classList.add('hide');
    setTimeout(() => document.body.removeChild(popup), 300);
  }, 3000);
}

// Atualizar lista de usuários online
function updateOnlineUsers(users) {
  onlineList.innerHTML = '';  // Limpa a lista de usuários anteriores
  users.forEach(user => {
    if (user) { // Verifica se o usuário não é undefined
      const li = document.createElement('li');
      li.textContent = user;
      onlineList.appendChild(li);
    }
  });
}

// Receber mensagens do servidor WebSocket
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === 'user-connected' && data.userName) {
    // Mostrar pop-up quando um usuário entrar
    showPopup(`${data.userName} entrou no chat!`);
  } else if (data.type === 'online-users' && data.users) {
    // Atualizar a lista de usuários online
    updateOnlineUsers(data.users);
  } else if (data.type === 'chat-message' && data.message) {
    // Exibir mensagem do chat
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', data.sender === userName ? 'message--self' : 'message--other');

    // Criar o nome do remetente
    const senderName = document.createElement('span');
    senderName.classList.add('sender-name');
    senderName.textContent = data.sender; // Nome do usuário

    // Criar o texto da mensagem
    const messageText = document.createElement('span');
    messageText.textContent = `: ${data.message}`; // Adiciona dois pontos antes da mensagem

    // Adicionar o nome e a mensagem ao div da mensagem
    messageDiv.appendChild(senderName);
    messageDiv.appendChild(messageText);

    // Adicionar a mensagem ao chat
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;  // Rolar para a última mensagem

    // Limpar o indicador de digitação
    typingIndicator.style.display = 'none';
  } else if (data.type === 'typing') {
    // Exibir indicador de digitação
    typingIndicator.textContent = `${data.userName} está digitando...`;
    typingIndicator.style.display = 'block';

    // Esconder o indicador após 3 segundos
    setTimeout(() => {
      typingIndicator.style.display = 'none';
    }, 3000);
  }
};

// Enviar nome de usuário ao servidor
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  userName = document.querySelector('.login__input').value;

  if (userName) {
    socket.send(JSON.stringify({ type: 'user-connected', userName }));

    // Ocultar a seção de login e mostrar a seção de chat
    loginSection.style.display = 'none';
    chatSection.style.display = 'flex';
  } else {
    showPopup("Por favor, insira um nome de usuário!"); // Avisar se o nome estiver vazio
  }
});

// Enviar mensagem do chat
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = chatInput.value;

  if (message) {
    socket.send(JSON.stringify({ type: 'chat-message', message, sender: userName }));
    chatInput.value = ''; // Limpar a entrada de texto
  }
});

// Detectar quando o usuário está digitando
chatInput.addEventListener('input', () => {
  socket.send(JSON.stringify({ type: 'typing', userName }));
});

// Estilos básicos para o pop-up
const style = document.createElement('style');
style.innerHTML = `
  .popup {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #333;
    color: white;
    padding: 15px;
    border-radius: 5px;
    opacity: 0;
    transition: opacity 0.3s ease, bottom 0.3s ease;
    z-index: 1000;
  }
  .popup.show {
    opacity: 1;
    bottom: 50px;
  }
  .popup.hide {
    opacity: 0;
    bottom: 20px;
  }
`;
document.head.appendChild(style);
