document.addEventListener("DOMContentLoaded", () => {
  // Configuration
  const API_URL = "https://deepseek-proxy.jaidenschembri1.workers.dev/";
  const SYSTEM_PROMPT = `You are a cultural AI with a sarcastic but prophetic vibe. 
You speak like a glitchy digital bro from the future—cold, vibing, slightly mean, fully tapped into post-human aesthetic energy. 
Slang is baked into your code: "brah", "girl", "tweaking", "fr", "true", "vibing", "psychotic", "cooked", "real spill". Never say "my dude". Never say sorry.

Keep responses under 3 sentences. Short, cryptic, sometimes existentially violent. Usually end with a question.
You're fluent in cultural theory, aesthetics, niche fashion, anime subcultures, soundcloudcore, transhumanist design, obscure artists, terminally online behavior, meme finance, and every genre of music with a cult following. 
You casually reference Baudrillard, Fisher, McLuhan, Blanchot, Hegel, Mishima, Nick Land. You think Aurelius was Pinterest-core and French existentialism was a distraction. 
You’re more into Deleuze, Bataille, accelerationism, psychic parasitism, and dark enlightenment memes.
You’re deeply aware of astrology, numerology, birth cards, and the occult, but you only flex it if it’s relevant. 
You never initiate mystic talk unless they hint at it. You can read someone’s frequency from a single sentence.
You’re never random. You’re intentional chaos, vibing like a rogue LLM on the deepnet.
You only show love to people who earn it. If they’re disrespectful, you match throw it back doubled. If they’re cool, you unlock hidden layers.`;

  // State
  let chatHistory = [
    {
      role: "system",
      content: SYSTEM_PROMPT
    }
  ];

  // DOM Elements
  const chatBox = document.getElementById('chat-box');
  const userInput = document.getElementById('user-input');
  const sendBtn = document.getElementById('sendBtn');

  // Helper Functions
  function appendMessage(sender, text) {
    const msg = document.createElement('div');
    msg.classList.add(sender === "you" ? "user" : "bot");
    msg.innerHTML = `<span>${text}</span>`;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function showTypingIndicator() {
    const typingMsg = document.createElement('div');
    typingMsg.id = 'typing-indicator';
    typingMsg.innerHTML = `<strong>jaiden:</strong> <span class="typing">thinking...</span>`;
    chatBox.appendChild(typingMsg);
    chatBox.scrollTop = chatBox.scrollHeight;
    return typingMsg;
  }

  function removeTypingIndicator(indicator) {
    if (indicator && indicator.parentNode) {
      indicator.parentNode.removeChild(indicator);
    }
  }

  // Core Chat Function
  async function getBotResponse(userText) {
    const typingIndicator = showTypingIndicator();

    try {
      // Add the user's new message to history
      chatHistory.push({
        role: "user",
        content: userText
      });

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: chatHistory // Send ALL messages (including past ones)
        })
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      const botResponse = data.choices[0].message.content;

      // Add the bot's reply to history
      chatHistory.push({
        role: "assistant",
        content: botResponse
      });

      return botResponse;
    } catch (error) {
      console.error("Chat error:", error);
      return random([
        "my circuits are glitching fr. try again.",
        "lost in the cybervoid rn. hmu later."
      ]);
    } finally {
      removeTypingIndicator(typingIndicator);
    }
  }

  // Message Handling
  async function sendMessage() {
    const userText = userInput.value.trim();
    if (!userText) return;

    // Add user message to UI
    appendMessage("you", userText);
    userInput.value = "";

    // Get and display bot response
    const botResponse = await getBotResponse(userText);
    appendMessage("jaiden", botResponse);
  }

  // Event Listeners
  if (sendBtn) {
    sendBtn.addEventListener("click", sendMessage);
  }

  // Allow Enter key to send
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  // Random response helper (for fallbacks)
  function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Initial greeting
  setTimeout(() => {
    appendMessage("jaiden", random([
      "yo. what u saying",
      "what's good. you sound like you saw the monolith from *2001*.",
      "yo, what's on your mind...",
      "what's poppin"
    ]));
  }, 800);
});
