(() => {
  // Chakra Oscillator Visualizer 🌈
  let audioCtx, oscillator, analyser, dataArray, canvas, ctx;

  const startBtn = document.getElementById('startButton');
  const stopBtn = document.getElementById('stopButton');
  const freqInput = document.getElementById('frequencyInput');
  const freqVal = document.getElementById('frequencyValue');

  startBtn.addEventListener("click", () => {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    oscillator = audioCtx.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(freqInput.value, audioCtx.currentTime);

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.8;

    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    oscillator.connect(analyser);
    analyser.connect(audioCtx.destination);
    oscillator.start();

    canvas = document.getElementById("oscilloscope");
    ctx = canvas.getContext("2d");

    // 🔧 Fix: match internal canvas size to CSS size
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    startBtn.disabled = true;
    stopBtn.disabled = false;

    drawOscilloscope();
  });

  stopBtn.addEventListener("click", () => {
    oscillator.stop();
    oscillator.disconnect();
    audioCtx.close();
    startBtn.disabled = false;
    stopBtn.disabled = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  freqInput.addEventListener("input", () => {
    const freq = parseInt(freqInput.value);
    freqVal.textContent = `${freq} Hz`;

    if (oscillator) {
      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
    }

    const box = document.getElementById('oscillator-box');
    const header = document.getElementById('oscillator-header');
    const windowEl = document.getElementById('oscillator');

    const intensity = Math.min(1, (freq - 20) / 1980);
    const glow = Math.floor(intensity * 80);
    const color = getChakraColor(freq);

    box.style.boxShadow = `
      0 0 ${glow}px ${color},
      0 0 ${glow * 1.5}px ${color},
      0 0 ${glow * 2}px ${color},
      inset 0 0 ${glow / 2}px rgba(255, 255, 255, 0.15)
    `;

    if (header) {
      header.style.background = color;
      header.style.boxShadow = `0 0 12px ${color}`;
    }

    if (windowEl) {
      windowEl.style.boxShadow = `
        0 0 ${glow}px ${color},
        0 0 ${glow * 1.5}px ${color},
        0 0 ${glow * 2}px ${color}
      `;
      windowEl.style.borderColor = color;
    }
  });

  function drawOscilloscope() {
    if (!ctx || !analyser) return;

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    requestAnimationFrame(drawOscilloscope);
    analyser.getByteTimeDomainData(dataArray);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const freq = parseFloat(freqInput.value);
    const color = getChakraColor(freq);

    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;

    ctx.beginPath();

    const sliceWidth = WIDTH / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 128.0;
      const y = v * HEIGHT / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(WIDTH, HEIGHT / 2);
    ctx.stroke();
  }

  function getChakraColor(freq) {
    const minFreq = 20;
    const maxFreq = 2000;
    const clampedFreq = Math.max(minFreq, Math.min(freq, maxFreq));
    const t = (clampedFreq - minFreq) / (maxFreq - minFreq);
    const hue = t * 270;
    return `hsl(${hue}, 100%, 60%)`;
  }
})();
