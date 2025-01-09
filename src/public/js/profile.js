document.addEventListener('DOMContentLoaded', function() {
    const editProfileBtn = document.getElementById('editProfileBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const profileForm = document.getElementById('profileForm');
    const saveButtons = document.getElementById('saveButtons');
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    const formInputs = profileForm.querySelectorAll('input, select, textarea');
    const avatarInput = document.getElementById('avatarInput');
    const profileImage = document.querySelector('img[alt="Profile Picture"]');

    // Enable edit mode
    editProfileBtn.addEventListener('click', () => {
        formInputs.forEach(input => input.disabled = false);
        saveButtons.classList.remove('hidden');
        changeAvatarBtn.classList.remove('hidden');
        editProfileBtn.classList.add('hidden');
    });

    // Cancel edit
    cancelBtn.addEventListener('click', () => {
        exitEditMode();
        profileForm.reset();
    });

    // Exit edit mode function
    function exitEditMode() {
        formInputs.forEach(input => input.disabled = true);
        saveButtons.classList.add('hidden');
        changeAvatarBtn.classList.add('hidden');
        editProfileBtn.classList.remove('hidden');
    }

    // Validate email
    const emailInput = document.querySelector('input[name="email"]');
    emailInput.addEventListener('input', function() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.value)) {
            this.classList.add('border-red-500');
            showFieldError(this, 'Invalid email format');
        } else {
            this.classList.remove('border-red-500');
            removeFieldError(this);
        }
    });

    // Validate phone
    const phoneInput = document.querySelector('input[name="phone"]');
    phoneInput.addEventListener('input', function() {
        const phoneRegex = /^[0-9]{10}$/;
        if (this.value && !phoneRegex.test(this.value)) {
            this.classList.add('border-red-500');
            showFieldError(this, 'Phone number must be 10 digits');
        } else {
            this.classList.remove('border-red-500');
            removeFieldError(this);
        }
    });

    // Show field error message
    function showFieldError(field, message) {
        let errorDiv = field.nextElementSibling;
        if (!errorDiv || !errorDiv.classList.contains('error-message')) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message text-red-500 text-sm mt-1';
            field.parentNode.insertBefore(errorDiv, field.nextSibling);
        }
        errorDiv.textContent = message;
    }

    // Remove field error message
    function removeFieldError(field) {
        const errorDiv = field.nextElementSibling;
        if (errorDiv && errorDiv.classList.contains('error-message')) {
            errorDiv.remove();
        }
    }

    // Handle profile update
    profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validate all fields before submitting
        const email = emailInput.value;
        const phone = phoneInput.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{10}$/;

        if (!emailRegex.test(email)) {
            Swal.fire({
                title: 'Error!',
                text: 'Invalid email format',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#EF4444',
            });
            return;
        }

        if (phone && !phoneRegex.test(phone)) {
            Swal.fire({
                title: 'Error!',
                text: 'Phone number must be 10 digits',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#EF4444',
            });
            return;
        }
        console.log('save');

        // Hiển thị confirm dialog trước khi save
        const confirmResult = await Swal.fire({
            title: 'Save Changes?',
            text: 'Are you sure you want to save these changes?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel',
            confirmButtonColor: '#3B82F6',
            cancelButtonColor: '#6B7280',
        });

        
        if (!confirmResult.isConfirmed) {
            return;
        }

        try {
            const formData = new FormData(this);
            const jsonData = {};
            formData.forEach((value, key) => {
                jsonData[key] = value;
            });

            const response = await fetch('/profile/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jsonData),
            });

            const result = await response.json();

            if (result.success) {
                await Swal.fire({
                    title: 'Success!',
                    text: 'Profile updated successfully',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3B82F6',
                });
                
                exitEditMode();
                
                // Cập nhật display name
                const username = formData.get('username');
                const displayName = document.querySelector('h2.text-xl');
                if (displayName && username) {
                    displayName.textContent = username;
                }
            } else {
                throw new Error(result.message || 'Failed to update profile');
            }
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: error.message,
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#EF4444',
            });
        }
    });

    // Handle avatar update
    changeAvatarBtn.addEventListener('click', function() {
        avatarInput.click();
    });

    avatarInput.addEventListener('change', async function(e) {
        if (!this.files || !this.files[0]) return;

        const file = this.files[0];
        if (!file.type.startsWith('image/')) {
            Swal.fire({
                title: 'Error!',
                text: 'Please select an image file',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#EF4444',
            });
            return;
        }

        // Show loading state
        Swal.fire({
            title: 'Uploading...',
            text: 'Please wait while we upload your avatar',
            allowOutsideClick: false,
            showConfirmButton: false,
            willOpen: () => {
                Swal.showLoading();
            }
        });

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await fetch('/profile/update-avatar', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.success) {
                // Cập nhật ảnh avatar
                profileImage.src = result.avatarUrl;
                await Swal.fire({
                    title: 'Success!',
                    text: 'Avatar updated successfully',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3B82F6',
                });
            } else {
                throw new Error(result.message || 'Failed to update avatar');
            }
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: error.message,
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#EF4444',
            });
        }
    });
});