// ===== DESKTOP MANAGER - NEOCITY =====
// Main desktop functionality including windows, taskbar, and UI interactions

// ===== CONSTANTS & CONFIGURATION =====
const APPS_CONFIG = {
  chatbot: { title: 'Chatbot', icon: 'pixelated/folder-icon.png', openIcon: 'pixelated/icons/folder-icon-open.png' },
  oscillator: { title: 'Oscillator', icon: 'pixelated/folder-icon.png', openIcon: 'pixelated/icons/folder-icon-open.png' },
  ipod: { title: 'iPod', icon: 'pixelated/folder-icon.png', openIcon: 'pixelated/icons/folder-icon-open.png' },
  gifypet: { title: 'Gifypet', icon: 'pixelated/folder-icon.png', openIcon: 'pixelated/icons/folder-icon-open.png' },
  numerology: { title: 'Numerology', icon: 'pixelated/folder-icon.png', openIcon: 'pixelated/icons/folder-icon-open.png' },
  guestbook: { title: 'Guestbook', icon: 'pixelated/folder-icon.png', openIcon: 'pixelated/icons/folder-icon-open.png' },
  'window-shop': { title: 'Shop', icon: 'pixelated/folder-icon.png', openIcon: 'pixelated/icons/folder-icon-open.png' },
  'window-portfolio': { title: 'Portfolio', icon: 'pixelated/folder-icon.png', openIcon: 'pixelated/icons/folder-icon-open.png' },
};

const ANIMATION_CONFIG = {
  mobile: {
    open: ['mobileFadeIn'],
    close: [], // uses class-based animation
  },
  desktop: {
    open: ['zoomIn', 'rotateIn', 'slideInBottom', 'crtPop', 'glitchPop', 'dropIn', 'vhsGlitchIn', 'explodeIn'],
    close: ['blackHoleOut', 'fadeOut', 'rotateOut', 'slideOutBottom', 'crtExit', 'shatterOut'],
  }
};

const FLOATING_SYMBOLS = ['★', '☠', '⌘', '✞', '∞', '⚠', '𓆩𓆪', '█'];
const SYMBOL_COLORS = ['#00ffff', '#ff77cc', '#39ff14', '#ff003c', '#ffffff'];

const AUTO_OPEN_WINDOWS = ['window-shop', 'oscillator', 'guestbook', 'chatbot'];

// ===== GLOBAL STATE =====
let zCounter = 100;
const taskbar = document.getElementById('taskbar-apps');

// ===== AUDIO SYSTEM =====
class AudioManager {
  constructor() {
    this.openSound = new Audio('audio/open.wav');
    this.closeSound = new Audio('audio/close.wav');
  }

  playOpenSound() {
    this.openSound.currentTime = 0;
    this.openSound.play().catch(() => {}); // prevent uncaught errors on mobile autoplay restrictions
  }

  playCloseSound() {
    this.closeSound.currentTime = 0;
    this.closeSound.play().catch(() => {});
  }
}

const audioManager = new AudioManager();

// ===== UTILITY FUNCTIONS =====
const Utils = {
  isMobile: () => window.innerWidth <= 768,
  
  getRandomAnimation: (type) => {
    const animations = Utils.isMobile() ? ANIMATION_CONFIG.mobile[type] : ANIMATION_CONFIG.desktop[type];
    return animations[Math.floor(Math.random() * animations.length)];
  },

  clampToScreen: (x, y, element) => {
    const taskbar = document.querySelector('footer.taskbar');
    const taskbarHeight = taskbar ? taskbar.offsetHeight : 0;
    const maxLeft = window.innerWidth - element.offsetWidth - 20;
    const maxTop = window.innerHeight - element.offsetHeight - taskbarHeight - 20;
    
    return {
      x: Math.max(0, Math.min(x, maxLeft)),
      y: Math.max(0, Math.min(y, maxTop))
    };
  },

  getWindowPosition: (windowId) => {
    const positions = {
      'guestbook': {
        x: window.innerWidth - 400 - 20, // assuming width of 400
        y: 20
      },
      'window-shop': {
        x: window.innerWidth * 0.20,
        y: window.innerHeight * 0.02
      },
      'chatbot': {
        x: window.innerWidth * 0.47,
        y: window.innerHeight * 0.02
      },
      'oscillator': {
        x: window.innerWidth * 0.53,
        y: window.innerHeight * 0.55
      }
    };

    return positions[windowId] || {
      x: 100 + Math.floor(Math.random() * 60),
      y: 100 + Math.floor(Math.random() * 60)
    };
  }
};

// ===== WINDOW MANAGEMENT SYSTEM =====
class WindowManager {
  static bringToFront(element) {
    zCounter++;
    element.style.zIndex = zCounter;
    TaskbarManager.highlightButton(element.id);

    document.querySelectorAll('.window').forEach(w =>
      w.classList.remove('active-window')
    );
    element.classList.add('active-window');
  }

  static openWindow(id) {
    const element = document.getElementById(id);
    if (!element) return;

    // Reset styles if needed
    if (id !== 'window-portfolio') {
      element.style.width = '';
      element.style.height = '';
    }

    element.classList.remove('hidden');
    audioManager.playOpenSound();
    element.style.visibility = 'hidden';
    element.style.display = 'block';

    // Mobile positioning
    if (Utils.isMobile()) {
      const body = document.body;
      if (element.parentNode === body) {
        body.insertBefore(element, body.querySelector('.window'));
      }
    }

    // Update icon
    IconManager.updateIcon(id, true);

    // Set specific dimensions
    WindowManager._setWindowDimensions(id, element);

    // Position window
    WindowManager._positionWindow(id, element);

    // Show window
    element.style.visibility = '';
    element.style.display = '';

    // Clean mobile styles
    if (Utils.isMobile()) {
      element.style.removeProperty('left');
      element.style.removeProperty('top');
    }

    // Animate
    WindowManager._animateWindowOpen(element);

    WindowManager.bringToFront(element);
    DragManager.bindDrag(element);
    TaskbarManager.addButton(id);
  }

  static closeWindow(id) {
    const element = document.getElementById(id);
    if (!element) return;

    audioManager.playCloseSound();
    const isMobile = Utils.isMobile();

    element.classList.add('closing');

    if (!isMobile) {
      const closeAnimation = Utils.getRandomAnimation('close');
      element.style.animationName = closeAnimation;
    }

    setTimeout(() => {
      element.classList.remove('closing');
      element.classList.add('hidden');
      if (!isMobile) element.style.animationName = '';
    }, isMobile ? 200 : 300);

    TaskbarManager.removeButton(id);
    IconManager.updateIcon(id, false);
  }

  static minimizeWindow(id) {
    const element = document.getElementById(id);
    if (!element) return;

    const isMobile = Utils.isMobile();

    if (isMobile) {
      element.classList.add('closing');
      setTimeout(() => {
        element.classList.remove('closing');
        element.classList.add('hidden');
      }, 200);
      return;
    }

    // Desktop: slide down animation
    element.classList.add('minimizing');
    element.style.animationName = 'slideToTaskbar';

    setTimeout(() => {
      element.classList.remove('minimizing');
      element.style.animationName = '';
      element.classList.add('hidden');
    }, 300);
  }

  static _setWindowDimensions(id, element) {
    if (id === 'gifypet') {
      if (!Utils.isMobile()) {
        element.style.width = '310px';
        element.style.height = '360px';
      } else {
        element.style.width = '';
        element.style.height = '';
      }
    }
  }

  static _positionWindow(id, element) {
    if (Utils.isMobile()) {
      element.style.left = '';
      element.style.top = '';
      return;
    }

    const position = Utils.getWindowPosition(id);
    const clamped = Utils.clampToScreen(position.x, position.y, element);

    element.style.left = `${clamped.x}px`;
    element.style.top = `${clamped.y}px`;
  }

  static _animateWindowOpen(element) {
    const openAnimation = Utils.getRandomAnimation('open');
    element.classList.add('opening');
    element.style.animationName = openAnimation;

    setTimeout(() => {
      element.classList.remove('opening');
      element.style.animationName = '';
    }, 350);
  }
}

// ===== TASKBAR MANAGEMENT =====
class TaskbarManager {
  static addButton(id) {
    if (document.querySelector(`[data-app="${id}"]`)) return;

    const button = document.createElement('button');
    button.className = 'taskbar-button';
    button.setAttribute('data-app', id);

    const app = APPS_CONFIG[id];
    const iconPath = app?.icon;
    const title = app?.title || id;

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
      const window = document.getElementById(id);
      if (window.classList.contains('hidden')) {
        window.classList.remove('hidden');
        window.classList.add('restoring');
        setTimeout(() => window.classList.remove('restoring'), 250);
      }
      WindowManager.bringToFront(window);
    };

    taskbar.appendChild(button);
  }

  static removeButton(id) {
    const button = document.querySelector(`[data-app="${id}"]`);
    if (button) button.remove();
  }

  static highlightButton(id) {
    document.querySelectorAll('.taskbar-button').forEach(btn =>
      btn.classList.remove('active')
    );
    const current = document.querySelector(`[data-app="${id}"]`);
    if (current) current.classList.add('active');
  }

  static ensureMoreButtonExists() {
    let moreButton = document.querySelector('.more-dropdown');

    if (!moreButton) {
      moreButton = document.createElement('div');
      moreButton.className = 'taskbar-button more-dropdown';
      moreButton.style.display = 'none';
      moreButton.innerHTML = '<div class="more-menu"></div>';
      taskbar.appendChild(moreButton);
    }

    return moreButton;
  }

  static updateTaskbarButtons() {
    // Function disabled but still exists to prevent errors
  }
}

// ===== ICON MANAGEMENT =====
class IconManager {
  static updateIcon(windowId, isOpen) {
    const iconElement = document.querySelector(`.icon[data-window-id="${windowId}"] img`);
    const app = APPS_CONFIG[windowId];
    
    if (iconElement && app) {
      iconElement.src = isOpen ? (app.openIcon || app.icon) : app.icon;
    }
  }
}

// ===== DRAG SYSTEM =====
class DragManager {
  static bindDrag(window) {
    const header = window.querySelector('.window-header');
    if (!header) return;

    let isDragging = false;
    let offsetX = 0, offsetY = 0;

    const onMouseDown = (e) => {
      e.preventDefault();
      WindowManager.bringToFront(window);
      isDragging = true;
      offsetX = e.clientX - window.offsetLeft;
      offsetY = e.clientY - window.offsetTop;
      window.style.position = 'absolute';
      document.body.style.userSelect = 'none';
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      window.style.left = `${e.clientX - offsetX}px`;
      window.style.top = `${e.clientY - offsetY}px`;
    };

    const onMouseUp = () => {
      if (!isDragging) return;
      isDragging = false;
      document.body.style.userSelect = '';
    };

    header.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  static initIpodDrag() {
    const ipod = document.getElementById("fixed-ipod");
    const dragHandle = document.getElementById("ipod-drag");

    if (!ipod || !dragHandle) return;

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
  }
}

// ===== CLOCK SYSTEM =====
class ClockManager {
  static updateClock() {
    const clock = document.getElementById('taskbar-clock');
    if (!clock) return;

    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    clock.textContent = `${hours}:${minutes} ${ampm}`;
  }

  static init() {
    ClockManager.updateClock();
    setInterval(ClockManager.updateClock, 1000);
  }
}

// ===== LIGHTBOX SYSTEM =====
class LightboxManager {
  static openLightbox(src) {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    if (!lightbox || !lightboxImg) return;

    lightboxImg.src = src;
    lightbox.classList.remove("hidden");
  }

  static closeLightbox() {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    if (!lightbox || !lightboxImg) return;

    lightbox.classList.add("hidden");
    lightboxImg.src = "";
  }

  static init() {
    document.querySelectorAll('.gallery-grid img').forEach(img => {
      img.addEventListener('click', () => LightboxManager.openLightbox(img.src));
    });
  }
}

// ===== START MENU SYSTEM =====
class StartMenuManager {
  static init() {
    const startBtn = document.getElementById('start-btn');
    const startMenu = document.getElementById('start-menu');
    
    if (!startBtn || !startMenu) return;

    startBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = !startMenu.classList.contains('hidden');
      startMenu.classList.toggle('hidden');
      startBtn.classList.toggle('active', !isOpen);
    });

    document.addEventListener('click', (e) => {
      if (!startMenu.contains(e.target) && !startBtn.contains(e.target)) {
        startMenu.classList.add('hidden');
        startBtn.classList.remove('active');
      }
    });
  }
}

// ===== IPOD TOGGLE SYSTEM =====
class IpodManager {
  static initToggle() {
    if (Utils.isMobile()) {
      const ipod = document.getElementById('fixed-ipod');
      if (ipod && !ipod.classList.contains('visible')) {
        ipod.classList.add('visible');
      }
    }
    
    const ipodToggleBtn = document.getElementById('ipod-toggle-btn');
    const ipodEl = document.getElementById('fixed-ipod');

    if (ipodToggleBtn && ipodEl) {
      ipodToggleBtn.addEventListener('click', () => {
        if (Utils.isMobile()) {
          ipodEl.classList.toggle('visible');
        } else {
          ipodEl.classList.toggle('hidden');
        }
        console.log('🎧 iPod toggled');
      });
    } else {
      console.warn('⚠️ iPod toggle elements not ready, retrying...');
      setTimeout(IpodManager.initToggle, 100);
    }
  }
}

// ===== FLOATING SYMBOLS SYSTEM =====
class FloatingSymbolsManager {
  static spawnFloatingSymbol() {
    const symbol = document.createElement('div');
    symbol.className = 'floating-symbol';

    // Choose random symbol and color
    symbol.textContent = FLOATING_SYMBOLS[Math.floor(Math.random() * FLOATING_SYMBOLS.length)];
    const color = SYMBOL_COLORS[Math.floor(Math.random() * SYMBOL_COLORS.length)];
    
    // Set styles
    symbol.style.left = `${Math.random() * 100}vw`;
    symbol.style.animationDuration = `${6 + Math.random() * 6}s`;
    symbol.style.color = color;
    symbol.style.textShadow = `0 0 4px ${color}, 0 0 8px ${color}`;

    document.body.appendChild(symbol);

    // Clean up after animation
    setTimeout(() => {
      symbol.remove();
    }, 12000);
  }

  static init() {
    setInterval(() => {
      if (Math.random() < 0.7) {
        FloatingSymbolsManager.spawnFloatingSymbol();
      }
    }, 5000);
  }
}

// ===== THEME SYSTEM =====
class ThemeManager {
  static setTheme(theme) {
    const body = document.body;
    body.classList.remove('theme-classic', 'theme-mono', 'theme-cyber', 'theme-win98');
    body.classList.add(`theme-${theme}`);
    localStorage.setItem('neocity-theme', theme);
  }

  static loadSavedTheme() {
    const savedTheme = localStorage.getItem('neocity-theme') || 'classic';
    ThemeManager.setTheme(savedTheme);
  }
}

// ===== MAIN INITIALIZATION =====
class DesktopManager {
  static init() {
    // Load theme
    ThemeManager.loadSavedTheme();

    // Position icons
    positionIcons();

    // Bind icon dragging
    document.querySelectorAll('.icon').forEach(bindIconDrag);

    // External link icons
    document.querySelectorAll('.icon[data-external-url]').forEach(icon => {
      icon.addEventListener('click', () => {
        const url = icon.getAttribute('data-external-url');
        window.open(url, '_blank');
      });
    });

    // Initialize systems
    IpodManager.initToggle();
    DragManager.initIpodDrag();
    ClockManager.init();
    LightboxManager.init();
    StartMenuManager.init();
    FloatingSymbolsManager.init();

    // Open default windows
    AUTO_OPEN_WINDOWS.forEach(id => WindowManager.openWindow(id));

    // Allow clicking anywhere in window to activate
    document.querySelectorAll('.window').forEach(win => {
      win.addEventListener('mousedown', () => {
        if (!win.classList.contains('active-window')) {
          WindowManager.bringToFront(win);
        }
      });
    });
  }
}

// ===== GLOBAL FUNCTION EXPORTS =====
// These functions are called from HTML and need to remain global
window.openWindow = WindowManager.openWindow;
window.closeWindow = WindowManager.closeWindow;
window.minimizeWindow = WindowManager.minimizeWindow;
window.openLightbox = LightboxManager.openLightbox;
window.closeLightbox = LightboxManager.closeLightbox;
window.setTheme = ThemeManager.setTheme;

// ===== EVENT LISTENERS =====
window.addEventListener('DOMContentLoaded', DesktopManager.init);
window.addEventListener('resize', positionIcons);

