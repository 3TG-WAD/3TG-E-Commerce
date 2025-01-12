document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra các elements tồn tại
    const editProfileBtn = document.getElementById('editProfileBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const profileForm = document.getElementById('profileForm');
    const saveButtons = document.getElementById('saveButtons');
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    const avatarInput = document.getElementById('avatarInput');
    
    if (!profileForm) {
        console.error('Profile form not found');
        return;
    }

    const formInputs = profileForm.querySelectorAll('input, select, textarea');
    const profileImage = document.querySelector('img[alt="Profile Picture"]');

    // Show/hide edit hints
    const editHints = document.querySelectorAll('.edit-hint');
    
    function toggleEditHints(show) {
        editHints.forEach(hint => {
            hint.style.opacity = show ? '1' : '0';
        });
    }

    // Enable edit mode with updated UI
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            formInputs.forEach(input => {
                input.disabled = false;
                input.classList.remove('cursor-not-allowed', 'bg-gray-50');
                input.classList.add('bg-white');
            });
            
            saveButtons?.classList.remove('hidden');
            if (changeAvatarBtn) {
                changeAvatarBtn.classList.remove('hidden');
                changeAvatarBtn.classList.add('edit-mode');
            }
            editProfileBtn.classList.add('hidden');
            toggleEditHints(false);
        });
    }

    // Cancel edit with updated UI
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            exitEditMode();
            profileForm.reset();
        });
    }

    // Updated exit edit mode function
    function exitEditMode() {
        formInputs?.forEach(input => {
            if (input) {
                input.disabled = true;
                input.classList.add('cursor-not-allowed', 'bg-gray-50');
                input.classList.remove('bg-white');
            }
        });
        
        saveButtons?.classList.add('hidden');
        if (changeAvatarBtn) {
            changeAvatarBtn.classList.remove('edit-mode');
            changeAvatarBtn.classList.add('hidden');
        }
        editProfileBtn?.classList.remove('hidden');
        toggleEditHints(true);
    }

    // Handle profile update
    profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();

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

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();

            if (result.success) {
                // Cập nhật UI
                const username = formData.get('username');
                const displayName = document.querySelector('h2.text-2xl');
                if (displayName && username) {
                    displayName.textContent = username;
                }
                
                // Disable form
                exitEditMode();
                
                // Thông báo thành công
                await Swal.fire({
                    title: 'Success!',
                    text: 'Profile updated successfully',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3B82F6',
                });

                // Reload page để cập nhật dữ liệu mới
                window.location.reload();
            } else {
                throw new Error(result.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                title: 'Error!',
                text: error.message,
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#EF4444',
            });
        }
    });

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

    // Handle avatar update
    if (changeAvatarBtn && avatarInput) {
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

            // Hiển thị preview ảnh trước khi upload
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.querySelector('img[alt="Profile Picture"]');
                if (preview) {
                    // Lưu URL ảnh cũ để khôi phục nếu cần
                    preview.dataset.oldSrc = preview.src;
                    preview.src = e.target.result;
                }
            };
            reader.readAsDataURL(file);

            // Show confirmation dialog
            const result = await Swal.fire({
                title: 'Update Avatar?',
                text: 'Do you want to update your profile picture?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, update it!',
                cancelButtonText: 'No, keep current',
                confirmButtonColor: '#3B82F6',
                cancelButtonColor: '#6B7280',
            });

            // If user cancels, restore old avatar
            if (!result.isConfirmed) {
                const preview = document.querySelector('img[alt="Profile Picture"]');
                if (preview && preview.dataset.oldSrc) {
                    preview.src = preview.dataset.oldSrc;
                }
                avatarInput.value = ''; // Reset file input
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

                if (!response.ok) {
                    throw new Error('Failed to update avatar');
                }

                const result = await response.json();
                
                if (result.success) {
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
                // Restore old avatar on error
                const preview = document.querySelector('img[alt="Profile Picture"]');
                if (preview && preview.dataset.oldSrc) {
                    preview.src = preview.dataset.oldSrc;
                }
                
                Swal.fire({
                    title: 'Error!',
                    text: error.message,
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#EF4444',
                });
            } finally {
                avatarInput.value = ''; // Reset file input
            }
        });
    }
});