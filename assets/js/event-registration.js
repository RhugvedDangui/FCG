/**
 * Event Registration Page JavaScript
 * Handles event registration form functionality, validation, and payment processing
 */

class EventRegistration {
    constructor() {
        this.currentEvent = null;
        this.razorpayKeyId = null;
        this.eventId = null;
        
        // DOM Elements
        this.loadingState = null;
        this.errorState = null;
        this.formContainer = null;
        this.registrationForm = null;
        
        this.init();
    }

    async init() {
        // Get event ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        this.eventId = urlParams.get('event');
        
        // Initialize DOM elements
        this.loadingState = document.getElementById('loadingState');
        this.errorState = document.getElementById('errorState');
        this.formContainer = document.getElementById('formContainer');
        this.registrationForm = document.getElementById('registrationForm');
        
        if (!this.eventId) {
            this.showError('No event specified. Please select an event to register.');
            setTimeout(() => {
                window.location.href = 'events.html';
            }, 3000);
            return;
        }

        await this.loadEventData();
    }

    async loadEventData() {
        try {
            // Load Razorpay configuration first
            try {
                await this.loadRazorpayConfig();
            } catch (configError) {
                console.warn('Payment configuration failed to load:', configError);
            }
            
            // Fetch events data
            const response = await fetch('api/events/get-events.php');
            
            if (!response.ok) {
                throw new Error(`Events API returned HTTP ${response.status}`);
            }
            
            const result = await response.json();
            
            if (!result.success || !result.data) {
                throw new Error(result.message || 'Failed to load events data');
            }
            
            // Find the event by ID
            const event = result.data.find(e => String(e.id) === String(this.eventId));
            
            if (!event) {
                this.showError('The requested event could not be found or is no longer available.');
                return;
            }
            
            // Update event information and show form
            this.updateEventInfo(event);
            this.showForm();
            
            // Add form submit handler
            this.registrationForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                // Basic form validation
                if (!this.validateForm()) {
                    return;
                }
                
                const formData = new FormData(this.registrationForm);
                await this.handleFormSubmission(formData);
            });
            
        } catch (error) {
            console.error('Error loading event:', error);
            this.showError('Failed to load event details. Please check your internet connection and try again.');
        }
    }

    async loadRazorpayConfig() {
        try {
            const response = await fetch('api/config/razorpay-config.php');
            const config = await response.json();
            
            if (config.success) {
                this.razorpayKeyId = config.key_id;
                console.log('Razorpay configuration loaded successfully');
            } else {
                throw new Error(config.message || 'Failed to load payment configuration');
            }
        } catch (error) {
            console.error('Error loading Razorpay config:', error);
            throw new Error('Payment system not available. Please try again later.');
        }
    }

    showError(message = 'Event not found') {
        this.loadingState.style.display = 'none';
        this.formContainer.style.display = 'none';
        this.errorState.style.display = 'block';
        this.errorState.querySelector('p').textContent = message;
    }

    showForm() {
        this.loadingState.style.display = 'none';
        this.errorState.style.display = 'none';
        this.formContainer.style.display = 'block';
    }

    updateEventInfo(event) {
        this.currentEvent = event;
        
        // Update page title
        document.title = `Register for ${event.title} - Fitness Conscious Goa`;
        const pageTitleEl = document.getElementById('page-title');
        if (pageTitleEl) pageTitleEl.textContent = event.title;
        const pageDescEl = document.getElementById('page-description');
        if (pageDescEl) pageDescEl.textContent = `Complete the form below to register for ${event.title}`;
        
        // Update event info section
        document.getElementById('eventTitle').textContent = event.title;
        const descEl = document.getElementById('eventDescription');
        if (descEl) descEl.textContent = event.description || 'Join us for this exciting fitness event!';
        const dateEl = document.getElementById('eventDate');
        if (dateEl) dateEl.innerHTML = `<i class="fas fa-calendar-alt"></i> ${event.formatted_date || event.date}`;
        const locEl = document.getElementById('eventLocation');
        if (locEl) locEl.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${event.location || 'Goa'}`;
        
        // Update price and payment section
        const priceElement = document.getElementById('eventPrice');
        const paymentSection = document.getElementById('paymentSection');
        const paymentAmount = document.getElementById('paymentAmount');
        const totalAmount = document.getElementById('totalAmount');
        
        if (event.price && event.price > 0) {
            // Paid event
            priceElement.textContent = `₹${event.price}`;
            priceElement.classList.remove('free-event');
            
            // Show payment section
            paymentSection.style.display = 'block';
            paymentAmount.textContent = `₹${event.price}`;
            totalAmount.textContent = `₹${event.price}`;
        } else {
            // Free event
            priceElement.textContent = 'FREE';
            priceElement.classList.add('free-event');
            
            // Hide payment section
            paymentSection.style.display = 'none';
        }
    }

    async handleFormSubmission(formData) {
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.innerHTML;
        
        try {
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            submitBtn.disabled = true;
            
            // If it's a paid event, handle payment
            if (this.currentEvent.price && this.currentEvent.price > 0) {
                // Ensure payment system is ready
                if (!this.razorpayKeyId) {
                    throw new Error('Payment system not available. Please refresh the page and try again.');
                }
                await this.handlePayment(formData);
            } else {
                // For free events, directly submit registration
                await this.submitRegistration(formData);
            }
            
        } catch (error) {
            console.error('Registration error:', error);
            
            // Show user-friendly error message
            let errorMessage = 'Registration failed. Please try again.';
            if (error.message.includes('Payment system')) {
                errorMessage = error.message;
            } else if (error.message.includes('Payment cancelled')) {
                errorMessage = 'Payment was cancelled. Please try again if you wish to register.';
            }
            
            alert(errorMessage);
        } finally {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async handlePayment(formData) {
        try {
            // First create the order and registration entry
            const orderData = await this.createOrder(formData);
            
            // Then proceed with payment using the created order
            return new Promise((resolve, reject) => {
                const firstName = formData.get('firstName');
                const lastName = formData.get('lastName');
                const fullName = `${firstName} ${lastName}`;
                
                const options = {
                    key: orderData.razorpaykey, // From create-order response
                    amount: orderData.amount * 100, // Already in correct format from server
                    currency: orderData.currency,
                    order_id: orderData.order_id, // Important: use the created order ID
                    name: 'Fitness Conscious Goa',
                    description: `Registration for ${this.currentEvent.title}`,
                    prefill: {
                        name: fullName,
                        email: formData.get('email'),
                        contact: formData.get('mobileNumber')
                    },
                    handler: async (response) => {
                        try {
                            // Payment successful — redirect to thank you page
                            const eventId = this.currentEvent.event_id || this.currentEvent.id;
                            window.location.href = `registration-success.html?event=${eventId}&payment_id=${response.razorpay_payment_id}`;
                            resolve();
                        } catch (error) {
                            reject(error);
                        }
                    },
                    modal: {
                        ondismiss: () => {
                            reject(new Error('Payment cancelled'));
                        }
                    }
                };
                
                const rzp = new Razorpay(options);
                rzp.open();
            });
        } catch (error) {
            throw new Error(`Order creation failed: ${error.message}`);
        }
    }

    async createOrder(formData) {
        // Check if there are any files in the form data
        const hasFiles = Array.from(formData.entries()).some(([key, value]) => value instanceof File);
        
        if (hasFiles) {
            // Send as FormData to support file uploads
            const orderFormData = new FormData();
            
            // Copy all form fields to the order form data
            for (let [key, value] of formData.entries()) {
                orderFormData.append(key, value);
            }
            
            // Add event-specific data
            orderFormData.append('event_id', this.currentEvent.event_id || this.currentEvent.id);
            orderFormData.append('event_slug', this.currentEvent.slug || this.titleToId(this.currentEvent.title));
            orderFormData.append('event_title', this.currentEvent.title);
            orderFormData.append('amount', this.currentEvent.price || 0);
            orderFormData.append('currency', this.currentEvent.currency || 'INR');
            orderFormData.append('request_timestamp', Date.now());
            orderFormData.append('request_id', this.generateRequestId());
            orderFormData.append('client_info', JSON.stringify(this.getClientInfo()));

            const response = await fetch('api/payments/create-order.php', {
                method: 'POST',
                body: orderFormData // Send as FormData to support file uploads
            });

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Failed to create order');
            }

            return result;
        } else {
            // Send as JSON (backward compatibility for requests without files)
            const userData = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                fullName: `${formData.get('firstName')} ${formData.get('lastName')}`,
                email: formData.get('email'),
                mobileNumber: formData.get('mobileNumber'),
                gender: formData.get('gender'),
                dateOfBirth: formData.get('dateOfBirth'),
                address: formData.get('address'),
                tshirtSize: formData.get('tshirtSize'),
                runnerGroup: formData.get('runnerGroup'),
                emergencyContactName: formData.get('emergencyContactName'),
                emergencyContactMobile: formData.get('emergencyContactMobile')
            };

            const orderRequest = {
                event_id: this.currentEvent.event_id || this.currentEvent.id,
                event_slug: this.currentEvent.slug || this.titleToId(this.currentEvent.title),
                event_title: this.currentEvent.title,
                amount: this.currentEvent.price || 0,
                currency: this.currentEvent.currency || 'INR',
                user_data: userData,
                request_timestamp: Date.now(),
                request_id: this.generateRequestId(),
                client_info: this.getClientInfo()
            };

            const response = await fetch('api/payments/create-order.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderRequest)
            });

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Failed to create order');
            }

            return result;
        }
    }

    titleToId(title) {
        return title.toLowerCase()
                  .replace(/[^a-z0-9\s-]/g, '')
                  .replace(/\s+/g, '-')
                  .replace(/-+/g, '-')
                  .replace(/^-|-$/g, '');
    }

    generateRequestId() {
        return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getClientInfo() {
        return {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };
    }

    async submitRegistration(formData) {
        // This method is now only used for FREE events
        // Paid events go through createOrder -> payment -> webhook flow
        
        // Add event information
        formData.append('event_id', this.currentEvent.event_id || this.currentEvent.id);
        formData.append('event_title', this.currentEvent.title);
        formData.append('event_price', this.currentEvent.price || 0);
        formData.append('registration_type', 'free');
        
        const response = await fetch('api/events/register.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Redirect to thank you page
            const eventId = this.currentEvent.event_id || this.currentEvent.id;
            window.location.href = `registration-success.html?event=${eventId}&reg_id=${result.registration_id}`;
        } else {
            throw new Error(result.message || 'Registration failed');
        }
    }

    validateForm() {
        const form = document.getElementById('registrationForm');
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        // Remove previous error states
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('has-error');
            const errorMsg = group.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
        });
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showFieldError(field, 'This field is required');
                isValid = false;
            } else if (field.type === 'email' && !this.isValidEmail(field.value)) {
                this.showFieldError(field, 'Please enter a valid email address');
                isValid = false;
            } else if (field.type === 'tel' && !this.isValidPhone(field.value)) {
                this.showFieldError(field, 'Please enter a valid phone number');
                isValid = false;
            } else if (field.type === 'file' && !this.isValidFile(field)) {
                this.showFieldError(field, 'Please upload a valid ID proof (JPG, PNG, PDF, max 5MB)');
                isValid = false;
            }
        });
        
        return isValid;
    }

    showFieldError(field, message) {
        const formGroup = field.closest('.form-group');
        formGroup.classList.add('has-error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        formGroup.appendChild(errorDiv);
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    isValidPhone(phone) {
        return /^[\+]?[1-9][\d]{9,14}$/.test(phone.replace(/\s/g, ''));
    }

    isValidFile(fileInput) {
        const file = fileInput.files[0];
        if (!file) return false;
        
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        return allowedTypes.includes(file.type) && file.size <= maxSize;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EventRegistration();
});