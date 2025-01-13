console.log('Purchase.js loading...');

document.addEventListener('DOMContentLoaded', () => {
    console.log('Purchase page initializing...');
    
    const purchaseContent = document.getElementById('purchaseContent');
    const orderTabs = document.querySelectorAll('.tab-button');
    
    if (!purchaseContent) {
        console.error('Purchase content element not found');
        return;
    }

    // Load orders when page loads
    loadOrders('all');

    // Add styles for active tab
    const style = document.createElement('style');
    style.textContent = `
        .tab-button {
            color: #6B7280;
            background: transparent;
        }
        
        .tab-button:hover {
            color: #1F2937;
            background: rgba(255, 255, 255, 0.5);
        }
        
        .tab-button.active-tab {
            color: #1F2937;
            background: white;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        @keyframes tabTransition {
            from {
                transform: translateY(-2px);
                opacity: 0.8;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        .tab-button.active-tab {
            animation: tabTransition 0.2s ease-out;
        }
    `;
    document.head.appendChild(style);

    // Update tab click handler
    orderTabs.forEach(button => {
        button.addEventListener('click', (e) => {
            console.log('Tab clicked:', e.target.dataset.tab);
            
            orderTabs.forEach(btn => btn.classList.remove('active-tab'));
            button.classList.add('active-tab');
            
            const status = button.dataset.tab;
            loadOrders(status);
        });
    });

    // Add search functionality
    const searchInput = document.querySelector('input[type="text"]');
    let searchTimeout;

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            
            // Add loading state to search icon
            const searchIcon = document.querySelector('.search-icon');
            if (searchIcon) {
                searchIcon.innerHTML = `
                    <div class="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full"></div>
                `;
            }

            searchTimeout = setTimeout(async () => {
                const searchTerm = e.target.value.trim();
                
                if (searchTerm.length === 0) {
                    // If search is empty, load all orders
                    loadOrders('all');
                    return;
                }

                try {
                    const response = await fetch(`/api/orders/search?q=${encodeURIComponent(searchTerm)}`);
                    if (!response.ok) throw new Error('Search failed');
                    
                    const data = await response.json();
                    
                    if (!data.success) {
                        throw new Error(data.message || 'Search failed');
                    }

                    // Update UI with search results
                    updateOrdersDisplay(data.orders);
                } catch (error) {
                    console.error('Search error:', error);
                    showSearchError(error.message);
                } finally {
                    // Restore search icon
                    if (searchIcon) {
                        searchIcon.innerHTML = '<i class="fas fa-search"></i>';
                    }
                }
            }, 300); // Debounce search for 300ms
        });
    }

    // Simplified search styles
    const searchStyles = document.createElement('style');
    searchStyles.textContent = `
        @keyframes searchLoading {
            to {
                transform: rotate(360deg);
            }
        }
    `;
    document.head.appendChild(searchStyles);

    // Simplified loading state handling
    const setSearchLoading = (isLoading) => {
        const searchInput = document.querySelector('input[type="text"]');
        if (searchInput) {
            searchInput.style.opacity = isLoading ? '0.7' : '1';
            searchInput.style.cursor = isLoading ? 'wait' : 'text';
        }
    };
});

const getStatusText = (status) => {
    const statusMap = {
        'pending': 'Pending',
        'processing': 'Processing',
        'shipping': 'Shipping',
        'completed': 'Completed',
        'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
};

const getStatusStyle = (status) => {
    const styleMap = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'processing': 'bg-blue-100 text-blue-800',
        'shipping': 'bg-purple-100 text-purple-800',
        'completed': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800'
    };
    return styleMap[status] || 'bg-gray-100 text-gray-800';
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount/23000); // Assuming conversion rate 23000 VND = 1 USD
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const renderOrderItems = (items) => {
    return items.map(item => `
        <div class="flex items-center gap-4 py-3 hover:bg-gray-50 transition-colors rounded-lg">
            <div class="flex-1">
                <p class="font-medium text-gray-900">${item.product_id}</p>
                <p class="text-sm text-gray-500">Quantity: ${item.quantity}</p>
            </div>
            <div class="text-right">
                <p class="font-medium text-gray-900">${formatCurrency(item.price)}</p>
                ${item.discount > 0 ? `
                    <div class="flex items-center gap-2 justify-end">
                        <span class="text-sm line-through text-gray-400">${formatCurrency(item.price)}</span>
                        <span class="text-sm text-red-500">-${formatCurrency(item.discount)}</span>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
};

const loadOrders = async (status = 'all') => {
    console.log('loadOrders called with status:', status);
    const purchaseContent = document.getElementById('purchaseContent');
    
    try {
        purchaseContent.innerHTML = `
            <div class="flex justify-center items-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span class="ml-2">Loading orders...</span>
            </div>
        `;
        
        const response = await fetch(`/api/orders?status=${status}`);
        console.log('API Response:', response);
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        console.log('Orders data:', data);

        if (!data.success) {
            throw new Error(data.message || 'Failed to load orders');
        }

        if (!data.orders || data.orders.length === 0) {
            purchaseContent.innerHTML = `
                <div class="bg-white rounded-xl shadow-sm p-8 text-center max-w-2xl mx-auto">
                    <img src="/images/orders/empty-order.png" alt="No Orders" class="w-32 h-32 mx-auto mb-6 opacity-75">
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
                    <p class="text-gray-500">Start shopping to create your first order</p>
                    <br/>
                    <a href="/categories/all" class="inline-block mt-6 px-6 py-3 bg-black text-white rounded-lg transition-colors">
                        Browse Products
                    </a>
                </div>
            `;
            return;
        }

        // Render orders
        purchaseContent.innerHTML = data.orders.map(order => `
            <div class="bg-white rounded-xl shadow-sm mb-6 overflow-hidden hover:shadow-md transition-shadow">
                <div class="p-6 border-b border-gray-100">
                    <div class="flex justify-between items-center">
                        <div>
                            <a href="/purchase/${order.order_id}" class="group">
                                <h3 class="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    Order #${order.order_id}
                                </h3>
                                <p class="text-sm text-gray-500 mt-1">${formatDate(order.created_at)}</p>
                            </a>
                        </div>
                        <div class="flex items-center gap-4">
                            <span class="px-4 py-2 rounded-full text-sm font-medium ${getStatusStyle(order.status)}">
                                ${getStatusText(order.status)}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="p-6">
                    <div class="space-y-2">
                        ${renderOrderItems(order.items)}
                    </div>
                    
                    <div class="mt-6 pt-6 border-t border-gray-100">
                        <div class="flex flex-col gap-3">
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600">Total Amount</span>
                                <span class="text-xl font-semibold text-gray-900">${formatCurrency(order.total_amount)}</span>
                            </div>
                            <div class="flex justify-between items-center text-sm text-gray-500">
                                <span>Payment Method</span>
                                <span class="font-medium">${order.payment_method}</span>
                            </div>
                            
                        </div>
                        
                        ${order.status === 'pending' ? `
                            <div class="mt-6 flex justify-end gap-3">
                                <button class="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
                                    Cancel Order
                                </button>
                                <button class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                                    Track Order
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading orders:', error);
        purchaseContent.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm p-8 text-center max-w-2xl mx-auto">
                <div class="text-red-500 mb-4">
                    <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">Error Loading Orders</h3>
                <p class="text-gray-500 mb-6">${error.message}</p>
                <button onclick="loadOrders('${status}')" 
                        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Try Again
                </button>
            </div>
        `;
    }
};

const updateOrdersDisplay = (orders) => {
    const purchaseContent = document.getElementById('purchaseContent');
    
    if (!orders || orders.length === 0) {
        purchaseContent.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm p-8 text-center max-w-2xl mx-auto">
                <img src="/images/orders/empty-order.png" alt="No Results" class="w-15 h-15 mx-auto mb-6 opacity-75">
                <h3 class="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
                <p class="text-gray-500">Try different search terms or clear the search</p>
                <button onclick="clearSearch()" 
                        class="mt-6 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    Clear Search
                </button>
            </div>
        `;
        return;
    }

    // Use the existing order rendering logic
    purchaseContent.innerHTML = orders.map(order => `
        <div class="bg-white rounded-xl shadow-sm mb-6 overflow-hidden hover:shadow-md transition-shadow">
            <!-- Existing order template -->
            ${renderOrder(order)}
        </div>
    `).join('');
};

const renderOrder = (order) => {
    return `
        <div class="bg-white rounded-xl shadow-sm mb-6 overflow-hidden hover:shadow-md transition-shadow">
            <div class="p-6 border-b border-gray-100">
                <div class="flex justify-between items-center">
                    <div>
                        <a href="/purchase/${order.order_id}" class="group">
                            <h3 class="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                Order #${order.order_id}
                            </h3>
                            <p class="text-sm text-gray-500 mt-1">${formatDate(order.created_at)}</p>
                        </a>
                    </div>
                    <div class="flex items-center gap-4">
                        <span class="px-4 py-2 rounded-full text-sm font-medium ${getStatusStyle(order.status)}">
                            ${getStatusText(order.status)}
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="p-6">
                <div class="space-y-2">
                    ${renderOrderItems(order.items)}
                </div>
                
                <div class="mt-6 pt-6 border-t border-gray-100">
                    <div class="flex flex-col gap-3">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">Total Amount</span>
                            <span class="text-xl font-semibold text-gray-900">${formatCurrency(order.total_amount)}</span>
                        </div>
                        <div class="flex justify-between items-center text-sm text-gray-500">
                            <span>Payment Method</span>
                            <span class="font-medium">${order.payment_method}</span>
                        </div>
                        <div class="flex justify-between items-center text-sm text-gray-500">
                            <span>Shipping Address</span>
                            <span class="font-medium">${order.shipping_address}</span>
                        </div>
                    </div>
                    
                    ${order.status === 'pending' ? `
                        <div class="mt-6 flex justify-end gap-3">
                            <button class="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
                                Cancel Order
                            </button>
                            <button class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                                Track Order
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
};

const showSearchError = (message) => {
    const purchaseContent = document.getElementById('purchaseContent');
    purchaseContent.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm p-8 text-center max-w-2xl mx-auto">
            <div class="text-red-500 mb-4">
                <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Search Error</h3>
            <p class="text-gray-500 mb-6">${message}</p>
            <button onclick="clearSearch()" 
                    class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Clear Search
            </button>
        </div>
    `;
};

const clearSearch = () => {
    const searchInput = document.querySelector('input[type="text"]');
    if (searchInput) {
        searchInput.value = '';
        loadOrders('all');
    }
};

// Update search input UI
document.querySelector('input[type="text"]').classList.add(
    'pl-12', // Add more padding for the search icon
    'focus:ring-2',
    'focus:ring-blue-500',
    'focus:border-blue-500'
);

// Add search icon
const searchIconSpan = document.querySelector('.absolute');
searchIconSpan.classList.add('search-icon');