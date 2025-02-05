<template>
  <div class="chat-item">
    <div class="chat-info">
      <strong>{{ chat.userName || chat.id.slice(-6) }}</strong>
      <p class="last-message">{{ lastMessageText }}</p>
    </div>
    <div class="status-label" :style="{ background: statusBackground }">
      {{ statusLabel }}
    </div>
  </div>
</template>

<script>
export default {
  name: "ChatItem",
  props: {
    chat: {
      type: Object,
      required: true
    },
    currentTime: {
      type: Date,
      required: true
    }
  },
  computed: {
    lastMessage() {
      if (!this.chat.messages || this.chat.messages.length === 0) {
        return {};
      }

      const userMessages = this.chat.messages.filter(msg => msg.sender === "user");

      if (userMessages.length === 0) {
        return {};
      }

      return userMessages.reduce((latest, msg) => {
        return new Date(msg.timestamp) > new Date(latest.timestamp) ? msg : latest;
      });
    },
    lastMessageText() {
      const text = this.lastMessage.text || "";
      return text.length > 20 ? text.slice(0, 20) + "..." : text;
    },
    timeDiffSeconds() {
      if (!this.lastMessage.timestamp) return Infinity;
      const lastTime = new Date(this.lastMessage.timestamp);
      return (this.currentTime - lastTime) / 1000;
    },
    statusBackground() {
      const diff = this.timeDiffSeconds;
      if (diff < 60) {
        return "linear-gradient(45deg, #27ae60, #2ecc71)";
      } else if (diff < 300) {
        return "linear-gradient(45deg, #f39c12, #f1c40f)";
      } else if (diff < 600) {
        return "linear-gradient(45deg, #e67e22, #d35400)";
      } else {
        return "linear-gradient(45deg, #e74c3c, #c0392b)";
      }
    },
    statusLabel() {
      const diff = this.timeDiffSeconds;
      if (diff < 60) return "Active";
      else if (diff < 300) return "Idle";
      else if (diff < 600) return "Away";
      else return "Sleeping";
    }
  }
};
</script>

<style scoped>
.chat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #2c2f33;
  cursor: pointer;
  transition: background 0.2s;
  width: 100vh;
}
.chat-item:hover {
  background: #3a5060;
}
.chat-info {
  flex-grow: 1;
}
.last-message {
  margin: 4px 0 0;
  font-size: 12px;
  color: #000000;
}
.status-label {
  padding: 4px 10px;
  border-radius: 12px;
  color: #fff;
  font-size: 15px;
  text-align: center;
  min-width: 70px;
}

.chat-info strong {
  font-weight: bold;
  color: #000000;
}

</style>
