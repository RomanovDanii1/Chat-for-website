import { BACKEND_URL } from '@/config.js'
import { customFetch } from '@/utils/fetchWrapper' 

const state = {
  chats: null,
  archive: [],
  selectedChat: null
};

const mutations = {
  updateChats(state, chats) {
    state.chats = chats;
  },
  updateArchive(state, archive) {
    state.archive = archive;
    localStorage.setItem('chatArchive', JSON.stringify(state.archive));
  },
  selectChat(state, chat) {
    state.selectedChat = chat;
  },
};

const actions = {
  async fetchChats({ commit }, payload) {
    try {
      const response = await customFetch(`${BACKEND_URL}/get_chats?bot_id=${payload.botId}`, {
      });
      const data = response
      // Преобразование данных с сервера в нужный формат
      let count = 0;
      const resultChats = [];
      for (const chat in data) {
        const newChat = {
          id: count,
          name: chat,
          dropdown: false, 
          takeToWork: data[chat].takeToWork,
          displayProposal: false,
          emmaProposal: '',
          input: '',
          unreadMessages: 0
        };
        const messages = [];
        data[chat].messages.forEach(element => {
          messages.push({
            sender: element.sender,
            message: element.text
          });
        });
        newChat['messages'] = messages;
        resultChats.push(newChat);
        count++;
      }

      // Сравнение с локальным хранилищем
      const localArchive = JSON.parse(localStorage.getItem('chatArchive')) || [];
      const serverChatNames = resultChats.map(chat => chat.name);
      // Фильтрация архивов, которые отсутствуют на сервере
      const updatedArchive = localArchive.filter(archiveChat => serverChatNames.includes(archiveChat.name));

      const updatedArchiveNames = updatedArchive.map(chat => chat.name)

      const resultArchive = resultChats.filter(chat => updatedArchiveNames.includes(chat.name))

      resultChats.forEach(chat => {
        if (updatedArchiveNames.includes(chat.name)) {
          resultChats.pop(chat)
        }
      });
      // Обновление чатов в состоянии
      commit('updateChats', resultChats);

      // Обновление архива
      commit('updateArchive', resultArchive);

      // Выбор первого чата, если есть доступные
      if (resultChats.length > 0) {
        commit('selectChat', resultChats[0]);
      }else if (resultArchive.length > 0) {
        commit('selectChat', resultArchive[0])
      }
    } catch (error) {
      console.error('Ошибка загрузки чатов:', error);
    }
  },
  async updateArchive({ commit }) {
    commit('updateArchive', state.archive)
  }
};

export default {
  state,
  mutations,
  actions
};
