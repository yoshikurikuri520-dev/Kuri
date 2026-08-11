const chat = document.getElementById("chat");
const form = document.getElementById("chatForm");
const input = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const clearButton = document.getElementById("clearButton");

const STORAGE_KEY = "yoshikun_chat_v1";
const SESSION_KEY = "yoshikun_session_v1";
const MAX_SAVED_MESSAGES = 12;

let history = loadHistory();
let busy = false;

function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id =
      (crypto.randomUUID && crypto.randomUUID()) ||
      `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function loadHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(saved)) return [];
    return saved
      .filter(
        (m) =>
          m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string"
      )
      .slice(-MAX_SAVED_MESSAGES);
  } catch {
    return [];
  }
}

function saveHistory() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(history.slice(-MAX_SAVED_MESSAGES))
  );
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return map[char];
  });
}

function renderMessage(role, content, extraClass = "") {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role} ${extraClass}`.trim();

  if (role === "assistant") {
    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = "😈";
    wrapper.appendChild(avatar);
  }

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = escapeHtml(content);
  wrapper.appendChild(bubble);

  chat.appendChild(wrapper);
  chat.scrollTop = chat.scrollHeight;
  return wrapper;
}

function renderTyping() {
  const wrapper = document.createElement("div");
  wrapper.className = "message assistant";
  wrapper.id = "typingMessage";
  wrapper.innerHTML = `
    <div class="message-avatar">😈</div>
    <div class="bubble">
      <span class="typing" aria-label="入力中">
        <span></span><span></span><span></span>
      </span>
    </div>
  `;
  chat.appendChild(wrapper);
  chat.scrollTop = chat.scrollHeight;
}

function removeTyping() {
  document.getElementById("typingMessage")?.remove();
}

function renderSavedHistory() {
  if (!history.length) return;
  document.querySelector(".hero")?.remove();
  for (const item of history) {
    renderMessage(item.role, item.content);
  }
}

function autosize() {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 150)}px`;
}

async function sendMessage(text) {
  const message = text.trim();
  if (!message || busy) return;

  busy = true;
  sendButton.disabled = true;
  input.disabled = true;
  document.querySelector(".hero")?.remove();

  // APIへ送る履歴は「今回のユーザー発言を追加する前」のもの
  const priorHistory = history.slice(-MAX_SAVED_MESSAGES);

  renderMessage("user", message);
  history.push({ role: "user", content: message });
  saveHistory();

  input.value = "";
  autosize();
  renderTyping();

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        history: priorHistory,
        sessionId: getSessionId()
      })
    });

    const data = await response.json().catch(() => ({}));
    removeTyping();

    if (!response.ok) {
      renderMessage(
        "assistant",
        data.error || "なんかコケた。もう一回やってみろ。",
        "error"
      );
      return;
    }

    renderMessage("assistant", data.reply);
    history.push({ role: "assistant", content: data.reply });
    history = history.slice(-MAX_SAVED_MESSAGES);
    saveHistory();
  } catch {
    removeTyping();
    renderMessage(
      "assistant",
      "通信できねぇ。電波かサーバーが寝てる。",
      "error"
    );
  } finally {
    busy = false;
    sendButton.disabled = false;
    input.disabled = false;
    input.focus();
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage(input.value);
});

input.addEventListener("input", autosize);
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    form.requestSubmit();
  }
});

document.querySelectorAll(".chip").forEach((button) => {
  button.addEventListener("click", () => sendMessage(button.dataset.prompt || ""));
});

clearButton.addEventListener("click", () => {
  history = [];
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
});

renderSavedHistory();
autosize();
