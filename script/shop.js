/**
 * NEOCITY SHOP
 * Handles payment processing and wallet integrations
 */

document.addEventListener('DOMContentLoaded', () => {
  // ===== CONFIGURATION =====
  const SHOP_CONFIG = {
    items: [
      {
        containerId: 'paypal-button-container-2',
        value: '35.00',
        description: 'CUCK tee'
      }
    ],
    wallets: {
      ethereum: '0x07017175ac2e3Fe581B7E9B0e89f038166d39c98',
      solana: 'A96xCDmUox8D3hbCNSGXJ6wgMGbB7vV8MxYWGG8EHiae'
    }
  };

  // ===== PAYPAL INTEGRATION =====
  function initializePayPal() {
    if (!window.paypal) {
      console.warn('⚠️ PayPal SDK not loaded');
      return;
    }

    SHOP_CONFIG.items.forEach(item => {
      const container = document.getElementById(item.containerId);
      if (container && !container.hasChildNodes()) {
        paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal'
          },
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [{
                amount: { value: item.value },
                description: item.description
              }]
            });
          },
          onApprove: (data, actions) => {
            return actions.order.capture().then(details => {
              alert('✅ Payment complete. Thanks ' + details.payer.name.given_name + '!');
            });
          },
          onError: err => {
            console.error('❌ PayPal Error:', err);
            alert('Something went wrong during payment.');
          }
        }).render(`#${item.containerId}`);
      }
    });
  }

  // ===== WALLET PAYMENT METHODS =====
  /**
   * Open payment link in MetaMask
   */
  window.openMetaMask = function() {
    const addr = SHOP_CONFIG.wallets.ethereum;
    window.open(`https://metamask.app.link/send/${addr}`, "_blank");
  };

  /**
   * Open generic WalletConnect
   */
  window.openWalletConnect = function() {
    window.open("https://walletconnect.com/", "_blank");
  };

  /**
   * Open payment link in Phantom wallet
   */
  window.openPhantom = function() {
    const addr = SHOP_CONFIG.wallets.solana;
    window.open(`https://phantom.app/ul/send?recipient=${addr}&reference=shop_payment`, "_blank");
  };

  /**
   * Open payment link in Solflare wallet
   */
  window.openSolflare = function() {
    const addr = SHOP_CONFIG.wallets.solana;
    window.open(`https://solflare.com/send?recipient=${addr}`, "_blank");
  };

  /**
   * Pay with Ethereum through a wallet link
   * @param {string} address - Ethereum address
   */
  window.payWithETH = function(address) {
    const link = `https://metamask.app.link/send/${address}`;
    window.open(link, '_blank');
  };

  /**
   * Pay with Solana through a wallet link
   * @param {string} address - Solana address
   */
  window.payWithSOL = function(address) {
    const link = `https://phantom.app/ul/send?recipient=${address}&reference=shop_payment`;
    window.open(link, '_blank');
  };

  /**
   * Toggle wallet selection modal visibility
   */
  window.toggleWalletModal = function() {
    const modal = document.getElementById("wallet-modal");
    modal.classList.toggle("hidden");
  };

  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   */
  window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    });
  };

  // Initialize PayPal on page load
  initializePayPal();
});
