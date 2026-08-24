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

        // Make all asterisks in labels red
        this.styleRequiredAsterisks();
    }

    styleRequiredAsterisks() {
        document.querySelectorAll('.form-group label').forEach(label => {
            if (label.innerHTML.includes('*') && !label.querySelector('.req-star')) {
                label.innerHTML = label.innerHTML.replace(/\s?\*(\s?)$/, ' <span class="req-star" style="color:#FF4444;">*</span>$1');
            }
        });
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
        // Style required asterisks red after form is visible
        setTimeout(() => this.styleRequiredAsterisks(), 50);
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
        const dateEl = document.getElementById('eventDate');
        if (dateEl) dateEl.innerHTML = `<i class="fas fa-calendar-alt"></i> ${event.formatted_date || event.date}`;
        const locEl = document.getElementById('eventLocation');
        if (locEl) locEl.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${event.location || 'Goa'}`;

        // Description inline
        const descEl = document.getElementById('eventDescription');
        if (descEl && event.description) {
            descEl.textContent = event.description;
            descEl.style.display = 'block';
        }

        // Extra info as inline tags inside the card
        this.renderExtraInfo(event.extra_info || []);

        // Event details extracted text inline
        const detailsBlock = document.getElementById('eventDetailsBlock');
        const detailsContent = document.getElementById('eventDetailsContent');
        if (detailsContent && event.event_details) {
            const tmp = document.createElement('div');
            tmp.innerHTML = event.event_details;
            tmp.querySelectorAll('style, script').forEach(el => el.remove());
            let html = '';
            tmp.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li').forEach(el => {
                const tag = el.tagName.toLowerCase();
                const text = el.textContent.trim();
                if (!text) return;
                if (['h1','h2','h3','h4','h5','h6'].includes(tag)) {
                    html += `<p style="font-weight:700;font-size:0.78rem;color:var(--text-primary);margin:0.5rem 0 0.15rem;text-transform:uppercase;letter-spacing:0.06em;">${text}</p>`;
                } else if (tag === 'li') {
                    html += `<p style="font-size:0.78rem;color:var(--text-secondary);margin:0.1rem 0 0.1rem 0.75rem;"><span style="color:#FF6B35;margin-right:5px;">•</span>${text}</p>`;
                } else {
                    html += `<p style="font-size:0.78rem;color:var(--text-secondary);line-height:1.5;margin:0.1rem 0;">${text}</p>`;
                }
            });
            if (html) {
                detailsContent.innerHTML = html;
                detailsBlock.style.display = 'block';
            }
        }
        
        // Update price and payment section
        const priceElement = document.getElementById('eventPrice');
        const paymentSection = document.getElementById('paymentSection');
        const paymentAmount = document.getElementById('paymentAmount');
        const totalAmount = document.getElementById('totalAmount');
        
        if (event.price && event.price > 0) {
            priceElement.textContent = `₹${event.price}`;
            priceElement.classList.remove('free-event');
            paymentSection.style.display = 'block';
            paymentAmount.textContent = `₹${event.price}`;
            totalAmount.textContent = `₹${event.price}`;
        } else {
            priceElement.textContent = 'FREE';
            priceElement.classList.add('free-event');
            paymentSection.style.display = 'none';
        }

        // Render custom fields if any
        this.renderCustomFields(event.custom_fields || []);

        // Show extra info if available
        this.renderExtraInfo(event.extra_info || []);
    }

    renderExtraInfo(extraInfo) {
        const div = document.getElementById('extraInfoSection');
        if (!div) return;
        if (!extraInfo || !extraInfo.length) return;

        div.style.display = 'flex';
        div.innerHTML = extraInfo.map(block => `
            <div style="font-size:0.78rem;color:var(--text-secondary);background:rgba(255,107,53,0.08);border:1px solid rgba(255,107,53,0.2);border-radius:6px;padding:0.25rem 0.6rem;display:flex;align-items:center;gap:0.35rem;">
                <span style="color:#FF6B35;font-weight:600;">${block.label || ''}:</span>
                <span>${block.content || ''}</span>
            </div>
        `).join('');
    }

    renderCustomFields(fields) {
        // Remove existing custom fields section if any
        const existing = document.getElementById('customFieldsSection');
        if (existing) existing.remove();

        if (!fields || fields.length === 0) return;

        const form = document.getElementById('registrationForm');
        const submitSection = form.querySelector('.form-section:last-child');

        const section = document.createElement('div');
        section.className = 'form-section';
        section.id = 'customFieldsSection';
        section.innerHTML = `
            <h3 class="section-title">
                <i class="fas fa-sliders-h"></i>
                Additional Information
            </h3>
            <div class="form-grid" id="customFieldsGrid"></div>
        `;

        form.insertBefore(section, submitSection);

        const grid = section.querySelector('#customFieldsGrid');

        fields.forEach((field, idx) => {
            const fieldId = `custom_field_${idx}`;
            const required = field.required ? 'required' : '';
            const reqMark  = field.required ? ' <span class="req-star" style="color:#FF4444;">*</span>' : '';
            let inputHtml  = '';

            if (field.type === 'select' && field.options && field.options.length) {
                const opts = field.options.map(o => `<option value="${o}">${o}</option>`).join('');
                inputHtml = `<select id="${fieldId}" name="custom_${idx}" ${required}>
                    <option value="">Select ${field.label}</option>
                    ${opts}
                </select>`;
            } else if (field.type === 'checkbox') {
                inputHtml = `<label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;padding-top:0.5rem;">
                    <input type="checkbox" id="${fieldId}" name="custom_${idx}" value="Yes" ${required}>
                    <span>${field.label}</span>
                </label>`;
            } else {
                const inputType = field.type === 'number' ? 'number' : 'text';
                inputHtml = `<input type="${inputType}" id="${fieldId}" name="custom_${idx}" 
                    placeholder="${field.label}" ${required}>`;
            }

            const div = document.createElement('div');
            div.className = 'form-group';
            div.dataset.fieldLabel = field.label;
            div.dataset.fieldIdx = idx;
            if (field.type !== 'checkbox') {
                div.innerHTML = `<label for="${fieldId}">${field.label}${reqMark}</label>${inputHtml}`;
            } else {
                div.innerHTML = inputHtml;
            }
            grid.appendChild(div);
        });

        // Re-run asterisk styling for new fields
        this.styleRequiredAsterisks();
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

            // Append custom field answers
            this.appendCustomFields(orderFormData);

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
        // Add event information
        formData.append('event_id', this.currentEvent.event_id || this.currentEvent.id);
        formData.append('event_title', this.currentEvent.title);
        formData.append('event_price', this.currentEvent.price || 0);
        formData.append('registration_type', 'free');

        // Append custom field answers
        this.appendCustomFields(formData);
        
        const response = await fetch('api/events/register.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            const eventId = this.currentEvent.event_id || this.currentEvent.id;
            window.location.href = `registration-success.html?event=${eventId}&reg_id=${result.registration_id}`;
        } else {
            throw new Error(result.message || 'Registration failed');
        }
    }

    appendCustomFields(formData) {
        const fields = this.currentEvent.custom_fields || [];
        if (!fields.length) return;

        const answers = [];
        fields.forEach((field, idx) => {
            const el = document.querySelector(`[name="custom_${idx}"]`);
            if (!el) return;
            let value = '';
            if (el.type === 'checkbox') {
                value = el.checked ? 'Yes' : 'No';
            } else {
                value = el.value || '';
            }
            answers.push({ label: field.label, value: value });
        });

        formData.append('custom_field_answers', JSON.stringify(answers));
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
                this.showFieldError(field, 'Please upload a valid ID proof (JPG, PNG, max 5MB)');
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
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        return allowedTypes.includes(file.type) && file.size <= maxSize;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EventRegistration();
});