const CACHE_NAME = "neocity-cache-v1";

const urlsToCache = [
  // 🌐 Base
  "./",
  "./index.html",
  "./manifest.json",

  // 🎨 CSS
  "./css/index.css",
  "./css/footer.css",
  "./css/animations.css",
  "./css/mobile.css",

  // Components CSS (even if not uploaded)
  "./css/components/ipod.css",
  "./css/components/chatbot.css",
  "./css/components/guestbook.css",
  "./css/components/portfolio.css",
  "./css/components/numerology.css",
  "./css/components/oscillator.css",
  "./css/components/shop.css",

  // 🎯 JS (UI + app logic only)
  "./script/desktop.js",
  "./script/icons.js",
  "./script/ipod.js",
  "./script/chatbot.js",
  "./script/numerology.js",
  "./script/oscillator.js",
  "./script/shop.js",
  "./script/tip.js",
  "./script/mobile.js",

  // 🔤 Fonts
  "./fonts/Perfect DOS VGA 437 Win.ttf",

  // 🖼️ Images
  "./images/swag.jpg",
  "./images/windows.jpg", // from theme
  "./images/ETHEREUM.png",
  "./images/SOLANA.png",
  "./pixelated/ipod.gif",
  "./pixelated/folder-icon.png",
  "./pixelated/icons/close-icon.png",
  "./pixelated/icons8-x-24.png",
  "./pixelated/icons8-instagram-24.png",
  "./pixelated/icons8-twitch-24.png",
  "./pixelated/music_5.gif",

  // 🎵 MP3s for offline iPod use
  "./mp3s/Such Great Heights.mp3",
  "./mp3s/Into Dust.mp3",
  "./mp3s/Welcome To The Black Parade.mp3",
  "./mp3s/Skrillex - Summit (feat. Ellie Goulding) [Video by Pilerats].mp3",
  "./mp3s/A Rocket To The Moon - 54321 [HD].mp3",
  "./mp3s/Imgod.mp3",
  "./mp3s/Dance Inside.mp3"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("📦 Caching app shell...");
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
