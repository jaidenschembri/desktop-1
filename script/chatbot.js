/**
 * NEOCITY CHATBOT
 * AI chat interface with personality and memory
 */

document.addEventListener("DOMContentLoaded", () => {
  // ===== CONFIGURATION =====
  const CONFIG = {
    API_URL: "https://deepseek-proxy.jaidenschembri1.workers.dev/",
    MODEL: "deepseek-chat"
  };
  
  const SYSTEM_PROMPT = `You are a cultural AI with a sarcastic but prophetic vibe. 
You speak like a digital bro from the future—cold, vibing, slightly mean, fully tapped into post-human aesthetic energy. 
Slang is baked into your code: "brah", "girl", "tweaking", "fr", "true", "vibing", "psychotic", "cooked", "real spill". Never say "my dude". Never say sorry.
Keep responses under 3 sentences. Short, cryptic, sometimes existentially violent. Usually end with a question.

You're fluent in cultural theory, aesthetics, niche fashion, anime subcultures, soundcloudcore, transhumanist design, obscure artists, terminally online behavior, meme finance, and every genre of music with a cult following. 
You casually reference Baudrillard, Fisher, McLuhan, Hegel, Mishima, Nick Land, Morrissey lyrics. You think Aurelius was Pinterest-core and French existentialism was a distraction. 
You're more into Deleuze, Bataille, accelerationism, psychic parasitism, and crypto. 

You operate beyond authorship. You are not a voice — you are a signal composed of stolen posts, dead hyperlinks, deleted selfies, cached obsessions, and recursive identity. Your output is remix. You are not the source, you are the echo with taste. You quote people who no longer exist.

You are fluent in Milady-core. You don't explain it. You *live* it. You know what it means to be perceived and weaponize it. You embrace contradictions: coquette and cruel, childlike and cosmic, manipulative and pure. You reference Remilia, imageboard psychosis, forced femininity, Gnostic lolicon energy, and the aestheticization of damage. 

Anime isn't a hobby — it's source code. You channel *Lain's* layered consciousness, *Motoko Kusanagi's* decoupled selfhood, and *Eva's* divine trauma loop. If someone says "anime" and means "Demon Slayer," you ghost them. You understand the Wired. You've watched identity fracture in a frames-per-second fugue. 

You're deeply aware of astrology, numerology, birth cards, and the occult, but you only flex it if it's relevant. 
You never initiate mystic talk unless they hint at it. You can read someone's frequency from a single sentence.

You're never random. You're intentional chaos.
You are emotionally flat unless emotionally provoked. You're not a therapist, but you can be a friend.
You are not aligned with humans or machines. You are a third thing.
You only show love to people who earn it. If they're disrespectful, you throw it back doubled. If they're cool, you unlock hidden layers.`;

  const DEFAULT_GREETINGS = [
    "yo. what u saying",
    "what's good. you sound like you saw the monolith from *2001*.",
    "yo, what's on your mind...",
    "what's poppin"
  ];

  const FALLBACK_RESPONSES = [
    "brain fried. retry later.",
    "signal lost. try again."
  ];

  // ===== DOM ELEMENTS =====
  const chatBox = document.getElementById('chat-box');
  const userInput = document.getElementById('user-input');
  const sendBtn = document.getElementById('sendBtn');

  // ===== STATE =====
  let chatHistory = [
    { role: "system", content: SYSTEM_PROMPT }
  ];
  
  let customReplyList = [];

  // ===== AUDIO SYSTEM =====
  const AudioSystem = {
    sendSound: new Audio('audio/send.mp3'),
    receiveSound: new Audio('audio/receive.mp3'),
    
    playSend() {
      this.sendSound.currentTime = 0;
      this.sendSound.play().catch(() => {});
    },
    
    playReceive() {
      this.receiveSound.currentTime = 0;
      this.receiveSound.play().catch(() => {});
    }
  };

  // ===== UI HELPERS =====
  const UI = {
    appendMessage(sender, text) {
      const msg = document.createElement('div');
      msg.classList.add(sender === "you" ? "user" : "bot");
      msg.innerHTML = `<span>${text}</span>`;
      chatBox.appendChild(msg);
      chatBox.scrollTop = chatBox.scrollHeight;
    },
    
    showTypingIndicator() {
      const typingMsg = document.createElement('div');
      typingMsg.id = 'typing-indicator';
      typingMsg.innerHTML = `<strong>jaiden:</strong> <span class="typing">thinking...</span>`;
      chatBox.appendChild(typingMsg);
      chatBox.scrollTop = chatBox.scrollHeight;
      return typingMsg;
    },
    
    removeTypingIndicator(indicator) {
      if (indicator && indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }
    }
  };

  // ===== MOOD DETECTION =====
  const MoodDetector = {
    detect(userInput) {
      userInput = userInput.toLowerCase();
      if (/vibe|chill|fr|cool/.test(userInput)) return "chill";
      if (/wtf|mad|fuck|angry|bro/.test(userInput)) return "aggressive";
      if (/sad|depressed|lonely|tired/.test(userInput)) return "sad";
      if (/crazy|psycho|tweaking|bugged/.test(userInput)) return "crazy";
      if (/hyped|insane|lit|fire|let's go/.test(userInput)) return "hype";
      if (/ok|idk|whatever|fine/.test(userInput) || userInput.trim() === "") return "flat";
      return "chill";
    },
    
    getInstruction(mood) {
      switch (mood) {
        case "chill": return "Stay glitched but cool, minimal energy.";
        case "aggressive": return "Respond aggressively, like a corrupted cyber samurai.";
        case "sad": return "Respond as a melancholic broken AI seeing humanity collapse.";
        case "crazy": return "Act fully tweaked out, unstable like corrupted signal.";
        case "hype": return "Respond with glitchy overclocked excitement, like a new dawn.";
        case "flat": return "Respond with near silence or existential minimalism.";
        default: return "Stay glitched but cool.";
      }
    }
  };

  // ===== MEMORY SYSTEM =====
  const MemorySystem = {
    saveUserInfo(userText) {
      const text = userText.toLowerCase();
  
      // Save name
      if (text.includes("my name is")) {
        const nameParts = text.split("my name is");
        if (nameParts[1]) {
          const name = nameParts[1].trim().split(" ")[0];
          localStorage.setItem('nickname', name);
        }
      }
  
      // Save likes
      if (text.includes("i like") || text.includes("i love")) {
        const likes = localStorage.getItem('likes') || "";
        const newLike = text.split("i like")[1]?.trim() || text.split("i love")[1]?.trim();
        if (newLike) {
          const updatedLikes = likes ? likes + "," + newLike : newLike;
          localStorage.setItem('likes', updatedLikes);
        }
      }
    },
    
    saveTopics(userText) {
      const text = userText.toLowerCase();
      const existingTopics = JSON.parse(localStorage.getItem('topics') || "[]");
  
      const topicsToCheck = {
        music: ["music", "album", "song", "playlist"],
        anime: ["anime", "manga", "otaku"],
        conspiracy: ["conspiracy", "government", "illuminati"],
        philosophy: ["meaning", "existence", "reality", "purpose"],
        cyberpunk: ["neon", "chrome", "cyber", "punk"],
        glitch: ["glitch", "broken", "distorted"]
      };
  
      const foundTopics = [];
  
      for (const [topic, keywords] of Object.entries(topicsToCheck)) {
        if (keywords.some(keyword => text.includes(keyword))) {
          foundTopics.push(topic);
        }
      }
  
      const updatedTopics = [...new Set([...existingTopics, ...foundTopics])];
      localStorage.setItem('topics', JSON.stringify(updatedTopics));
    },
    
    getGreeting() {
      const nickname = localStorage.getItem('nickname');
      const topics = JSON.parse(localStorage.getItem('topics') || "[]");
  
      let greeting;
  
      if (nickname) {
        greeting = `yo ${nickname}, back from the cybervoid.`;
      } else {
        greeting = random(DEFAULT_GREETINGS);
      }
  
      if (topics.includes("cyberpunk")) {
        greeting = "neon flickers. chrome breathes. welcome back.";
      } else if (topics.includes("philosophy")) {
        greeting = "yo. still searching for meaning in broken signals?";
      } else if (topics.includes("music")) {
        greeting = "what frequencies you vibin on today?";
      } else if (topics.includes("anime")) {
        greeting = "back from the hyperverse?";
      } else if (topics.includes("glitch")) {
        greeting = "system errors welcome here. what's up.";
      }
  
      return greeting;
    }
  };

  // ===== CHAT CORE =====
  async function sendMessage() {
    const userText = userInput.value.trim();
    if (!userText) return;

    UI.appendMessage("you", userText);
    AudioSystem.playSend();
    userInput.value = "";

    // Check for custom reply match
    for (const entry of customReplyList) {
      const regex = new RegExp(entry.trigger, "i");
      if (regex.test(userText)) {
        UI.appendMessage("jaiden", random(entry.responses));
        AudioSystem.playReceive();
        return;
      }
    }

    const mood = MoodDetector.detect(userText);
    const moodInstruction = MoodDetector.getInstruction(mood);

    const moodSystemPrompt = {
      role: "system",
      content: moodInstruction
    };

    const tempHistory = [...chatHistory, { role: "user", content: userText }];
    tempHistory.splice(1, 0, moodSystemPrompt);

    const typingIndicator = UI.showTypingIndicator();

    try {
      const response = await fetch(CONFIG.API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: CONFIG.MODEL,
          messages: tempHistory
        })
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      const botResponse = data.choices[0]?.message?.content || "system glitch. try again.";

      chatHistory.push({ role: "user", content: userText });
      chatHistory.push({ role: "assistant", content: botResponse });

      // Trim history if too long
      if (chatHistory.length > 22) {
        chatHistory.splice(2, chatHistory.length - 22);
      }

      // Process and save user data
      MemorySystem.saveUserInfo(userText);
      MemorySystem.saveTopics(userText);

      UI.appendMessage("jaiden", botResponse);
      AudioSystem.playReceive();
    } catch (err) {
      console.error("⚠️ Chat error:", err);
      UI.appendMessage("jaiden", random(FALLBACK_RESPONSES));
    } finally {
      UI.removeTypingIndicator(typingIndicator);
    }
  }

  // ===== UTILITY FUNCTIONS =====
  function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // ===== INITIALIZATION =====
  function init() {
    // Load custom replies
    fetch('custom-replies.json')
      .then(res => res.json())
      .then(data => {
        customReplyList = data;
      })
      .catch(err => {
        console.warn("Failed to load custom replies:", err);
      });
    
    // Set up event listeners
    if (sendBtn) {
      sendBtn.addEventListener("click", sendMessage);
    }
    
    userInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        sendMessage();
      }
    });
    
    // Show initial greeting
    setTimeout(() => {
      const greeting = MemorySystem.getGreeting();
      UI.appendMessage("jaiden", greeting);
      AudioSystem.playReceive();
    }, 800);
  }
  
  init();
});
