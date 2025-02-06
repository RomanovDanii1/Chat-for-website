<template>
  <div class="manager-dashboard">
    <div class="dashboard-container">
      <ChatList :chats="chats" :currentTime="currentTime" @selectChat="selectChat" />
      <div class="chat-window-container" v-if="selectedChat">
        <ManagerChat :chat="selectedChat" @closeChat="deselectChat" />
      </div>
      <div class="chat-window-placeholder" v-else>
        <p>Please select a chat to view conversation.</p>
      </div>
    </div>
  </div>
</template>

<script>
import ChatList from "./ChatList.vue";
import ManagerChat from "./ManagerChat.vue";

export default {
  name: "ManagerDashboard",
  components: {
    ChatList,
    ManagerChat
  },
  data() {
    return {
      chats: [],
      selectedChat: null,
      currentTime: new Date(),
      timerCurrent: null,
      timerChats: null,
      managerWS: null
    };
  },
  methods: {
    async fetchChats() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/manager/chats`);
        const data = await response.json();

        this.chats = data.sort((a, b) => {
          const aTime =
            a.messages && a.messages.length
              ? new Date(a.messages[a.messages.length - 1].timestamp)
              : new Date(0);
          const bTime =
            b.messages && b.messages.length
              ? new Date(b.messages[b.messages.length - 1].timestamp)
              : new Date(0);
          return bTime - aTime;
        });
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    },

    selectChat(chat) {
      this.selectedChat = chat;
    },
    deselectChat() {
      this.selectedChat = null;
    },
    connectManagerWS() {
      this.managerWS = new WebSocket("ws://localhost:8000/manager/ws");
      this.managerWS.onopen = () => {
        console.log("Manager WS connected");
      };
      this.managerWS.onmessage = (event) => {
        console.log("Manager WS message received:", event.data);
        this.fetchChats();
      };
      this.managerWS.onclose = () => {
        console.log("Manager WS closed, reconnecting in 3s...");
        setTimeout(() => this.connectManagerWS(), 3000);
      };
      this.managerWS.onerror = (err) => {
        console.error("Manager WS error:", err);
      };
    }
  },

  mounted() {
    this.timerCurrent = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
    this.fetchChats();
    this.timerChats = setInterval(() => {
      this.fetchChats();
    }, 5000);
    this.connectManagerWS();
  },

  beforeUnmount() {
    clearInterval(this.timerCurrent);
    clearInterval(this.timerChats);
    if (this.managerWS) this.managerWS.close();
  }
};
</script>

<style scoped>
.manager-dashboard {
  max-height: 100vh;
  overflow: hidden;
  margin-top: 50px;

  padding: 20px;
  background-color: #EAEAEA;
  color: #000000;
}
.dashboard-container {
  display: flex;
  gap: 20px;
}
.chat-window-container {
  flex: 1;
  border-radius: 8px;
  min-height: 500px;
}
.chat-window-placeholder {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px dashed #23272a;
  border-radius: 8px;
  min-height: 500px;
  color: #b9bbbe;
}
</style>
