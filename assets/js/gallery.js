// Gallery JavaScript functionality
document.addEventListener("DOMContentLoaded", () => {
  // Load navigation first
  loadNavigation();
  
  // Initialize gallery after a short delay to ensure GSAP is loaded
  setTimeout(() => {
    initializeGallery();
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
 * Initialize the interactive gallery drag functionality
 */
function initializeGallery() {
  // Register GSAP plugins
  if (typeof gsap !== 'undefined' && gsap.registerPlugin) {
    gsap.registerPlugin(Observer);
  } else {
    console.error('GSAP or Observer plugin not loaded');
    return;
  }

  const gallery = document.querySelector(".gallery-wrapper");
  const container = document.querySelector(".gallery-container");

  if (!gallery || !container) {
    console.error('Gallery elements not found');
    return;
  }

  let startX = (window.innerWidth - gallery.offsetWidth) / 2;
  let startY = (window.innerHeight - gallery.offsetHeight) / 2;
  let isDoneCentredAnimation = false;

  // Initial animation to center the gallery
  gsap.to(gallery, {
    x: startX,
    y: startY,
    duration: 4,
    ease: "power4.inOut",
    onComplete: () => {
      isDoneCentredAnimation = true;
    },
  });

  // Create quick animation functions for smooth dragging
  const yQuick = gsap.quickTo(gallery, "y", {
      ease: "sine",
      duration: 1,
    });
  const xQuick = gsap.quickTo(gallery, "x", {
      ease: "sine", 
      duration: 1,
    });

  // Calculate movement boundaries
  const maxX = -(gallery.offsetWidth - window.innerWidth);
  const maxY = -(gallery.offsetHeight - window.innerHeight);

  let xTrack = startX;
  let yTrack = startY;

  // Create observer for drag interactions
  Observer.create({
    type: "pointer,touch",
    onChange: (self) => {
      function runAnimation() {
        xTrack += self.deltaX * 1.5;
        yTrack += self.deltaY * 1.5;

        // Clamp values to boundaries
        xTrack = gsap.utils.clamp(maxX, 0, xTrack);
        yTrack = gsap.utils.clamp(maxY, 0, yTrack);

        yQuick(yTrack);
        xQuick(xTrack);
      }

      // Only allow dragging after initial animation is complete
      if (isDoneCentredAnimation) {
        runAnimation();
      }
    },
    onPress: () => {
      container.classList.add("dragging");
    },
    onRelease: () => {
      container.classList.remove("dragging");
    },
    tolerance: 10,
  });

  // Handle window resize
  window.addEventListener("resize", () => {
    startX = (window.innerWidth - gallery.offsetWidth) / 2;
    startY = (window.innerHeight - gallery.offsetHeight) / 2;

    gsap.set(gallery, {
      x: startX,
      y: startY,
    });

    // Recalculate bounds
    const newMaxX = -(gallery.offsetWidth - window.innerWidth);
    const newMaxY = -(gallery.offsetHeight - window.innerHeight);
    
    xTrack = gsap.utils.clamp(newMaxX, 0, xTrack);
    yTrack = gsap.utils.clamp(newMaxY, 0, yTrack);
  });
}

// Gallery initialization with error handling
function safeInitializeGallery() {
  try {
    initializeGallery();
  } catch (error) {
    console.error('Error initializing gallery:', error);
  }
}