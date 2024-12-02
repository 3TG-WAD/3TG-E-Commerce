// Thêm console.log để kiểm tra file đã được load
console.log('Register.js loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    const passwordInput = document.getElementById('password');
    console.log('Password Input:', passwordInput); // Debug

    if (passwordInput) {
        ['input', 'keyup'].forEach(event => {
            passwordInput.addEventListener(event, function() {
                console.log('Password changed:', this.value.length);
                checkPasswordStrength(this.value);
            });
        });
    }
});

function checkPasswordStrength(password) {
    const strengthBar = document.querySelector('.password-strength');
    const strengthText = document.querySelector('.strength-text');
    
    if (!strengthBar || !strengthText) {
        console.error('Strength elements not found');
        return;
    }
    
    let strength = 0;
    const criteria = {
        length: password.length >= 8,
        lowercase: password.match(/[a-z]/),
        uppercase: password.match(/[A-Z]/),
        numbers: password.match(/[0-9]/),
        special: password.match(/[^a-zA-Z0-9]/)
    };

    strength = Object.values(criteria).filter(Boolean).length;

    strengthBar.className = 'password-strength h-full rounded-full transition-all duration-300';
    
    const strengthMap = {
        0: { class: '', text: '', width: '0%' },
        1: { class: 'bg-red-500', text: 'Very Weak', width: '20%' },
        2: { class: 'bg-orange-500', text: 'Weak', width: '40%' },
        3: { class: 'bg-yellow-500', text: 'Average', width: '60%' },
        4: { class: 'bg-green-500', text: 'Strong', width: '80%' },
        5: { class: 'bg-blue-500', text: 'Very Strong', width: '100%' }
    };

    const currentStrength = strengthMap[strength] || strengthMap[0];

    if (password.length > 0) {
        strengthBar.classList.add(currentStrength.class);
        strengthBar.style.width = currentStrength.width;
        strengthText.textContent = currentStrength.text;
    } else {
        strengthBar.style.width = '0%';
        strengthText.textContent = '';
    }
}

function validateForm() {
    const form = document.getElementById('registerForm');
    const password = form.querySelector('input[name="password"]').value;
    const confirmPassword = form.querySelector('input[name="confirmPassword"]').value;
    const username = form.querySelector('input[name="username"]').value;
    const email = form.querySelector('input[name="email"]').value;

    if (username.length < 3) {
        showError('Username must be at least 3 characters long');
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('Please enter a valid email address');
        return false;
    }

    if (password.length < 8) {
        showError('Password must be at least 8 characters long');
        return false;
    }   

    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return false;
    }

    return true;
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'bg-red-500/20 text-red-200 px-4 py-3 rounded-lg mb-4';
    errorDiv.textContent = message;
    
    const form = document.getElementById('registerForm');
    const existingError = form.querySelector('.bg-red-500\\/20');
    if (existingError) {
        existingError.remove();
    }
    
    form.insertBefore(errorDiv, form.firstChild);
}