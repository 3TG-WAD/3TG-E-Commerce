class ReviewHandler {
    constructor() {
        this.reviewBtn = document.getElementById('writeReviewBtn');
        this.reviewModal = document.getElementById('reviewModal');
        this.reviewForm = document.getElementById('reviewForm');
        this.imageInput = document.getElementById('reviewImages');
        this.imagePreview = document.getElementById('imagePreview');
        this.ratingStars = document.getElementById('ratingStars');
        
        this.init();
    }

    init() {
        // Check auth khi click Write Review
        this.reviewBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            // Show toast if not authenticated
            if (!this.reviewBtn.dataset.authenticated || this.reviewBtn.dataset.authenticated === 'false') {
                showToast('Please login to write a review', 'error');
                return;
            }
            this.toggleModal();
        });

        this.reviewForm?.addEventListener('submit', (e) => this.handleSubmit(e));
        this.imageInput?.addEventListener('change', (e) => this.handleImagePreview(e));
        
        // Add star rating functionality
        this.ratingStars?.addEventListener('change', (e) => {
            if (e.target.name === 'rating') {
                this.fillStars(e.target.value);
            }
        });

        // Close modal when clicking outside
        this.reviewModal?.addEventListener('click', (e) => {
            if (e.target === this.reviewModal) {
                this.toggleModal();
            }
        });
    }

    toggleModal() {
        this.reviewModal.classList.toggle('hidden');
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const rating = this.reviewForm.querySelector('input[name="rating"]:checked')?.value;
        const comment = this.reviewForm.querySelector('textarea[name="comment"]').value.trim();
        const files = this.imageInput?.files;
        
        if (!rating || !comment) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        const productId = window.location.pathname.split('/').pop();
        
        try {
            let uploadedUrls = [];
            if (files && files.length > 0) {
                showToast('Uploading images...', 'info');
                uploadedUrls = await this.uploadImages(files);
            }

            const response = await fetch(`/api/products/${productId}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    rating, 
                    comment,
                    photos: uploadedUrls
                })
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || 'Error submitting review');
            }

            showToast('Review added successfully', 'success');
            
            // Reload trang sau khi thêm review thành công
            setTimeout(() => {
                window.location.reload();
            }, 1000); // Đợi 1s để user thấy thông báo thành công

        } catch (error) {
            console.error('Error submitting review:', error);
            showToast(error.message || 'Error submitting review', 'error');
        }
    }

    async uploadImages(files) {
        console.log('Preparing to upload files:', files); // Debug log
        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('images', file);
            console.log('Added file to FormData:', file.name); // Debug log
        });

        try {
            console.log('Sending upload request...'); // Debug log
            const response = await fetch('/api/reviews/upload-images', {
                method: 'POST',
                body: formData
            });

            console.log('Upload response received:', response.status); // Debug log

            if (!response.ok) {
                throw new Error('Failed to upload images');
            }

            const data = await response.json();
            console.log('Upload response data:', data); // Debug log

            if (!data.success) {
                throw new Error(data.message || 'Failed to upload images');
            }

            return data.urls;
        } catch (error) {
            console.error('Error uploading images:', error);
            throw new Error('Failed to upload images');
        }
    }

    fillStars(rating) {
        const stars = this.ratingStars.querySelectorAll('.star-icon');
        stars.forEach(star => {
            const starRating = parseInt(star.dataset.rating);
            if (starRating <= rating) {
                star.classList.add('text-yellow-400');
                star.classList.remove('text-gray-300');
            } else {
                star.classList.remove('text-yellow-400');
                star.classList.add('text-gray-300');
            }
        });
    }

    async reloadReviews(productId) {
        try {
            const response = await fetch(`/api/products/${productId}/reviews?page=1`, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to reload reviews');
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Invalid response format');
            }

            const data = await response.json();
            
            if (data.success && data.html) {
                const reviewsList = document.getElementById('reviewsList');
                reviewsList.innerHTML = data.html;
                
                // Update review count if exists
                const reviewCountElement = document.querySelector('h2');
                if (reviewCountElement) {
                    const currentCount = parseInt(reviewCountElement.textContent.match(/\d+/)[0]) || 0;
                    reviewCountElement.textContent = `Reviews (${currentCount + 1})`;
                }
            }
        } catch (error) {
            console.error('Error reloading reviews:', error);
            showToast('Error loading reviews', 'error');
        }
    }

    handleImagePreview(e) {
        this.imagePreview.innerHTML = '';
        const files = Array.from(e.target.files);
        
        if (files.length > 5) {
            showToast('Maximum 5 images allowed', 'error');
            e.target.value = '';
            return;
        }

        files.forEach(file => {
            if (!file.type.startsWith('image/')) {
                showToast('Please upload only image files', 'error');
                return;
            }

            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                showToast('Image size should be less than 5MB', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.createElement('div');
                preview.className = 'relative inline-block mr-2 mb-2';
                preview.innerHTML = `
                    <img src="${e.target.result}" class="h-20 w-20 object-cover rounded-lg">
                    <button type="button" 
                            class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                            onclick="this.parentElement.remove()">
                        ×
                    </button>
                `;
                this.imagePreview.appendChild(preview);
            };
            reader.readAsDataURL(file);
        });
    }

    addReviewToList(review) {
        const reviewsList = document.getElementById('reviewsList');
        const reviewElement = document.createElement('div');
        reviewElement.className = 'border-b pb-8 review-item';
        
        // Create review HTML with photos
        const photosHtml = review.photos && review.photos.length > 0 
            ? `
                <div class="flex gap-2 my-3">
                    ${review.photos.map(photo => `
                        <div class="w-20 h-20 rounded-lg overflow-hidden">
                            <img src="${photo}" alt="Review photo" class="w-full h-full object-cover">
                        </div>
                    `).join('')}
                </div>
            ` 
            : '';

        reviewElement.innerHTML = `
            <div class="flex justify-between mb-4">
                <div>
                    <div class="flex items-center gap-2 mb-2">
                        <div class="flex text-yellow-400">
                            ${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}
                        </div>
                        <span class="font-medium">${review.user_name}</span>
                    </div>
                    <p class="text-gray-600 mb-2">"${review.comment}"</p>
                    ${photosHtml}
                    <span class="text-sm text-gray-500">
                        Posted on ${new Date(review.created_at).toLocaleDateString()}
                    </span>
                </div>
            </div>
        `;
        
        // Thêm review mới vào đầu danh sách
        if (reviewsList.firstChild) {
            reviewsList.insertBefore(reviewElement, reviewsList.firstChild);
        } else {
            reviewsList.appendChild(reviewElement);
        }

        // Cập nhật tổng số review
        const reviewCount = document.querySelector('.review-count');
        if (reviewCount) {
            const currentCount = parseInt(reviewCount.textContent) || 0;
            reviewCount.textContent = currentCount + 1;
        }
    }

    updateReviewCount() {
        const productId = window.location.pathname.split('/').pop();
        
        // Cập nhật số lượng review ngay lập tức trên UI
        const reviewHeading = document.querySelector('#reviews h2');
        if (reviewHeading) {
            const currentCount = parseInt(reviewHeading.textContent.match(/\d+/)[0]) || 0;
            const newCount = currentCount + 1;
            reviewHeading.textContent = `Reviews (${newCount})`;
        }

        // Reload toàn bộ phần reviews để cập nhật cả danh sách và phân trang
        fetch(`/api/products/${productId}/reviews?review_page=1`)
            .then(response => response.text())
            .then(html => {
                const reviewsSection = document.getElementById('reviewsList');
                if (reviewsSection) {
                    reviewsSection.innerHTML = html;
                }
                
                // Reload phần phân trang nếu cần
                this.updatePagination(productId);
            })
            .catch(error => {
                console.error('Error reloading reviews:', error);
            });
    }

    updatePagination(productId) {
        fetch(`/api/products/${productId}/reviews?review_page=1&count_only=true`)
            .then(response => response.json())
            .then(data => {
                const paginationContainer = document.getElementById('reviewsPagination');
                if (paginationContainer && data.totalPages > 1) {
                    let paginationHtml = '';
                    for (let i = 1; i <= data.totalPages; i++) {
                        paginationHtml += `
                            <button type="button" 
                                onclick="window.loadPage('reviews', '${i}', '${productId}')"
                                data-page="${i}"
                                class="cursor-pointer px-4 py-2 border rounded ${i === 1 ? 'bg-black text-white' : 'hover:bg-gray-50'}">
                                ${i}
                            </button>
                        `;
                    }
                    paginationContainer.innerHTML = paginationHtml;
                } else if (paginationContainer) {
                    paginationContainer.innerHTML = ''; // Xóa phân trang nếu chỉ có 1 trang
                }
            })
            .catch(error => {
                console.error('Error updating pagination:', error);
            });
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const successIcon = document.getElementById('toast-success');
    const errorIcon = document.getElementById('toast-error');

    toastMessage.textContent = message;

    successIcon.classList.toggle('hidden', type !== 'success');
    errorIcon.classList.toggle('hidden', type !== 'error');

    toast.classList.remove('translate-x-full', 'opacity-0');

    setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
    }, 3000);
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    new ReviewHandler();
});