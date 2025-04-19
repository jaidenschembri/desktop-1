(() => {
  let audioCtx, oscillator, analyser, dataArray, canvas, ctx;
  let iPodAudio = document.getElementById('audio');
  let iPodAnalyser = null;
  let iPodDataArray = null;

  const startBtn = document.getElementById('startButton');
  const stopBtn = document.getElementById('stopButton');
  const freqInput = document.getElementById('frequencyInput');
  const freqVal = document.getElementById('frequencyValue');
  const toggle = document.getElementById('visualizerToggle');

  function getDOM() {
    return {
      scope: document.getElementById("oscilloscope"),
      header: document.getElementById("oscillator-header"),
      windowEl: document.getElementById("oscillator"),
      ipodWheel: document.querySelector(".ipod-wheel")
    };
  }

  function setupVisualizer() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaElementSource(iPodAudio);
    iPodAnalyser = audioCtx.createAnalyser();
    iPodAnalyser.fftSize = 256;
    iPodDataArray = new Uint8Array(iPodAnalyser.frequencyBinCount);
    source.connect(iPodAnalyser);
    iPodAnalyser.connect(audioCtx.destination);
  }

  function getDominantFrequency(data) {
    let maxVal = -Infinity;
    let index = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i] > maxVal) {
        maxVal = data[i];
        index = i;
      }
    }
    return (index / data.length) * 2000;
  }

  function getChakraColor(freq) {
    const minFreq = 20;
    const maxFreq = 2000;
    const clamped = Math.max(minFreq, Math.min(freq, maxFreq));
  
    // 📈 Use logarithmic scale to boost mid/high ranges
    const logMin = Math.log(minFreq);
    const logMax = Math.log(maxFreq);
    const logFreq = Math.log(clamped);
    const t = (logFreq - logMin) / (logMax - logMin);
  
    const hue = 360 * t; // full rainbow spin
    return `hsl(${Math.floor(hue)}, ${80 + Math.random() * 20}%, ${60 + Math.random() * 10}%)`;
  }
  

  function updateGlow(freq) {
    const { scope, header, windowEl, ipodWheel } = getDOM();
    const ipodBody = document.querySelector(".ipod-nano-body");
    const ipodScreen = document.querySelector(".ipod-screen");
  
    const color = getChakraColor(freq);
    const glow = 60;
  
    // log target hit for debug
    console.log("🌈 Applying glow color:", color);
  
    if (scope) scope.style.boxShadow = `0 0 ${glow}px ${color}`;
    if (header) {
      header.style.backgroundColor = color;
      header.style.boxShadow = `0 0 12px ${color}`;
    }
    if (windowEl) {
      windowEl.style.boxShadow = `0 0 ${glow}px ${color}`;
      windowEl.style.border = `2px solid ${color}`;
    }
    if (ipodWheel) {
      ipodWheel.style.boxShadow = `0 0 24px ${color}, 0 0 48px ${color}`;
    }
    if (ipodBody) {
      ipodBody.style.boxShadow = `inset 0 0 8px ${color}, 0 0 18px ${color}`;
      ipodBody.style.borderColor = color;
    }
    if (ipodScreen) {
      ipodScreen.style.setProperty("background-color", color, "important");
      ipodScreen.style.boxShadow = `inset 0 0 12px rgba(0,0,0,0.2), 0 0 14px ${color}`;
    }
  }
  
  

  function fadeGlow() {
    const { scope, header, windowEl, ipodWheel } = getDOM();
    if (!scope || !header || !windowEl) return;

    scope.style.boxShadow = 'none';
    header.style.background = '';
    header.style.boxShadow = '';
    windowEl.style.boxShadow = '';
    windowEl.style.borderColor = '';
    if (ipodWheel) ipodWheel.style.boxShadow = '';
  }

  function drawOscilloscope() {
    const { scope } = getDOM();
    if (!scope) return;
    const ctx = scope.getContext("2d");
    const WIDTH = scope.clientWidth;
    const HEIGHT = scope.clientHeight;
    scope.width = WIDTH;
    scope.height = HEIGHT;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const visualizerOn = toggle.checked && !iPodAudio.paused;

    if (visualizerOn) {
      if (!iPodAnalyser) setupVisualizer();
      iPodAnalyser.getByteFrequencyData(iPodDataArray);

      const freq = getDominantFrequency(iPodDataArray);
      const color = getChakraColor(freq);
      updateGlow(freq);

      ctx.lineWidth = 2;
      ctx.strokeStyle = color;
      ctx.shadowBlur = 32 + Math.sin(Date.now() * 0.01) * 16;
      ctx.shadowBlur = 18;

      ctx.beginPath();
      const sliceWidth = WIDTH / iPodDataArray.length;
      let x = 0;
      for (let i = 0; i < iPodDataArray.length; i++) {
        const v = iPodDataArray[i] / 255.0;
        const y = HEIGHT - (v * HEIGHT);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.stroke();
    } else if (analyser && oscillator && !toggle.checked) {
      analyser.getByteTimeDomainData(dataArray);
      const freq = parseFloat(freqInput.value);
      const color = getChakraColor(freq);
      updateGlow(freq);

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
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(WIDTH, HEIGHT / 2);
      ctx.stroke();
    } else {
      fadeGlow();
    }

    requestAnimationFrame(drawOscilloscope);
  }

  startBtn.addEventListener("click", () => {
    if (toggle.checked) return; // visualizer mode = no oscillator

    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    oscillator = audioCtx.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(freqInput.value, audioCtx.currentTime);

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.8;

    dataArray = new Uint8Array(analyser.frequencyBinCount);

    oscillator.connect(analyser);
    analyser.connect(audioCtx.destination);
    oscillator.start();

    startBtn.disabled = true;
    stopBtn.disabled = false;

    drawOscilloscope();
  });

  stopBtn.addEventListener("click", () => {
    if (oscillator) {
      oscillator.stop();
      oscillator.disconnect();
    }
    if (audioCtx) audioCtx.close();
    audioCtx = null;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    fadeGlow();
  });

  freqInput.addEventListener("input", () => {
    if (toggle.checked) return; // no updates if in visualizer mode
    const freq = parseInt(freqInput.value);
    freqVal.textContent = `${freq} Hz`;
    if (oscillator) oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
    updateGlow(freq);
  });

  toggle.addEventListener("change", () => {
    // if they toggle ON visualizer, fade oscillator and reset
    if (toggle.checked && oscillator) {
      oscillator.stop();
      oscillator.disconnect();
      oscillator = null;
      analyser = null;
      startBtn.disabled = false;
      stopBtn.disabled = true;
    }
    drawOscilloscope();
  });
})();
