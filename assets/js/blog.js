// Blog JavaScript functionality
document.addEventListener("DOMContentLoaded", () => {
  // Load navigation first
  loadNavigation();
  
  // Initialize blog animations after a short delay
  setTimeout(() => {
    initializeBlogAnimations();
  }, 100);
});

/**
 * Load navigation include
 */
function loadNavigation() {
  fetch('_includes/nav.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('nav-include').innerHTML = data;
      
      // Dispatch custom event to notify that navigation is loaded
      document.dispatchEvent(new CustomEvent('navigationLoaded'));
    })
    .catch(error => {
      console.error('Error loading navigation:', error);
    });
}

/**
 * Initialize GSAP animations for the blog page
 */
function initializeBlogAnimations() {
  // Register GSAP plugins
  if (typeof gsap !== 'undefined' && gsap.registerPlugin) {
    gsap.registerPlugin(ScrollTrigger);
  } else {
    console.error('GSAP or ScrollTrigger plugin not loaded');
    return;
  }

  // Hero section animations
  animateHeroSection();
  
  // Blog posts animations
  animateBlogPosts();
  
  // Newsletter section animation
  animateNewsletterSection();
  
  // Interactive features
  initializeInteractiveFeatures();
}

/**
 * Animate hero section elements
 */
function animateHeroSection() {
  const heroTitle = document.querySelector('.hero-title');
  const heroSubtitle = document.querySelector('.hero-subtitle');
  
  if (!heroTitle || !heroSubtitle) return;

  // Create timeline for hero animations
  const heroTl = gsap.timeline();
  
  heroTl
    .to(heroTitle, {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: "power3.out"
    })
    .to(heroSubtitle, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power2.out"
    }, "-=0.8");
}

/**
 * Animate blog posts with scroll trigger
 */
function animateBlogPosts() {
  const blogPosts = document.querySelectorAll('.blog-post');
  
  if (blogPosts.length === 0) return;

  blogPosts.forEach((post, index) => {
    gsap.to(post, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: post,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      },
      delay: index * 0.1 // Stagger effect
    });

    // Add hover animation enhancement
    post.addEventListener('mouseenter', () => {
      gsap.to(post.querySelector('.post-image img'), {
        scale: 1.05,
        duration: 0.4,
        ease: "power2.out"
      });
    });

    post.addEventListener('mouseleave', () => {
      gsap.to(post.querySelector('.post-image img'), {
        scale: 1,
        duration: 0.4,
        ease: "power2.out"
      });
    });
  });
}

/**
 * Animate newsletter section
 */
function animateNewsletterSection() {
  const newsletterContent = document.querySelector('.newsletter-content');
  
  if (!newsletterContent) return;

  gsap.fromTo(newsletterContent, 
    {
      opacity: 0,
      y: 50
    },
    {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: newsletterContent,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      }
    }
  );
}

/**
 * Initialize interactive features
 */
function initializeInteractiveFeatures() {
  initializeLoadMoreButton();
  initializeNewsletterForm();
  initializeSmoothScrolling();
}

/**
 * Initialize load more button functionality
 */
function initializeLoadMoreButton() {
  const loadMoreBtn = document.querySelector('.load-more-btn');
  
  if (!loadMoreBtn) return;

  loadMoreBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Add loading animation
    const originalText = loadMoreBtn.innerHTML;
    loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    loadMoreBtn.disabled = true;
    
    // Simulate loading delay
    setTimeout(() => {
      // Reset button
      loadMoreBtn.innerHTML = originalText;
      loadMoreBtn.disabled = false;
      
      // Add feedback animation
      gsap.fromTo(loadMoreBtn, 
        { scale: 0.95 },
        { 
          scale: 1, 
          duration: 0.3, 
          ease: "back.out(1.7)" 
        }
      );
      
      // You can add logic here to load more posts
      console.log('Loading more blog posts...');
    }, 1500);
  });
}

/**
 * Initialize newsletter form
 */
function initializeNewsletterForm() {
  const newsletterForm = document.querySelector('.newsletter-form');
  
  if (!newsletterForm) return;

  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const emailInput = newsletterForm.querySelector('input[type="email"]');
    const submitBtn = newsletterForm.querySelector('button');
    const email = emailInput.value;
    
    if (!email) return;
    
    // Add success animation
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-check"></i> Subscribed!';
    submitBtn.style.background = '#10B981';
    
    // Reset form
    emailInput.value = '';
    
    // Reset button after delay
    setTimeout(() => {
      submitBtn.innerHTML = originalBtnText;
      submitBtn.style.background = '';
    }, 3000);
    
    // Add success feedback animation
    gsap.fromTo(submitBtn, 
      { scale: 0.95 },
      { 
        scale: 1, 
        duration: 0.4, 
        ease: "back.out(1.7)" 
      }
    );
    
    console.log('Newsletter subscription:', email);
  });
}

/**
 * Initialize smooth scrolling for better UX
 */
function initializeSmoothScrolling() {
  // Add smooth scrolling behavior
  document.documentElement.style.scrollBehavior = 'smooth';
  
  // Enhanced scroll animations for better performance
  gsap.registerEffect({
    name: "fadeInUp",
    effect: (targets, config) => {
      return gsap.fromTo(targets, 
        { 
          opacity: 0, 
          y: config.distance || 50 
        },
        { 
          opacity: 1, 
          y: 0, 
          duration: config.duration || 0.8,
          ease: config.ease || "power2.out",
          stagger: config.stagger || 0
        }
      );
    },
    defaults: { duration: 0.8 }
  });
}

/**
 * Handle page visibility changes for performance
 */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause animations when page is not visible
    gsap.globalTimeline.pause();
  } else {
    // Resume animations when page becomes visible
    gsap.globalTimeline.resume();
  }
});

/**
 * Error handling wrapper
 */
function safeBlogInitialization() {
  try {
    initializeBlogAnimations();
  } catch (error) {
    console.error('Error initializing blog animations:', error);
  }
}

// Intersection Observer for performance optimization
const observeElements = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '50px'
  });

  // Observe all blog posts
  document.querySelectorAll('.blog-post').forEach(post => {
    observer.observe(post);
  });
};

// Initialize observer when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', observeElements);
} else {
  observeElements();
}