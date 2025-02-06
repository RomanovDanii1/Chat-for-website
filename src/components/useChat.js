import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

export function useChat() {
  const { locale } = useI18n();

  let simulateTypingExists = false;
  let typingInterval = null;

  const isChatOpen = ref(false);
  const isCircleButtonVisible = ref(false);
  const messages = ref([]);
  const messageInput = ref('');
  const unreadCount = ref(localStorage.getItem('chatUnreadCount')
    ? parseInt(localStorage.getItem('chatUnreadCount'))
    : 0
  );

  function getTypingMessage() {
    switch (locale.value) {
      case 'uk': return 'Зачекайте, будь ласка, декілька секунд';
      case 'en': return 'Please wait a few seconds';
      case 'pl': return 'Proszę czekać kilka секунд';
      case 'es': return 'Por favor, espera unos segundos';
      default:   return 'Please wait a few seconds';
    }
  }

  function initChat() {
    if (localStorage.getItem('chatButtonClicked') === 'true') {
      isCircleButtonVisible.value = true;
    }
    const sc = localStorage.getItem('chatUnreadCount');
    if (sc) {
      unreadCount.value = parseInt(sc, 10) || 0;
    }
  }

  function toggleChat() {
    if (!isChatOpen.value) {
      isChatOpen.value = true;
      localStorage.setItem('chatButtonClicked', 'true');
      isCircleButtonVisible.value = true;
      unreadCount.value = 0;
      localStorage.setItem('chatUnreadCount', '0');
    } else {
      isChatOpen.value = false;
    }
  }

  function sendMessage() {
    if (!messageInput.value.trim()) return;
    const msg = messageInput.value;

    addMessageToChat(msg);
    messageInput.value = '';

    simulateOperatorTyping();

    sendMessageToBackendSupport(msg)
      .then(resp => {
        stopTypingIndicator();
        addBotMessageToChat(resp);
      })
      .catch(e => {
        stopTypingIndicator();
        console.error('Ошибка при отправке:', e);
      });
  }

  function addMessageToChat(text) {
    messages.value.push({ text, author: 'user' });
    scrollMessagesToBottom();
  }

  function addBotMessageToChat(text) {
    messages.value.push({ text, author: 'bot' });
    scrollMessagesToBottom();
    if (!isChatOpen.value) {
      unreadCount.value++;
      localStorage.setItem('chatUnreadCount', unreadCount.value.toString());
    }
  }

  function scrollMessagesToBottom() {
    setTimeout(() => {
      const msgDiv = document.getElementById('messages');
      if (msgDiv) {
        msgDiv.scrollTop = msgDiv.scrollHeight;
      }
    }, 0);
  }

  function simulateOperatorTyping() {
    if (simulateTypingExists) return;
    simulateTypingExists = true;

    const typingMsg = { text: getTypingMessage(), author: 'bot', isTyping: true };
    messages.value.push(typingMsg);

    let dots = '';
    typingInterval = setInterval(() => {
      dots += '.';
      if (dots.length > 3) dots = '';
      messages.value.splice(messages.value.length - 1, 1, {
        text: getTypingMessage() + dots,
        author: 'bot',
        isTyping: true
      });
    }, 500);
  }

  function stopTypingIndicator() {
    simulateTypingExists = false;
    clearInterval(typingInterval);
    const idx = messages.value.findIndex(m => m.isTyping);
    if (idx !== -1) {
      messages.value.splice(idx, 1);
    }
  }

  function autoResizeTextarea(e) {
    const txt = e.target;
    txt.style.height = 'auto';
    txt.style.overflowY = 'hidden';
    const sH = txt.scrollHeight;
    const maxH = 72;
    if (sH > maxH) {
      txt.style.height = `${maxH}px`;
      txt.style.overflowY = 'auto';
    } else {
      txt.style.height = `${sH}px`;
    }
  }

  function sendMessageToBackendSupport(txt) {
    const url = 'http://localhost:8020/generate_response_mobile/';
    const cID = localStorage.getItem('chatId') || 'defaultChatId';
    const formData = new FormData();
    formData.append('text', txt);
    formData.append('chat_id', cID);
    return fetch(url, { method: 'POST', body: formData })
      .then(r => {
        if (!r.ok) throw new Error('Сетевой ответ некорректен');
        return r.json();
      })
      .then(d => {
        if (typeof d.answer === 'string') return d.answer;
        throw new Error('Ответ не содержит "answer"');
      });
  }

  function fetchWithTimeout(resource, options, timeout = 40000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const { signal } = controller;

    return fetch(resource, { ...options, signal })
      .then(resp => {
        clearTimeout(id);
        return resp;
      })
      .catch(e => {
        clearTimeout(id);
        throw e;
      });
  }

  return {
    isChatOpen,
    isCircleButtonVisible,
    messages,
    messageInput,
    unreadCount,

    initChat,
    toggleChat,
    sendMessage,
    autoResizeTextarea
  };
}
