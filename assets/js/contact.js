// Contact Page JavaScript with Heavy GSAP Animations
document.addEventListener("DOMContentLoaded", () => {
  // Load navigation first
  loadNavigation();

  // Initialize contact page animations after a short delay
  setTimeout(() => {
    initializeContactAnimations();
  }, 100);
});

/**
 * Load navigat  // Reset any existing transforms
  gsap.set([animatedLetter, animatedCard], {
    x: 0,
    y: 0,
    scale: 1
  });
  
  // Set initial rotations - letter straight, card tilted
  gsap.set(animatedLetter, {
    rotation: 0
  });
  
  gsap.set(animatedCard, {
    rotation: -12
  });
 */
function loadNavigation() {
  fetch("_includes/nav.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("nav-include").innerHTML = data;

      // Dispatch custom event to notify that navigation is loaded
      document.dispatchEvent(new CustomEvent("navigationLoaded"));
    })
    .catch((error) => {
      console.error("Error loading navigation:", error);
    });
}

/**
 * Initialize all GSAP animations for the contact page
 */
function initializeContactAnimations() {
  // Register GSAP plugins
  if (typeof gsap !== "undefined" && gsap.registerPlugin) {
    gsap.registerPlugin(ScrollTrigger, TextPlugin);
  } else {
    console.error("GSAP plugins not loaded");
    return;
  }

  // Initialize all animation sections
  animateHeroSection();
  animateInfoCards();
  animateContactForm();
  animateFAQSection();
  initializeInteractiveFeatures();
  initializeParallaxEffects();
  animateContactCards();
}

/**
 * Animate hero section with complex animations
 */
function animateHeroSection() {
  const titleLines = document.querySelectorAll(".title-line");
  const subtitle = document.querySelector(".hero-subtitle");
  const shapes = document.querySelectorAll(".shape");

  if (!titleLines.length) return;

  // Create main timeline
  const heroTl = gsap.timeline();

  // Animate title lines with stagger
  heroTl
    .to(titleLines, {
      y: 0,
      opacity: 1,
      duration: 1.2,
      ease: "power3.out",
      stagger: 0.2
    })
    .to(
      subtitle,
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out"
      },
      "-=0.6"
    );

  // Animate background shapes
  shapes.forEach((shape, index) => {
    gsap.set(shape, { scale: 0, rotation: Math.random() * 360 });
    gsap.to(shape, {
      scale: 1,
      duration: 1.5,
      ease: "elastic.out(1, 0.8)",
      delay: index * 0.1
    });
  });

  // Continuous rotation animation for shapes
  shapes.forEach((shape) => {
    gsap.to(shape, {
      rotation: "+=360",
      duration: 20 + Math.random() * 10,
      ease: "none",
      repeat: -1
    });
  });
}

/**
 * Animate info cards with scroll trigger
 */
function animateInfoCards() {
  const infoCards = document.querySelectorAll(".info-card");

  if (!infoCards.length) return;

  infoCards.forEach((card, index) => {
    // Initial animation
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: card,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      },
      delay: index * 0.15
    });

    // Enhanced hover animations
    const cardIcon = card.querySelector(".card-icon");
    const cardContent = card.querySelector(".card-content");

    card.addEventListener("mouseenter", () => {
      gsap
        .timeline()
        .to(cardIcon, {
          scale: 1.2,
          rotation: 10,
          duration: 0.4,
          ease: "back.out(1.7)"
        })
        .to(
          cardContent,
          {
            y: -5,
            duration: 0.3,
            ease: "power2.out"
          },
          "-=0.2"
        );
    });

    card.addEventListener("mouseleave", () => {
      gsap
        .timeline()
        .to(cardIcon, {
          scale: 1,
          rotation: 0,
          duration: 0.4,
          ease: "power2.out"
        })
        .to(
          cardContent,
          {
            y: 0,
            duration: 0.3,
            ease: "power2.out"
          },
          "-=0.2"
        );
    });
  });
}

/**
 * Animate contact form elements
 */
function animateContactForm() {
  const formTitle = document.querySelector(".form-title");
  const formSubtitle = document.querySelector(".form-subtitle");
  const contactForm = document.querySelector(".contact-form");
  const inputGroups = document.querySelectorAll(".input-group");

  if (!formTitle) return;

  // Animate form header
  const formTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".form-wrapper",
      start: "top 70%",
      end: "bottom 30%",
      toggleActions: "play none none reverse"
    }
  });

  formTl
    .to(formTitle, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out"
    })
    .to(
      formSubtitle,
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out"
      },
      "-=0.4"
    )
    .to(
      contactForm,
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
      },
      "-=0.2"
    );

  // Animate input fields on focus
  inputGroups.forEach((group) => {
    const input = group.querySelector("input, select, textarea");
    const label = group.querySelector("label");
    const line = group.querySelector(".input-line");

    if (!input) return;

    // Enhanced animations for select elements
    if (input.tagName === "SELECT") {
      input.addEventListener("focus", () => {
        gsap
          .timeline()
          .to(label, {
            scale: 0.9,
            y: -5,
            color: "var(--accent-primary)",
            duration: 0.3,
            ease: "power2.out"
          })
          .to(
            input,
            {
              y: -3,
              scale: 1.02,
              boxShadow: "0 8px 30px rgba(255, 107, 53, 0.2)",
              duration: 0.4,
              ease: "back.out(1.7)"
            },
            "-=0.2"
          )
          .to(
            line,
            {
              width: "100%",
              duration: 0.4,
              ease: "power2.out"
            },
            "-=0.3"
          );
      });

      input.addEventListener("blur", () => {
        gsap
          .timeline()
          .to(input, {
            y: 0,
            scale: 1,
            boxShadow: "0 4px 15px var(--shadow-light)",
            duration: 0.3,
            ease: "power2.out"
          })
          .to(
            label,
            {
              scale: input.value ? 0.9 : 1,
              y: input.value ? -5 : 0,
              color: input.value
                ? "var(--accent-primary)"
                : "var(--text-primary)",
              duration: 0.3,
              ease: "power2.out"
            },
            "-=0.2"
          )
          .to(
            line,
            {
              width: input.value ? "100%" : "0%",
              duration: 0.4,
              ease: "power2.out"
            },
            "-=0.2"
          );
      });

      input.addEventListener("change", () => {
        // Enhanced selection feedback animation
        gsap
          .timeline()
          .to(input, {
            scale: 0.98,
            duration: 0.1,
            ease: "power2.out"
          })
          .to(input, {
            scale: 1.02,
            duration: 0.2,
            ease: "back.out(1.7)"
          })
          .to(input, {
            scale: 1,
            duration: 0.2,
            ease: "power2.out"
          })
          .to(
            label,
            {
              color: "var(--accent-primary)",
              scale: 0.9,
              y: -5,
              duration: 0.3,
              ease: "power2.out"
            },
            "-=0.4"
          );
      });

      // Add hover animation for select
      input.addEventListener("mouseenter", () => {
        if (document.activeElement !== input) {
          gsap.to(input, {
            y: -1,
            boxShadow: "0 6px 20px var(--shadow-medium)",
            duration: 0.3,
            ease: "power2.out"
          });
        }
      });

      input.addEventListener("mouseleave", () => {
        if (document.activeElement !== input) {
          gsap.to(input, {
            y: 0,
            boxShadow: "0 4px 15px var(--shadow-light)",
            duration: 0.3,
            ease: "power2.out"
          });
        }
      });
    } else {
      // Regular animations for input and textarea
      input.addEventListener("focus", () => {
        gsap
          .timeline()
          .to(label, {
            scale: 0.9,
            y: -5,
            color: "var(--accent-primary)",
            duration: 0.3,
            ease: "power2.out"
          })
          .to(
            line,
            {
              width: "100%",
              duration: 0.4,
              ease: "power2.out"
            },
            "-=0.1"
          );
      });

      input.addEventListener("blur", () => {
        if (!input.value) {
          gsap
            .timeline()
            .to(label, {
              scale: 1,
              y: 0,
              color: "var(--text-primary)",
              duration: 0.3,
              ease: "power2.out"
            })
            .to(
              line,
              {
                width: "0%",
                duration: 0.4,
                ease: "power2.out"
              },
              "-=0.1"
            );
        }
      });
    }
  });
}

/**
 * Animate FAQ section
 */
function animateFAQSection() {
  const faqTitle = document.querySelector(".faq-title");
  const faqSubtitle = document.querySelector(".faq-subtitle");
  const faqItems = document.querySelectorAll(".faq-item");

  if (!faqTitle) return;

  // Animate header
  const faqHeaderTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".faq-header",
      start: "top 80%",
      toggleActions: "play none none reverse"
    }
  });

  faqHeaderTl
    .to(faqTitle, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out"
    })
    .to(
      faqSubtitle,
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out"
      },
      "-=0.4"
    );

  // Animate FAQ items
  faqItems.forEach((item, index) => {
    gsap.to(item, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: item,
        start: "top 85%",
        toggleActions: "play none none reverse"
      },
      delay: index * 0.1
    });
  });
}

/**
 * Animate contact cards scroll trigger entrance
 */
function animateContactCards() {
  const animatedLetter = document.querySelector(".animated-letter");
  const animatedCard = document.querySelector(".animated-card");

  if (!animatedLetter || !animatedCard) {
    console.error("Animated elements not found for scroll trigger!");
    return;
  }

  // Set initial positions off-screen
  gsap.set(animatedLetter, {
    x: -200,
    y: 200,
    opacity: 0,
    rotation: -15
  });

  gsap.set(animatedCard, {
    x: 200,
    y: 200,
    opacity: 0,
    rotation: -30
  });

  // Create scroll trigger animation
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".contact-form-section",
      start: "top 80%",
      end: "bottom 20%",
      toggleActions: "play none none reverse",
      markers: false, // Set to true for debugging
      onStart: () => {
        console.log("Scroll trigger activated!");
      },
      onComplete: () => {
        console.log("Animation completed!");
        // Add levitating animations after entrance
        animatedLetter.classList.add("animate-in");
        animatedCard.classList.add("animate-in");
      }
    }
  });

  // Orange div (slower) - from bottom-left
  tl.to(
    animatedLetter,
    {
      x: 0,
      y: 0,
      opacity: 1,
      rotation: 0,
      duration: 1.8,
      ease: "power3.out"
    },
    0
  )

    // Black div (faster) - from bottom-right
    .to(
      animatedCard,
      {
        x: 0,
        y: 0,
        opacity: 1,
        rotation: -12,
        duration: 1.4,
        ease: "power3.out"
      },
      0.2
    );
}

/**
 * Animate form submission (letter and card animation) - Faster & Smoother Version
 */
function animateFormSubmission() {
  console.log("Starting faster animation...");

  const animatedLetter = document.querySelector(".animated-letter");
  const animatedCard = document.querySelector(".animated-card");
  const formWrapper = document.querySelector(".form-wrapper");
  const contactForm = document.getElementById("contactForm");

  console.log("Elements found:", {
    letter: !!animatedLetter,
    card: !!animatedCard,
    form: !!formWrapper
  });

  if (!animatedLetter || !animatedCard || !formWrapper) {
    console.error("Animation elements not found!");
    return;
  }

  // Delay form clearing until after the animation sequence completes
  setTimeout(() => {
    if (contactForm) {
      contactForm.reset();
      // Clear any remaining values
      const inputs = contactForm.querySelectorAll("input, select, textarea");
      inputs.forEach((input) => {
        input.value = "";
      });
      console.log("Form cleared after animation completion");
    }
  }, 4000); // Clear after 4 seconds to allow animation to complete

  // Initial setup - elements are already visible, just ensure proper state
  gsap.set([animatedLetter, animatedCard], {
    opacity: 1,
    visibility: "visible"
  });

  // Reset any existing transforms
  gsap.set([animatedLetter, animatedCard, formWrapper], {
    x: 0,
    y: 0,
    rotation: 0,
    scale: 1
  });

  // Set initial rotation for letter
  gsap.set(animatedLetter, {
    rotation: 10
  });

  // Ensure card starts with "CONTACT US"
  animatedCard.classList.remove("thank-you");

  let tl = gsap.timeline({
    onStart: () => {
      console.log("Faster timeline started");
      // Animate CONTACT US to THANK YOU after a delay
      setTimeout(() => {
        animateContactUsToThankYou();
      }, 600);
    },
    onComplete: () => console.log("Faster timeline completed"),
    ease: "power2.out"
  });

  // Phase 1: Faster rotation to horizontal positions
  tl.to(
    animatedCard,
    {
      duration: 0.8,
      rotation: 0,
      ease: "power3.out",
      transformOrigin: "center center"
    },
    "rotate"
  )

    .to(
      animatedLetter,
      {
        duration: 0.8,
        rotation: 0,
        ease: "power3.out",
        transformOrigin: "center center"
      },
      "rotate"
    )

    // Phase 2: Faster separation
    .to(
      animatedCard,
      {
        duration: 1.2,
        x: -380,
        ease: "power2.inOut"
      },
      "separate+=0.2"
    )

    .to(
      animatedLetter,
      {
        duration: 1.2,
        x: 400,
        ease: "power2.inOut"
      },
      "separate+=0.2"
    )

    // Phase 3: Quick z-index change and show main content
    .set(animatedLetter, { zIndex: 10 }, "zindex+=0.1")
    .set(animatedCard, { zIndex: 13 }, "zindex+=0.1")

    .call(() => {
      const cardContent = document.querySelector(
        ".animated-card .card-content"
      );
      if (cardContent) {
        // Show the main THANK YOU message
        cardContent.innerHTML = `<h2 class="card-title">THANK YOU</h2>`;
        gsap.to(cardContent, {
          opacity: 1,
          duration: 0.6,
          ease: "back.out(1.4)"
        });
      }
    }, "zindex+=0.2")

    // Phase 4: Faster return
    .to(
      animatedCard,
      {
        duration: 1.5,
        x: 0,
        ease: "power2.inOut"
      },
      "close+=0.6"
    )
    .to(
      animatedLetter,
      {
        duration: 1.5,
        x: 0,
        ease: "power2.inOut"
      },
      "close+=0.6"
    )

    // Phase 5: Faster exit
    .to([animatedLetter, animatedCard], {
      duration: 1.8,
      delay: 0.4,
      x: -1400,
      y: 0,
      ease: "power2.inOut"
    })

    // Add rotation during exit
    .to(
      animatedLetter,
      {
        duration: 1.8,
        delay: 0.4,
        rotation: 12,
        ease: "power2.inOut"
      },
      "<"
    )
    .to(
      animatedCard,
      {
        duration: 1.8,
        delay: 0.4,
        rotation: -12,
        ease: "power2.inOut"
      },
      "<"
    )

    // Phase 6: Quick fade out
    .to(
      [animatedLetter, animatedCard],
      {
        duration: 0.8,
        opacity: 0,
        scale: 0.8,
        ease: "power2.inOut",
        onComplete: () => {
          console.log("Faster animation completed, resetting...");

          // Quick reset all elements
          gsap.set([animatedLetter, animatedCard], {
            x: 0,
            y: 0,
            opacity: 1,
            scale: 1
          });

          // Reset to initial rotations
          gsap.set(animatedLetter, {
            rotation: 0,
            zIndex: 12
          });

          gsap.set(animatedCard, {
            rotation: -12,
            zIndex: 11
          });

          // Hide main content and reset vertical text
          const cardContent = document.querySelector(
            ".animated-card .card-content"
          );
          if (cardContent) {
            cardContent.innerHTML = "";
            gsap.set(cardContent, { opacity: 0 });
          }

          // Reset vertical text back to "CONTACT US"
          setTimeout(() => {
            animatedCard.classList.remove("thank-you");
          }, 200);

          // Show success message
          setTimeout(() => {
            showAnimatedSuccessMessage();
          }, 500);
        }
      },
      "-=0.2"
    );
}

/**
 * Animate CONTACT US changing to THANK YOU on vertical text using TextAni pattern
 */
function animateContactUsToThankYou() {
  const animatedCard = document.querySelector(".animated-card");
  if (!animatedCard) return;

  // First create a temporary element for the text animation
  const textContainer = document.createElement("div");
  textContainer.className = "text-transition-container";
  textContainer.style.cssText = `
    position: absolute;
    left: 40px;
    top: 25%;
    transform: translateY(-50%) rotate(-90deg);
    transform-origin: center;
    font-family: 'Oswald', sans-serif;
    font-size: 2.2rem;
    font-weight: 800;
    letter-spacing: 4px;
    color: #FF6B35;
    white-space: nowrap;
    opacity: 1;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    z-index: 15;
  `;

  // Add enhanced levitating effect to the whole card during transition
  gsap.to(animatedCard, {
    y: -25,
    duration: 2,
    ease: "power2.inOut",
    yoyo: true,
    repeat: 1
  });

  // Split and animate "THANK YOU" text
  function splitAndAnimateText(text, container) {
    let splittedText = text.split("");
    let halfTextLen = Math.floor(splittedText.length / 2);
    let clutter = "";

    splittedText.forEach((char, ind) => {
      if (char === " ") {
        clutter += `<span style="display: inline-block; width: 0.3em;"></span>`;
      } else if (ind < halfTextLen) {
        clutter += `<span class="text-a" style="display: inline-block; padding: 0 1px;">${char}</span>`;
      } else {
        clutter += `<span class="text-b" style="display: inline-block; padding: 0 1px;">${char}</span>`;
      }
    });

    container.innerHTML = clutter;
  }

  // Hide original pseudo-element
  animatedCard.style.setProperty("--hide-after", "1");

  // Add the text container
  animatedCard.appendChild(textContainer);

  // Split the "THANK YOU" text
  splitAndAnimateText("THANK YOU", textContainer);

  // Animate the text in using the TextAni pattern
  gsap.fromTo(
    textContainer.querySelectorAll(".text-a"),
    {
      y: 100,
      opacity: 0,
      rotationX: 90
    },
    {
      y: 0,
      opacity: 1,
      rotationX: 0,
      duration: 0.8,
      delay: 0.3,
      stagger: 0.1,
      ease: "back.out(1.7)"
    }
  );

  gsap.fromTo(
    textContainer.querySelectorAll(".text-b"),
    {
      y: 100,
      opacity: 0,
      rotationX: 90
    },
    {
      y: 0,
      opacity: 1,
      rotationX: 0,
      duration: 0.8,
      delay: 0.3,
      stagger: -0.1,
      ease: "back.out(1.7)"
    }
  );

  // Clean up after animation
  setTimeout(() => {
    if (textContainer && textContainer.parentNode) {
      animatedCard.removeChild(textContainer);
      animatedCard.classList.add("thank-you");
      animatedCard.style.removeProperty("--hide-after");
    }
  }, 2000);
}

/**
 * Show animated success message
 */
function showAnimatedSuccessMessage() {
  const successOverlay = document.createElement("div");
  successOverlay.className = "success-overlay";
  successOverlay.innerHTML = `
    <div class="success-content">
      <div class="success-icon">
        <i class="fas fa-check-circle"></i>
      </div>
      <h3>Message Sent Successfully!</h3>
      <p>Thank you for contacting us. We'll get back to you soon.</p>
      <button class="close-success-btn">Continue</button>
    </div>
  `;

  // Style the success overlay
  gsap.set(successOverlay, {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000,
    opacity: 0
  });

  const successContent = successOverlay.querySelector(".success-content");
  gsap.set(successContent, {
    background: "var(--card-background)",
    padding: "40px",
    borderRadius: "20px",
    textAlign: "center",
    maxWidth: "400px",
    margin: "0 20px",
    transform: "scale(0.5)",
    boxShadow: "0 25px 80px rgba(0, 0, 0, 0.3)"
  });

  document.body.appendChild(successOverlay);

  // Animate in
  gsap
    .timeline()
    .to(successOverlay, {
      opacity: 1,
      duration: 0.3,
      ease: "power2.out"
    })
    .to(
      successContent,
      {
        scale: 1,
        duration: 0.5,
        ease: "back.out(1.7)"
      },
      "-=0.2"
    );

  // Close button functionality
  const closeBtn = successOverlay.querySelector(".close-success-btn");
  closeBtn.addEventListener("click", () => {
    gsap
      .timeline()
      .to(successContent, {
        scale: 0.5,
        duration: 0.3,
        ease: "power2.in"
      })
      .to(
        successOverlay,
        {
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => successOverlay.remove()
        },
        "-=0.1"
      );
  });
}

/**
 * Initialize interactive features
 */
function initializeInteractiveFeatures() {
  initializeFAQToggle();
  initializeFormSubmission();
  initializeScrollToTop();
  initializeCardAnimation();
}

/**
 * Initialize card animation button
 */
function initializeCardAnimation() {
  // Animation is now handled by form submission
  console.log("Card animation will be triggered by form submission");
}

/**
 * Initialize FAQ toggle functionality
 */
function initializeFAQToggle() {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    const toggle = item.querySelector(".faq-toggle");

    question.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      // Close all other items
      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.classList.remove("active");
          gsap.to(otherItem.querySelector(".faq-answer"), {
            maxHeight: 0,
            duration: 0.4,
            ease: "power2.inOut"
          });
          gsap.to(otherItem.querySelector(".faq-toggle"), {
            rotation: 0,
            duration: 0.3,
            ease: "power2.out"
          });
        }
      });

      // Toggle current item
      if (!isActive) {
        item.classList.add("active");
        gsap.to(answer, {
          maxHeight: answer.scrollHeight + "px",
          duration: 0.4,
          ease: "power2.inOut"
        });
        gsap.to(toggle, {
          rotation: 45,
          duration: 0.3,
          ease: "back.out(1.7)"
        });
      } else {
        item.classList.remove("active");
        gsap.to(answer, {
          maxHeight: 0,
          duration: 0.4,
          ease: "power2.inOut"
        });
        gsap.to(toggle, {
          rotation: 0,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    });
  });
}

/**
 * Initialize form submission with animations
 */
function initializeFormSubmission() {
  const form = document.querySelector("#contactForm");
  const submitBtn = document.querySelector(".submit-btn");

  if (!form || !submitBtn) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Collect form data
    const formData = {
      name:    form.querySelector('#name').value.trim(),
      email:   form.querySelector('#email').value.trim(),
      phone:   form.querySelector('#phone').value.trim(),
      subject: form.querySelector('#subject').value.trim(),
      message: form.querySelector('#message').value.trim()
    };

    // Basic client-side validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      alert('Please fill in all required fields.');
      return;
    }

    // Disable button and show loading
    submitBtn.disabled = true;
    const btnText = submitBtn.querySelector('.btn-text');
    const originalText = btnText ? btnText.textContent : 'Send Message';
    if (btnText) btnText.textContent = 'Sending...';

    try {
      const response = await fetch('api/contact/submit-contact.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        // Trigger the card animation on success
        animateFormSubmission();
      } else {
        alert(result.message || 'Failed to send message. Please try again.');
      }

    } catch (error) {
      console.error('Contact form error:', error);
      alert('Something went wrong. Please try again later.');
    } finally {
      submitBtn.disabled = false;
      if (btnText) btnText.textContent = originalText;
    }
  });
}

/**
 * Show success message with animation
 */
function showSuccessMessage() {
  const successMsg = document.createElement("div");
  successMsg.className = "success-message";
  successMsg.innerHTML =
    '<i class="fas fa-check-circle"></i> Message sent successfully!';

  // Style the success message
  gsap.set(successMsg, {
    position: "fixed",
    top: "20px",
    right: "20px",
    background: "#10B981",
    color: "white",
    padding: "15px 25px",
    borderRadius: "10px",
    fontSize: "1rem",
    fontWeight: "600",
    zIndex: 10000,
    opacity: 0,
    y: -50
  });

  document.body.appendChild(successMsg);

  // Animate in and out
  gsap
    .timeline()
    .to(successMsg, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "back.out(1.7)"
    })
    .to(successMsg, {
      opacity: 0,
      y: -50,
      duration: 0.4,
      ease: "power2.in",
      delay: 3,
      onComplete: () => successMsg.remove()
    });
}

/**
 * Initialize scroll to top functionality
 */
function initializeScrollToTop() {
  // Scroll to top functionality can be added here if needed
}

/**
 * Initialize parallax effects
 */
function initializeParallaxEffects() {
  const shapes = document.querySelectorAll(".shape");

  // Parallax effect for shapes
  shapes.forEach((shape, index) => {
    gsap.to(shape, {
      yPercent: -50 * (index + 1),
      ease: "none",
      scrollTrigger: {
        trigger: ".contact-hero",
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });
  });

  // Parallax for info cards
  const infoCards = document.querySelectorAll(".info-card");
  infoCards.forEach((card, index) => {
    gsap.to(card, {
      y: -30 * (index % 2 === 0 ? 1 : -1),
      ease: "none",
      scrollTrigger: {
        trigger: card,
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });
  });
}

/**
 * Handle page visibility for performance
 */
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    gsap.globalTimeline.pause();
  } else {
    gsap.globalTimeline.resume();
  }
});

/**
 * Error handling wrapper
 */
function safeContactInitialization() {
  try {
    initializeContactAnimations();
  } catch (error) {
    console.error("Error initializing contact animations:", error);
  }
}

// Cursor follower effect
let cursor = { x: 0, y: 0 };
let mouse = { x: 0, y: 0 };

document.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

function updateCursor() {
  cursor.x += (mouse.x - cursor.x) * 0.1;
  cursor.y += (mouse.y - cursor.y) * 0.1;

  // Create trailing effect on interactive elements
  const interactiveElements = document.querySelectorAll(
    ".info-card, .submit-btn, .faq-question"
  );
  interactiveElements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (
      mouse.x >= rect.left &&
      mouse.x <= rect.right &&
      mouse.y >= rect.top &&
      mouse.y <= rect.bottom
    ) {
      el.style.transform = `translate(${
        (mouse.x - rect.left - rect.width / 2) * 0.02
      }px, ${(mouse.y - rect.top - rect.height / 2) * 0.02}px)`;
    } else {
      el.style.transform = "translate(0, 0)";
    }
  });

  requestAnimationFrame(updateCursor);
}

// Start cursor animation
requestAnimationFrame(updateCursor);
