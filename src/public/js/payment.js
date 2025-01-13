console.log('Payment.js loaded');

// Progress toast functionality
function showProgressToast() {
    const progressToast = document.getElementById('progress-toast');
    const progressBar = document.getElementById('progress-bar');
    
    // Show toast
    progressToast.classList.remove('translate-x-full', 'opacity-0');
    
    // Reset progress bar
    progressBar.style.width = '100%';
    
    // Add smooth transition
    progressBar.style.transition = 'width 3s linear';
    
    // Start animation in next frame to ensure transition works
    requestAnimationFrame(() => {
        progressBar.style.width = '0%';
    });
    
    // Wait for animation to complete
    setTimeout(() => {
        progressToast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => {
            window.location.href = '/auth/login';
        }, 300);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', function() {
    const paymentButton = document.getElementById('paymentButton');
    
    if (paymentButton) {
        console.log('Auth data attribute:', paymentButton.dataset.auth);
        console.log('Auth type:', typeof paymentButton.dataset.auth);
        
        paymentButton.addEventListener('click', async function(e) {
            e.preventDefault();
            
            // Check auth status từ data attribute
            const isAuthenticated = paymentButton.dataset.auth === 'true';
            
            // Kiểm tra cart count
            const cartCount = parseInt(document.getElementById('cartCount').textContent) || 0;
            if (cartCount === 0) {
                showNotification('Your cart is empty', 'error');
                return;
            }
            
            if (!isAuthenticated) {
                showProgressToast();
                return;
            }

            // Nếu đã đăng nhập, tiếp tục với payment flow
            const phone = document.getElementById('phone').value.trim();
            const address = document.getElementById('address').value.trim();

            // Validate inputs
            if (!phone || !/^[0-9]{10}$/.test(phone)) {
                showNotification('Please enter a valid phone number (10 digits)', 'error');
                return;
            }

            if (!address) {
                showNotification('Please enter a valid shipping address', 'error');
                return;
            }

            try {
                console.log('Sending payment request with:', { phone, address });
                
                const response = await fetch('/payment/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ phone, address })
                });

                console.log('Payment response:', response);
                
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Payment API error:', errorData);
                    throw new Error(errorData.message || 'Payment request failed');
                }

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

// Toast notification functionality
function showNotification(message, type = 'success') {
    const toast = document.getElementById('toast');
    const progressToast = document.getElementById('progress-toast');
    const toastMessage = document.getElementById('toast-message');
    const successIcon = document.getElementById('toast-success');
    const errorIcon = document.getElementById('toast-error');
    
    // Hide progress toast if it's visible
    if (progressToast) {
        progressToast.classList.add('translate-x-full', 'opacity-0');
    }
    
    toastMessage.textContent = message;
    
    // Reset classes
    successIcon.classList.add('hidden');
    errorIcon.classList.add('hidden');
    
    // Show correct icon
    if (type === 'success') {
        successIcon.classList.remove('hidden');
    } else {
        errorIcon.classList.remove('hidden');
    }
    
    // Show toast
    toast.classList.remove('translate-x-full', 'opacity-0');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
    }, 3000);
}