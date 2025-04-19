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