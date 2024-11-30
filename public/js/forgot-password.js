document.addEventListener('DOMContentLoaded', function() {
    console.log('Document ready');
    const form = document.getElementById('forgotPasswordForm');
    console.log('Form found:', !!form);
    const submitButton = form.querySelector('button[type="submit"]');
    const messageDiv = document.getElementById('message');

    form.addEventListener('submit', function(e) {
        console.log('Form submitted');
        e.preventDefault();
        const emailInput = form.querySelector('input[name="email"]');
        console.log('Email value:', emailInput.value);
        
        if (!emailInput.value) {
            showMessage('Please enter your email address', 'error');
            return;
        }

        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="inline-flex items-center"><svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Sending...</span>';

        fetch('/auth/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: emailInput.value
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showMessage(data.message, 'success');
                setTimeout(() => {
                    window.location.href = '/auth/login';
                }, 3000);
            } else {
                throw new Error(data.message || 'An error occurred');
            }
        })
        .catch(error => {
            showMessage(error.message || 'An error occurred', 'error');
            submitButton.disabled = false;
            submitButton.textContent = 'Send Reset Link';
        });
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