// Simple Navigation Injector - Works without server
document.addEventListener('DOMContentLoaded', function() {
    const navContainer = document.getElementById('nav-container');
    if (!navContainer) return;

    // Navigation HTML template
    const navigationHTML = `
    <header class="navbar">
        <div class="container">
            <a href="index.html" class="nav-brand">
                <span class="brand-text">FITNESS<span class="brand-accent"> CONSCIOUS</span> GOA</span>
            </a>
            <div class="main-navigation">
                <nav class="nav-menu">
                    <a href="index.html#home" class="nav-link">Home</a>
                    <a href="index.html#about" class="nav-link">About Us</a>
                    <a href="gallery.html" class="nav-link">Gallery</a>
                    <!-- <a href="blog.html" class="nav-link">Blog</a> -->
                    <!-- <a href="challenge.html" class="nav-link">Challenge</a> -->
                    <a href="events.html" class="nav-link">Events</a>
                    <a href="contact.html" class="nav-link">Contact</a>
                    <!-- <a href="index.html#join" class="nav-link">Join Us</a> -->
                </nav>
            </div>
            <div class="nav-actions">
                <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">
                    <i class="fas fa-moon"></i>
                </button>
                <button class="nav-hamburger" id="navHamburger" aria-label="Open menu">
                    <span class="hamburger-line"></span>
                    <span class="hamburger-line"></span>
                    <span class="hamburger-line"></span>
                </button>
            </div>
        </div>
        
        <!-- Enhanced Mobile Menu -->
        <div class="mobile-menu-overlay" id="mobileMenuOverlay">
            <div class="mobile-menu-container">
                <div class="mobile-menu-header">
                    <span class="mobile-brand-text">FITNESS<span class="brand-accent"> CONSCIOUS</span> GOA</span>
                    <button class="mobile-close-btn" id="mobileCloseBtn" aria-label="Close menu">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <nav class="mobile-nav-menu">
                    <a href="index.html#home" class="mobile-nav-link" data-text="Home">
                        <span class="link-text">Home</span>
                        <span class="link-icon"><i class="fas fa-home"></i></span>
                    </a>
                    <a href="index.html#about" class="mobile-nav-link" data-text="About Us">
                        <span class="link-text">About Us</span>
                        <span class="link-icon"><i class="fas fa-users"></i></span>
                    </a>
                    <a href="gallery.html" class="mobile-nav-link" data-text="Gallery">
                        <span class="link-text">Gallery</span>
                        <span class="link-icon"><i class="fas fa-images"></i></span>
                    </a>
                    <!-- <a href="blog.html" class="mobile-nav-link" data-text="Blog">
                        <span class="link-text">Blog</span>
                        <span class="link-icon"><i class="fas fa-blog"></i></span>
                    </a> -->
                    <!-- <a href="challenge.html" class="mobile-nav-link" data-text="Challenge">
                        <span class="link-text">Challenge</span>
                        <span class="link-icon"><i class="fas fa-trophy"></i></span>
                    </a> -->
                    <a href="events.html" class="mobile-nav-link" data-text="Events">
                        <span class="link-text">Events</span>
                        <span class="link-icon"><i class="fas fa-calendar-alt"></i></span>
                    </a>
                    <a href="contact.html" class="mobile-nav-link" data-text="Contact">
                        <span class="link-text">Contact</span>
                        <span class="link-icon"><i class="fas fa-envelope"></i></span>
                    </a>
                    <!-- <a href="index.html#join" class="mobile-nav-link" data-text="Join Us">
                        <span class="link-text">Join Us</span>
                        <span class="link-icon"><i class="fas fa-user-plus"></i></span>
                    </a> -->
                </nav>
                <div class="mobile-menu-footer">
                    <button class="mobile-theme-toggle" id="mobileThemeToggle" aria-label="Toggle theme">
                        <i class="fas fa-moon"></i>
                        <span>Dark Mode</span>
                    </button>
                </div>
            </div>
        </div>
    </header>`;

    // Inject navigation
    navContainer.innerHTML = navigationHTML;

    // Set active page
    setActivePage();

    // Initialize navigation functionality
    initializeNavigation();
});

function setActivePage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && (href.includes(currentPage) || 
            (currentPage === 'index.html' && href.includes('#home')))) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function initializeNavigation() {
    const hamburger = document.getElementById('navHamburger');
    const mobileOverlay = document.getElementById('mobileMenuOverlay');
    const mobileCloseBtn = document.getElementById('mobileCloseBtn');
    const body = document.body;

    if (hamburger && mobileOverlay) {
        hamburger.addEventListener('click', () => {
            mobileOverlay.classList.add('active');
            body.classList.add('mobile-menu-open');
        });
    }

    if (mobileCloseBtn && mobileOverlay) {
        mobileCloseBtn.addEventListener('click', () => {
            mobileOverlay.classList.remove('active');
            body.classList.remove('mobile-menu-open');
        });
    }

    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', (e) => {
            if (e.target === mobileOverlay) {
                mobileOverlay.classList.remove('active');
                body.classList.remove('mobile-menu-open');
            }
        });
    }

    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileOverlay) {
                mobileOverlay.classList.remove('active');
                body.classList.remove('mobile-menu-open');
            }
        });
    });

    // Dispatch event so main.js can initialize theme toggle and other features
    setTimeout(() => {
        document.dispatchEvent(new CustomEvent('navigationLoaded'));
    }, 50);
}
