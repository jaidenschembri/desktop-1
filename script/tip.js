/**
 * NEOCITY TIP FUNCTIONALITY
 * Provides cryptocurrency tipping functionality
 */

// ===== CONFIGURATION =====
const CONFIG = {
  walletAddress: "0x890114186a41283a2EDe3fE4eF2692FB9B8B4eFC",
  ethDecimals: 18
};

// ===== UI CONTROLS =====
/**
 * Toggle the visibility of the tip dropdown menu
 */
function toggleTipDropdown() {
  const dropdown = document.getElementById("tip-dropdown");
  dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
}

/**
 * Toggle the QR code tip popup visibility
 */
function toggleQRTip() {
  const popup = document.getElementById("qr-tip-popup");
  popup.classList.toggle("hidden");
}

// ===== WALLET INTEGRATION =====
/**
 * Connect to MetaMask or other web3 wallet
 */
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

/**
 * Send a tip in ETH to the configured wallet address
 * @param {number} amountEth - Amount to send in ETH
 */
async function sendTip(amountEth) {
  if (typeof window.ethereum === "undefined") {
    document.getElementById("tip-status").innerText = "🦊 MetaMask not available.";
    return;
  }

  try {
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    const from = accounts[0];
    const value = "0x" + BigInt(amountEth * (10 ** CONFIG.ethDecimals)).toString(16);

    const tx = await ethereum.request({
      method: "eth_sendTransaction",
      params: [{
        to: CONFIG.walletAddress,
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
  