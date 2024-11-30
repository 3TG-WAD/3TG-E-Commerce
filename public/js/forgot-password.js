document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('forgotPasswordForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitButton = form.querySelector('button[type="submit"]');
        const emailInput = form.querySelector('input[name="email"]');
        
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        try {
            console.log('Submitting form with email:', emailInput.value);
            const response = await fetch('/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    email: emailInput.value
                })
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server did not return JSON');
            }

            const data = await response.json();
            console.log('Response:', data);
            
            if (response.ok) {
                showMessage(data.message || 'Reset link has been sent to your email.', 'success');
                form.reset();
            } else {
                showMessage(data.message || 'Failed to send reset email', 'error');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            showMessage('An error occurred. Please try again later.', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Send Reset Link';
        }
    });
});

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `${type} p-4 rounded-lg mb-4 ${type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`;
        messageDiv.style.display = 'block';

        if (type === 'success') {
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    }
}