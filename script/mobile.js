
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

  Object.entries(apps).forEach(([id, title]) => {
    const li = document.createElement('li');
    li.textContent = title;
    li.onclick = () => {
      openWindow(id);
      startMenu.classList.add('hidden');
    };
    ul.appendChild(li);
  });

  // Toggle submenu on tap
  document.querySelectorAll('.submenu-parent').forEach(parent => {
    const submenu = parent.querySelector('.submenu');
    if (!submenu) return;

    parent.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();

      // Close all submenus first
      document.querySelectorAll('.submenu').forEach(s => s.classList.remove('open'));

      // Toggle this one
      submenu.classList.toggle('open');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.submenu-parent')) {
      document.querySelectorAll('.submenu').forEach(s => s.classList.remove('open'));
    }
  });
}
