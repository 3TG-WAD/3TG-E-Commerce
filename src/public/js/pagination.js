// Attach function to window object
window.loadPage = async function(type, page, productId) {
    console.log(`Loading ${type} page:`, page);
    page = parseInt(page);
    
    try {
        const url = type === 'reviews' 
            ? `/api/products/${productId}/reviews?page=${page}`
            : `/api/products/${productId}/recommended?page=${page}`;
            
        console.log('Fetching URL:', url);
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Data received:', data);

        // Update content
        const contentId = type === 'reviews' ? 'reviewsList' : 'recommendedList';
        if (data.html) {
            document.getElementById(contentId).innerHTML = data.html;
        }

        // Update active button
        const paginationContainer = document.getElementById(`${type}Pagination`);
        if (paginationContainer) {
            const buttons = paginationContainer.querySelectorAll('button');
            buttons.forEach(btn => {
                const btnPage = parseInt(btn.getAttribute('data-page'));
                if (btnPage === page) {
                    btn.classList.add('bg-black', 'text-white');
                    btn.classList.remove('hover:bg-gray-50');
                } else {
                    btn.classList.remove('bg-black', 'text-white');
                    btn.classList.add('hover:bg-gray-50');
                }
            });
        }

    } catch (error) {
        console.error(`Error loading ${type}:`, error);
    }
}

