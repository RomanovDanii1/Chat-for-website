<template>
  <div class="chat-list">
    <div class="header">
      <h3>Manager Dashboard</h3>
    </div>

    <div class="active-chats">
      <h4>Active Chats</h4>
      <ul>
        <li v-for="chat in chats" :key="chat.id" @click="selectChat(chat)">
          <ChatItem :chat="chat" :currentTime="currentTime" />
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import ChatItem from "./ChatItem.vue";
export default {
  name: "ChatList",
  components: { ChatItem },
  props: {
    chats: {
      type: Array,
      required: true
    },
    currentTime: {
      type: Date,
      required: true
    }
  },
  methods: {
    selectChat(chat) {
      this.$emit("selectChat", chat);
    }
  }
};
</script>

<style scoped>
.chat-list {
  width: 350px;
  background-color: #f5f5f5;
  border-radius: 10px;
  overflow: hidden;
  border: 3px solid #0a9ff5;
  display: flex;
  flex-direction: column;
  height: 500px;
}

.header {
  background-color: #008cdd;
  color: white;
  text-align: center;
  padding: 12px;
  font-size: 20px;
  font-weight: bold;
}

.active-chats {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  max-height: 420px;
}

.active-chats h4 {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.chat-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.chat-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.chat-list li:hover {
  background-color: #eaeaea;
}

.active-chats::-webkit-scrollbar {
  width: 6px;
}

.active-chats::-webkit-scrollbar-track {
  background: #e0e0e0;
  border-radius: 3px;
}

.active-chats::-webkit-scrollbar-thumb {
  background: #008cdd;
  border-radius: 3px;
}

.status {
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 14px;
  font-weight: bold;
  color: white;
  text-transform: uppercase;
  text-align: center;
  min-width: 80px;
}

.status.waiting {
  background: linear-gradient(45deg, #ffcc00, #ff9900);
}

.status.idle {
  background: linear-gradient(45deg, #ffcc00, #ffaa00);
}

.status.sleeping {
  background: linear-gradient(45deg, #ff4b4b, #ff0000);
}
</style>