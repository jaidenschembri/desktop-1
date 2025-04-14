// ===== Taskbar & App Logic =====
const taskbar = document.getElementById('taskbar-apps');

const apps = {
  chatbot: { title: 'Chatbot', icon: 'pixelated/folder-icon.png', openIcon: 'pixelated/icons/folder-icon-open.png' },
  oscillator: { title: 'Oscillator', icon: 'pixelated/folder-icon.png', openIcon: 'pixelated/icons/folder-icon-open.png' },
  ipod: { title: 'iPod', icon: 'pixelated/folder-icon.png', openIcon: 'pixelated/icons/folder-icon-open.png' },
  gifypet: { title: 'Gifypet', icon: 'pixelated/folder-icon.png', openIcon: 'pixelated/icons/folder-icon-open.png' },
  numerology: { title: 'Numerology', icon: 'pixelated/folder-icon.png', openIcon: 'pixelated/icons/folder-icon-open.png' },
  tip: { title: 'Tip Jar', icon: 'pixelated/folder-icon.png', openIcon: 'pixelated/icons/folder-icon-open.png' },
  guestbook: { title: 'Guestbook', icon: 'pixelated/folder-icon.png', openIcon: 'pixelated/icons/folder-icon-open.png' },
  'window-shop': { title: 'Shop', icon: 'pixelated/folder-icon.png', openIcon: 'pixelated/icons/folder-icon-open.png' },
  'window-portfolio': { title: 'Portfolio', icon: 'pixelated/folder-icon.png', openIcon: 'pixelated/icons/folder-icon-open.png' },
  yume: { title: 'Yume', icon: 'pixelated/folder-icon.png', openIcon: 'pixelated/icons/folder-icon-open.png' }
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

  // Only reset size for non-portfolio windows
  if (id !== 'window-portfolio') {
    el.style.width = '';
    el.style.height = '';
  }

  el.classList.remove('hidden');
  el.style.visibility = 'hidden';
  el.style.display = 'block';
  

// 🔁 Swap to open icon
const iconEl = document.querySelector(`.icon[data-window-id="${id}"] img`);
if (iconEl && apps[id]?.openIcon) {
  iconEl.src = apps[id].openIcon;
}

  if (id === 'gifypet') {
    el.style.width = '310px';
    el.style.height = '360px';
  }
  

  // Positioning
  if (id === 'window-portfolio') {
    const centeredLeft = (window.innerWidth - el.offsetWidth) / 2;
    el.style.left = `${centeredLeft}px`;
    el.style.top = '100px';
  } else {
    if (window.innerWidth > 768) {
      // ✅ Desktop: random offset
      el.style.left = `${100 + Math.floor(Math.random() * 60)}px`;
      el.style.top = `${100 + Math.floor(Math.random() * 60)}px`;
    } else {
      // 📱 Mobile: no positioning
      el.style.left = '';
      el.style.top = '';
    }
  }


  el.style.visibility = '';
  el.style.display = '';

  // 🔧 Clean up inline styles on mobile
  if (window.innerWidth <= 768) {
    el.style.removeProperty('left');
    el.style.removeProperty('top');
  }

  el.classList.add('restoring');

  bringToFront(el);
  bindDrag(el);

  setTimeout(() => {
    el.classList.remove('restoring');
  }, 250);

  addToTaskbar(id);
}

function minimizeWindow(id) {
  const el = document.getElementById(id);
  if (!el) return;

  el.classList.add('minimizing');
  setTimeout(() => {
    el.classList.remove('minimizing');
    el.classList.add('hidden');
  }, 300);
}

function closeWindow(id) {
  const el = document.getElementById(id);
  if (!el) return;

  el.classList.add('hidden');
  removeFromTaskbar(id);

  // 🔁 Revert to closed icon
  const iconEl = document.querySelector(`.icon[data-window-id="${id}"] img`);
  if (iconEl && apps[id]?.icon) {
    iconEl.src = apps[id].icon;
  }
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
  updateTaskbarButtons(); // 🔁 update after adding
}

function removeFromTaskbar(id) {
  const btn = document.querySelector(`[data-app="${id}"]`);
  if (btn) btn.remove();
  updateTaskbarButtons(); // 🔁 update after removing
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


// ===== Desktop Icon Logic =====
function bindIconDrag(iconEl) {
  let isDragging = false;
  let startX, startY, offsetX, offsetY;

  iconEl.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();

    const rect = iconEl.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    const onMouseMove = (e) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (!isDragging && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
        isDragging = true;
        iconEl.style.position = 'absolute';
        iconEl.style.zIndex = 99;
      }

      if (isDragging) {
        iconEl.style.left = `${e.clientX - offsetX}px`;
        iconEl.style.top = `${e.clientY - offsetY}px`;
      }
    };

    const onMouseUp = (e) => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      // Always open the window when the icon is clicked
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const wasClick = Math.abs(dx) < 3 && Math.abs(dy) < 3;

      if (wasClick) {
        const windowId = iconEl.getAttribute('data-window-id');
        if (windowId) openWindow(windowId);
      }

      isDragging = false;
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}


function positionIcons() {
  const iconSpacing = 108;
  const columnSpacing = 120;
  const startX = 20;
  const bottomPadding = 20;

  const taskbar = document.querySelector('footer.taskbar');
  const taskbarHeight = taskbar ? taskbar.offsetHeight : 0;
  const availableHeight = window.innerHeight - taskbarHeight - bottomPadding;

  const iconIds = [
    'chatbot',
    'guestbook',
    'window-shop',
    'window-portfolio',
    'oscillator',
    'gifypet',
    'numerology',
    'tip',
    'yume'   
  ];

  const leftColumn = iconIds.slice(0, 8); // first 8 icons in column 1
  const rightColumn = iconIds.slice(8);   // gifypet in column 2

  // Position left column centered
  const totalHeightLeft = leftColumn.length * iconSpacing;
  const startYLeft = Math.max((availableHeight - totalHeightLeft) / 2, 10);

  leftColumn.forEach((id, index) => {
    const el = document.querySelector(`.icon[data-window-id="${id}"]`);
    if (el) {
      el.style.left = `${startX}px`;
      el.style.top = `${startYLeft + index * iconSpacing}px`;
    }
  });

  // Position right column aligned with the 8th icon (index 7)
  const alignToIndex = 7; // "window-portfolio"
  const alignY = startYLeft + alignToIndex * iconSpacing;

  rightColumn.forEach((id, index) => {
    const el = document.querySelector(`.icon[data-window-id="${id}"]`);
    if (el) {
      el.style.left = `${startX + columnSpacing}px`;
      el.style.top = `${alignY + index * iconSpacing}px`;
    }
  });
}



// Run on load
window.addEventListener('DOMContentLoaded', () => {
  positionIcons();
  // re-bind drag on load
  document.querySelectorAll('.icon').forEach(bindIconDrag);
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
  const appsContainer = document.getElementById('taskbar-apps');
  let moreButton = appsContainer.querySelector('.more-dropdown');

  if (!moreButton) {
    moreButton = document.createElement('div');
    moreButton.className = 'taskbar-button more-dropdown';
    moreButton.innerHTML = 'More ▾<div class="more-menu"></div>';

    // 👉 Always append at the end
    appsContainer.appendChild(moreButton);
  }

  return moreButton;
}


function updateTaskbarButtons() {
  const appsContainer = document.getElementById('taskbar-apps');
  const allButtons = Array.from(appsContainer.querySelectorAll('.taskbar-button:not(.more-dropdown)'));
  const moreButton = ensureMoreButtonExists();
  const moreMenu = moreButton.querySelector('.more-menu');

  // Reset state
  moreMenu.innerHTML = '';
  allButtons.forEach(btn => btn.style.display = 'flex');
  moreButton.style.display = 'none';

  const containerWidth = appsContainer.offsetWidth;
  const gapSize = 4;
  let usedWidth = 0;
  const visibleButtons = [];

  // Measure buttons that can fit
  for (const btn of allButtons) {
    const btnWidth = btn.offsetWidth + gapSize;
    if (usedWidth + btnWidth + moreButton.offsetWidth > containerWidth) break;

    usedWidth += btnWidth;
    visibleButtons.push(btn);
  }

  const overflowed = allButtons.filter(btn => !visibleButtons.includes(btn));

  // Build the dropdown
  if (overflowed.length > 0) {
    moreButton.style.display = 'flex';

    overflowed.forEach(btn => {
      btn.style.display = 'none';

      const appId = btn.getAttribute('data-app');
      const appInfo = apps[appId];
      if (!appInfo) return;

      const clone = document.createElement('div');
      clone.className = 'taskbar-button';
      clone.setAttribute('data-app', appId);
      clone.style.display = 'flex';
      clone.style.alignItems = 'center';
      clone.style.gap = '4px';
      clone.style.height = '28px';
      clone.style.boxSizing = 'border-box';

      // Icon
      if (appInfo.icon) {
        const img = document.createElement('img');
        img.src = appInfo.icon;
        img.alt = `${appInfo.title} icon`;
        img.className = 'taskbar-icon-img';
        clone.appendChild(img);
      }

      // Title
      const span = document.createElement('span');
      span.textContent = appInfo.title;
      span.style.overflow = 'hidden';
      span.style.whiteSpace = 'nowrap';
      span.style.textOverflow = 'ellipsis';
      span.style.flex = '1';
      clone.appendChild(span);

      // Click behavior — reopen or focus the actual window
      clone.onclick = () => {
        openWindow(appId); // ✅ this handles restoring + focusing
      };

      moreMenu.appendChild(clone);
    });
  }
}

// Auto update on resize
window.addEventListener('resize', updateTaskbarButtons);

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

window.addEventListener('DOMContentLoaded', initIpodToggle);


