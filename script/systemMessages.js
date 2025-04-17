// ✨ Text + Style Options
const yumeMessages = {
    texts: [
      "<span style='color: hotpink;'>This user</span> is a present.",
      "<span style='color: cyan;'>Reminder:</span> Breathe.",
      "<span style='color: #ffcc00;'>Neon levels</span> critical. Inject more glow.",
      "<span style='color: lime;'>You are seen.</span>",
      "<span style='color: #f0f;'>Dream.exe</span> is still running..."
    ],
    images: [
      "pixelated/swtchblade.gif",
      "pixelated/pills.jpg",
      "pixelated/randoms/thighholster.png",
      "pixelated/landscapes/cemetery.gif",
      "pixelated/landscapes/orangeroom.gif",
      
    ],
    headerBgs: [
      "#a660c2",
      "#009999",
      "#ffcc00",
      "#3333cc",
      "#ff6699"
    ],
    fontColors: [
      "#ffffff",
      "#000000",
      "#ffccff",
      "#00ffff",
      "#ff0000"
    ],
    imageFilters: [
      "grayscale(1)",
      "contrast(1.5)",
      "sepia(1)",
      "hue-rotate(90deg)",
      "saturate(2)",
      "invert(1)",
      "drop-shadow(0 0 4px magenta)",
      "none"
    ]
  };
  
  // 🔁 Utility to grab a random item from any array
  function randomFrom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
  
  // 🚀 Load the message content and styles
  function loadSystemMessage() {
    const text = randomFrom(yumeMessages.texts);
    const image = randomFrom(yumeMessages.images);
    const headerBg = randomFrom(yumeMessages.headerBgs);
    const fontColor = randomFrom(yumeMessages.fontColors);
    const filter = randomFrom(yumeMessages.imageFilters);
  
    const imageEl = document.getElementById('yume-img');
    const textEl = document.getElementById('yume-msg');
    const headerEl = document.querySelector('#yume .window-header');
  
    if (imageEl) {
      imageEl.src = image;
      imageEl.style.filter = filter;
    }
  
    if (textEl) {
      textEl.innerHTML = text;
      textEl.style.color = fontColor;
    }
  
    if (headerEl) {
      headerEl.style.background = headerBg;
    }
  }
  
  // 👁 Trigger once on DOM load
  document.addEventListener('DOMContentLoaded', loadSystemMessage);
  