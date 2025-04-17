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
  
    if (window.innerWidth <= 768) {
      // Enable submenu click toggles
      document.querySelectorAll('.submenu-parent').forEach(parent => {
        const submenu = parent.querySelector('.submenu');
        
        if (!submenu) return;
    
        // First, hide it by default
        submenu.style.display = 'none';
    
        parent.addEventListener('click', (e) => {
          e.stopPropagation(); // prevent bubbling to document
          const isVisible = submenu.style.display === 'block';
    
          // Close all submenus
          document.querySelectorAll('.submenu').forEach(el => {
            el.style.display = 'none';
          });
    
          // Toggle this one
          submenu.style.display = isVisible ? 'none' : 'block';
        });
      });
    
      // Close submenus if clicking elsewhere
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.submenu-parent')) {
          document.querySelectorAll('.submenu').forEach(el => {
            el.style.display = 'none';
          });
        }
      });
    }
    
  