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
  