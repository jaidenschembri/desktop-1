// ===== Taskbar & App Logic =====
const taskbar = document.getElementById('taskbar-apps');

const apps = {
  chatbot: { title: 'Chatbot', icon: 'pixelated/folder-icon.png', openIcon: 'pixelated/icons/folder-icon-open.png' },
  oscillator: { title: 'Oscillator', icon: 'pixelated/folder-icon.png', openIcon: 'pixelated/icons/folder-icon-open.png' },
  ipod: { title: 'iPod', icon: 'pixelated/folder-icon.png', openIcon: 'pixelated/icons/folder-icon-open.png' },
  gifypet: { title: 'Gifypet', icon: 'pixelated/folder-icon.png', openIcon: 'pixelated/icons/folder-icon-open.png' },
  numerology: { title: 'Numerology', icon: 'pixelated/folder-icon.png', openIcon: 'pixelated/icons/folder-icon-open.png' },
  yume: { title: 'Yume', icon: 'pixelated/folder-icon.png', openIcon: 'pixelated/icons/folder-icon-open.png' },
  guestbook: { title: 'Guestbook', icon: 'pixelated/folder-icon.png', openIcon: 'pixelated/icons/folder-icon-open.png' },
  'window-shop': { title: 'Shop', icon: 'pixelated/folder-icon.png', openIcon: 'pixelated/icons/folder-icon-open.png' },
  'window-portfolio': { title: 'Portfolio', icon: 'pixelated/folder-icon.png', openIcon: 'pixelated/icons/folder-icon-open.png' },
  
};

let zCounter = 100;

function bringToFront(el) {
  zCounter++;
  el.style.zIndex = zCounter;
  highlightTaskbar(el.id);

  document.querySelectorAll('.window').forEach(w =>
    w.classList.remove('active-window')
  );
  el.classList.add('active-window');
}

function openWindow(id) {
  const el = document.getElementById(id);
  if (!el) return;

  // Reset styles if needed
  if (id !== 'window-portfolio') {
    el.style.width = '';
    el.style.height = '';
  }

  el.classList.remove('hidden');
  el.style.visibility = 'hidden';
  el.style.display = 'block';

  // On mobile: move it up top
  if (window.innerWidth <= 768) {
    const body = document.body;
    if (el.parentNode === body) {
      body.insertBefore(el, body.querySelector('.window'));
    }
  }

  // 🔁 Icon swap
  const iconEl = document.querySelector(`.icon[data-window-id="${id}"] img`);
  if (iconEl && apps[id]?.openIcon) {
    iconEl.src = apps[id].openIcon;
  }

  // Set dimensions for specific windows
  if (id === 'gifypet') {
    if (window.innerWidth > 768) {
      el.style.width = '310px';
      el.style.height = '360px';
    } else {
      el.style.width = '';
      el.style.height = '';
    }
  }

  // ==== 🔲 SMART POSITIONING ====
  if (window.innerWidth > 768) {
    const taskbar = document.querySelector('footer.taskbar');
    const taskbarHeight = taskbar ? taskbar.offsetHeight : 0;

    // Default position
    let x = 100 + Math.floor(Math.random() * 60);
    let y = 100 + Math.floor(Math.random() * 60);

    switch (id) {
      case 'window-portfolio':
        x = (window.innerWidth - el.offsetWidth) / 2;
        y = 100;
        break;
      case 'yume':
        x = window.innerWidth * 0.75;
        y = 445;
        break;
      case 'guestbook':
        x = window.innerWidth - el.offsetWidth - 20;
        y = 20;
        break;
      case 'window-shop':
        x = window.innerWidth * 0.48;
        y = window.innerHeight * 0.02;
        break;
      default:
        break;
    }

    // Clamp to screen
    const maxLeft = window.innerWidth - el.offsetWidth - 20;
    const maxTop = window.innerHeight - el.offsetHeight - taskbarHeight - 20;

    el.style.left = `${Math.max(0, Math.min(x, maxLeft))}px`;
    el.style.top = `${Math.max(0, Math.min(y, maxTop))}px`;
  } else {
    // 📱 Mobile: no positioning
    el.style.left = '';
    el.style.top = '';
  }

  el.style.visibility = '';
  el.style.display = '';

  // Clean inline styles on mobile
  if (window.innerWidth <= 768) {
    el.style.removeProperty('left');
    el.style.removeProperty('top');
  }

  // 📽️ Animation
  const openAnims = window.innerWidth <= 768
    ? ['mobileFadeIn']
    : ['zoomIn', 'rotateIn', 'slideInBottom', 'crtPop', 'glitchPop', 'dropIn', 'vhsGlitchIn', 'explodeIn'];

  const chosenOpen = openAnims[Math.floor(Math.random() * openAnims.length)];
  el.classList.add('opening');
  el.style.animationName = chosenOpen;

  setTimeout(() => {
    el.classList.remove('opening');
    el.style.animationName = '';
  }, 350);

  bringToFront(el);
  bindDrag(el);
  addToTaskbar(id);
}

function closeWindow(id) {
  const el = document.getElementById(id);
  if (!el) return;

  const isMobile = window.innerWidth <= 768;
  const closeAnims = isMobile
    ? [] // mobile uses class-based animation
    : ['blackHoleOut', 'fadeOut', 'rotateOut', 'slideOutBottom', 'crtExit', 'shatterOut'];

  el.classList.add('closing');

  if (!isMobile) {
    const chosenClose = closeAnims[Math.floor(Math.random() * closeAnims.length)];
    el.style.animationName = chosenClose;
  }

  setTimeout(() => {
    el.classList.remove('closing');
    el.classList.add('hidden');
    if (!isMobile) el.style.animationName = '';
  }, isMobile ? 200 : 300);

  removeFromTaskbar(id);

  const iconEl = document.querySelector(`.icon[data-window-id="${id}"] img`);
  if (iconEl && apps[id]?.icon) {
    iconEl.src = apps[id].icon;
  }
}

function minimizeWindow(id) {
  const el = document.getElementById(id);
  if (!el) return;

  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    el.classList.add('closing');
    setTimeout(() => {
      el.classList.remove('closing');
      el.classList.add('hidden');
    }, 200);
    return;
  }

  // 🖥 Desktop: slide down animation
  el.classList.add('minimizing');
  el.style.animationName = 'slideToTaskbar';

  setTimeout(() => {
    el.classList.remove('minimizing');
    el.style.animationName = '';
    el.classList.add('hidden');
  }, 300);
}


function addToTaskbar(id) {
  if (document.querySelector(`[data-app="${id}"]`)) return;

  const button = document.createElement('button');
  button.className = 'taskbar-button';
  button.setAttribute('data-app', id);

  const iconPath = apps[id]?.icon;
  const title = apps[id]?.title || id;

  if (iconPath) {
    const img = document.createElement('img');
    img.src = iconPath;
    img.alt = `${title} icon`;
    img.classList.add('taskbar-icon-img');
    button.appendChild(img);
  }

  const span = document.createElement('span');
  span.textContent = title;
  button.appendChild(span);

  button.onclick = () => {
    const win = document.getElementById(id);
    if (win.classList.contains('hidden')) {
      win.classList.remove('hidden');
      win.classList.add('restoring');
      setTimeout(() => win.classList.remove('restoring'), 250);
    }
    bringToFront(win);
  };

  taskbar.appendChild(button);
}

function removeFromTaskbar(id) {
  const btn = document.querySelector(`[data-app="${id}"]`);
  if (btn) btn.remove();
}

function highlightTaskbar(id) {
  document.querySelectorAll('.taskbar-button').forEach(btn =>
    btn.classList.remove('active')
  );
  const current = document.querySelector(`[data-app="${id}"]`);
  if (current) current.classList.add('active');
}

// ===== Window Dragging =====
function bindDrag(win) {
  const header = win.querySelector('.window-header');
  if (!header) return;

  let isDragging = false;
  let offsetX = 0, offsetY = 0;

  const onMouseDown = (e) => {
    e.preventDefault(); // 💥 Prevent text selection
    bringToFront(win);
    isDragging = true;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
    win.style.position = 'absolute';

    // 👇 Temporarily disable text selection on body
    document.body.style.userSelect = 'none';
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    win.style.left = `${e.clientX - offsetX}px`;
    win.style.top = `${e.clientY - offsetY}px`;
  };

  const onMouseUp = () => {
    if (!isDragging) return;
    isDragging = false;

    // ✅ Restore default user-select
    document.body.style.userSelect = '';
  };

  header.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

window.addEventListener('DOMContentLoaded', () => {
  positionIcons();
  document.querySelectorAll('.icon').forEach(bindIconDrag);
  // ——— External‑link icons ———
document.querySelectorAll('.icon[data-external-url]').forEach(icon => {
  icon.addEventListener('click', () => {
    const url = icon.getAttribute('data-external-url');
    window.open(url, '_blank');
  });
});

  initIpodToggle(); // ✅ already being called

  // 🪟 Auto-open these windows on load
  const windowsToOpen = [
    'window-shop',
    'guestbook',
    'yume',
    // add any others like 'oscillator', 'window-portfolio', etc.
  ];

  windowsToOpen.forEach(id => openWindow(id));
});

// Re-run on resize
window.addEventListener('resize', () => {
  positionIcons();
});

// ===== iPod Dragging =====
const ipod = document.getElementById("fixed-ipod");
const dragHandle = document.getElementById("ipod-drag");

(() => {
  let dragging = false;
  let offsetX, offsetY;

  dragHandle.addEventListener("mousedown", (e) => {
    dragging = true;
    offsetX = e.clientX - ipod.offsetLeft;
    offsetY = e.clientY - ipod.offsetTop;
  });

  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    ipod.style.left = `${e.clientX - offsetX}px`;
    ipod.style.top = `${e.clientY - offsetY}px`;
    ipod.style.right = "auto";
    ipod.style.bottom = "auto";
  });

  document.addEventListener("mouseup", () => {
    dragging = false;
  });
})();

// ===== Clock =====
function updateClock() {
  const clock = document.getElementById('taskbar-clock');
  const now = new Date();

  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;

  clock.textContent = `${hours}:${minutes} ${ampm}`;
}

updateClock();
setInterval(updateClock, 1000);

// ===== Lightbox =====
function openLightbox(src) {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  lightboxImg.src = src;
  lightbox.classList.remove("hidden");
}

function closeLightbox() {
  const lightbox = document.getElementById("lightbox");
  lightbox.classList.add("hidden");
  document.getElementById("lightbox-img").src = "";
}

document.querySelectorAll('.gallery-grid img').forEach(img => {
  img.addEventListener('click', () => openLightbox(img.src));
});

function ensureMoreButtonExists() {
  // 👻 Create a hidden placeholder to keep layout intact
  let moreButton = document.querySelector('.more-dropdown');

  if (!moreButton) {
    moreButton = document.createElement('div');
    moreButton.className = 'taskbar-button more-dropdown';
    moreButton.style.display = 'none'; // <- never shown
    moreButton.innerHTML = '<div class="more-menu"></div>';
    document.getElementById('taskbar-apps').appendChild(moreButton);
  }

  return moreButton;
}

function updateTaskbarButtons() {
  // 💤 Function disabled but still exists to prevent errors
}

const startBtn = document.getElementById('start-btn');
const startMenu = document.getElementById('start-menu');            

startBtn.addEventListener('click', (e) => {
  e.stopPropagation(); // prevent body click from closing
  const isOpen = !startMenu.classList.contains('hidden');
  startMenu.classList.toggle('hidden');
  startBtn.classList.toggle('active', !isOpen); // ✅ toggle active class
});

document.addEventListener('click', (e) => {
  if (!startMenu.contains(e.target) && !startBtn.contains(e.target)) {
    startMenu.classList.add('hidden');
    startBtn.classList.remove('active'); // ✅ close the button state
  }
});

function setTheme(mode) {
  document.body.classList.remove('theme-classic', 'theme-mono', 'theme-cyber');
  document.body.classList.add(`theme-${mode}`);
  startMenu.classList.add('hidden');
}

function initIpodToggle() {
  if (window.innerWidth <= 768) {
    const ipod = document.getElementById('fixed-ipod');
    if (ipod && !ipod.classList.contains('visible')) {
      ipod.classList.add('visible');
    }
  }
  
  const ipodToggleBtn = document.getElementById('ipod-toggle-btn');
  const ipodEl = document.getElementById('fixed-ipod');

  if (ipodToggleBtn && ipodEl) {
    ipodToggleBtn.addEventListener('click', () => {
      const isMobile = window.innerWidth <= 768;

      if (isMobile) {
        ipodEl.classList.toggle('visible');  // mobile logic
      } else {
        ipodEl.classList.toggle('hidden');   // desktop logic
      }

      console.log('🎧 iPod toggled');
    });
  } else {
    console.warn('⚠️ iPod toggle elements not ready, retrying...');
    setTimeout(initIpodToggle, 100);
  }
}

function spawnFloatingSymbol() {
  const s = document.createElement('div');
  s.className = 'floating-symbol';

  // choose a symbol
  const symbols = ['★', '☠', '⌘', '✞', '∞', '⚠', '𓆩𓆪', '█'];
  s.textContent = symbols[Math.floor(Math.random() * symbols.length)];

  // random position + animation timing
  s.style.left = `${Math.random() * 100}vw`;
  s.style.animationDuration = `${6 + Math.random() * 6}s`;

  document.body.appendChild(s);

  // clean up after it floats off-screen
  setTimeout(() => {
    s.remove();
  }, 12000);

  const colors = ['#00ffff', '#ff77cc', '#39ff14', '#ff003c', '#ffffff'];
const chosen = colors[Math.floor(Math.random() * colors.length)];
s.style.color = chosen;
s.style.textShadow = `0 0 4px ${chosen}, 0 0 8px ${chosen}`;

}

setInterval(() => {
  if (Math.random() < 0.7) spawnFloatingSymbol(); // 70% chance every time
}, 5000); // every 4 seconds
