// Only run this if we're on mobile
if (window.innerWidth <= 768) {
    const startMenu = document.getElementById('start-menu');
    const apps = {    
      oscillator: 'Oscillator',
      numerology: 'Numerology',     
      guestbook: 'Guestbook',
      'window-shop': 'Shop',
      gifypet: 'Gifypet',
      yume: 'Yume',
      chatbot: 'Chatbot',
      'window-portfolio': 'Portfolio',
    };
    
    const ul = startMenu.querySelector('ul');
  
    // Inject menu items
    Object.entries(apps).forEach(([id, title]) => {
      const li = document.createElement('li');
      li.textContent = title;
      li.onclick = () => {
        openWindow(id);
        startMenu.classList.add('hidden'); // auto-close after tap
      };
      ul.appendChild(li);
    });
  }
  
  if (window.innerWidth <= 768) {
    const startMenu = document.getElementById('start-menu');
  
    // Add click logic for submenus
    document.querySelectorAll('.submenu-parent').forEach(parent => {
      parent.addEventListener('click', (e) => {
        e.stopPropagation(); // stop bubbling to document
        const submenu = parent.querySelector('.submenu');
        const isOpen = submenu.style.display === 'block';
        
        // close all others
        document.querySelectorAll('.submenu').forEach(s => s.style.display = 'none');
        
        // toggle current
        submenu.style.display = isOpen ? 'none' : 'block';
      });
    });
  
    // close all on outside tap
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.submenu-parent')) {
        document.querySelectorAll('.submenu').forEach(s => s.style.display = 'none');
      }
    });
  }
  