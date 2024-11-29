document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registerForm');
    const usernameInput = form.querySelector('input[name="username"]');
    const emailInput = form.querySelector('input[name="email"]');
    const passwordInput = form.querySelector('input[name="password"]');
    const confirmPasswordInput = form.querySelector('input[name="confirmPassword"]');
    
    // Check username availability
    let usernameTimeout;
    usernameInput.addEventListener('input', function() {
        clearTimeout(usernameTimeout);
        usernameTimeout = setTimeout(() => {
            checkAvailability('username', this.value);
        }, 500);
    });

    // Check email availability
    let emailTimeout;
    emailInput.addEventListener('input', function() {
        clearTimeout(emailTimeout);
        emailTimeout = setTimeout(() => {
            checkAvailability('email', this.value);
        }, 500);
    });

    // Password strength checker
    passwordInput.addEventListener('input', function() {
        checkPasswordStrength(this.value);
    });

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Registering...';

        try {
            const formData = {
                username: usernameInput.value,
                email: emailInput.value,
                password: passwordInput.value,
                confirmPassword: confirmPasswordInput.value,
                address: form.querySelector('input[name="address"]').value
            };

            const response = await fetch('/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (response.ok) {
                showMessage(data.message, 'success');
                setTimeout(() => {
                    window.location.href = '/auth/login';
                }, 3000);
            } else {
                showMessage(data.message || 'Registration failed. Please try again.', 'error');
                submitButton.disabled = false;
                submitButton.textContent = 'Create Account';
            }
        } catch (error) {
            console.error('Registration error:', error);
            showMessage('An error occurred. Please try again.', 'error');
            submitButton.disabled = false;
            submitButton.textContent = 'Create Account';
        }
    });
});

async function checkAvailability(field, value) {
    if (!value) {
        clearAvailabilityStatus(field);
        return;
    }

    try {
        const response = await fetch(`/auth/check-availability?field=${field}&value=${value}`);
        const data = await response.json();
        
        const status = document.querySelector(`input[name="${field}"] + .availability-status`);
        if (status) {
            status.textContent = data.available ? '✓ Available' : '✗ Already taken';
            status.style.color = data.available ? '#2e7d32' : '#c62828';
        }
    } catch (error) {
        console.error('Error checking availability:', error);
        clearAvailabilityStatus(field);
    }
}

function clearAvailabilityStatus(field) {
    const status = document.querySelector(`input[name="${field}"] + .availability-status`);
    if (status) {
        status.textContent = '';
    }
}

function checkPasswordStrength(password) {
    const strengthBar = document.querySelector('.password-strength');
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength++;
    
    // Character type checks
    if (password.match(/[a-z]/)) strength++; // lowercase
    if (password.match(/[A-Z]/)) strength++; // uppercase
    if (password.match(/[0-9]/)) strength++; // numbers
    if (password.match(/[^a-zA-Z0-9]/)) strength++; // special characters

    const colors = ['#f44336', '#ff9800', '#fdd835', '#7cb342', '#43a047'];
    strengthBar.style.background = `linear-gradient(to right, ${colors[strength-1]} ${strength*20}%, #ddd 0%)`;
}

function validateForm() {
    const form = document.getElementById('registerForm');
    const password = form.querySelector('input[name="password"]').value;
    const confirmPassword = form.querySelector('input[name="confirmPassword"]').value;
    const username = form.querySelector('input[name="username"]').value;
    const email = form.querySelector('input[name="email"]').value;

    // Clear previous error messages
    clearMessages();

    // Validate username
    if (username.length < 3) {
        showMessage('Username must be at least 3 characters long', 'error');
        return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('Please enter a valid email address', 'error');
        return false;
    }

    // Validate password
    if (password.length < 8) {
        showMessage('Password must be at least 8 characters long', 'error');
        return false;
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return false;
    }

    return true;
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = type;
    messageDiv.style.display = 'block';

    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

function clearMessages() {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = '';
    messageDiv.className = '';
    messageDiv.style.display = 'none';
}