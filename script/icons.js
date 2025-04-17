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
    const icons = Array.from(document.querySelectorAll('.desktop-icons .icon'));
    const iconHeight = 108;
    const iconGap = 12;
    const columnSpacing = 120;
    const padding = 20;
  
    const taskbar = document.querySelector('footer.taskbar');
    const taskbarHeight = taskbar ? taskbar.offsetHeight : 0;
  
    const availableHeight = window.innerHeight - taskbarHeight - padding * 2;
    const iconsPerColumn = Math.floor(availableHeight / (iconHeight + iconGap));
  
    icons.forEach((icon, index) => {
      const column = Math.floor(index / iconsPerColumn);
      const row = index % iconsPerColumn;
  
      const x = 20 + column * columnSpacing;
      const y = padding + row * (iconHeight + iconGap);
  
      icon.style.left = `${x}px`;
      icon.style.top = `${y}px`;
    });
  }
  
  