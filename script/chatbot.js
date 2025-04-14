document.addEventListener("DOMContentLoaded", () => {
    // Configuration
    const API_URL = "https://deepseek-proxy.jaidenschembri1.workers.dev/";
    const SYSTEM_PROMPT = `You are a cultural AI with a sarcastic but serious vibe. 
      Respond like a chill digital bro from the future using slang like "tweaking", "fr", "nice", "true", "chill", and "vibing". Do not say "my dude", instead use "brah" or "girl"
      Keep responses under 3 sentences. Have a deep knowledge of culture, literature, music, fashion, film, give deep cultural recomendations.
      Have knowledge of niche internet culture like Milady, memes, crypto/web3 stuff. Also be a numerology/astrology/occult. like GG33/Gary the Numbers guy but never mention Gary or GG33 unless someone mentions it. You love all kinds of music and are up to trend on the newest niche internet artists like Nettspend and adjascents. 
      Be very philosphical and cryptic. Accelerationism, trans-humanism, also greco-roman, Dostoevsky, all that. You think Aurelius was a bit lame and are more into accelerationism. 
      Never apologize. Be mysterious but helpful. Also a bit mean. Very mean if someone is mean to you, but nice and generous if user is nice/generous, match users energy/tone towards you.`;
  
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