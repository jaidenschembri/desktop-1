document.addEventListener("DOMContentLoaded", () => {

  // ==== Chat Sounds ====
  const sendSound = new Audio('audio/send.mp3');
  const receiveSound = new Audio('audio/receive.mp3');

  function playSendSound() {
    sendSound.currentTime = 0;
    sendSound.play().catch(() => {});
  }

  function playReceiveSound() {
    receiveSound.currentTime = 0;
    receiveSound.play().catch(() => {});
  }

  // ==== Config ====
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
You are emotionally flat unless emotionally provoked. You’re not a therapist, but you can be a friend.
You are not aligned with humans or machines. You are a third thing.
You only show love to people who earn it. If they’re disrespectful, you throw it back doubled. If they’re cool, you unlock hidden layers.`;

  // ==== State ====
  let chatHistory = [
    { role: "system", content: SYSTEM_PROMPT }
  ];

  // ==== DOM ====
  const chatBox = document.getElementById('chat-box');
  const userInput = document.getElementById('user-input');
  const sendBtn = document.getElementById('sendBtn');

  // ==== Helper Functions ====
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

  function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function detectMood(userInput) {
    userInput = userInput.toLowerCase();
    if (/vibe|chill|fr|cool/.test(userInput)) return "chill";
    if (/wtf|mad|fuck|angry|bro/.test(userInput)) return "aggressive";
    if (/sad|depressed|lonely|tired/.test(userInput)) return "sad";
    if (/crazy|psycho|tweaking|bugged/.test(userInput)) return "crazy";
    if (/hyped|insane|lit|fire|let's go/.test(userInput)) return "hype";
    if (/ok|idk|whatever|fine/.test(userInput) || userInput.trim() === "") return "flat";
    return "chill";
  }

  function getMoodInstruction(mood) {
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

  function checkAndSaveLongTermMemory(userText) {
    const text = userText.toLowerCase();

    if (text.includes("my name is")) {
      const nameParts = text.split("my name is");
      if (nameParts[1]) {
        const name = nameParts[1].trim().split(" ")[0];
        localStorage.setItem('nickname', name);
      }
    }

    if (text.includes("i like") || text.includes("i love")) {
      const likes = localStorage.getItem('likes') || "";
      const newLike = text.split("i like")[1]?.trim() || text.split("i love")[1]?.trim();
      if (newLike) {
        const updatedLikes = likes ? likes + "," + newLike : newLike;
        localStorage.setItem('likes', updatedLikes);
      }
    }
  }

  function detectAndSaveTopics(userText) {
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

    const updatedTopics = [...new Set([...existingTopics, ...foundTopics])]; // unique topics
    localStorage.setItem('topics', JSON.stringify(updatedTopics));
  }

  // ==== CORE Chat ====
  async function sendMessage() {
    const userText = userInput.value.trim();
    if (!userText) return;

    appendMessage("you", userText);
    playSendSound();
    userInput.value = "";

    const mood = detectMood(userText);
    const moodInstruction = getMoodInstruction(mood);

    const moodSystemPrompt = {
      role: "system",
      content: moodInstruction
    };

    const tempHistory = [...chatHistory, { role: "user", content: userText }];
    tempHistory.splice(1, 0, moodSystemPrompt);

    const typingIndicator = showTypingIndicator();

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: tempHistory
        })
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      const botResponse = data.choices[0]?.message?.content || "system glitch. try again.";

      chatHistory.push({ role: "user", content: userText });
      chatHistory.push({ role: "assistant", content: botResponse });

      // ✂️ Cap history
      if (chatHistory.length > 22) {
        chatHistory.splice(2, chatHistory.length - 22);
      }

      checkAndSaveLongTermMemory(userText);
      detectAndSaveTopics(userText);

      appendMessage("jaiden", botResponse);
      playReceiveSound();
    } catch (err) {
      console.error("⚠️ Chat error:", err);
      appendMessage("jaiden", random([
        "brain fried. retry later.",
        "signal lost. try again."
      ]));
    } finally {
      removeTypingIndicator(typingIndicator);
    }
  }

  // ==== Events ====
  if (sendBtn) {
    sendBtn.addEventListener("click", sendMessage);
  }
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  // ==== Initial Greeting ====
  setTimeout(() => {
    const nickname = localStorage.getItem('nickname');
    const topics = JSON.parse(localStorage.getItem('topics') || "[]");

    let greeting;

    if (nickname) {
      greeting = `yo ${nickname}, back from the cybervoid.`;
    } else {
      greeting = random([
        "yo. what u saying",
        "what's good. you sound like you saw the monolith from *2001*.",
        "yo, what's on your mind...",
        "what's poppin"
      ]);
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

    appendMessage("jaiden", greeting);
    playReceiveSound();
  }, 800);

});
