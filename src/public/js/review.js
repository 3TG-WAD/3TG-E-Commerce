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
        
        if (!rating || !comment) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        const productId = window.location.pathname.split('/').pop();

        try {
            const response = await fetch(`/api/products/${productId}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ rating, comment })
            });

            // Nếu chưa đăng nhập, server sẽ redirect đến trang login
            if (response.redirected) {
                window.location.href = response.url;
                return;
            }

            const data = await response.json();

            if (!data.success) {
                showToast(data.message || 'Error submitting review', 'error');
                return;
            }

            // Reset form and close modal
            this.reviewForm.reset();
            this.toggleModal();
            this.fillStars(0);

            // Reload reviews
            await this.reloadReviews(productId);
            
            showToast('Review added successfully', 'success');

        } catch (error) {
            console.error('Error submitting review:', error);
            showToast('Error submitting review', 'error');
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

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.createElement('div');
                preview.className = 'relative inline-block';
                preview.innerHTML = `
                    <img src="${e.target.result}" class="h-20 w-20 object-cover rounded-lg">
                    <button type="button" 
                            class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
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
        reviewElement.className = 'review-item mb-4 p-4 border rounded';
        reviewElement.innerHTML = `
            <div class="flex items-center mb-2">
                <div class="flex-1">
                    <div class="font-medium">${review.user_name}</div>
                    <div class="text-sm text-gray-500">
                        ${new Date(review.created_at).toLocaleDateString()}
                    </div>
                </div>
                <div class="flex text-yellow-400">
                    ${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}
                </div>
            </div>
            <p class="mb-2">${review.comment}</p>
            ${review.photos ? `
                <div class="flex gap-2">
                    ${review.photos.map(photo => `
                        <img src="${photo}" alt="Review photo" class="w-20 h-20 object-cover rounded">
                    `).join('')}
                </div>
            ` : ''}
        `;
        
        // Thêm review mới vào đầu danh sách
        if (reviewsList.firstChild) {
            reviewsList.insertBefore(reviewElement, reviewsList.firstChild);
        } else {
            reviewsList.appendChild(reviewElement);
        }

        // Cập nhật tổng số review nếu có element hiển thị số review
        const reviewCount = document.querySelector('.review-count');
        if (reviewCount) {
            const currentCount = parseInt(reviewCount.textContent) || 0;
            reviewCount.textContent = currentCount + 1;
        }
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