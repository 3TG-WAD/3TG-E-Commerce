document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('resetPasswordForm');
    const passwordInput = form.querySelector('input[name="password"]');
    
    passwordInput.addEventListener('input', function() {
        checkPasswordStrength(this.value);
    });
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Resetting...';

        try {
            const formData = {
                token: form.querySelector('input[name="token"]').value,
                password: passwordInput.value,
                confirmPassword: form.querySelector('input[name="confirmPassword"]').value
            };

            const response = await fetch('/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (response.ok) {
                showMessage('Password has been reset successfully!', 'success');
                setTimeout(() => {
                    window.location.href = '/auth/login';
                }, 3000);
            } else {
                showMessage(data.message || 'Failed to reset password', 'error');
                submitButton.disabled = false;
                submitButton.textContent = 'Reset Password';
            }
        } catch (error) {
            showMessage('An error occurred. Please try again.', 'error');
            console.error('Reset password error:', error);
            submitButton.disabled = false;
            submitButton.textContent = 'Reset Password';
        }
    });
});

function validateForm() {
    const form = document.getElementById('resetPasswordForm');
    const password = form.querySelector('input[name="password"]').value;
    const confirmPassword = form.querySelector('input[name="confirmPassword"]').value;

    if (password.length < 8) {
        showMessage('Password must be at least 8 characters long', 'error');
        return false;
    }

    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return false;
    }

    return true;
} 