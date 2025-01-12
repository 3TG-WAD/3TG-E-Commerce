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
            // Cập nhật số lượng
            cartCount.textContent = count || '0';
            
            // Ẩn badge khi số lượng = 0
            if (count <= 0) {
                cartCount.classList.add('hidden');
            } else {
                cartCount.classList.remove('hidden');
                
                // Điều chỉnh kích thước cho số có nhiều chữ số
                if (count > 99) {
                    cartCount.textContent = '99+';
                    cartCount.classList.add('w-6');
                } else {
                    cartCount.classList.remove('w-6');
                }
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
        const size = document.querySelector('#productSize')?.value;

        // Validate size
        if (!size) {
            showNotification('Please select a size', 'error');
            return;
        }

        console.log('Sending cart request:', { productId, quantity, size }); // Debug

        const response = await fetch('/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: quantity,
                size: size
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
    if (type === 'error') {
        alert('Error: ' + message);
    } else {
        alert(message);
    }
}