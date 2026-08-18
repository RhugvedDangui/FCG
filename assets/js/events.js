// Events Page JavaScript - Clean Structure
// Dynamic Events Data - Loaded from Database!
// Empty events array - will be populated from database
let eventsData = [];

let displayedEventsCount = 6;

document.addEventListener('DOMContentLoaded', function() {
    initializeEventsPage();
});

async function initializeEventsPage() {
    // Load events data first
    await loadEventsData();
    
    // Render initial events
    renderEvents();
    
    // Initialize filter functionality
    initializeEventFilters();
    
    // Initialize load more functionality
    initializeLoadMore();
    
    // Initialize event animations
    initializeEventAnimations();
}

// Load events data from database API
async function loadEventsData() {
    try {
        console.log('Loading events from database...');
        
        // Fetch events from API
        const response = await fetch('api/events/get-events.php?active=true');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
            // Transform database format to match existing eventsData format
            eventsData = data.data.map(event => transformEventData(event));
            console.log('Events loaded from database:', eventsData.length, 'events');
        } else {
            throw new Error(data.message || 'Failed to load events');
        }
        
    } catch (error) {
        console.error('Error loading events from database:', error);
        console.log('API failed - showing error message to user');
        
        // Show error message instead of fallback events
        const eventsList = document.getElementById('eventsList');
        if (eventsList) {
            eventsList.innerHTML = `
                <div class="api-error-message">
                    <div class="error-content">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>Unable to Load Events</h3>
                        <p>We're experiencing technical difficulties loading our latest events. Please try refreshing the page or check back later.</p>
                        <button class="refresh-btn-inline" onclick="window.location.reload()">
                            <i class="fas fa-refresh"></i> Refresh Page
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

// Transform database event format to match existing UI format
function transformEventData(dbEvent) {
    const eventDate = new Date(dbEvent.date);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
                   'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    
    // Map database type to category for filtering
    const categoryMap = {
        'running': 'running',
        'cycling': 'cycling', 
        'challenge': 'challenge',
        'steps': 'challenge',
        'multi': 'challenge'
    };
    
    // Map type to badge display name
    const badgeMap = {
        'running': 'Running',
        'cycling': 'Cycling',
        'challenge': 'Challenge',
        'steps': 'Steps',
        'multi': 'Multi-Sport'
    };
    
    return {
        id: dbEvent.slug || `event-${dbEvent.id}`,
        title: dbEvent.title,
        category: categoryMap[dbEvent.type] || 'challenge',
        badge: badgeMap[dbEvent.type] || 'Event',
        date: {
            day: eventDate.getDate().toString().padStart(2, '0'),
            month: months[eventDate.getMonth()]
        },
        description: dbEvent.description || 'Join us for this exciting event!',
        time: dbEvent.formatted_time || '9:00 AM',
        location: dbEvent.location || 'TBD',
        image: dbEvent.image || 'public/images/runner.png',
        price: dbEvent.amount || 0,
        currency: dbEvent.currency || 'INR',
        // Additional fields for registration
        event_id: dbEvent.id,
        slug: dbEvent.slug,
        is_paid: dbEvent.is_paid
    };
}

// Render events to the DOM
function renderEvents(filteredEvents = null) {
    const eventsList = document.getElementById('eventsList');
    if (!eventsList) return;
    
    // Clear existing events (including loading state)
    eventsList.innerHTML = '';
    
    // Use filtered events or all events
    const eventsToRender = filteredEvents || eventsData.slice(0, displayedEventsCount);
    
    if (eventsToRender.length === 0) {
        showNoEventsMessage(eventsList);
        return;
    }
    
    // Create and append event cards
    eventsToRender.forEach(eventData => {
        const eventCard = createEventCard(eventData);
        eventsList.appendChild(eventCard);
    });
    
    // Update load more button visibility
    updateLoadMoreButton();
}

// Event Filtering  
function initializeEventFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', async () => {
            // Update active filter button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const filterCategory = button.getAttribute('data-filter');
            
            // Show loading state
            const eventsList = document.getElementById('eventsList');
            eventsList.style.opacity = '0.7';
            
            try {
                let filteredEvents = eventsData;
                
                // Try to filter via API for better performance with large datasets
                if (filterCategory !== 'all') {
                    // Try API filtering first
                    try {
                        await filterEventsByType(filterCategory);
                        return;
                    } catch (error) {
                        console.log('API filtering failed, using client-side filtering');
                        // Fallback to client-side filtering
                        filteredEvents = eventsData.filter(event => event.category === filterCategory);
                    }
                } else {
                    // Show all events
                    filteredEvents = eventsData;
                }
                
                // Reset displayed count for filtering
                displayedEventsCount = Math.min(6, filteredEvents.length);
                
                // Re-render events
                renderEvents(filteredEvents);
                
            } catch (error) {
                console.error('Filter error:', error);
                // Fallback to showing all events
                renderEvents(eventsData);
            } finally {
                // Restore opacity and re-initialize animations
                setTimeout(() => {
                    eventsList.style.opacity = '1';
                    initializeCardAnimations();
                }, 200);
            }
        });
    });
}

// Show no events message
function showNoEventsMessage(container) {
    const noEventsMessage = document.createElement('div');
    noEventsMessage.className = 'no-events-message';
    noEventsMessage.innerHTML = `
        <div class="no-events-content">
            <i class="fas fa-calendar-times"></i>
            <h3>No events found</h3>
            <p>No events match your current filter. Try selecting a different category.</p>
        </div>
    `;
    container.appendChild(noEventsMessage);
}

// Update load more button visibility
function updateLoadMoreButton() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (!loadMoreBtn) return;
    
    const activeFilter = document.querySelector('.filter-btn.active');
    const filterCategory = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';
    
    let totalAvailableEvents = eventsData.length;
    if (filterCategory !== 'all') {
        totalAvailableEvents = eventsData.filter(event => event.category === filterCategory).length;
    }
    
    // Show/hide load more button based on remaining events
    if (displayedEventsCount >= totalAvailableEvents) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
    }
}

// Load More Functionality
function initializeLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreEvents);
    }
}

function loadMoreEvents() {
    const eventsList = document.getElementById('eventsList');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    // Get current filter
    const activeFilter = document.querySelector('.filter-btn.active');
    const filterCategory = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';
    
    // Get filtered events
    let availableEvents = eventsData;
    if (filterCategory !== 'all') {
        availableEvents = eventsData.filter(event => event.category === filterCategory);
    }
    
    // Show loading state
    loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    loadMoreBtn.disabled = true;
    
    // Simulate network delay
    setTimeout(() => {
        // Calculate how many more events to show (load 3 more at a time)
        const eventsToAdd = 3;
        const currentlyDisplayed = eventsList.querySelectorAll('.event-card:not(.no-events-message)').length;
        const startIndex = currentlyDisplayed;
        const endIndex = Math.min(startIndex + eventsToAdd, availableEvents.length);
        
        // Add new events
        for (let i = startIndex; i < endIndex; i++) {
            if (availableEvents[i]) {
                const eventCard = createEventCard(availableEvents[i]);
                eventsList.appendChild(eventCard);
                
                // Animate in
                setTimeout(() => {
                    eventCard.classList.add('show');
                }, 100);
            }
        }
        
        // Update displayed count
        displayedEventsCount = endIndex;
        
        // Update button
        loadMoreBtn.innerHTML = '<span>Load More Events</span><i class="fas fa-arrow-down"></i>';
        loadMoreBtn.disabled = false;
        
        // Update button visibility
        updateLoadMoreButton();
        
    }, 800);
}

function createEventCard(eventData) {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.setAttribute('data-category', eventData.category);
    
    // Determine price display
    const price = eventData.price || 0;
    const isFree = !eventData.is_paid || price === 0;
    const priceText = isFree ? 'FREE' : price.toString();
    const priceClass = isFree ? 'free' : '';
    
    card.innerHTML = `
        <div class="event-image">
            <img src="${eventData.image}" alt="${eventData.title}" />
            <div class="event-badge">${eventData.badge}</div>
            <div class="event-price ${priceClass}">${priceText}</div>
        </div>
        <div class="event-content">
            <div class="event-date">
                <span class="day">${eventData.date.day}</span>
                <span class="month">${eventData.date.month}</span>
            </div>
            <div class="event-details">
                <h3 class="event-title">${eventData.title}</h3>
                <p class="event-description">${eventData.description}</p>
                <div class="event-info">
                    <span class="event-time"><i class="fas fa-clock"></i> ${eventData.time}</span>
                    <span class="event-location"><i class="fas fa-map-marker-alt"></i> ${eventData.location}</span>
                </div>
                <div class="event-price-section">
                    <span class="event-price-label">Entry Fee</span>
                    <div class="event-price-value ${priceClass}">${priceText}</div>
                </div>
                <button class="event-btn" onclick="window.location.href='event-registration.html?event=${eventData.event_id}'">Join Event</button>
            </div>
        </div>
    `;
    
    return card;
}

// Event Animations
function initializeEventAnimations() {
    // Check if GSAP is available
    if (typeof gsap === 'undefined') {
        console.warn('GSAP not loaded, skipping animations');
        return;
    }
    
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);
    
    // Animate filter buttons
    gsap.fromTo('.filter-btn', {
        scale: 0,
        opacity: 0
    }, {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        stagger: 0.1,
        scrollTrigger: {
            trigger: '.events-filter',
            start: 'top 90%',
            toggleActions: 'play none none reverse'
        }
    });
    
    // Animate hero content
    gsap.fromTo('.hero-title', {
        y: 50,
        opacity: 0
    }, {
        y: 0,
        opacity: 1,
        duration: 1,
        delay: 0.2
    });
    
    gsap.fromTo('.hero-description', {
        y: 30,
        opacity: 0
    }, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        delay: 0.5
    });
    
    // Initialize card animations for loaded events
    setTimeout(() => {
        initializeCardAnimations();
    }, 100);
}

// Initialize animations for event cards (called after dynamic loading)
function initializeCardAnimations() {
    if (typeof gsap === 'undefined') return;
    
    // Refresh ScrollTrigger for new content
    ScrollTrigger.refresh();
    
    // Animate event cards with stagger
    gsap.fromTo('.event-card', {
        y: 50,
        opacity: 0
    }, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        scrollTrigger: {
            trigger: '.events-grid',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
        }
    });
}

// Utility function to show loading state for any element
function showLoadingState(element, message = 'Loading...') {
    const originalContent = element.innerHTML;
    element.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${message}`;
    element.disabled = true;
    
    return () => {
        element.innerHTML = originalContent;
        element.disabled = false;
    };
}

// Utility function for smooth scrolling
function scrollToElement(selector, offset = 0) {
    const element = document.querySelector(selector);
    if (element && typeof gsap !== 'undefined') {
        gsap.to(window, {
            duration: 1,
            scrollTo: {
                y: element,
                offsetY: offset
            },
            ease: "power2.inOut"
        });
    }
}

// Add refresh functionality
async function refreshEvents() {
    const eventsList = document.getElementById('eventsList');
    if (eventsList) {
        // Show loading state
        eventsList.innerHTML = `
            <div class="loading-events">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Refreshing events...</p>
            </div>
        `;
    }
    
    // Reset display count
    displayedEventsCount = eventsPerPage;
    
    // Reload data from database
    await loadEventsData();
    
    // Re-render events
    renderEvents();
    
    // Re-initialize animations
    if (typeof gsap !== 'undefined') {
        initializeEventAnimations();
    }
}

// Add filter by event type functionality
async function filterEventsByType(type) {
    try {
        const response = await fetch(`api/events/get-events.php?active=true&type=${type}`);
        const data = await response.json();
        
        if (data.success && data.data) {
            const filteredEvents = data.data.map(event => transformEventData(event));
            renderEvents(filteredEvents);
        }
    } catch (error) {
        console.error('Error filtering events:', error);
        // Fallback to client-side filtering
        const filteredEvents = eventsData.filter(event => event.category === type);
        renderEvents(filteredEvents);
    }
}

// Removed upcoming events functionality as requested

// Export functions for potential use by other modules
window.EventsPage = {
    createEventCard,
    scrollToElement,
    showLoadingState,
    refreshEvents,
    filterEventsByType,
    loadEventsData
};