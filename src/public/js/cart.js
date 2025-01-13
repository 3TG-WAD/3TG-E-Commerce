/**
 * Cart Module - Handles all cart-related functionality
 */
const Cart = {
    /**
     * Initialize cart functionality
     */
    async init() {
        try {
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

    /**
     * Add item to cart and update cart count
     * @param {Object} item - Cart item to be added
     */
    async addItem(item) {
        try {
            const response = await fetch('/cart/count');
            const data = await response.json();
            this.updateCartCount(data.count);
        } catch (error) {
            console.error('Error updating cart count:', error);
        }
    },

    /**
     * Update cart count display
     * @param {number} count - New cart count
     */
    updateCartCount(count) {
        const cartCount = document.querySelector('#cartCount');
        if (cartCount) {
            cartCount.textContent = count > 99 ? '99+' : count;
            this._updateCartCountWidth(cartCount, count);
        }
    },

    /**
     * Update cart count element width based on count
     * @private
     * @param {HTMLElement} element - Cart count element
     * @param {number} count - Cart count
     */
    _updateCartCountWidth(element, count) {
        if (count > 99) {
            element.classList.add('w-6');
        } else {
            element.classList.remove('w-6');
        }
    }
};

/**
 * Cart UI Functions
 */
const CartUI = {
    /**
     * Add product to cart
     * @param {string} productId - Product ID
     */
    async addToCart(productId) {
        try {
            if (!this._validateProductId(productId)) return;

            const { quantity, selectedSize } = this._getProductDetails();
            if (!this._validateSize(selectedSize)) return;

            await this._sendAddToCartRequest(productId, quantity, selectedSize);
        } catch (error) {
            console.error('Error adding to cart:', error);
            showNotification('Error adding product to cart', 'error');
        }
    },

    /**
     * Update cart item quantity
     * @param {string} itemId - Cart item ID
     * @param {number} quantity - New quantity
     */
    async updateCartQuantity(itemId, quantity) {
        try {
            if (!this._validateItemId(itemId)) return;

            const cartItem = document.querySelector(`[data-cart-item="${itemId}"]`);
            const size = cartItem?.dataset.size;

            await this._sendUpdateQuantityRequest(itemId, quantity, size);
        } catch (error) {
            console.error('Error:', error);
            showNotification(error.message || 'Failed to update cart', 'error');
        }
    },

    /**
     * Remove item from cart
     * @param {string} itemId - Cart item ID
     */
    async removeCartItem(itemId) {
        try {
            if (!this._validateItemId(itemId)) return;
            await this._sendRemoveItemRequest(itemId);
        } catch (error) {
            console.error('Error:', error);
            showNotification(error.message || 'Failed to remove item', 'error');
        }
    },

    /**
     * Private helper methods
     */
    _validateProductId(productId) {
        if (!productId) {
            console.error('Product ID is missing');
            showNotification('Invalid product', 'error');
            return false;
        }
        return true;
    },

    _validateItemId(itemId) {
        if (!itemId) {
            throw new Error('Item ID is required');
        }
        return true;
    },

    _getProductDetails() {
        const quantity = parseInt(document.querySelector('#quantity').value || '1');
        const selectedSize = document.querySelector('input[name="size"]:checked')?.value;
        return { quantity, selectedSize };
    },

    _validateSize(selectedSize) {
        const sizeError = document.querySelector('#size-error');
        if (!selectedSize) {
            sizeError.classList.remove('hidden');
            return false;
        }
        sizeError.classList.add('hidden');
        return true;
    },

    async _sendAddToCartRequest(productId, quantity, selectedSize) {
        const response = await fetch('/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
    },

    async _sendUpdateQuantityRequest(itemId, quantity, size) {
        const response = await fetch(`/cart/update/${itemId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity, size, product_id: itemId })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update cart');
        }

        const data = await response.json();
        
        if (data.success) {
            updateCartCount(data.cart.total_items);
            showNotification('Cart updated successfully', 'success');
            setTimeout(() => window.location.reload(), 500);
        } else {
            throw new Error(data.message || 'Failed to update cart');
        }
    },

    async _sendRemoveItemRequest(itemId) {
        const response = await fetch(`/cart/remove/${itemId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to remove item');
        }

        const data = await response.json();
        
        if (data.success) {
            updateCartCount(data.cart.total_items);
            showNotification('Item removed from cart', 'success');
            setTimeout(() => window.location.reload(), 500);
        } else {
            throw new Error(data.message || 'Failed to remove item');
        }
    }
};

/**
 * Notification Functions
 */
function showNotification(message, type = 'success') {
    const elements = {
        toast: document.getElementById('toast'),
        message: document.getElementById('toast-message'),
        successIcon: document.getElementById('toast-success'),
        errorIcon: document.getElementById('toast-error')
    };

    if (!_validateToastElements(elements)) return;

    _updateToastContent(elements, message, type);
    _showToast(elements.toast);
}

function _validateToastElements(elements) {
    if (!elements.toast || !elements.message || !elements.successIcon || !elements.errorIcon) {
        console.error('Toast elements not found');
        return false;
    }
    return true;
}

function _updateToastContent(elements, message, type) {
    elements.message.textContent = message;
    elements.successIcon.classList.add('hidden');
    elements.errorIcon.classList.add('hidden');
    
    if (type === 'success') {
        elements.successIcon.classList.remove('hidden');
    } else if (type === 'error') {
        elements.errorIcon.classList.remove('hidden');
    }
}

function _showToast(toastElement) {
    toastElement.classList.remove('translate-x-full', 'opacity-0');
    setTimeout(() => {
        toastElement.classList.add('translate-x-full', 'opacity-0');
    }, 3000);
}

/**
 * Event Listeners
 */
document.addEventListener('DOMContentLoaded', () => {
    Cart.init();
    _initializeSizeSelection();
});

function _initializeSizeSelection() {
    const sizeInputs = document.querySelectorAll('input[name="size"]');
    const sizeError = document.querySelector('#size-error');
    
    sizeInputs.forEach(input => {
        input.addEventListener('change', () => {
            sizeError.classList.add('hidden');
        });
    });
}

// Export functions to window object
window.updateCartCount = Cart.updateCartCount.bind(Cart);
window.updateCartQuantity = CartUI.updateCartQuantity.bind(CartUI);
window.removeCartItem = CartUI.removeCartItem.bind(CartUI);
window.addToCart = CartUI.addToCart.bind(CartUI);