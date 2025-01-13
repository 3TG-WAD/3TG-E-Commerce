console.log('Payment.js loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    const paymentButton = document.getElementById('paymentButton');
    console.log('Payment button:', paymentButton);
    
    if (paymentButton) {
        paymentButton.addEventListener('click', async function() {
            console.log('Payment button clicked');
            
            const phone = document.getElementById('phone').value.trim();
            const address = document.getElementById('address').value.trim();

            // Validate phone
            const phoneRegex = /^[0-9]{10}$/;
            if (!phone || !phoneRegex.test(phone)) {
                showNotification('Please enter a valid phone number (10 digits)', 'error');
                return;
            }

            // Validate address
            if (!address) {
                showNotification('Please enter a valid shipping address', 'error');
                return;
            }

            try {
                const response = await fetch('/payment/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ phone, address })
                });

                console.log('Payment response:', response);
                const data = await response.json();
                console.log('Payment data:', data);
                
                if (data.success) {
                    window.location.href = data.paymentUrl;
                } else {
                    showNotification(data.message || 'An error occurred while creating payment', 'error');
                }
            } catch (error) {
                console.error('Payment error:', error);
                showNotification('An error occurred while creating payment', 'error');
            }
        });
    } else {
        console.error('Payment button not found');
    }
});