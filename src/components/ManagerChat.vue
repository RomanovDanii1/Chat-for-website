<template>
  <div class="manager-chat">
    <div class="chat-header">
      <h3>Chat with {{ chat.userName }}</h3>
      <div class="header-buttons">
        <button v-if="!joined" @click="joinChat" class="control-button">
          Enter Dialogue
        </button>
        <button v-else @click="leaveChat" class="control-button">
          Exit Dialogue
        </button>
        <button @click="$emit('closeChat')" class="close-chat">✕</button>
      </div>
    </div>
    <div class="chat-messages" ref="messagesContainer">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="['message', getMessageClass(msg)]"
      >
        <div class="message-content">
          <span>{{ msg.text }}</span>
          <small class="timestamp">{{ formatTimestamp(msg.timestamp) }}</small>
        </div>
      </div>
    </div>
    <div class="chat-input" v-if="joined">
      <textarea
        v-model="newMessage"
        placeholder="Type your message..."
        @keydown.enter.prevent="sendMessage"
      ></textarea>
      <button @click="sendMessage">Send</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick, onBeforeUnmount, watch } from "vue";
import { useI18n } from "vue-i18n";

export default {
  name: "ManagerChat",
  props: {
    chat: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const { t } = useI18n();
    const messages = ref([]);
    const newMessage = ref("");
    const joined = ref(false);
    const messagesContainer = ref(null);
    let pollingInterval = null;

    async function fetchHistory() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/history?chat_id=${props.chat.id}`);
        const data = await response.json();
        messages.value = data.map(msg => ({
          from: msg.sender,
          text: msg.text,
          timestamp: msg.timestamp
        }));
        scrollToBottom();
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    }

    function joinChat() {
      const joinMsg = {
        from: "system",
        text: t("managerEnter"),
        timestamp: new Date().toISOString()
      };
      messages.value.push(joinMsg);
      scrollToBottom();
      sendManagerMessageAction({ message: t("managerEnter"), managerStatus: true });
      joined.value = true;
      pollingInterval = setInterval(fetchHistory, 5000);
      localStorage.setItem("managerJoined_" + props.chat.id, "true");
    }

    function leaveChat() {
      const leaveMsg = {
        from: "system",
        text: t("managerExit"),
        timestamp: new Date().toISOString()
      };
      messages.value.push(leaveMsg);
      scrollToBottom();
      sendManagerMessageAction({ message: t("managerExit"), managerStatus: false });
      joined.value = false;
      if (pollingInterval) clearInterval(pollingInterval);
      localStorage.removeItem("managerJoined_" + props.chat.id);
    }

    async function sendManagerMessageAction(payload) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/manager/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: props.chat.id,
            message: payload.message,
            action: true,
            managerStatus: payload.managerStatus
          })
        });
      } catch (error) {
        console.error("Error sending manager message:", error);
      }
    }

    async function sendManagerMessage(text) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/manager/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: props.chat.id,
            message: text,
          })
        });
      } catch (error) {
        console.error("Error sending manager message:", error);
      }
    }

    function sendMessage() {
      if (!newMessage.value.trim()) return;
      const msg = {
        from: "manager",
        text: newMessage.value,
        timestamp: new Date().toISOString()
      };
      messages.value.push(msg);
      scrollToBottom();
      sendManagerMessage(msg.text);
      newMessage.value = "";
    }

    function formatTimestamp(ts) {
      const date = new Date(ts);
      return date.toLocaleTimeString();
    }

    function scrollToBottom() {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
      });
    }

    function getMessageClass(msg) {
      if (msg.from === "user") return "user-msg";
      else if (msg.from === "manager") return "manager-msg";
      else if (msg.from === "bot") return "ai-msg";
      else if (msg.from === "system") return "system-banner";
      else return "center-msg";
    }

    onMounted(() => {
      fetchHistory();
      if (localStorage.getItem("managerJoined_" + props.chat.id) === "true") {
        joined.value = true;
        pollingInterval = setInterval(fetchHistory, 5000);
      }
    });

    onBeforeUnmount(() => {
      if (pollingInterval) clearInterval(pollingInterval);
    });

    watch(() => props.chat, () => {
      fetchHistory();
      if (pollingInterval) clearInterval(pollingInterval);
      joined.value = false;
    });

    return {
      messages,
      newMessage,
      joined,
      joinChat,
      leaveChat,
      sendMessage,
      formatTimestamp,
      messagesContainer,
      getMessageClass,
    };
  }
};
</script>

<style scoped>
.manager-chat {
  display: flex;
  flex-direction: column;
  max-height: 75vh;
  max-width: 90vw;
  background-color: #2c2f33;
  color: #fff;
  border-radius: 8px;
  overflow: hidden;
  min-height: 75vh;
}

.chat-messages {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: linear-gradient(131.11deg, #FBFBFB 1.38%, #CEF2FF 19.31%, #FBFBFB 30.58%, #CEF2FF 68.54%, #FFFFFF 98.22%);
  overflow-y: auto;
}

.user-msg {
  align-self: flex-start;
  background-color: #dcf8c6;
  color: #000;
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  max-width: 80%;
}

.manager-msg {
  align-self: flex-end;
  background: linear-gradient(45deg, #d49402, #8f6003);
  color: #000;
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  max-width: 80%;
}

.ai-msg {
  align-self: flex-end;
  background: linear-gradient(45deg, #BC70FF, #7570FF);
  color: #000;
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  max-width: 80%;
}

.system-banner {
  align-self: center;
  width: 100%;
  background-color: #B8860B;
  color: #fff;
  text-align: center;
  padding: 8px 0;
  margin: 8px 0;
  border-radius: 4px;
  box-shadow: 0 0 8px rgba(184, 134, 11, 0.8);
}

.center-msg {
  align-self: center;
  background-color: #99aab5;
  color: #2c2f33;
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 8px;
}

.message-content {
  word-break: break-all;
  overflow-wrap: break-word;
  white-space: pre-wrap;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #23272a;
  padding: 12px 16px;
}
.chat-header h3 {
  margin: 0;
  font-size: 18px;
}
.header-buttons {
  display: flex;
  gap: 10px;
}
.control-button,
.close-chat {
  background: #7289da;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
}
.close-chat {
  background: transparent;
  font-size: 18px;
}

.chat-input {
  display: flex;
  padding: 12px 16px;
  background-color: #2c2f33;
  border-top: 1px solid #23272a;
}
.chat-input textarea {
  flex: 1;
  resize: none;
  padding: 8px 12px;
  border-radius: 4px;
  border: none;
  font-size: 14px;
  margin-right: 8px;
  background-color: #40444b;
  color: #fff;
}
.chat-input textarea::placeholder {
  color: #b9bbbe;
}
.chat-input button {
  background-color: #7289da;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
}

.timestamp {
  display: block;
  font-size: 10px;
  color: #000000;
  margin-top: 4px;
  text-align: right;
}

.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #e0e0e0;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #008cdd;
  border-radius: 3px;
}
</style>
