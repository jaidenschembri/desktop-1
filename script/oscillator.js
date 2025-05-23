/**
 * NEOCITY OSCILLATOR AND AUDIO VISUALIZER
 * Creates interactive audio oscillation and visualization effects
 */

(() => {
  // ===== STATE =====
  let audioCtx, oscillator, analyser, dataArray;
  let iPodAudio = document.getElementById('audio');
  let iPodAnalyser = null;
  let iPodDataArray = null;

  // ===== DOM ELEMENTS =====
  const DOM = {
    startBtn: document.getElementById('startButton'),
    stopBtn: document.getElementById('stopButton'),
    freqInput: document.getElementById('frequencyInput'),
    freqVal: document.getElementById('frequencyValue'),
    toggle: document.getElementById('visualizerToggle'),
    
    get scope() { return document.getElementById("oscilloscope"); },
    get header() { return document.getElementById("oscillator-header"); },
    get windowEl() { return document.getElementById("oscillator"); },
    get ipodWheel() { return document.querySelector(".ipod-wheel"); },
    get ipodBody() { return document.querySelector(".ipod-nano-body"); },
    get ipodScreen() { return document.querySelector(".ipod-screen"); }
  };

  // ===== AUDIO PROCESSING =====
  /**
   * Set up the audio visualizer for the iPod audio element
   */
  function setupVisualizer() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const source = audioCtx.createMediaElementSource(iPodAudio);
    iPodAnalyser = audioCtx.createAnalyser();
    iPodAnalyser.fftSize = 256;
    iPodDataArray = new Uint8Array(iPodAnalyser.frequencyBinCount);
    source.connect(iPodAnalyser);
    iPodAnalyser.connect(audioCtx.destination);
  }

  /**
   * Calculate the dominant frequency from analyzer data
   * @param {Uint8Array} data - Frequency data array
   * @returns {number} - Dominant frequency
   */
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

  // ===== VISUALIZATION =====
  /**
   * Generate a color based on frequency with a chakra-inspired mapping
   * @param {number} freq - Audio frequency
   * @returns {string} - HSL color string
   */
  function getChakraColor(freq) {
    const minFreq = 20;
    const maxFreq = 2000;
    const clamped = Math.max(minFreq, Math.min(freq, maxFreq));
  
    const logMin = Math.log(minFreq);
    const logMax = Math.log(maxFreq);
    const logFreq = Math.log(clamped);
    const t = (logFreq - logMin) / (logMax - logMin);
  
    const hue = (t * 360 + Math.random() * 20) % 360; // small hue jump
    const sat = 90 + Math.random() * 10;
    const light = 55 + Math.random() * 15;
  
    return `hsl(${Math.floor(hue)}, ${sat}%, ${light}%)`;
  }

  /**
   * Update all UI elements with a glow effect based on frequency
   * @param {number} freq - Audio frequency
   */
  function updateGlow(freq) {
    const color = getChakraColor(freq);
    const glow = 60;
  
    // Debug log
    console.log("🌈 Applying glow color:", color);
  
    // Apply effects to oscilloscope
    if (DOM.scope) {
      DOM.scope.style.boxShadow = `0 0 ${glow}px ${color}`;
    }
    
    // Apply effects to window header
    if (DOM.header) {
      DOM.header.style.backgroundColor = color;
      DOM.header.style.boxShadow = `0 0 12px ${color}`;
    }
    
    // Apply effects to window
    if (DOM.windowEl) {
      DOM.windowEl.style.boxShadow = `0 0 ${glow}px ${color}`;
      DOM.windowEl.style.border = `2px solid ${color}`;
    }
    
    // Apply effects to iPod wheel
    if (DOM.ipodWheel) {
      const pulse = 12 + Math.sin(Date.now() * 0.008) * 12;
      DOM.ipodWheel.style.boxShadow = `
        0 0 ${pulse}px ${color},
        0 0 ${pulse * 2}px ${color}
      `;
    }
    
    // Apply effects to iPod body
    if (DOM.ipodBody) {
      DOM.ipodBody.style.boxShadow = `inset 0 0 8px ${color}, 0 0 18px ${color}`;
      DOM.ipodBody.style.borderColor = color;
    }
    
    // Apply effects to iPod screen
    if (DOM.ipodScreen) {
      DOM.ipodScreen.style.setProperty("background-color", color, "important");
      DOM.ipodScreen.style.boxShadow = `inset 0 0 12px rgba(0,0,0,0.2), 0 0 14px ${color}`;
    }
  }

  /**
   * Remove all glow effects from UI elements
   */
  function fadeGlow() {
    if (!DOM.scope || !DOM.header || !DOM.windowEl) return;

    DOM.scope.style.boxShadow = 'none';
    DOM.header.style.background = '';
    DOM.header.style.boxShadow = '';
    DOM.windowEl.style.boxShadow = '';
    DOM.windowEl.style.borderColor = '';
    
    if (DOM.ipodWheel) {
      DOM.ipodWheel.style.boxShadow = '';
    }
  }

  /**
   * Draw the oscilloscope visualization
   */
  function drawOscilloscope() {
    if (!DOM.scope) return;
    
    const ctx = DOM.scope.getContext("2d");
    const WIDTH = DOM.scope.clientWidth;
    const HEIGHT = DOM.scope.clientHeight;
    
    // Set canvas dimensions to match display size
    DOM.scope.width = WIDTH;
    DOM.scope.height = HEIGHT;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const visualizerOn = DOM.toggle.checked && !iPodAudio.paused;

    if (visualizerOn) {
      // Handle iPod audio visualization mode
      if (!iPodAnalyser) setupVisualizer();
      iPodAnalyser.getByteFrequencyData(iPodDataArray);

      const freq = getDominantFrequency(iPodDataArray);
      const color = getChakraColor(freq);
      updateGlow(freq);

      // Draw frequency visualization
      ctx.lineWidth = 2;
      ctx.strokeStyle = color;
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
    } else if (analyser && oscillator && !DOM.toggle.checked) {
      // Handle oscillator visualization mode
      analyser.getByteTimeDomainData(dataArray);
      const freq = parseFloat(DOM.freqInput.value);
      const color = getChakraColor(freq);
      updateGlow(freq);

      // Draw waveform visualization
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
      // No active visualization
      fadeGlow();
    }

    // Continue animation loop
    requestAnimationFrame(drawOscilloscope);
  }

  // ===== EVENT HANDLERS =====
  /**
   * Start the oscillator and visualization
   */
  function startOscillator() {
    if (DOM.toggle.checked) return; // Skip if in visualizer mode

    // Create audio context if it doesn't exist
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Configure oscillator
    oscillator = audioCtx.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(DOM.freqInput.value, audioCtx.currentTime);

    // Set up analyzer
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.8;
    dataArray = new Uint8Array(analyser.frequencyBinCount);

    // Connect audio nodes
    oscillator.connect(analyser);
    analyser.connect(audioCtx.destination);
    oscillator.start();

    // Update UI
    DOM.startBtn.disabled = true;
    DOM.stopBtn.disabled = false;

    // Start visualization
    drawOscilloscope();
  }

  /**
   * Stop the oscillator and clean up
   */
  function stopOscillator() {
    if (oscillator) {
      oscillator.stop();
      oscillator.disconnect();
    }
    
    if (audioCtx) {
      audioCtx.close();
    }
    
    audioCtx = null;
    DOM.startBtn.disabled = false;
    DOM.stopBtn.disabled = true;
    fadeGlow();
  }

  /**
   * Update oscillator frequency
   */
  function updateFrequency() {
    if (DOM.toggle.checked) return; // Skip if in visualizer mode
    
    const freq = parseInt(DOM.freqInput.value);
    DOM.freqVal.textContent = `${freq} Hz`;
    
    if (oscillator) {
      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
    }
    
    updateGlow(freq);
  }

  /**
   * Handle visualization mode toggle
   */
  function toggleVisualizationMode() {
    // If switching to visualizer mode while oscillator is running, stop it
    if (DOM.toggle.checked && oscillator) {
      oscillator.stop();
      oscillator.disconnect();
      oscillator = null;
      analyser = null;
      DOM.startBtn.disabled = false;
      DOM.stopBtn.disabled = true;
    }
    
    drawOscilloscope();
  }

  // ===== INITIALIZATION =====
  function init() {
    // Set up event listeners
    DOM.startBtn.addEventListener("click", startOscillator);
    DOM.stopBtn.addEventListener("click", stopOscillator);
    DOM.freqInput.addEventListener("input", updateFrequency);
    DOM.toggle.addEventListener("change", toggleVisualizationMode);
  }

  // Initialize the module
  init();
})();
