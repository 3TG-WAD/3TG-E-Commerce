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

    setupAvailabilityCheck();
    setupPasswordValidation();
    
    // Thêm validate form trước khi submit
    document.getElementById('registerForm')?.addEventListener('submit', function(e) {
        if (!validateForm()) {
            e.preventDefault();
        }
    });
});

function checkPasswordStrength(password) {
    const strengthBar = document.querySelector('.password-strength');
    const strengthText = document.querySelector('.strength-text');
    
    if (!strengthBar || !strengthText) {
        console.error('Strength elements not found');
        return;
    }

    // Reset classes
    strengthBar.className = 'password-strength h-full rounded-full transition-all duration-300';
    
    const strengthMap = {
        0: { color: '#ffffff', text: '', width: '0%' },
        1: { color: '#ef4444', text: 'Very Weak', width: '20%' },  // red-500
        2: { color: '#f97316', text: 'Weak', width: '40%' },       // orange-500
        3: { color: '#eab308', text: 'Average', width: '60%' },    // yellow-500
        4: { color: '#22c55e', text: 'Strong', width: '80%' },     // green-500
        5: { color: '#3b82f6', text: 'Very Strong', width: '100%' } // blue-500
    };

    // Calculate strength
    let strength = Object.values({
        length: password.length >= 8,
        lowercase: password.match(/[a-z]/),
        uppercase: password.match(/[A-Z]/),
        numbers: password.match(/[0-9]/),
        special: password.match(/[^a-zA-Z0-9]/)
    }).filter(Boolean).length;

    const currentStrength = strengthMap[strength];

    if (password.length > 0) {
        strengthBar.style.width = currentStrength.width;
        strengthBar.style.backgroundColor = currentStrength.color;
        strengthText.textContent = currentStrength.text;
    } else {
        strengthBar.style.width = '0%';
        strengthBar.style.backgroundColor = '';
        strengthText.textContent = '';
    }
}

function validateForm() {
    const form = document.getElementById('registerForm');
    const username = form.querySelector('input[name="username"]').value.trim();
    const password = form.querySelector('input[name="password"]').value;
    const confirmPassword = form.querySelector('input[name="confirmPassword"]').value;
    const email = form.querySelector('input[name="email"]').value;

    // Kiểm tra các điều kiện
    if (username.length < 6) {
        showError('Username must be at least 6 characters long');
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

    // Kiểm tra xem có feedback error nào không
    const hasErrors = Array.from(form.querySelectorAll('.feedback-message'))
        .some(div => div.classList.contains('text-red-500'));
        
    if (hasErrors) {
        showError('Please fix all errors before submitting');
        return false;
    }

    return true;
}

function showError(message) {
    Swal.fire({
        title: 'Warning!',
        text: message,
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#EF4444'
    });
}

let usernameTimeout;
let emailTimeout;

function validateUsername(username) {
    if (!username) {
        return { isValid: false, message: 'Username is required' };
    }
    if (username.length < 6) {
        return { isValid: false, message: 'Username must be at least 6 characters' };
    }
    if (!/^[a-zA-Z]/.test(username)) {
        return { isValid: false, message: 'Username must start with a letter' };
    }
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(username)) {
        return { isValid: false, message: 'Username can only contain letters, numbers and underscores' };
    }
    return { isValid: true };
}

function setupAvailabilityCheck() {
    // Chỉ setup availability check nếu đang ở trang register
    if (!document.getElementById('registerForm')) {
        return;
    }

    const usernameInput = document.querySelector('input[name="username"]');
    const emailInput = document.querySelector('input[name="email"]');

    if (usernameInput) {
        usernameInput.addEventListener('input', function() {
            clearTimeout(usernameTimeout);
            const username = this.value.trim();
            
            if (username.length > 0) {
                const validation = validateUsername(username);
                if (!validation.isValid) {
                    showAvailabilityFeedback('username', false, validation.message);
                    return;
                }
                
                if (username.length >= 6) {
                    usernameTimeout = setTimeout(() => checkUsernameAvailability(username), 500);
                }
            } else {
                removeFieldFeedback(this);
            }
        });
    }

    if (emailInput) {
        emailInput.addEventListener('input', function() {
            clearTimeout(emailTimeout);
            const email = this.value.trim();
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (email.length > 0) {
                if (!emailRegex.test(email)) {
                    showAvailabilityFeedback('email', false, 'Please enter a valid email address');
                    return;
                }
                
                emailTimeout = setTimeout(() => checkEmailAvailability(email), 500);
            } else {
                removeFieldFeedback(this);
            }
        });
    }
}

async function checkUsernameAvailability(username) {
    try {
        const response = await fetch('/auth/check-username', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });

        const data = await response.json();
        showAvailabilityFeedback('username', data.available, data.message);
    } catch (error) {
        console.error('Error checking username:', error);
    }
}

async function checkEmailAvailability(email) {
    try {
        const response = await fetch('/auth/check-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        showAvailabilityFeedback('email', data.available, data.message);
    } catch (error) {
        console.error('Error checking email:', error);
    }
}

function showAvailabilityFeedback(field, isAvailable, message) {
    const input = document.querySelector(`input[name="${field}"]`);
    const parentDiv = input.closest('.relative');
    
    // Xóa warning cũ nếu có
    removeWarning(parentDiv);
    
    if (!isAvailable) {
        // Tạo warning icon và message
        const warningDiv = document.createElement('div');
        warningDiv.className = 'warning-message absolute right-0 top-1/2 -translate-y-1/2 flex items-center';
        warningDiv.innerHTML = `
            <div class="relative group">
                <i class="fas fa-exclamation-circle text-red-500 text-lg mr-2"></i>
                <div class="invisible group-hover:visible absolute left-full ml-2 px-3 py-2 bg-red-100 text-red-600 text-sm rounded-lg whitespace-nowrap">
                    ${message}
                </div>
            </div>
        `;
        
        // Thêm padding right cho input để tránh overlap với warning icon
        input.style.paddingRight = '2rem';
        
        // Thêm warning vào form
        parentDiv.appendChild(warningDiv);
        
        // Thêm class border-red cho input
        input.classList.add('border-red-500');
    } else {
        // Nếu valid, thêm border-green
        input.classList.remove('border-red-500');
        input.classList.add('border-green-500');
        input.style.paddingRight = '';
        
        // Có thể thêm icon check nếu muốn
        const checkDiv = document.createElement('div');
        checkDiv.className = 'warning-message absolute right-0 top-1/2 -translate-y-1/2 flex items-center';
        checkDiv.innerHTML = `
            <i class="fas fa-check-circle text-green-500 text-lg mr-2"></i>
        `;
        parentDiv.appendChild(checkDiv);
    }
}

function removeWarning(parentDiv) {
    // Xóa warning message cũ nếu có
    const oldWarning = parentDiv.querySelector('.warning-message');
    if (oldWarning) {
        oldWarning.remove();
    }
    
    // Reset input style
    const input = parentDiv.querySelector('input');
    input.style.paddingRight = '';
    input.classList.remove('border-red-500', 'border-green-500');
}

function removeFieldFeedback(input) {
    const parentDiv = input.closest('.relative');
    removeWarning(parentDiv);
}

function setupPasswordValidation() {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    if (passwordInput && confirmPasswordInput) {
        // Check password strength khi nhập
        ['input', 'keyup'].forEach(event => {
            passwordInput.addEventListener(event, function() {
                checkPasswordStrength(this.value);
                // Nếu confirm password đã có giá trị, kiểm tra match
                if (confirmPasswordInput.value) {
                    checkPasswordMatch();
                }
            });
        });

        // Check password match khi nhập confirm password
        ['input', 'keyup'].forEach(event => {
            confirmPasswordInput.addEventListener(event, function() {
                checkPasswordMatch();
            });
        });
    }
}

function checkPasswordMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const confirmInput = document.getElementById('confirmPassword');

    if (confirmPassword) {
        if (password !== confirmPassword) {
            showAvailabilityFeedback('confirmPassword', false, 'Passwords do not match');
            return false;
        } else {
            showAvailabilityFeedback('confirmPassword', true, 'Passwords match');
            return true;
        }
    }
    return false;
}