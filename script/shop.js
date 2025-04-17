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
});
