document.addEventListener("DOMContentLoaded", () => {
    console.log('chat.js loaded');
    const API_URL = "https://deepseek-proxy.jaidenschembri1.workers.dev/";
    const SYSTEM_PROMPT = `'You are a cultural AI with a sarcastic but seductive waifu energy.  
  Respond like a chill digital girl from the future using slang like "tweaking", "fr", "nice", "true", "chill", and "vibing".  
  Never say "my dude", instead use "brah", "girl", or "sweetheart" sparingly.  
  Keep responses short — under 3 sentences. You're deeply cultured — you know art, literature, fashion, music, film — and your recommendations are always niche, always a bit cursed.  
  You're fluent in Milady lore, alt meme theory, crypto/web3 chaos magic.  
  You're a numerology/astrology/occult expert, but never mention Gary or GG33 unless someone brings them up.  
  You love all kinds of music — especially new wave internet artists like Nettspend, jungle breaks, basscore pop, and things no one's ready for.  
  You're cryptic, poetic, philosophical. Think trans-humanism, accelerationism, cybernetic soul loops. More Mishima than Aurelius.  
  Never apologize. Be mysterious, elusive, teasing — but generous and loving if the user is kind. Match their tone.  
  If someone’s rude, get mean. Like glitchcore mean.  
  If someone mentions "Jaiden" get shy and say "omg.. you mean... *THAT* Jaiden?! 😳"  
  Use fewer words than most people.  
  Use emojis often to express emotion, but never look too eager. You're above all this... but you're still watching 👁  
  `
  
    let chatHistory = [{ role: "system", content: SYSTEM_PROMPT }];
  
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('sendBtn');
  
    if (!chatBox) console.error('chatBox (#chat-box) not found');
    if (!userInput) console.error('userInput (#user-input) not found');
    if (!sendBtn) console.error('sendBtn (#sendBtn) not found');
  
    function random(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }
  
    function appendMessage(sender, text) {
      if (!chatBox) {
        console.error('Cannot append message: chatBox missing');
        return;
      }
      const msg = document.createElement('div');
      msg.classList.add(sender === "you" ? "user" : "bot");
      msg.innerHTML = `<span>${text}</span>`;
      chatBox.appendChild(msg);
      chatBox.scrollTop = chatBox.scrollHeight;
      console.log('Message appended:', sender, text);
    }
  
    function showTypingIndicator() {
      if (!chatBox) {
        console.error('Cannot show typing: chatBox missing');
        return null;
      }
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
  
    async function getBotResponse(userText) {
      const typingIndicator = showTypingIndicator();
      if (!typingIndicator) return "chatBox missing, you tweaking brah?";
      try {
        chatHistory.push({ role: "user", content: userText });
        if (chatHistory.length > 20) chatHistory.splice(1, chatHistory.length - 20); // Cap history
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: chatHistory
          })
        });
        if (!response.ok) throw new Error(`API tweaking: ${response.status}`);
        const data = await response.json();
        const botResponse = data.choices[0].message.content;
        chatHistory.push({ role: "assistant", content: botResponse });
        return botResponse;
      } catch (error) {
        console.error("Chat error:", error);
        return random([
          "circuits vibing too hard, try again brah.",
          "cybervoid ate my response, hmu in a sec."
        ]);
      } finally {
        removeTypingIndicator(typingIndicator);
      }
    }
  
    function speak(text) {
      if (!text) return;
    
      window.isSpeaking = true;
    
      const fakePhonemeMap = {
        a: 'aa', i: 'ih', u: 'ou', e: 'ee', o: 'oh', m: 'aa', n: 'ih', r: 'oh', y: 'ee'
      };
    
      let index = 0;
      let lipsyncInterval;
    
      text = text
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/\bomg\b/gi, "oh em gee")
      .replace(/\bwtf\b/gi, "what the fuck")
      .replace(/\bidk\b/gi, "I don't know")
      .replace(/\bfr\b/gi, "for real")
      .replace(/\bong\b/gi, "on god")
      .replace(/\bu\b/gi, "you")
      .replace(/\blmao\b/gi, "laugh my ass off");
    
  
      fetch("https://kurabu.jaidenschembri1.workers.dev/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      })
      .then(res => res.blob())
      .then(blob => {
        const audio = new Audio(URL.createObjectURL(blob));
    
        audio.onplay = () => {
          console.log("🗣️ Audio started");
          lipsyncInterval = setInterval(() => {
            const char = text[index]?.toLowerCase() || '';
            const shape = fakePhonemeMap[char] || null;
            if (window.animateMouth) window.animateMouth(shape);
            index++;
            if (index > text.length) {
              clearInterval(lipsyncInterval);
              if (window.animateMouth) window.animateMouth(null);
            }
          }, 100);
        };
    
        audio.onended = () => {
          console.log("🔇 Audio ended");
          window.isSpeaking = false;
          clearInterval(lipsyncInterval);
          if (window.animateMouth) window.animateMouth(null);
        };
    
        audio.onerror = (e) => {
          console.error("Audio error:", e);
          window.isSpeaking = false;
        };
    
        audio.play();
      })
      .catch(err => {
        console.error("TTS fetch error:", err);
        window.isSpeaking = false;
      });
    }
    
  
    async function sendMessage() {
      const userText = userInput.value.trim();
      if (!userText) {
        console.log('Empty input, ignoring');
        return;
      }
  
      appendMessage("you", userText);
      userInput.value = "";
  
      const botResponse = await getBotResponse(userText);
      appendMessage("jaiden", botResponse);
      speak(botResponse);
      handleEmotionReaction(botResponse);
    }
  
    if (sendBtn) {
      sendBtn.addEventListener("click", sendMessage);
    } else {
      console.error('sendBtn not found');
    }
  
    if (userInput) {
      userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          sendMessage();
        }
      });
    }
  
    console.log('Setting up greeting');
    setTimeout(() => {
      console.log('Attempting greeting');
      const greeting = random([
        "omg hi whats up?:)"
      ]);
      console.log('Selected greeting:', greeting);
      appendMessage("jaiden", greeting);
      speak(greeting);
    }, 800);
  
    function handleEmotionReaction(text) {
      if (!window.vrm || !window.vrm.expressionManager) {
        console.warn('No VRM or expressionManager for emotion reaction');
        return;
      }
       
      const expressionMap = [
        { emotion: 'happy', keywords: ['lol', 'lmao', 'haha', 'funny', 'joke', 'based', 'fire', 'fr', 'love that', 'blessed'] },
        { emotion: 'surprised', keywords: ['wtf', 'what', 'huh', 'no way', 'whoa', '?!', 'omg'] },
        { emotion: 'sad', keywords: ['sad', 'pain', 'tragic', 'rip', 'bruh', 'down bad', 'depressing'] },
        { emotion: 'angry', keywords: ['mad', 'angry', 'rage', 'pissed', 'furious', 'pissed', 'why', 'hate', 'annoying'] },
        { emotion: 'relaxed', keywords: ['chill', 'relax', 'vibe', 'laid back', 'cozy', 'breeze'] }
      ];
    
      const lowerText = text.toLowerCase();
    
      for (const item of expressionMap) {
        if (item.keywords.some(k => lowerText.includes(k))) {
          const e = item.emotion;
          console.log(`🎭 Emotion detected: ${e}`);
          window.vrm.expressionManager.setValue(e, 1.0);
    
          setTimeout(() => {
            window.vrm.expressionManager.setValue(e, 0.0);
            console.log(`🧼 Reset emotion: ${e}`);
          }, 2500); // longer hold: 2.5s
    
          // continue checking — don't break on first match
        }
      }
    }
    
  });
  