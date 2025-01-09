class ProductFilterService {
    constructor() {
        this.initializeElements();
        this.initializeEventListeners();
    }

    initializeElements() {
        this.filterForm = document.getElementById('filterForm');
        this.sortBySelect = document.getElementById('sortBy');
        this.applyFiltersBtn = document.getElementById('applyFilters');
        this.productsGrid = document.getElementById('productsGrid');
        this.paginationContainer = document.getElementById('paginationNumbers');
    }

    initializeEventListeners() {
        this.applyFiltersBtn.addEventListener('click', () => this.handleFilters());
        this.sortBySelect.addEventListener('change', () => this.handleFilters());
        
        // Pagination event delegation
        this.paginationContainer.addEventListener('click', (e) => {
            const pageButton = e.target.closest('[data-page]');
            if (pageButton) {
                this.handleFilters();
            }
        });
    }

    async handleFilters() {
        const query = this.buildElasticSearchQuery();
        
        try {
            const response = await this.fetchFilteredProducts(query);
            this.updateUI(response);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }

    buildElasticSearchQuery() {
        const selectedBrands = [...document.querySelectorAll('input[type="checkbox"][name="brand"]:checked')]
            .map(cb => cb.value);
        
        const selectedColor = document.querySelector('.ring-gray-400')?.dataset.color;
        const selectedSize = document.querySelector('.bg-gray-200')?.dataset.size;
        const selectedFit = document.querySelector('input[name="fit"]:checked')?.value;
        const sortBy = this.sortBySelect.value;
        const page = document.querySelector('.bg-black[data-page]')?.dataset.page || 1;
        const categoryId = document.querySelector('[data-category-id]')?.dataset.categoryId;

        const query = {
            query: {
                bool: {
                    must: [
                        { term: { category_id: categoryId } }
                    ]
                }
            },
            sort: [{ [sortBy.split(':')[0]]: sortBy.split(':')[1] }],
            from: (page - 1) * 12,
            size: 12
        };

        // Add brand filter
        if (selectedBrands.length) {
            query.query.bool.must.push({
                terms: { manufacturer_id: selectedBrands }
            });
        }

        // Add color filter
        if (selectedColor) {
            query.query.bool.must.push({
                term: { "specifications.color": selectedColor }
            });
        }

        // Add size filter
        if (selectedSize) {
            query.query.bool.must.push({
                term: { "specifications.size_range": selectedSize }
            });
        }

        // Add fit filter
        if (selectedFit) {
            query.query.bool.must.push({
                term: { "specifications.fit": selectedFit }
            });
        }

        return query;
    }

    async fetchFilteredProducts(query) {
        const response = await fetch('/api/products/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                category_id: document.querySelector('[data-category-id]').dataset.categoryId,
                manufacturers: [...document.querySelectorAll('input[name="manufacturer"]:checked')].map(cb => cb.value),
                sort: document.getElementById('sortBy').value,
                page: document.querySelector('.bg-black[data-page]')?.dataset.page || 1
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return response.json();
    }

    updateUI(data) {
        this.updateProductsGrid(data.products);
        this.updatePagination(data.total, data.currentPage);
        this.updateProductCount(data.total);
    }

    updateProductsGrid(products) {
        // Assuming you have a template function to render product cards
        const html = products.map(product => this.renderProductCard(product)).join('');
        this.productsGrid.innerHTML = html;
    }

    updatePagination(total, currentPage) {
        const totalPages = Math.ceil(total / 12);
        let paginationHtml = '';

        for (let i = 1; i <= totalPages; i++) {
            paginationHtml += `
                <button class="w-8 h-8 flex items-center justify-center rounded 
                    ${currentPage === i ? 'bg-black text-white' : 'hover:bg-gray-100'}"
                    data-page="${i}">
                    ${i}
                </button>
            `;
        }

        this.paginationContainer.innerHTML = paginationHtml;
    }

    updateProductCount(total) {
        const countElement = document.querySelector('.product-count');
        if (countElement) {
            countElement.textContent = `Showing 1-12 of ${total} Products`;
        }
    }

    renderProductCard(product) {
        return `
            <div class="group">
                <a href="/products/${product.product_id}" class="block">
                    <div class="bg-gray-100 rounded-lg mb-3 aspect-square overflow-hidden">
                        <img 
                            src="${product.photos[0]}" 
                            alt="${product.product_name}"
                            class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        >
                    </div>
                    <h3 class="font-medium mb-1.5">${product.product_name}</h3>
                    <div class="flex items-center gap-1.5 mb-1.5">
                        ${this.renderRatingStars(product.rating)}
                        <span class="text-sm text-gray-500">${product.rating}/5</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="font-bold">$${product.finalPrice}</span>
                        ${product.discount ? `
                            <span class="text-sm text-gray-500 line-through">$${product.price}</span>
                            <span class="text-sm text-red-500">-${product.discount}%</span>
                        ` : ''}
                    </div>
                </a>
            </div>
        `;
    }

    renderRatingStars(rating) {
        let starsHtml = '';
        for (let i = 0; i < 5; i++) {
            starsHtml += `
                <svg class="w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}" 
                     fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
            `;
        }
        return starsHtml;
    }
}

// Initialize the service when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProductFilterService();
});

export default ProductFilterService;
