// Only run this if we're on mobile
if (window.innerWidth <= 768) {
    const startMenu = document.getElementById('start-menu');
    const apps = {    
      tip: 'Tip Jar', 
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
  
    // Optional: Add a separator line
    const divider = document.createElement('hr');
    divider.style.border = 'none';
    divider.style.borderTop = '1px solid #999';
    divider.style.margin = '6px 0';
    ul.appendChild(divider);
  
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
  