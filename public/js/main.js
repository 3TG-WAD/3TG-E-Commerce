document.addEventListener('DOMContentLoaded', function() {
    // Handle dropdown menu on mobile
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) {
        userMenu.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                const dropdown = this.querySelector('.dropdown-menu');
                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                e.stopPropagation();
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                const dropdown = userMenu.querySelector('.dropdown-menu');
                dropdown.style.display = 'none';
            }
        });
    }

    // Navigation toggle
    const navToggle = document.querySelector('.nav-toggle');
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            // Navigation logic
        });
    }

    // Smooth scroll
    const smoothScroll = (target) => {
        document.querySelector(target).scrollIntoView({
            behavior: 'smooth'
        });
    };
}); 