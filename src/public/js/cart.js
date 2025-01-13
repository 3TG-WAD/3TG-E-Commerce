const Cart = {
    async init() {
        try {
            // Lấy số lượng từ session thông qua API
            const response = await fetch('/cart/count');
            const data = await response.json();
            
            if (data.success) {
                this.updateCartCount(data.count);
            }
        } catch (error) {
            console.error('Error initializing cart:', error);
            this.updateCartCount(0);
        }
    },

    async addItem(item) {
        try {
            const response = await fetch('/cart/count');
            const data = await response.json();
            this.updateCartCount(data.count);
        } catch (error) {
            console.error('Error updating cart count:', error);
        }
    },

    updateCartCount(count) {
        const cartCount = document.querySelector('#cartCount');
        if (cartCount) {
            cartCount.textContent = count > 99 ? '99+' : count;
            
            if (count > 99) {
                cartCount.classList.add('w-6');
            } else {
                cartCount.classList.remove('w-6');
            }
        }
    }
};

// Initialize cart when page loads
document.addEventListener('DOMContentLoaded', () => {
    Cart.init();
});

// Add to cart function for product pages
async function addToCart(productId) {
    try {
        if (!productId) {
            console.error('Product ID is missing');
            showNotification('Invalid product', 'error');
            return;
        }

        const quantity = parseInt(document.querySelector('#quantity').value || '1');
        const selectedSize = document.querySelector('input[name="size"]:checked')?.value;
        const sizeError = document.querySelector('#size-error');

        // Validate size
        if (!selectedSize) {
            sizeError.classList.remove('hidden');
            return;
        }
        
        // Hide error if size is selected
        sizeError.classList.add('hidden');

        console.log('Sending cart request:', { productId, quantity, size: selectedSize }); // Debug

        const response = await fetch('/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: quantity,
                size: selectedSize
            })
        });

        const data = await response.json();
        
        if (data.success) {
            Cart.addItem(data.cartItem);
            showNotification('Product added to cart successfully', 'success');
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Error adding product to cart', 'error');
    }
}

function showNotification(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const successIcon = document.getElementById('toast-success');
    const errorIcon = document.getElementById('toast-error');
    
    if (!toast || !toastMessage || !successIcon || !errorIcon) {
        console.error('Toast elements not found');
        return;
    }
    
    // Set message
    toastMessage.textContent = message;
    
    // Show correct icon
    successIcon.classList.add('hidden');
    errorIcon.classList.add('hidden');
    
    if (type === 'success') {
        successIcon.classList.remove('hidden');
    } else if (type === 'error') {
        errorIcon.classList.remove('hidden');
    }
    
    // Show toast
    toast.classList.remove('translate-x-full', 'opacity-0');
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
    }, 3000);
}

// Add event listeners for size selection
document.addEventListener('DOMContentLoaded', () => {
    Cart.init();
    
    // Hide error message when a size is selected
    const sizeInputs = document.querySelectorAll('input[name="size"]');
    const sizeError = document.querySelector('#size-error');
    
    sizeInputs.forEach(input => {
        input.addEventListener('change', () => {
            sizeError.classList.add('hidden');
        });
    });
});

const updateCartCount = async (count) => {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = count;
        
        // Điều chỉnh kích thước cho số có nhiều chữ số
        if (count > 99) {
            cartCount.textContent = '99+';
            cartCount.classList.add('w-6');
        } else {
            cartCount.classList.remove('w-6');
        }
    }
};

const updateCartQuantity = async (itemId, quantity) => {
    console.log('Updating cart with ID:', itemId, 'Quantity:', quantity);
    
    try {
        if (!itemId) {
            throw new Error('Item ID is required');
        }

        // Thêm size vào request body
        const cartItem = document.querySelector(`[data-cart-item="${itemId}"]`);
        const size = cartItem?.dataset.size;

        const response = await fetch(`/cart/update/${itemId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                quantity,
                size,
                product_id: itemId // Thêm product_id cho guest users
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update cart');
        }

        const data = await response.json();
        
        if (data.success) {
            updateCartCount(data.cart.total_items);
            showNotification('Cart updated successfully', 'success');
            
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } else {
            throw new Error(data.message || 'Failed to update cart');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification(error.message || 'Failed to update cart', 'error');
    }
};

const removeCartItem = async (itemId) => {
    console.log('Removing item with ID:', itemId);
    
    try {
        if (!itemId) {
            throw new Error('Item ID is required');
        }

        const response = await fetch(`/cart/remove/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to remove item');
        }

        const data = await response.json();
        
        if (data.success) {
            updateCartCount(data.cart.total_items);
            showNotification('Item removed from cart', 'success');
            
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } else {
            throw new Error(data.message || 'Failed to remove item');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification(error.message || 'Failed to remove item', 'error');
    }
};

// Export functions to window object
window.updateCartCount = updateCartCount;
window.updateCartQuantity = updateCartQuantity;
window.removeCartItem = removeCartItem;