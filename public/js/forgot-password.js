document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('forgotPasswordForm');
    
    form.method = 'POST';
    form.action = '/auth/forgot-password';
    
    // Kiểm tra và hiển thị success message
    const successMessage = document.querySelector('[data-success-message]');
    if (successMessage) {
        showMessage(successMessage.dataset.message, 'success');
    }

    // Kiểm tra và hiển thị error message
    const errorMessage = document.querySelector('[data-error-message]');
    if (errorMessage) {
        showMessage(errorMessage.dataset.message, 'error');
    }
    
    form.addEventListener('submit', function(e) {
        const submitButton = form.querySelector('button[type="submit"]');
        const emailInput = form.querySelector('input[name="email"]');
        
        if (!emailInput.value) {
            e.preventDefault();
            showMessage('Please enter your email address', 'error');
            return;
        }
        
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
    });
});

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.innerHTML = `
            <div class="bg-${type === 'success' ? 'green' : 'red'}-500/10 backdrop-blur-lg text-${type === 'success' ? 'green' : 'red'}-500 p-6 rounded-lg mb-6 flex items-center space-x-4 animate-fade-in border border-${type === 'success' ? 'green' : 'red'}-500/20">
                <div class="flex-shrink-0">
                    ${type === 'success' 
                        ? '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
                        : '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
                    }
                </div>
                <div class="flex-1">
                    <p class="font-medium">${message}</p>
                    ${type === 'success' ? '<p class="text-sm text-green-400/80 mt-1">Redirecting to login page in 3 seconds...</p>' : ''}
                </div>
            </div>
        `;
        messageDiv.style.display = 'block';
    }
}