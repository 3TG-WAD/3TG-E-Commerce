document.addEventListener('DOMContentLoaded', function() {
    // Mobile filter toggle
    const mobileFilterToggle = document.getElementById('mobileFilterToggle');
    const filterForm = document.getElementById('filterForm');

    if (mobileFilterToggle && filterForm) {
        mobileFilterToggle.addEventListener('click', function() {
            filterForm.classList.toggle('hidden');
        });
    }

    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 1024) { // lg breakpoint
            filterForm.classList.remove('hidden');
        } else {
            filterForm.classList.add('hidden');
        }
    });
});