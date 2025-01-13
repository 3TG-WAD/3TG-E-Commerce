console.log('Payment.js loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded in payment.js');
    
    const paymentButton = document.getElementById('paymentButton');
    console.log('Payment button:', paymentButton);
    
    if (paymentButton) {
        paymentButton.addEventListener('click', async function() {
            console.log('Payment button clicked');
            
            try {
                const response = await fetch('/payment/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                console.log('Payment response:', response);
                const data = await response.json();
                console.log('Payment data:', data);
                
                if (data.success) {
                    window.location.href = data.paymentUrl;
                } else {
                    showNotification(data.message || 'Có lỗi xảy ra khi tạo thanh toán', 'error');
                }
            } catch (error) {
                console.error('Payment error:', error);
                showNotification('Có lỗi xảy ra khi tạo thanh toán', 'error');
            }
        });
    } else {
        console.error('Payment button not found');
    }
});