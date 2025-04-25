document.addEventListener('DOMContentLoaded', () => {
  if (window.paypal) {
    const container = document.getElementById('paypal-button-container');

    if (container && !container.hasChildNodes()) {
      paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
        },
        createOrder: function(data, actions) {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: '33.00'
              },
              description: 'NeoCore Tee'
            }]
          });
        },
        onApprove: function(data, actions) {
          return actions.order.capture().then(function(details) {
            alert('✅ Payment complete. Thanks ' + details.payer.name.given_name + '!');
          });
        },
        onError: function(err) {
          console.error('❌ PayPal Error:', err);
          alert('Something went wrong during payment.');
        }
      }).render('#paypal-button-container');
    }
  } else {
    console.warn('⚠️ PayPal SDK not loaded');
  }

  const items = [
    {
      containerId: 'paypal-button-container',
      value: '33.00',
      description: 'NeoCore Tee'
    },
    {
      containerId: 'paypal-button-container-2',
      value: '44.00',
      description: 'HELLGLAM TEE'
    }
  ];
  
  items.forEach(item => {
    const container = document.getElementById(item.containerId);
    if (container && !container.hasChildNodes()) {
      paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
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

  window.payWithETH = function(address) {
    const link = `https://metamask.app.link/send/${address}`;
    window.open(link, '_blank');
  };
  
  window.payWithSOL = function(address) {
    const link = `https://phantom.app/ul/send?recipient=${address}&reference=shop_payment`;
    window.open(link, '_blank');
  };

  window.toggleWalletModal = function() {
    const modal = document.getElementById("wallet-modal");
    modal.classList.toggle("hidden");
  };
  
  window.openMetaMask = function() {
    const addr = "0x07017175ac2e3Fe581B7E9B0e89f038166d39c98";
    window.open(`https://metamask.app.link/send/${addr}`, "_blank");
  };
  
  window.openWalletConnect = function() {
    window.open("https://walletconnect.com/", "_blank");
  };
  
  window.openPhantom = function() {
    const addr = "A96xCDmUox8D3hbCNSGXJ6wgMGbB7vV8MxYWGG8EHiae";
    window.open(`https://phantom.app/ul/send?recipient=${addr}&reference=shop_payment`, "_blank");
  };
  
  window.openSolflare = function() {
    const addr = "A96xCDmUox8D3hbCNSGXJ6wgMGbB7vV8MxYWGG8EHiae";
    window.open(`https://solflare.com/send?recipient=${addr}`, "_blank");
  };
  
  window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    });
  };
  
});
