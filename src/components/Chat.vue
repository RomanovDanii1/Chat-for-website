<template>
  <LanguageSelect />
  <Credits />

  <div id="chat-app">
    <div id="chat-button-container">
      <button
          v-if="!chatButtonClicked"
          class="long-launch-button"
          id="long-launch-button"
          @click="toggleChat"
      >
        <img :src="chatIcon" alt="Chat" class="launch-icon" />
        <span class="button-text">{{ $t('supportButtonText') }}</span>
        <span class="chat-badge" v-if="unreadCount > 0" id="chat-badge-long">
            {{ unreadCount }}
          </span>
      </button>

      <button
          v-else
          class="launch-button"
          id="circle-launch-button"
          @click="toggleChat"
      >
        <img :src="chatIcon" alt="Chat" class="launch-icon" />
        <span class="chat-badge" v-if="unreadCount > 0" id="chat-badge-circle">
            {{ unreadCount }}
          </span>
      </button>
    </div>

    <div
        id="chat-container"
        v-show="chatVisible"
        :class="{ 'fade-in': chatVisible }"
    >

      <div class="chat-avatar-wrapper">
        <img :src="avatarImage" alt="Avatar" />
        <div class="chat-header-text">
          <h4>Neuron</h4>
          <h4>
            {{ $t('alwaysHelper') }}
            <span class="status-online">online</span>
          </h4>
        </div>
        <button
            class="close-button"
            @click="toggleChat"
            :style="{ backgroundImage: 'url(' + closeIcon + ')' }"
        ></button>
      </div>

      <div id="messages" ref="messagesDiv">
        <div
            v-for="(msg, index) in messages"
            :key="index"
            :class="['message', msg.from]"
        >
          {{ msg.text }}
        </div>

        <div v-if="isBotTyping" class="message bot typing-indicator">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>

      <div class="message-input-wrapper">
        <div class="inner-placeholder-container">
            <textarea
                class="custom-placeholder"
                v-model="currentMessage"
                :placeholder="$t('placeholderText')"
                @input="handleInput"
                @keydown.enter.prevent="sendMessage"
            ></textarea>

          <div
              class="send-button"
              v-if="canSend"
              @click="sendMessage"
              style="cursor: pointer;"
          >
            <img :src="sendIcon" alt="Send" class="send-icon" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LanguageSelect from "./LanguageSelect.vue";
import Credits from "./CreditsView.vue";

export default {
  name: "Chat",
  components: {
    LanguageSelect,
    Credits
  },
  data() {
    return {
      chatVisible: false,
      chatButtonClicked: false,
      unreadCount: 0,

      messages: [],

      currentMessage: "",

      ws: null,
      chatId: null,

      chatIcon: "/images/chat-icon.png",
      avatarImage: "/images/avatar.png",
      closeIcon: "/images/close.png",
      sendIcon: "/images/send-icon.png",

      hasSentGreeting: false,

      isBotTyping: false
    };
  },
  computed: {
    canSend() {
      return this.currentMessage.trim().length > 0;
    }
  },
  methods: {
    toggleChat() {
      this.chatVisible = !this.chatVisible;
      if (this.chatVisible) {
        this.chatButtonClicked = true;
        localStorage.setItem("chatButtonClicked", "true");
        this.unreadCount = 0;
        localStorage.setItem("chatUnreadCount", "0");
      }
    },
    connectWebSocket() {
      let chatId = localStorage.getItem("chatId");
      if (!chatId) {
        chatId = Date.now() + "-" + Math.random().toString(36).substr(2, 9);
        localStorage.setItem("chatId", chatId);
      }
      this.chatId = chatId;

      const wsUrl = `ws://localhost:8000/ws?chat_id=${this.chatId}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = async () => {
        console.log("WebSocket connected");
        await this.loadChatHistory();

        if (this.messages.length === 0) {
          this.addBotMessageToChat(this.$t("greetingMessage"), true);
          this.hasSentGreeting = true;
        }
      };

      this.ws.onmessage = (event) => {
        this.isBotTyping = false;
        const data = JSON.parse(event.data);
        if (data.type === "message") {
          this.messages.push({ text: data.message, from: data.sender });
          this.scrollMessagesToBottom();
        }
      };


      this.ws.onclose = () => {
        console.log("WebSocket closed, reconnecting in 3s...");
        setTimeout(this.connectWebSocket, 3000);
      };

      this.ws.onerror = (err) => {
        console.error("WebSocket error:", err);
      };
    },

    sendMessage() {
      const message = this.currentMessage.trim();
      if (!message) return;

      this.addMessageToChat(message);

      this.isBotTyping = true;

      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        const payload = {
          chat_id: this.chatId,
          message
        };
        this.ws.send(JSON.stringify(payload));
      } else {
        console.error("WebSocket is not open");
      }

      this.currentMessage = "";
    },

    addMessageToChat(message) {
      this.messages.push({ text: message, from: "user" });
      this.scrollMessagesToBottom();
    },

    addBotMessageToChat(message, isGreeting = false) {
      this.messages.push({ text: message, from: "bot", isGreeting });
      this.scrollMessagesToBottom();

      if (!this.chatVisible) {
        this.unreadCount++;
        localStorage.setItem("chatUnreadCount", String(this.unreadCount));
      }
    },

    scrollMessagesToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesDiv;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    },

    handleInput(e) {
      const txt = e.target;
      txt.style.height = "auto";
      txt.style.overflowY = "hidden";

      const scrollHeight = txt.scrollHeight;
      const maxHeight = 72;
      if (scrollHeight > maxHeight) {
        txt.style.height = maxHeight + "px";
        txt.style.overflowY = "auto";
      } else {
        txt.style.height = scrollHeight + "px";
      }
    },

    async loadChatHistory() {
      if (!this.chatId) return;

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/history?chat_id=${this.chatId}`);
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          this.messages = data.map(msg => ({
            text: msg.text,
            from: msg.sender
          }));
          this.scrollMessagesToBottom();
        }
      } catch (err) {
        console.error("Error loading history:", err);
      }
    }
  },

  mounted() {
    if (localStorage.getItem("chatButtonClicked") === "true") {
      this.chatButtonClicked = true;
    }
    const storedUnread = localStorage.getItem("chatUnreadCount");
    if (storedUnread) {
      this.unreadCount = parseInt(storedUnread, 10);
    }
    this.connectWebSocket();
  },

  watch: {
    "$i18n.locale"(newVal, oldVal) {
      if (
        this.messages.length === 1 &&
        this.messages[0].from === "bot" &&
        this.messages[0].isGreeting
      ) {
        this.messages[0].text = this.$t("greetingMessage");
      }
    }
  }
};
</script>


<style scoped>
.long-launch-button {
    position: fixed;
    z-index: 1000;
    right: 20px;
    bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 20px;
    height: 60px;
    border-radius: 30px;
    background-image: linear-gradient(45deg, #ffffff, #ffffff);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition: transform 0.3s, width 0.3s, padding 0.3s;
    font-size: 14px;
    color: #000;
    font-weight: 500;
}

.long-launch-button:hover {
    transform: scale(1.05);
}

.long-launch-button img.launch-icon {
    width: 40px;
    height: 40px;
    margin-right: 10px;
    justify-content: center;
}

.long-launch-button .button-text {
    white-space: nowrap;
    font-size: 16px;
}

@media (max-width: 768px) {
    .long-launch-button {
        padding: 8px 16px; 
        height: 50px; 
        border-radius: 25px;
        font-size: 12px;
        right: 15px; 
        bottom: 15px;
    }

    .long-launch-button img.launch-icon {
        width: 25px; 
        height: 25px;
    }
}

.launch-button {
    position: fixed;
    z-index: 1000;
    right: 20px;
    bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-image: linear-gradient(45deg, #ffffff, #ffffff);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition: transform 0.3s;
}

.launch-button:hover {
    transform: scale(1.1);
}

.launch-button img.launch-icon {
    width: 30px;
    height: 30px;
}

.chat-badge {
    position: absolute; 
    top: 0;
    right: 0;
    background-color: red;
    color: white;
    border-radius: 50%;
    font-size: 12px;
    min-width: 16px;
    height: 16px;
    line-height: 16px;
    text-align: center;
    padding: 0 4px;
}

#chat-container {
    position: fixed;
    z-index: 1000;
    right: 20px;
    bottom: 100px;
    flex-direction: column;
    width: 393px;
    height: 550px;
    border-radius: 40px;
    background-color: #ffffff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    animation: fade-in 0.5s;
}

@keyframes fade-in {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

#chat-container input[type='text'] {
    margin: 5px;
    padding: 10px;
    font-size: 14px;
}

#chat-container button:hover {
    opacity: 0.9;
}

#chat-container button.close-button {
    right: 15px;
    padding: 5px;
    border: none;
    background: transparent;
    color: #1C1B1F;
    margin-left: 110px;
    height: 13px;
    width: 14px;
    cursor: pointer;
}

#messages {
    overflow-y: auto;
    flex-grow: 1;
    padding: 10px;
    background: #f9f9f9;
}

#messages ul {
  padding-inline-start: 25px;
  margin-top: 5px;
}

#messages {
    display: flex;
    overflow-y: auto;
    flex-direction: column;
    height: 350px; 
    padding: 15px;
}
#messages::-webkit-scrollbar {
    width: 6px;
    height: 8px; 
    padding-left: 20px;
}

#messages::-webkit-scrollbar-track {
    border-radius: 10px; 
    background: #ddeef6;
}

#messages::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: #1c80a2;
}

#messages::-webkit-scrollbar-thumb:hover {
    background: #555555; 
}

.send-button {
    padding: 10px 20px;
    border: none;
    background-image: linear-gradient(94.84deg, #2e2050 12.26%, #4c3069 37.68%, #5a3881 61.1%);
    color: white;
    cursor: pointer;
    transition: background-color 0.3s;
    
}

.chat-header-text {
  width: 150px;
}

button.chat-send-button {
    position: relative;
    right: 10px;
    border: none;
    background: transparent;
}

#chat-container .message {
    margin-bottom: 12px;
    padding: 10px;
}

#chat-container .message.user {
    align-self: flex-end;
    background-color: #EAEAF3;
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 6px;
    border-top-left-radius: 16px;
    border-top-right-radius: 6px;
}

#chat-container .message.bot {
    align-self: flex-start;
    border-radius: 16px 16px 16px 6px;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    background: linear-gradient(45deg, #BC70FF, #7570FF);
    color: white;
}

#chat-container .message.manager {
    align-self: flex-start;
    border-radius: 16px 16px 16px 6px;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    background: linear-gradient(45deg, #0b5fc1, #377cf5);
    color: white;
}

#chat-container .message.action {
    border-radius: 900px;
    font-weight: 700;
    font-size: 17px;
    text-align: center;
    line-height: 25px;
    background: linear-gradient(45deg, #0b5fc1, #377cf5);
    color: white;
}

.chat-avatar-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    background-image: linear-gradient(45deg, #fefefe, #ffffff);
    border-bottom: 1px solid #1F1F2926;
    border-radius: 40px 40px 0 0;
    padding: 10px;
}

.chat-avatar-wrapper img {
    width: 50px;
    height: auto;
    padding: 10px;
}

.chat-avatar-wrapper h4:first-child {
    font-size: 18px;
    font-weight: bold;
    color: #000000; 
    margin: 0;
}

.chat-avatar-wrapper h4:nth-child(2) {
    font-size: 14px;
    font-weight: normal;
    color: #1F1F2980;
    margin: 0;
    line-height: 1.5;
}

.chat-avatar-wrapper h4:nth-child(2) .status-online {
    color: #00c9aa; 
    font-weight: bold; 
}

h4.chat-status-icon {
    padding-left: 15px;
    color: #00c9aa;
    font-size: 12px;
}

.message.question {
    max-width: 150px;
    margin-left: auto;
    border-radius: 10px 3px 10px 10px;
    background: #ddeef6;
    font-size: 14px;
    line-height: 20px;
}

.message.answer {
    margin-bottom: 4px;
    border-radius: 3px 10px 10px 10px;
    background-color: #1c80a2;
    color: #ffffff;
    font-size: 14px;
    line-height: 20px;
}


.message-input-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 10px 0; 
    border-top: 1px solid #1F1F2926;
}


.inner-placeholder-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 90%;
    max-width: 500px;
    background-color: #ffffff;
    border-radius: 40px; 
    box-shadow: 0 1px 10px rgba(0, 0, 0, 0.1);
    padding: 6px 12px; 
}


.custom-placeholder {
    flex-grow: 1;
    border: none;
    background: transparent;
    font-size: 16px;
    line-height: 1;
    color: #1F1F29;
    outline: none;
    resize: none;

    min-height: 1em;
    max-height: 3em; 
    overflow-y: auto;

    padding: 0;

    padding: 4px 12px;
}

.custom-placeholder::-webkit-scrollbar {
    width: 8px;
    background: transparent;
}

.custom-placeholder::-webkit-scrollbar-track {
    background: transparent;
}

.custom-placeholder::-webkit-scrollbar-thumb {
    background: rgba(29,28,29,0.52);
    border-radius: 4px;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
}

.custom-placeholder:hover::-webkit-scrollbar-thumb,
.custom-placeholder:focus::-webkit-scrollbar-thumb {
    opacity: 1;
}

.custom-placeholder::-webkit-scrollbar-thumb:hover {
    cursor: default;
}


.custom-placeholder::-webkit-scrollbar-button {
    display: none;
}

.custom-placeholder {
    scroll-behavior: smooth;
}

.custom-placeholder::placeholder {
    color: #1F1F29;
    opacity: 0.6;
    padding: 7px 0px;
}

.custom-placeholder:focus::placeholder {
    color: transparent;
}



.send-button {
    position: relative;
    height: 20px;
    border: none;
    border-radius: 50%;
    background-color: #A37BFE;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin-left: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    overflow: visible;
}

.send-icon {
    display: inline-block;
    max-width: none;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 12px;
    height: 12px;
    object-fit: cover;
}


@media (max-width: 480px) {
    .long-launch-button {
        padding: 6px 12px;
        height: 40px;
        border-radius: 20px; 
        font-size: 10px; 
        right: 10px;
        bottom: 10px;
    }

    .long-launch-button img.launch-icon {
        width: 20px;
        height: 20px;
    }

    .long-launch-button .button-text {
        display: none;
    }

    #chat-container {
        width: 100% !important;
        max-width: none !important;
        right: 0 !important;
        left: 0 !important;
        bottom: 0 !important;

        border-radius: 16px 16px 0 0;
    
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
    
        min-height: 60vh !important;
        height: 90vh !important;
        margin: 0;
        background: linear-gradient(180deg, #fff 0%, #f8f8f8 100%);
    }

    .long-launch-button {
        display: none !important;
    }
    .launch-button {
        display: flex !important;
    }
}

.typing-indicator {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(45deg, #BC70FF, #7570FF);
  color: white;
  border-radius: 16px 16px 16px 6px;
  padding: 10px;
  margin-bottom: 12px;
}

.dot {
  width: 6px;
  height: 6px;
  margin: 0 3px;
  border-radius: 50%;
  background-color: #fff;
  animation: dot-bounce 1s infinite alternate;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dot-bounce {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-6px);
  }
}
</style>