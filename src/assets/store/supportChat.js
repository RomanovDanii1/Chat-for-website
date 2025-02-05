// src/store/modules/supportChat.js
import axios from 'axios';
import { BACKEND_URL, BACKEND_URL_WS } from '@/config.js';

export default {
  namespaced: true,
  state: {
    isOpen: false,
    messages: [],
    chatState: 'ai', // 'ai' или 'manager'
    userId: null,
    websocket: null,
    loading: false, // Новое состояние для отображения загрузки
  },
  mutations: {
    toggleChat(state) {
      state.isOpen = !state.isOpen;
    },
    setMessages(state, messages) {
      state.messages = messages;
    },
    addMessage(state, message) {
      state.messages.push(message);
    },
    setChatState(state, chatState) {
      state.chatState = chatState;
    },
    setUserId(state, userId) {
      state.userId = userId;
    },
    setWebSocket(state, websocket) {
      state.websocket = websocket;
    },
    setLoading(state, loading) {
      state.loading = loading;
    },
  },
  actions: {
    initializeUserId({ commit }) {
      let userId = localStorage.getItem('userId');
      if (!userId) {
        userId = 'user-' + Date.now();
        localStorage.setItem('userId', userId);
      }
      commit('setUserId', userId);
    },
    async loadChatHistory({ state, commit }) {
      try {
        const response = await axios.get(`${BACKEND_URL}/support/history`, {
          params: { user_id: state.userId },
        });
        commit('setMessages', response.data.messages);
        commit('setChatState', response.data.chatState || 'ai');
      } catch (error) {
        console.error('Ошибка при загрузке истории чата:', error);
      }
    },
    async sendMessage({ state, commit }, message) {
      commit('addMessage', message);

      // Включаем индикатор загрузки, если чат с ИИ
      if (state.chatState === 'ai') {
        commit('setLoading', true);
      }

      try {
        const response = await axios.post(`${BACKEND_URL}/support/message`, {
          user_id: state.userId,
          text: message.text,
        });
        // Обновляем состояние чата, если оно изменилось
        if (response.data.chatState && response.data.chatState !== state.chatState) {
          commit('setChatState', response.data.chatState);
        }
      } catch (error) {
        console.error('Ошибка при отправке сообщения на бэкенд:', error);
        commit('setLoading', false); // Отключаем индикатор загрузки при ошибке
      }
    },
    initializeWebSocket({ state, commit }) {
      if (state.websocket) return; // Если WebSocket уже установлен

      const websocket = new WebSocket(`${BACKEND_URL_WS}/support/ws/${state.userId}`);

      websocket.onmessage = (event) => {
        let data;
        try {
          data = JSON.parse(event.data);
        } catch (e) {
          console.error('Ошибка при разборе сообщения WebSocket:', e);
          return;
        }
      
        if (data.type === 'chat_state_update') {
          // Обновляем состояние чата
          commit('setChatState', data.chatState);
        }
      
        const messageText = data.message;
        const sender = data.sender || (state.chatState === 'manager' ? 'manager' : 'bot');
      
        // Если чат с ИИ и получено сообщение от бота, отключаем индикатор загрузки
        if (sender === 'bot' && state.chatState === 'ai') {
          commit('setLoading', false);
        }
      
        commit('addMessage', {
          id: Date.now(),
          text: messageText,
          sender: sender,
        });
      };

      websocket.onclose = () => {
        console.log('WebSocket соединение закрыто');
        commit('setWebSocket', null);
      };

      commit('setWebSocket', websocket);
    },
    closeWebSocket({ state, commit }) {
      if (state.websocket) {
        state.websocket.close();
        commit('setWebSocket', null);
      }
    },
  },
  getters: {
    loading: (state) => state.loading,
  },
};
