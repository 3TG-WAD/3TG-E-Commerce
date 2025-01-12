class ProductFilterService {
    constructor() {
        this.initializeElements();
        this.initializeFiltersFromURL();
        this.initializeEventListeners();
    }

    initializeElements() {
        this.filterForm = document.getElementById('filterForm');
        this.sortSelect = document.getElementById('sortBy');
        this.manufacturerCheckboxes = document.querySelectorAll('input[name="manufacturer"]');
        this.productsGrid = document.getElementById('productsGrid');
        this.productCount = document.querySelector('.product-count');
        this.applyButton = document.getElementById('applyFilters');
        // Lấy category_id từ URL thay vì data attribute
        this.categoryId = window.location.pathname.split('/').pop();
    }

    initializeFiltersFromURL() {
        const params = new URLSearchParams(window.location.search);
        
        // Set sort value
        const sortValue = params.get('sort') || 'popular';
        if (this.sortSelect) {
            this.sortSelect.value = sortValue;
        }

        // Set manufacturer checkboxes
        const manufacturer = params.get('manufacturer')?.split(',') || [];
        this.manufacturerCheckboxes.forEach(checkbox => {
            checkbox.checked = manufacturer.includes(checkbox.value);
        });
    }

    initializeEventListeners() {
        this.applyButton?.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleFilters();
        });

        this.sortSelect?.addEventListener('change', () => {
            this.handleFilters();
        });
    }

    async handleFilters() {
        try {
            const selectedManufacturers = Array.from(this.manufacturerCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);

            const sortValue = this.sortSelect?.value || 'popular';

            console.log('Sending filter request:', { // Debug log
                manufacturers: selectedManufacturers,
                sort: sortValue
            });

            // Cập nhật URL trước
            this.updateURL(selectedManufacturers, sortValue);

            const response = await fetch(`/categories/${this.categoryId}/filter`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    manufacturers: selectedManufacturers,
                    sort: sortValue
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                this.updateUI(data);
            }

        } catch (error) {
            console.error('Error in handleFilters:', error);
        }
    }

    updateURL(manufacturers, sort) {
        const params = new URLSearchParams();
        
        // Thêm sort parameter nếu khác giá trị mặc định
        if (sort && sort !== 'popular') {
            params.set('sort', sort);
        }
        
        // Thêm manufacturer parameter nếu có
        if (manufacturers.length > 0) {
            params.set('manufacturer', manufacturers.join(','));
        }

        // Cập nhật URL không reload trang
        const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
        window.history.pushState({}, '', newUrl);
    }

    updateUI(data) {
        if (!data.success) return;

        const { products } = data.data;

        // Cập nhật grid sản phẩm
        if (this.productsGrid) {
            this.productsGrid.innerHTML = products.map(product => `
                <div class="group">
                    <a href="/products/${product.id}" class="block">
                        <div class="bg-gray-100 rounded-lg mb-3 aspect-square overflow-hidden">
                            <img 
                                src="${product.image}" 
                                alt="${product.name}"
                                class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            >
                        </div>
                        <h3 class="font-medium mb-1.5">${product.name}</h3>
                        <div class="flex items-center gap-2">
                            <span class="font-bold">${product.finalPrice}</span>
                            ${product.discount > 0 ? `
                                <span class="text-sm text-gray-500 line-through">
                                    ${formatToVND(product.price)}
                                </span>
                                <span class="text-sm text-red-500">-${product.discount}%</span>
                            ` : ''}
                        </div>
                    </a>
                </div>
            `).join('');
        }

        // Cập nhật số lượng sản phẩm
        if (this.productCount) {
            this.productCount.textContent = `${data.data.pagination.totalProducts} Products`;
        }
    }

    formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    }

    handleSort() {
        const sortSelect = document.getElementById('sortBy');
        if (!sortSelect) return;

        sortSelect.addEventListener('change', async () => {
            const categoryId = window.location.pathname.split('/').pop();
            const sortValue = sortSelect.value;

            try {
                const response = await fetch(`/categories/${categoryId}/sort?sort=${sortValue}`);
                const data = await response.json();

                if (data.success) {
                    document.getElementById('productsGrid').innerHTML = data.html;
                } else {
                    console.error('Error sorting products:', data.message);
                }
            } catch (error) {
                console.error('Error sorting products:', error);
            }
        });
    }

    async handleSort(event) {
        const sortValue = event.target.value;
        const categoryId = window.location.pathname.split('/').pop();

        console.log('Handling sort:', { sortValue, categoryId }); // Debug log

        try {
            const response = await fetch(`/api/categories/${categoryId}/sort?sort=${sortValue}`);
            const data = await response.json();

            console.log('Sort response:', data); // Debug log

            if (data.success) {
                // Cập nhật URL mà không reload trang
                const url = new URL(window.location);
                url.searchParams.set('sort', sortValue);
                window.history.pushState({}, '', url);

                // Render sản phẩm mới
                this.renderProducts(data.products);
            } else {
                console.error('Sort error:', data.message);
            }
        } catch (error) {
            console.error('Sort error:', error);
        }
    }

    renderProducts(products) {
        console.log('Rendering products:', products); // Debug log

        if (!this.productsGrid || !products) {
            console.error('Missing productsGrid or products data');
            return;
        }

        const html = products.map(product => {
            console.log('Processing product:', product); // Debug log per product
            return `
                <div class="group">
                    <a href="/products/${product.id}" class="block">
                        <div class="bg-gray-100 rounded-lg mb-3 aspect-square overflow-hidden">
                            <img src="${product.image}" 
                                 alt="${product.name}"
                                 class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
                        </div>
                        <h3 class="font-medium mb-1.5">${product.name}</h3>
                        <div class="flex items-center gap-2">
                            <span class="font-bold">
                                ${this.formatPrice(product.finalPrice)}
                            </span>
                            ${product.discount > 0 ? `
                                <span class="text-sm text-gray-500 line-through">
                                    ${this.formatPrice(product.price)}
                                </span>
                                <span class="text-sm text-red-500">-${product.discount}%</span>
                            ` : ''}
                        </div>
                    </a>
                </div>
            `;
        }).join('');

        console.log('Generated HTML:', html.substring(0, 200) + '...'); // Debug log HTML
        this.productsGrid.innerHTML = html;
    }
}

// Khởi tạo service khi document ready
document.addEventListener('DOMContentLoaded', () => {
    new ProductFilterService();
});

export default ProductFilterService;
