// 🎵 iPod / Music Player
const audio = document.getElementById('audio');
const trackTitleEl = document.getElementById('nano-title');

const playlist = [
  { title: 'Such Great Heights', src: 'mp3s/Such Great Heights.mp3' },
  { title: 'Into Dust', src: 'mp3s/Into Dust.mp3' },
  { title: 'Welcome To The Black Parade', src: 'mp3s/Welcome To The Black Parade.mp3' },
  { title: 'Summit', src: 'mp3s/Skrillex - Summit (feat. Ellie Goulding) [Video by Pilerats].mp3' },
  { title: '54321', src: 'mp3s/A Rocket To The Moon - 54321 [HD].mp3' },
  { title: 'Strange Things Will Happen', src: 'mp3s/Strange Things Will Happen.mp3' }
];

let currentTrack = 0;

function loadTrack(i, shouldPlay = true) {
  currentTrack = i;
  const track = playlist[i];
  audio.src = track.src;
  trackTitleEl.textContent = track.title;

  if (shouldPlay) {
    audio.play().catch(err => console.warn('Autoplay error:', err));
  }
}

function playPause() {
  if (audio.paused) {
    audio.play().catch(err => console.warn('Play error:', err));
  } else {
    audio.pause();
  }
}

function nextTrack() {
  const next = (currentTrack + 1) % playlist.length;
  loadTrack(next, true); // force autoplay
}

function prevTrack() {
  const prev = (currentTrack - 1 + playlist.length) % playlist.length;
  loadTrack(prev, true); // force autoplay
}

function changeVolume(delta) {
  audio.volume = Math.min(1, Math.max(0, audio.volume + delta));
}

audio.addEventListener('ended', nextTrack);

// Initial track on load (autoplay off)
loadTrack(currentTrack, false);
