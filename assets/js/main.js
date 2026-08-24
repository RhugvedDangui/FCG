"use strict";

// Initialize theme immediately to prevent white flash
(function initThemeImmediate() {
  const savedTheme = localStorage.getItem("theme") || "light";
  if (savedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();

document.addEventListener("DOMContentLoaded", () => {
  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  // Initialize functionalities that don't depend on navigation
  initAnimations();
  initEventsFilter();
  initBannerCarousel();

  // Initialize navigation-dependent functionalities after navigation is loaded
  initNavigationDependentFeatures();
});

// Listen for navigation loaded event
document.addEventListener("navigationLoaded", () => {
  initNavigationDependentFeatures();
});

function initNavigationDependentFeatures() {
  // Initialize all navigation-related functionalities
  initNavbarAnimation();
  initThemeToggle();
  initMobileMenu();
  initNavbarScrollEffect();
  initSmoothScroll();
}

/**
 * Initializes navbar entrance animations
 */
function initNavbarAnimation() {
  // Animate navbar elements on page load
  const navbarTl = gsap.timeline({ delay: 0.1 });

  navbarTl
    .to(".nav-brand", {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: "power3.out"
    })
    .to(
      ".nav-link",
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.1
      },
      "-=0.6"
    )
    .to(
      ".theme-toggle",
      {
        opacity: 1,
        x: 0,
        duration: 0.6,
        ease: "power2.out"
      },
      "-=0.4"
    )
    .to(
      ".nav-hamburger",
      {
        opacity: 1,
        x: 0,
        duration: 0.6,
        ease: "power2.out"
      },
      "-=0.6"
    );
}

/**
 * Initializes all the GSAP animations for the page elements.
 */
function initAnimations() {
  // --- Hero Section Animation ---
  const heroTl = gsap.timeline({ delay: 0.3 });

  // Set initial state for hero elements
  gsap.set(
    [
      ".hero-badge",
      ".hero-title",
      ".hero-description",
      ".hero-stats-inline",
      ".hero-actions",
      ".hero-svg-container",
      ".floating-stats",
      ".scroll-indicator"
    ],
    { opacity: 0, y: 40 }
  );
  gsap.set(".hero-svg-container", { scale: 0.8, rotation: -5 });
  gsap.set(".floating-stats .floating-stat", { x: 50, opacity: 0 });

  heroTl
    .to(".hero-badge", { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })
    .to(
      ".hero-title",
      { opacity: 1, y: 0, duration: 1.0, ease: "power3.out" },
      "-=0.6"
    )
    .to(
      ".hero-description",
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
      "-=0.8"
    )
    .to(
      ".hero-stats-inline",
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      "-=0.6"
    )
    .to(
      ".hero-actions",
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      "-=0.4"
    )
    .to(
      ".hero-svg-container",
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotation: 0,
        duration: 1.0,
        ease: "back.out(1.2)"
      },
      "-=0.6"
    )

    .to(
      ".floating-stats .floating-stat",
      { opacity: 1, x: 0, duration: 0.6, ease: "power2.out", stagger: 0.2 },
      "-=0.4"
    )
    .to(
      ".scroll-indicator",
      { opacity: 1, y: 0, duration: 1.0, ease: "bounce.out" },
      "-=0.2"
    );

  // --- General Scroll-Triggered Animations ---
  const sections = gsap.utils.toArray("section");

  sections.forEach((section) => {
    const header = section.querySelector(".section-header");
    const cards = gsap.utils.toArray(
      section.querySelectorAll(
        ".activity-card, .community-card, .benefit-card, .testimonial-card, .event-item, .location-card, .stat-card"
      )
    );

    // Animate section headers
    if (header) {
      gsap.from(header, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: header,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      });
    }

    // Animate cards within the section
    if (cards.length) {
      // Set initial state to prevent layout shifts
      gsap.set(cards, { opacity: 0, y: 20 });

      gsap.to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.15,
        scrollTrigger: {
          trigger: cards[0],
          start: "top 90%",
          end: "bottom 20%",
          toggleActions: "play none none none",
          once: true
        }
      });
    }
  });

  // Animate CTA section separately for more control
  const ctaContent = document.querySelector(".cta-content");
  if (ctaContent) {
    gsap.from(ctaContent.children, {
      opacity: 0,
      y: 50,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.2,
      scrollTrigger: {
        trigger: ctaContent,
        start: "top 85%",
        toggleActions: "play none none reverse"
      }
    });
  }

  // Animate newsletter section
  const newsletterContent = document.querySelector(".newsletter-content");
  if (newsletterContent) {
    gsap.from(newsletterContent.children, {
      opacity: 0,
      x: (i) => (i % 2 === 0 ? -50 : 50),
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.2,
      scrollTrigger: {
        trigger: newsletterContent,
        start: "top 85%",
        toggleActions: "play none none reverse"
      }
    });
  }

  // Counter animation for stats
  const statNumbers = document.querySelectorAll(".stat-number");
  statNumbers.forEach((stat) => {
    const finalNumber = stat.textContent;
    const isPercentage = finalNumber.includes("%");
    const isPlus = finalNumber.includes("+");
    const numericValue = parseInt(finalNumber.replace(/[^\d]/g, ""));

    gsap.from(stat, {
      textContent: 0,
      duration: 0.8,
      ease: "power3.out",
      snap: { textContent: 1 },
      scrollTrigger: {
        trigger: stat,
        start: "top 85%",
        toggleActions: "play none none reverse"
      },
      onUpdate: function () {
        const current = Math.ceil(this.targets()[0].textContent);
        stat.textContent =
          current + (isPlus ? "+" : "") + (isPercentage ? "%" : "");
      }
    });
  });
}

/**
 * Handles the theme switching (light/dark mode).
 */
function initThemeToggle() {
  const themeToggle = document.getElementById("themeToggle");
  if (!themeToggle || themeToggle.dataset.themeInitialized) return;
  themeToggle.dataset.themeInitialized = "true";

  const updateThemeIcons = (isDark) => {
    const mainIcon = themeToggle.querySelector("i");
    const mobileThemeToggle = document.getElementById("mobileThemeToggle");

    if (mainIcon) {
      mainIcon.className = isDark ? "fas fa-sun" : "fas fa-moon";
    }

    if (mobileThemeToggle) {
      const mobileIcon = mobileThemeToggle.querySelector("i");
      const mobileText = mobileThemeToggle.querySelector("span");
      if (mobileIcon) {
        mobileIcon.className = isDark ? "fas fa-sun" : "fas fa-moon";
      }
      if (mobileText) {
        mobileText.textContent = isDark ? "Light Mode" : "Dark Mode";
      }
    }
  };

  // Load saved theme or default to light
  const savedTheme = localStorage.getItem("theme") || "light";
  if (savedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }

  // Set initial theme icons
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  updateThemeIcons(isDark);

  themeToggle.addEventListener("click", () => {
    const currentlyDark = document.documentElement.hasAttribute("data-theme");
    if (currentlyDark) {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
      updateThemeIcons(false);
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
      updateThemeIcons(true);
    }

    // Add a small GSAP animation to the theme toggle
    gsap.to(themeToggle, {
      scale: 0.9,
      duration: 0.1,
      ease: "power2.out",
      yoyo: true,
      repeat: 1
    });
  });
}

/**
 * Manages the mobile navigation menu.
 */
function initMobileMenu() {
  const navHamburger = document.getElementById("navHamburger");
  const mobileMenuOverlay = document.getElementById("mobileMenuOverlay");
  if (!navHamburger || !mobileMenuOverlay) return;
  if (navHamburger.dataset.menuInitialized) return;
  navHamburger.dataset.menuInitialized = "true";

  const mobileCloseBtn = document.getElementById("mobileCloseBtn");
  const mobileThemeToggle = document.getElementById("mobileThemeToggle");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");

  let isOpen = false;
  let menuTimeline = null;

  const openMenu = () => {
    if (isOpen) return;
    isOpen = true;

    navHamburger.classList.add("active");
    mobileMenuOverlay.style.visibility = "visible";

    // Set initial states
    gsap.set(mobileMenuOverlay, { x: "100%", opacity: 1 });
    gsap.set(".mobile-menu-header", { y: -20, opacity: 0 });
    gsap.set(mobileNavLinks, { x: 40, opacity: 0 });
    gsap.set(".mobile-menu-footer", { y: 20, opacity: 0 });

    menuTimeline = gsap.timeline();
    menuTimeline
      .to(mobileMenuOverlay, {
        x: "0%",
        duration: 0.35,
        ease: "power3.out"
      })
      .to(".mobile-menu-header", {
        y: 0,
        opacity: 1,
        duration: 0.25,
        ease: "power2.out"
      }, "-=0.15")
      .to(mobileNavLinks, {
        x: 0,
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
        stagger: { each: 0.05, from: "start" }
      }, "-=0.15")
      .to(".mobile-menu-footer", {
        y: 0,
        opacity: 1,
        duration: 0.2,
        ease: "power2.out"
      }, "-=0.1");

    document.body.style.overflow = "hidden";
  };

  const closeMenu = () => {
    if (!isOpen) return;
    isOpen = false;

    navHamburger.classList.remove("active");

    menuTimeline = gsap.timeline();
    menuTimeline
      .to(mobileNavLinks, {
        x: 40,
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        stagger: { each: 0.03, from: "end" }
      })
      .to(mobileMenuOverlay, {
        x: "100%",
        duration: 0.3,
        ease: "power3.in",
        onComplete: () => {
          mobileMenuOverlay.style.visibility = "hidden";
          gsap.set(mobileMenuOverlay, { x: "100%" });
          gsap.set(".mobile-menu-header, .mobile-menu-footer", { opacity: 1, y: 0 });
        }
      }, "-=0.1");

    document.body.style.overflow = "";
  };

  // Event listeners
  navHamburger.addEventListener("click", openMenu);
  mobileCloseBtn.addEventListener("click", closeMenu);

  // Close menu when clicking on overlay
  mobileMenuOverlay.addEventListener("click", (e) => {
    if (e.target === mobileMenuOverlay) {
      closeMenu();
    }
  });

  // Close menu when clicking on nav links
  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  // Mobile theme toggle
  if (mobileThemeToggle) {
    mobileThemeToggle.addEventListener("click", () => {
      const themeToggle = document.getElementById("themeToggle");
      if (themeToggle) {
        themeToggle.click(); // Trigger the main theme toggle
      }
    });
  }

  // Handle escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) {
      closeMenu();
    }
  });

  // Add hover effects with GSAP
  mobileNavLinks.forEach((link) => {
    const icon = link.querySelector(".link-icon");

    link.addEventListener("mouseenter", () => {
      gsap.to(icon, {
        scale: 1.2,
        rotation: 5,
        duration: 0.3,
        ease: "power2.out"
      });
    });

    link.addEventListener("mouseleave", () => {
      gsap.to(icon, {
        scale: 1,
        rotation: 0,
        duration: 0.3,
        ease: "power2.out"
      });
    });
  });
}

/**
 * Adds a visual effect to the navbar on scroll.
 */
function initNavbarScrollEffect() {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;

  ScrollTrigger.create({
    start: "top -60",
    end: 99999,
    toggleClass: { className: "navbar-scrolled", targets: navbar }
  });
}

/**
 * Enables smooth scrolling for all anchor links.
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        gsap.to(window, {
          duration: 1,
          scrollTo: {
            y: targetElement,
            offsetY: 80 // Offset for fixed navbar
          },
          ease: "power2.inOut"
        });
      }
    });
  });

  // Add smooth scroll functionality for "Start Your Journey" button
  const startJourneyBtn = document.getElementById('startJourneyBtn');
  if (startJourneyBtn) {
    startJourneyBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const eventsSection = document.getElementById('events');
      
      if (eventsSection) {
        gsap.to(window, {
          duration: 0.5,
          scrollTo: {
            y: eventsSection,
            offsetY: 80 // Offset for fixed navbar
          },
          ease: "power2.inOut"
        });
      }
    });
  }
}

/**
 * Load events data for home carousel
 */
async function loadEventsForCarousel() {
  try {
    console.log('Loading events for carousel...');
    
    // Fetch events from API
    const response = await fetch('api/events/get-events.php?active=true');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.data && data.data.length > 0) {
      // Replace static content with dynamic events
      replaceStaticEventsWithDynamic(data.data.slice(0, 4)); // Take first 4 events
      console.log('Events loaded for carousel:', data.data.length, 'events');
      return true;
    } else {
      throw new Error(data.message || 'No events available');
    }
    
  } catch (error) {
    console.error('Error loading events for carousel:', error);
    console.log('No events available - showing empty state');
    showNoEventsMessage();
    return false;
  }
}

/**
 * Replace static events with dynamic content
 */
function replaceStaticEventsWithDynamic(events) {
  const eventsSlider = document.querySelector('.events-slider');
  if (!eventsSlider) return;
  
  // Clear existing content
  eventsSlider.innerHTML = '';
  
  events.forEach((event, index) => {
    const slide = createCarouselEventSlide(event, index === 0);
    eventsSlider.appendChild(slide);
  });
  
  // Update navigation dots
  updateCarouselDots(events.length);
}

/**
 * Show "No Events Available" message
 */
function showNoEventsMessage() {
  const eventsSlider = document.querySelector('.events-slider');
  const sliderContainer = document.querySelector('.events-slider-container');
  
  if (!eventsSlider || !sliderContainer) return;
  
  // Clear existing content
  eventsSlider.innerHTML = '';
  
  // Create empty state message
  const emptyState = document.createElement('div');
  emptyState.className = 'events-empty-state';
  emptyState.innerHTML = `
    <div class="empty-state-content">
      <div class="empty-state-icon">
        <i class="fas fa-calendar-times"></i>
      </div>
      <h3 class="empty-state-title">No Events Available</h3>
      <p class="empty-state-message">There are currently no upcoming events scheduled. Check back soon for new fitness events and challenges!</p>
      <a href="events.html" class="btn-view-all-events">
        <span>View All Events</span>
        <i class="fas fa-arrow-right"></i>
      </a>
    </div>
  `;
  
  eventsSlider.appendChild(emptyState);
  
  // Hide navigation controls
  const navigation = document.querySelector('.slider-navigation');
  if (navigation) {
    navigation.style.display = 'none';
  }
}

/**
 * Create event slide for carousel
 */
function createCarouselEventSlide(event, isActive = false) {
  const slide = document.createElement('div');
  slide.className = `event-slide ${isActive ? 'active' : ''}`;
  
  // Format date
  const eventDate = new Date(event.date);
  const day = eventDate.getDate().toString().padStart(2, '0');
  const month = eventDate.toLocaleDateString('en-US', { month: 'short' });
  
  // Get event type icon and category
  const typeIcon = getEventTypeIcon(event.type);
  const categoryName = getEventCategoryName(event.type);
  
  // Format price
  const isEventFree = !event.is_paid || !event.amount || parseFloat(event.amount) === 0;
  const priceText = isEventFree ? 'FREE' : `₹${event.amount}`;
  
  slide.innerHTML = `
    <div class="event-card-slider">
      <div class="event-image-bg" style="background: linear-gradient(135deg, rgba(255, 107, 53, 0.9), rgba(255, 107, 53, 0.7)), url('${event.image || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop'}') center/cover;"></div>
      <div class="event-content-overlay">
        <div class="event-date-badge">
          <div class="date-number">${day}</div>
          <div class="date-month">${month}</div>
        </div>
        <div class="event-info">
          <div class="event-category-tag">
            <i class="${typeIcon}"></i>
            <span>${categoryName}</span>
          </div>
          <h3 class="event-title">${event.title}</h3>
          <p class="event-description">${event.description ? event.description.substring(0, 120) + '...' : 'Join us for an amazing fitness experience!'}</p>
          <div class="event-meta">
            <div class="meta-item">
              <i class="fas fa-map-marker-alt"></i>
              <span>${event.location || 'Location TBA'}</span>
            </div>
            <div class="meta-item">
              <i class="fas fa-clock"></i>
              <span>${event.formatted_time || '6:00 AM'}</span>
            </div>
            <div class="meta-item">
              <i class="fas fa-users"></i>
              <span>Open Registration</span>
            </div>
          </div>
          <div class="event-action">
            <div class="event-price">
              <span class="price">${priceText}</span>
              ${!isEventFree ? '<span class="price-label">onwards</span>' : ''}
            </div>
            <button class="btn-register" onclick="redirectToEventPage('${event.id}')">
              <span>Register Now</span>
              <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  return slide;
}

/**
 * Get icon for event type
 */
function getEventTypeIcon(type) {
  const iconMap = {
    'running': 'fas fa-running',
    'cycling': 'fas fa-bicycle', 
    'challenge': 'fas fa-trophy',
    'steps': 'fas fa-walking',
    'multi': 'fas fa-medal'
  };
  return iconMap[type] || 'fas fa-calendar-alt';
}

/**
 * Get category name for display
 */
function getEventCategoryName(type) {
  const nameMap = {
    'running': 'Running',
    'cycling': 'Cycling',
    'challenge': 'Challenge', 
    'steps': 'Steps Challenge',
    'multi': 'Multi-Sport'
  };
  return nameMap[type] || 'Fitness Event';
}

/**
 * Update carousel navigation dots
 */
function updateCarouselDots(eventCount) {
  const dotsContainer = document.querySelector('.slider-dots');
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    
    for (let i = 0; i < eventCount; i++) {
      const dot = document.createElement('span');
      dot.className = `dot ${i === 0 ? 'active' : ''}`;
      dot.setAttribute('data-slide', i);
      dotsContainer.appendChild(dot);
    }
  }
}

/**
 * Redirect to event page for registration
 */
function redirectToEventPage(eventId) {
  window.location.href = `event-registration.html?event=${eventId}`;
}

/**
 * Infinite Events Slider with GSAP
 */
async function initEventsFilter() {
  // Try to load dynamic events first
  await loadEventsForCarousel();
  
  // Small delay to ensure DOM is updated
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const slider = document.querySelector(".events-slider");
  const slides = document.querySelectorAll(".event-slide");
  const dots = document.querySelectorAll(".dot");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  if (!slides.length || !slider) return;

  let currentIndex = 0;
  let isAnimating = false;
  let autoSlideInterval;
  const slideCount = slides.length;

  // Clone slides for infinite effect
  function setupInfiniteSlider() {
    // Clone first and last slides
    const firstSlideClone = slides[0].cloneNode(true);
    const lastSlideClone = slides[slideCount - 1].cloneNode(true);

    firstSlideClone.classList.add("clone");
    lastSlideClone.classList.add("clone");

    slider.appendChild(firstSlideClone);
    slider.insertBefore(lastSlideClone, slides[0]);

    // Update slider width to accommodate all slides + clones
    const totalSlides = slideCount + 2;
    slider.style.width = `${totalSlides * 100}%`;

    // Position slides
    const allSlides = slider.querySelectorAll(".event-slide");
    allSlides.forEach((slide, index) => {
      slide.style.left = `${(index * 100) / totalSlides}%`;
      slide.style.width = `${100 / totalSlides}%`;
    });

    // Set initial position (accounting for the cloned last slide at the beginning)
    gsap.set(slider, { x: `-${100 / totalSlides}%` });
    currentIndex = 0;

    // Set initial active states
    updateActiveStates();
  }

  // Update active states for slides and dots
  function updateActiveStates() {
    // Update dots
    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === currentIndex);
    });

    // Update slides content animation
    const allSlides = slider.querySelectorAll(".event-slide");
    allSlides.forEach((slide, index) => {
      const isActive = index === currentIndex + 1; // +1 because of cloned slide at start
      const content = slide.querySelector(".event-content-overlay");
      const imageBg = slide.querySelector(".event-image-bg");

      if (isActive) {
        gsap.to(content, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          delay: 0.3
        });
        gsap.to(imageBg, {
          scale: 1.05,
          duration: 0.8,
          ease: "power3.out"
        });
      } else {
        gsap.set(content, {
          opacity: 0,
          y: 30
        });
        gsap.set(imageBg, {
          scale: 1
        });
      }
    });
  }

  // Slide animation function
  function slideToIndex(index, direction = "next") {
    if (isAnimating) return;
    isAnimating = true;

    const slideWidth = 100 / (slideCount + 2);
    const targetX = -((index + 1) * slideWidth);

    gsap.to(slider, {
      x: `${targetX}%`,
      duration: 0.8,
      ease: "power3.inOut",
      onComplete: () => {
        // Handle infinite loop transitions
        if (index >= slideCount) {
          // We've gone past the last real slide, jump to first
          currentIndex = 0;
          gsap.set(slider, { x: `-${slideWidth}%` });
        } else if (index < 0) {
          // We've gone before the first real slide, jump to last
          currentIndex = slideCount - 1;
          gsap.set(slider, { x: `-${slideCount * slideWidth}%` });
        } else {
          currentIndex = index;
        }

        updateActiveStates();
        isAnimating = false;

        // Restart auto slide
        stopAutoSlide();
        startAutoSlide();
      }
    });

    // Immediate update for smooth UX
    if (index >= 0 && index < slideCount) {
      currentIndex = index;
    }
    updateActiveStates();
  }

  // Next slide
  function nextSlide() {
    if (isAnimating) return;
    slideToIndex(currentIndex + 1, "next");
  }

  // Previous slide
  function prevSlide() {
    if (isAnimating) return;
    slideToIndex(currentIndex - 1, "prev");
  }

  // Go to specific slide
  function goToSlide(index) {
    if (isAnimating || index === currentIndex) return;
    slideToIndex(index);
  }

  // Auto slide functionality
  function startAutoSlide() {
    stopAutoSlide();
    autoSlideInterval = setInterval(nextSlide, 4000);
  }

  function stopAutoSlide() {
    if (autoSlideInterval) {
      clearInterval(autoSlideInterval);
      autoSlideInterval = null;
    }
  }

  // Event listeners
  if (nextBtn) {
    nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      nextSlide();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", (e) => {
      e.preventDefault();
      prevSlide();
    });
  }

  // Dot navigation
  dots.forEach((dot, index) => {
    dot.addEventListener("click", (e) => {
      e.preventDefault();
      goToSlide(index);
    });
  });

  // Pause auto slide on hover
  const sliderContainer = document.querySelector(".events-slider-container");
  if (sliderContainer) {
    sliderContainer.addEventListener("mouseenter", stopAutoSlide);
    sliderContainer.addEventListener("mouseleave", startAutoSlide);
  }

  // Touch/swipe support for mobile
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartTime = 0;

  if (slider) {
    slider.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartTime = Date.now();
        stopAutoSlide();
      },
      { passive: true }
    );

    slider.addEventListener(
      "touchmove",
      (e) => {
        if (isAnimating) return;

        const touchCurrentX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchCurrentX;
        const slideWidth = 100 / (slideCount + 2);
        const currentX = -((currentIndex + 1) * slideWidth);
        const dragPercent = (diff / slider.offsetWidth) * 100;

        gsap.set(slider, { x: `${currentX - dragPercent}%` });
      },
      { passive: true }
    );

    slider.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const touchTime = Date.now() - touchStartTime;
        handleSwipe(touchTime);
      },
      { passive: true }
    );
  }

  function handleSwipe(touchTime) {
    const swipeThreshold = 50;
    const quickSwipeTime = 300; // ms
    const diff = touchStartX - touchEndX;

    if (
      Math.abs(diff) > swipeThreshold ||
      (Math.abs(diff) > 20 && touchTime < quickSwipeTime)
    ) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    } else {
      // Snap back to current slide
      slideToIndex(currentIndex);
    }
  }

  // Keyboard navigation
  function handleKeyboard(e) {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevSlide();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nextSlide();
    }
  }

  document.addEventListener("keydown", handleKeyboard);

  // Scroll trigger animation for slider entrance
  ScrollTrigger.create({
    trigger: ".events-slider-container",
    start: "top 80%",
    onEnter: () => {
      gsap.from(".events-slider-container", {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      });
    }
  });

  // Initialize the slider
  setupInfiniteSlider();
  startAutoSlide();

  // Cleanup function for potential memory leaks
  window.addEventListener("beforeunload", () => {
    stopAutoSlide();
    document.removeEventListener("keydown", handleKeyboard);
  });
}


/**
 * =========================================
 * EVENTS HERO BANNER — Full screen auto-slider
 * =========================================
 */
async function initBannerCarousel() {
  const slidesEl  = document.getElementById('ehbSlides');
  const contentEl = document.getElementById('ehbContent');
  const dotsEl    = document.getElementById('ehbDots');
  const prevBtn   = document.getElementById('ehbPrev');
  const nextBtn   = document.getElementById('ehbNext');
  const progressBar = document.getElementById('ehbProgressBar');

  if (!slidesEl || !contentEl) return;

  const INTERVAL = 5000; // ms per slide
  let current = 0;
  let timer = null;
  let events = [];

  const typeConfig = {
    running:   { icon: 'fa-running',  label: 'Running'     },
    cycling:   { icon: 'fa-bicycle',  label: 'Cycling'     },
    steps:     { icon: 'fa-walking',  label: 'Steps'       },
    challenge: { icon: 'fa-trophy',   label: 'Challenge'   },
    multi:     { icon: 'fa-medal',    label: 'Multi-Sport' },
  };

  function getType(type) {
    return typeConfig[type] || { icon: 'fa-calendar', label: type };
  }

  /**
   * Sample dominant color from an image using canvas
   * Returns {r, g, b} of the average color of the left 30% of the image
   */
  function sampleImageColor(imgUrl, callback) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
      try {
        const canvas = document.createElement('canvas');
        const sampleW = Math.floor(img.width * 0.3); // left 30% where text sits
        const sampleH = img.height;
        canvas.width  = sampleW;
        canvas.height = sampleH;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, sampleW, sampleH, 0, 0, sampleW, sampleH);

        const data = ctx.getImageData(0, 0, sampleW, sampleH).data;
        let r = 0, g = 0, b = 0, count = 0;

        // Sample every 20th pixel for speed
        for (let i = 0; i < data.length; i += 4 * 20) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }

        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);

        callback({ r, g, b });
      } catch (e) {
        // CORS or canvas error — use default dark
        callback({ r: 0, g: 0, b: 0 });
      }
    };
    img.onerror = () => callback({ r: 0, g: 0, b: 0 });
    img.src = imgUrl;
  }

  /**
   * Build overlay gradient that blends with image colors
   * Dark areas get a lighter complementary overlay, bright areas get darker overlay
   */
  function buildOverlay(color) {
    const brightness = (0.299 * color.r + 0.587 * color.g + 0.114 * color.b);
    const { r, g, b } = color;

    // Darken/blend the sampled color heavily for the strong side
    const strong = `rgba(${Math.round(r * 0.3)}, ${Math.round(g * 0.3)}, ${Math.round(b * 0.3)}, 0.92)`;
    const mid    = `rgba(${Math.round(r * 0.2)}, ${Math.round(g * 0.2)}, ${Math.round(b * 0.2)}, 0.6)`;
    const fade   = `rgba(${r}, ${g}, ${b}, 0.1)`;

    return `linear-gradient(to right, ${strong} 0%, ${mid} 45%, ${fade} 100%)`;
  }

  function buildSlides(evts) {
    slidesEl.innerHTML = '';
    evts.forEach((ev, i) => {
      const slide = document.createElement('div');
      slide.className = `ehb-slide${i === 0 ? ' active' : ''}`;
      slide.style.setProperty('--slide-overlay', 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.2) 100%)');

      if (ev.image) {
        slide.style.backgroundImage = `url('${ev.image}')`;

        // Sample image color and update overlay
        sampleImageColor(ev.image, (color) => {
          const overlay = buildOverlay(color);
          slide.style.setProperty('--slide-overlay', overlay);
        });
      } else {
        slide.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)';
      }

      slidesEl.appendChild(slide);
    });
  }

  function buildDots(count) {
    dotsEl.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('button');
      dot.className = `ehb-dot${i === 0 ? ' active' : ''}`;
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(dot);
    }
  }

  function updateContent(ev, idx) {
    const t = getType(ev.type);
    const isFree = !ev.is_paid || !ev.amount || parseFloat(ev.amount) === 0;
    const priceHtml = isFree
      ? `<span class="ehb-price free"><i class="fas fa-check-circle"></i> Free Entry</span>`
      : `<span class="ehb-price"><span class="ehb-price-symbol">₹</span>${parseFloat(ev.amount).toLocaleString('en-IN')}</span>`;

    const contactHtml = (ev.contact_name || ev.contact_phone || ev.contact_email) ? `
      <div class="ehb-contact">
        <div class="ehb-contact-label"><i class="fas fa-headset"></i> For Queries</div>
        <div class="ehb-contact-items">
          ${ev.contact_name  ? `<div class="ehb-contact-row"><i class="fas fa-user"></i> ${ev.contact_name}</div>` : ''}
          ${ev.contact_phone ? `<div class="ehb-contact-row"><i class="fas fa-phone"></i> <a href="tel:${ev.contact_phone}">${ev.contact_phone}</a></div>` : ''}
          ${ev.contact_email ? `<div class="ehb-contact-row"><i class="fas fa-envelope"></i> <a href="mailto:${ev.contact_email}">${ev.contact_email}</a></div>` : ''}
        </div>
      </div>` : '';

    const extraInfoHtml = (ev.extra_info && ev.extra_info.length) ? ev.extra_info.map(block => `
      <div class="ehb-meta-item ehb-extra-row">
        <i class="fas fa-circle-info"></i>
        <span><strong>${block.label || ''}:</strong> ${block.content || ''}</span>
      </div>`).join('') : '';

    const eventDetailsHtml = ev.event_details ? `
      <div class="ehb-event-details">${ev.event_details}</div>` : '';

    contentEl.innerHTML = `
      <h2 class="ehb-title">${ev.title}</h2>
      <div class="ehb-meta">
        <div class="ehb-meta-item"><i class="fas fa-calendar-alt"></i> ${ev.formatted_date || ev.date}</div>
        <div class="ehb-meta-item"><i class="fas fa-clock"></i> ${ev.formatted_time || ev.start_time}</div>
        <div class="ehb-meta-item"><i class="fas fa-map-marker-alt"></i> ${ev.location || 'Goa'}</div>
        ${extraInfoHtml}
      </div>
      ${eventDetailsHtml}
      ${contactHtml}
      <div class="ehb-actions">
        ${priceHtml}
        <a href="event-registration.html?event=${ev.id}" class="ehb-register-btn">
          Register Now <i class="fas fa-arrow-right"></i>
        </a>
      </div>
    `;

    // Animate content in
    requestAnimationFrame(() => {
      contentEl.querySelectorAll('.ehb-title, .ehb-meta, .ehb-extra-info, .ehb-event-details, .ehb-contact, .ehb-actions').forEach(el => {
        el.classList.add('visible');
      });
    });

    // Update counter
    const counter = document.querySelector('.ehb-counter');
    if (counter) counter.innerHTML = `<span>${idx + 1}</span> / ${events.length}`;
  }

  function goTo(idx) {
    const slideEls = slidesEl.querySelectorAll('.ehb-slide');
    const dotEls   = dotsEl.querySelectorAll('.ehb-dot');

    // Fade out content
    contentEl.querySelectorAll('.ehb-title, .ehb-meta, .ehb-extra-info, .ehb-event-details, .ehb-contact, .ehb-actions').forEach(el => {
      el.classList.remove('visible');
    });

    slideEls[current]?.classList.remove('active');
    dotEls[current]?.classList.remove('active');

    current = (idx + events.length) % events.length;

    slideEls[current]?.classList.add('active');
    dotEls[current]?.classList.add('active');

    setTimeout(() => updateContent(events[current], current), 150);

    // Reset progress bar
    resetProgress();
  }

  function resetProgress() {
    if (progressBar) {
      progressBar.style.transition = 'none';
      progressBar.style.width = '0%';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          progressBar.style.transition = `width ${INTERVAL}ms linear`;
          progressBar.style.width = '100%';
        });
      });
    }
  }

  function startAutoSlide() {
    stopAutoSlide();
    timer = setInterval(() => goTo(current + 1), INTERVAL);
    resetProgress();
  }

  function stopAutoSlide() {
    clearInterval(timer);
  }

  // Fetch events
  try {
    const res  = await fetch('api/events/get-events.php?active=true');
    const data = await res.json();

    if (data.success && data.data && data.data.length > 0) {
      events = data.data;

      buildSlides(events);
      buildDots(events.length);

      // Show the banner now that we have events
      const banner = document.querySelector('.events-hero-banner');
      if (banner) {
        banner.style.display = 'block';
        const counter = document.createElement('div');
        counter.className = 'ehb-counter';
        counter.innerHTML = `<span>1</span> / ${events.length}`;
        banner.appendChild(counter);
      }

      updateContent(events[0], 0);
      startAutoSlide();

      // Nav buttons
      prevBtn?.addEventListener('click', () => { stopAutoSlide(); goTo(current - 1); startAutoSlide(); });
      nextBtn?.addEventListener('click', () => { stopAutoSlide(); goTo(current + 1); startAutoSlide(); });

      // Pause on hover
      slidesEl.addEventListener('mouseenter', stopAutoSlide);
      slidesEl.addEventListener('mouseleave', startAutoSlide);

      // Touch swipe
      let touchStartX = 0;
      banner?.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
      banner?.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
          stopAutoSlide();
          goTo(diff > 0 ? current + 1 : current - 1);
          startAutoSlide();
        }
      }, { passive: true });

    } else {
      // No active events — hide banner, show original hero section
      const banner = document.querySelector('.events-hero-banner');
      if (banner) banner.style.display = 'none';
      const hero = document.getElementById('heroFallback');
      if (hero) hero.style.display = 'block';
    }
  } catch (e) {
    // On error hide banner, show original hero
    const banner = document.querySelector('.events-hero-banner');
    if (banner) banner.style.display = 'none';
    const hero = document.getElementById('heroFallback');
    if (hero) hero.style.display = 'block';
  }
}
