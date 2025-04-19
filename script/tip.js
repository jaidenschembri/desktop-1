//Buy me a Coffee
function toggleTipDropdown() {
    const dropdown = document.getElementById("tip-dropdown");
    dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
  }
    const oracleAddress = "0x890114186a41283a2EDe3fE4eF2692FB9B8B4eFC";
  async function connectWallet() {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        document.getElementById("wallet-connection").innerHTML = `✅ Connected: ${accounts[0].slice(0, 6)}...`;
        document.getElementById("tip-options").style.display = "block";
      } catch (error) {
        document.getElementById("tip-status").innerText = "❌ Connection rejected.";
      }
    } else {
      document.getElementById("tip-status").innerText = "🦊 MetaMask not detected.";
    }
  }
  async function sendTip(amountEth) {
    if (typeof window.ethereum === "undefined") {
      document.getElementById("tip-status").innerText = "🦊 MetaMask not available.";
      return;
    }
  
    try {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      const from = accounts[0]; // ✅ use the actual account
      const value = "0x" + BigInt(amountEth * 1e18).toString(16); // ✅ safe conversion
  
      const tx = await ethereum.request({
        method: "eth_sendTransaction",
        params: [{
          to: "0x890114186a41283a2EDe3fE4eF2692FB9B8B4eFC",
          from: from,
          value: value,
        }]
      });
  
      document.getElementById("tip-status").innerText = `✅ TX Sent: ${tx.slice(0, 10)}...`;
    } catch (err) {
      console.error("ETH Tip Error:", err);
      document.getElementById("tip-status").innerText = "❌ Tip cancelled or failed.";
    }
  }

  const solanaWallet = "A96xCDmUox8D3hbCNSGXJ6wgMGbB7vV8MxYWGG8EHiae"; // 👈 replace with your wallet

function sendTip(coin) {
  const amount = 0.0069;
  const label = encodeURIComponent(`Buy ${coin}`);
  const message = encodeURIComponent(`NeoCity ${coin.toUpperCase()} tip`);
  const url = `solana:${solanaWallet}?amount=${amount}&label=${label}&message=${message}`;

  const qrCode = document.getElementById('qr-code');
  const qrModal = document.getElementById('qr-modal');

  // Generate QR code image
  const encoded = encodeURIComponent(url);
  qrCode.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encoded}`;
  qrModal.classList.remove('hidden');
}

function animateFakeChart(canvasId, priceClass, startPrice, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const data = new Array(100).fill(startPrice);

  function draw() {
    // Fake price mutation
    const last = data[data.length - 1];
    const next = last + (Math.random() * 10 - 5);
    data.push(Math.max(1, next));
    if (data.length > 100) data.shift();

    // Draw line
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - data[0]);

    const scaleY = canvas.height / Math.max(...data);
    const scaleX = canvas.width / data.length;

    data.forEach((val, i) => {
      const x = i * scaleX;
      const y = canvas.height - val * scaleY;
      ctx.lineTo(x, y);
    });

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.stroke();

    // Update fake price text
    const lastPrice = data[data.length - 1].toFixed(2);
    document.querySelector(`.${priceClass}`).textContent = lastPrice;

    requestAnimationFrame(draw);
  }

  draw();
}

animateFakeChart("chart-vibes", "price-vibes", 420.69, "#00ffff");
animateFakeChart("chart-milady", "price-milady", 666.00, "#ff99ff");
