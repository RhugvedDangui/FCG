// Event Registration Modal Handler
class EventRegistrationModal {
    constructor() {
        this.modal = null;
        this.currentEventTitle = '';
        this.init();
    }

    init() {
        // Load modal template if not already in DOM
        this.loadModalTemplate();
        
        // Bind event handlers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('event-btn')) {
                this.handleEventRegistration(e.target);
            }
        });
    }
    

    loadModalTemplate() {
        // Check if template already exists
        if (document.getElementById('registrationModalTemplate')) {
            return;
        }

        // Create templates directly in JavaScript to avoid CORS issues
        const templateContainer = document.createElement('div');
        templateContainer.innerHTML = `
            <!-- Event Registration Modal Template -->
            <template id="registrationModalTemplate">
                <div class="registration-modal">
                    <div class="modal-overlay">
                        <div class="modal-content">
                            
                            <div class="modal-body">
                                <div class="event-info-section">
                                    <button class="modal-close" type="button" aria-label="Close modal">&times;</button>
                                    <h4 class="event-title-placeholder">Registering for: Event Name</h4>
                                    <div class="event-price-info">
                                        <span class="price-label">Registration Fee:</span>
                                        <span class="price-amount">FREE</span>
                                    </div>
                                    <p>Please fill in your details to complete registration</p>
                                </div>
                                
                                <form class="registration-form" id="registrationForm">
                                    <!-- Personal Information -->
                                    <div class="form-section">
                                        <h5 class="section-title">Personal Information</h5>
                                        <div class="form-row">
                                            <div class="form-group">
                                                <label for="firstName">First Name *</label>
                                                <input type="text" id="firstName" name="firstName" required>
                                            </div>
                                            <div class="form-group">
                                                <label for="lastName">Last Name *</label>
                                                <input type="text" id="lastName" name="lastName" required>
                                            </div>
                                        </div>
                                        
                                        <div class="form-row">
                                            <div class="form-group">
                                                <label for="email">Email Address *</label>
                                                <input type="email" id="email" name="email" required>
                                            </div>
                                            <div class="form-group">
                                                <label for="mobileNumber">Mobile Number *</label>
                                                <input type="tel" id="mobileNumber" name="mobileNumber" required>
                                            </div>
                                        </div>
                                        
                                        <div class="form-row">
                                            <div class="form-group">
                                                <label for="gender">Gender *</label>
                                                <select id="gender" name="gender" required>
                                                    <option value="">Select Gender</option>
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                            <div class="form-group">
                                                <label for="dateOfBirth">Date of Birth *</label>
                                                <input type="date" id="dateOfBirth" name="dateOfBirth" required>
                                            </div>
                                        </div>
                                        
                                        <div class="form-group">
                                            <label for="address">Address *</label>
                                            <textarea id="address" name="address" rows="3" required
                                                      placeholder="Enter your complete address"></textarea>
                                        </div>
                                    </div>

                                    <!-- Event Specific Information -->
                                    <div class="form-section">
                                        <h5 class="section-title">Event Details</h5>
                                        <div class="form-row">
                                            <div class="form-group">
                                                <label for="tshirtSize">T-shirt Size *</label>
                                                <select id="tshirtSize" name="tshirtSize" required>
                                                    <option value="">Select Size</option>
                                                    <option value="XS">XS</option>
                                                    <option value="S">S</option>
                                                    <option value="M">M</option>
                                                    <option value="L">L</option>
                                                    <option value="XL">XL</option>
                                                    <option value="XXL">XXL</option>
                                                    <option value="XXXL">XXXL</option>
                                                </select>
                                            </div>
                                            <div class="form-group">
                                                <label for="runnerGroup">Runner's Group (Optional)</label>
                                                <input type="text" id="runnerGroup" name="runnerGroup" 
                                                       placeholder="e.g., Morning Joggers, Speed Demons, Weekend Warriors">
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Emergency Contact -->
                                    <div class="form-section">
                                        <h5 class="section-title">Emergency Contact</h5>
                                        <div class="form-row">
                                            <div class="form-group">
                                                <label for="emergencyContactName">Emergency Contact Person's Name *</label>
                                                <input type="text" id="emergencyContactName" name="emergencyContactName" required>
                                            </div>
                                            <div class="form-group">
                                                <label for="emergencyContactMobile">Emergency Contact Mobile Number *</label>
                                                <input type="tel" id="emergencyContactMobile" name="emergencyContactMobile" required>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- ID Proof -->
                                    <div class="form-section">
                                        <h5 class="section-title">Identity Verification</h5>
                                        <div class="form-group">
                                            <label for="idProof">ID Proof with Birth Date *</label>
                                            <input type="file" id="idProof" name="idProof" 
                                                   accept=".jpg,.jpeg,.png,.pdf" required>
                                            <small class="form-help">Upload a clear photo/scan of your ID proof (Aadhaar Card, Passport, Driving License, etc.) that shows your birth date. Accepted formats: JPG, PNG, PDF (Max 5MB)</small>
                                        </div>
                                    </div>

                                    <!-- Payment Section (Hidden for free events) -->
                                    <div class="form-section payment-section" id="paymentSection" style="display: none;">
                                        <h5 class="section-title">Payment Details</h5>
                                        <div class="payment-summary">
                                            <div class="payment-item">
                                                <span class="payment-label">Registration Fee:</span>
                                                <span class="payment-amount" id="paymentAmount">₹0</span>
                                            </div>
                                            <div class="payment-total">
                                                <span class="payment-label">Total Amount:</span>
                                                <span class="payment-amount" id="totalAmount">₹0</span>
                                            </div>
                                        </div>
                                        <div class="payment-methods">
                                            <h6>Choose Payment Method:</h6>
                                            <div class="payment-options">
                                                <label class="payment-option">
                                                    <input type="radio" name="paymentMethod" value="razorpay" checked>
                                                    <span class="payment-method-info">
                                                        <i class="fas fa-credit-card"></i>
                                                        <span>Credit/Debit Card, UPI, Net Banking</span>
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="form-group checkbox-group">
                                        <input type="checkbox" id="termsAccepted" name="termsAccepted" required>
                                        <label for="termsAccepted">I accept the terms and conditions and understand the risks involved *</label>
                                    </div>
                                    
                                    <div class="form-group checkbox-group">
                                        <input type="checkbox" id="newsletterConsent" name="newsletterConsent">
                                        <label for="newsletterConsent">I would like to receive updates about future events and activities</label>
                                    </div>
                                    
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="modal-btn secondary" data-action="cancel">Cancel</button>
                                <button type="button" class="modal-btn primary" data-action="submit">Complete Registration</button>
                            </div>
                        </div>
                    </div>
                </div>
            </template>

            <!-- Loading State Template -->
            <template id="registrationLoadingTemplate">
                <div class="registration-loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <h4 class="loading-title">Processing Registration...</h4>
                    <p class="loading-message">Please wait while we register you for this event</p>
                </div>
            </template>

            <!-- Success State Template -->
            <template id="registrationSuccessTemplate">
                <div class="registration-success">
                    <i class="fas fa-check-circle"></i>
                    <h4>Registration Successful!</h4>
                    <p class="success-greeting">Thank you for registering!</p>
                    <p class="success-event">You've been registered for this event</p>
                    <div class="success-details">
                        <p class="success-email"><i class="fas fa-envelope"></i> Confirmation sent to your email</p>
                        <p class="success-phone"><i class="fas fa-phone"></i> We may contact you if needed</p>
                    </div>
                </div>
            </template>
        `;
        
        // Append all templates to body
        while (templateContainer.firstChild) {
            document.body.appendChild(templateContainer.firstChild);
        }
    }

    async handleEventRegistration(button) {
        const eventCard = button.closest('.event-card');
        if (!eventCard) {
            console.error('Could not find event card');
            return;
        }
        
        const eventTitleElement = eventCard.querySelector('.event-title');
        if (!eventTitleElement) {
            console.error('Could not find event title');
            return;
        }
        
        const eventTitle = eventTitleElement.textContent;
        
        // Load event data to get pricing information
        const eventData = await this.getEventData(eventTitle);
        
        // Animate button click
        this.animateButtonClick(button);
        
        // Show registration modal with event data
        this.showModal(eventTitle, eventData);
    }

    async getEventData(eventTitle) {
        try {
            // First try to get from global eventsData (loaded by EventLoader)
            if (typeof eventsData !== 'undefined' && eventsData.length > 0) {
                // Find event by title or ID
                const eventId = this.titleToId(eventTitle);
                const event = eventsData.find(e => 
                    e.title === eventTitle || 
                    e.id === eventId || 
                    e.slug === eventId
                );
                
                if (event) {
                    return {
                        id: event.id,
                        event_id: event.event_id, // Add numeric database ID
                        slug: event.slug,
                        title: event.title,
                        price: event.price || event.amount || 0,
                        currency: event.currency || 'INR',
                        is_paid: event.is_paid,
                        amount: event.amount || 0,
                        date: event.date,
                        location: event.location,
                        type: event.type
                    };
                }
            }
            
            // Fallback: try to get event data from button's parent card
            const eventCard = document.querySelector(`[data-event-title="${eventTitle}"], [data-event-slug="${this.titleToId(eventTitle)}"]`);
            if (eventCard) {
                const priceElement = eventCard.querySelector('.price');
                const priceText = priceElement?.textContent || 'FREE';
                const amount = priceText === 'FREE' ? 0 : parseFloat(priceText.replace(/[^\d.]/g, ''));
                
                return {
                    title: eventTitle,
                    price: amount,
                    currency: 'INR',
                    is_paid: amount > 0,
                    amount: amount
                };
            }
            
            // Final fallback
            console.warn('Event data not found, using fallback');
            return { title: eventTitle, price: 0, currency: 'INR', is_paid: false, amount: 0 };
            
        } catch (error) {
            console.error('Failed to get event data:', error);
            return { title: eventTitle, price: 0, currency: 'INR', is_paid: false, amount: 0 };
        }
    }

    titleToId(title) {
        return title.toLowerCase()
                   .replace(/[^\w\s-]/g, '')
                   .replace(/\s+/g, '-');
    }

    animateButtonClick(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }

    showModal(eventTitle, eventData = {}) {
        // Close any existing modal first
        if (this.modal) {
            this.closeModal();
            return;
        }

        this.currentEventTitle = eventTitle;
        this.currentEventData = eventData;
        
        // Clone template
        const template = document.getElementById('registrationModalTemplate');
        if (!template) {
            console.error('Modal template not found');
            return;
        }

        const modalClone = template.content.cloneNode(true);
        
        // Update event title
        const titleElement = modalClone.querySelector('.event-title-placeholder');
        titleElement.textContent = `Registering for: ${eventTitle}`;
        
        // Update price information
        this.updatePriceDisplay(modalClone, eventData);
        
        // Add modal to DOM
        document.body.appendChild(modalClone);
        this.modal = document.querySelector('.registration-modal');
        
        // Bind modal events after a small delay to ensure DOM is ready
        setTimeout(() => {
            this.bindModalEvents();
        }, 50);
        
        // Animate modal in
        this.animateModalIn();
    }

    updatePriceDisplay(modalClone, eventData) {
        const { price = 0, currency = 'INR' } = eventData;
        
        // Update price in event info section
        const priceAmountElement = modalClone.querySelector('.price-amount');
        if (price === 0) {
            priceAmountElement.textContent = 'FREE';
            priceAmountElement.classList.add('free-event');
        } else {
            priceAmountElement.textContent = `₹${price}`;
            priceAmountElement.classList.add('paid-event');
            
            // Show payment section for paid events
            const paymentSection = modalClone.querySelector('#paymentSection');
            paymentSection.style.display = 'block';
            
            // Update payment amounts
            modalClone.querySelector('#paymentAmount').textContent = `₹${price}`;
            modalClone.querySelector('#totalAmount').textContent = `₹${price}`;
        }
        
        // Update submit button text based on price
        const submitBtn = modalClone.querySelector('[data-action="submit"]');
        if (price === 0) {
            submitBtn.textContent = 'Complete Registration';
        } else {
            submitBtn.textContent = `Pay ₹${price} & Register`;
        }
    }

    bindModalEvents() {
        if (!this.modal) return;

        // Remove any existing event listeners to prevent duplicates
        this.removeModalEventListeners();

        // Close button (X)
        const closeBtn = this.modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeModal();
            });
        }

        // Cancel button
        const cancelBtn = this.modal.querySelector('[data-action="cancel"]');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Cancel button clicked'); // Debug log
                this.closeModal();
            });
        } else {
            console.error('Cancel button not found in modal');
        }

        // Submit button  
        const submitBtn = this.modal.querySelector('[data-action="submit"]');
        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.submitRegistration();
            });
        }

        // Overlay click to close
        const overlay = this.modal.querySelector('.modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeModal();
                }
            });
        }

        // ESC key handler (store reference for removal)
        this.escKeyHandler = (e) => {
            if (e.key === 'Escape' && this.modal) {
                this.closeModal();
            }
        };
        document.addEventListener('keydown', this.escKeyHandler);
    }

    removeModalEventListeners() {
        // Remove ESC key listener if it exists
        if (this.escKeyHandler) {
            document.removeEventListener('keydown', this.escKeyHandler);
            this.escKeyHandler = null;
        }
    }

    animateModalIn() {
        if (!this.modal) return;

        // Check if GSAP is available
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(this.modal, {
                opacity: 0
            }, {
                opacity: 1,
                duration: 0.3
            });

            gsap.fromTo(this.modal.querySelector('.modal-content'), {
                scale: 0.8,
                y: 50
            }, {
                scale: 1,
                y: 0,
                duration: 0.3,
                delay: 0.1
            });
        } else {
            // Fallback if GSAP is not available
            this.modal.style.opacity = '0';
            this.modal.style.display = 'block';
            setTimeout(() => {
                this.modal.style.opacity = '1';
                this.modal.style.transition = 'opacity 0.3s ease';
            }, 10);
        }
    }

    closeModal() {
        if (!this.modal) return;

        // Clean up event listeners
        this.removeModalEventListeners();

        if (typeof gsap !== 'undefined') {
            gsap.to(this.modal, {
                opacity: 0,
                duration: 0.3,
                onComplete: () => {
                    this.modal.remove();
                    this.modal = null;
                    this.currentEventTitle = '';
                    this.currentEventData = null;
                }
            });
        } else {
            // Fallback if GSAP is not available
            this.modal.style.transition = 'opacity 0.3s ease';
            this.modal.style.opacity = '0';
            setTimeout(() => {
                this.modal.remove();
                this.modal = null;
                this.currentEventTitle = '';
                this.currentEventData = null;
            }, 300);
        }
    }

    submitRegistration() {
        try {
            const form = this.modal.querySelector('#registrationForm');
            
            // Validate form element exists
            if (!form) {
                throw new Error('Registration form not found');
            }
            
            // Initialize FormData with error handling
            const formData = new FormData(form);
            
            // Validate FormData was created successfully
            if (!formData || typeof formData.get !== 'function') {
                throw new Error('Failed to initialize form data');
            }
            
            // Validate form data
            const validation = this.validateForm(formData);
            if (!validation.isValid) {
                this.showFormError(validation.message);
                return;
            }

            // Process registration
            this.processRegistration(formData);
            
        } catch (error) {
            console.error('Error in submitRegistration:', error);
            this.showFormError(`Form submission failed: ${error.message}`);
        }
    }

    validateForm(formData) {
        try {
            // Validate FormData object first
            if (!formData || typeof formData.get !== 'function') {
                throw new Error('Invalid form data object');
            }
            
            const requiredFields = [
                'firstName', 'lastName', 'email', 'mobileNumber', 'gender', 
                'dateOfBirth', 'address', 'tshirtSize', 'emergencyContactName', 
                'emergencyContactMobile', 'idProof'
            ];
            
            // Clear previous errors
            this.clearFormErrors();
            
            // Helper function to safely get form values
            const getFormValue = (fieldName) => {
                try {
                    const value = formData.get(fieldName);
                    if (value === null || value === undefined) return '';
                    return typeof value === 'string' ? value.trim() : value;
                } catch (error) {
                    console.error(`Error getting field ${fieldName}:`, error);
                    return '';
                }
            };
            
            // Helper function to mark field as error and get label text
            const markFieldError = (fieldName) => {
                try {
                    const fieldElement = document.getElementById(fieldName);
                    if (fieldElement) {
                        fieldElement.classList.add('error');
                        const label = fieldElement.previousElementSibling || fieldElement.labels?.[0];
                        return label ? label.textContent.replace(' *', '') : fieldName;
                    }
                    return fieldName;
                } catch (error) {
                    console.error(`Error marking field ${fieldName} as error:`, error);
                    return fieldName;
                }
            };
            
            // Check required fields with proper validation
            for (let field of requiredFields) {
                const value = getFormValue(field);
                
                // Special handling for file inputs
                if (field === 'idProof') {
                    const fileInput = document.getElementById('idProof');
                    const hasFile = fileInput?.files?.length > 0;
                    
                    if (!hasFile) {
                        const fieldName = markFieldError(field);
                        return {
                            isValid: false,
                            message: `Please upload your ${fieldName}.`
                        };
                    }
                } else {
                    // Regular text fields validation
                    if (!value || value.length === 0) {
                        const fieldName = markFieldError(field);
                        return {
                            isValid: false,
                            message: `Please fill in the ${fieldName} field.`
                        };
                    }
                }
            }
            
            // Enhanced validation with better error handling
            
            // Validate terms acceptance
            const termsAccepted = formData.get('termsAccepted');
            if (!termsAccepted || termsAccepted !== 'on') {
                markFieldError('termsAccepted');
                return {
                    isValid: false,
                    message: 'Please accept the terms and conditions to continue.'
                };
            }

            // Validate email format with proper sanitization
            const email = getFormValue('email').toLowerCase();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email || !emailRegex.test(email)) {
                markFieldError('email');
                return {
                    isValid: false,
                    message: 'Please enter a valid email address.'
                };
            }

            // Validate mobile number (Indian format)
            const mobileNumber = getFormValue('mobileNumber').replace(/\s+/g, '');
            const mobileRegex = /^[6-9]\d{9}$/;
            if (!mobileNumber || !mobileRegex.test(mobileNumber)) {
                markFieldError('mobileNumber');
                return {
                    isValid: false,
                    message: 'Please enter a valid 10-digit mobile number starting with 6-9.'
                };
            }

            // Validate emergency contact mobile
            const emergencyMobile = getFormValue('emergencyContactMobile').replace(/\s+/g, '');
            if (!emergencyMobile || !mobileRegex.test(emergencyMobile)) {
                markFieldError('emergencyContactMobile');
                return {
                    isValid: false,
                    message: 'Please enter a valid emergency contact mobile number.'
                };
            }

            // Validate date of birth with enhanced checks
            const dateOfBirth = getFormValue('dateOfBirth');
            if (dateOfBirth) {
                const birthDate = new Date(dateOfBirth);
                const today = new Date();
                
                // Check if date is valid
                if (isNaN(birthDate.getTime())) {
                    markFieldError('dateOfBirth');
                    return {
                        isValid: false,
                        message: 'Please enter a valid date of birth.'
                    };
                }
                
                // Check if date is not in future
                if (birthDate > today) {
                    markFieldError('dateOfBirth');
                    return {
                        isValid: false,
                        message: 'Date of birth cannot be in the future.'
                    };
                }
                
                const age = this.calculateAge(dateOfBirth);
                
                if (age < 16) {
                    markFieldError('dateOfBirth');
                    return {
                        isValid: false,
                        message: 'You must be at least 16 years old to participate.'
                    };
                }
                
                if (age > 80) {
                    markFieldError('dateOfBirth');
                    return {
                        isValid: false,
                        message: 'Please verify your date of birth (age appears to be over 80).'
                    };
                }
            }

            // Enhanced file upload validation
            const idProofFile = document.getElementById('idProof')?.files?.[0];
            if (idProofFile) {
                const maxSize = 5 * 1024 * 1024; // 5MB
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
                
                // Check file size
                if (idProofFile.size > maxSize) {
                    markFieldError('idProof');
                    return {
                        isValid: false,
                        message: `ID proof file size (${Math.round(idProofFile.size / 1024 / 1024)}MB) must be less than 5MB.`
                    };
                }
                
                // Check file type
                if (!allowedTypes.includes(idProofFile.type)) {
                    markFieldError('idProof');
                    return {
                        isValid: false,
                        message: 'Please upload a valid file format (JPG, PNG, or PDF).'
                    };
                }
                
                // Check minimum file size (not empty)
                if (idProofFile.size < 1024) { // Less than 1KB
                    markFieldError('idProof');
                    return {
                        isValid: false,
                        message: 'Uploaded file appears to be empty or corrupted.'
                    };
                }
            }

            // All validations passed
            return { isValid: true };
            
        } catch (error) {
            console.error('Error in form validation:', error);
            return {
                isValid: false,
                message: `Validation error: ${error.message}`
            };
        }
    }

    clearFormErrors() {
        const fields = this.modal.querySelectorAll('.form-group input, .form-group select, .form-group textarea');
        fields.forEach(field => field.classList.remove('error'));
        
        const errorDiv = this.modal.querySelector('.form-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    showFormError(message) {
        // Remove existing error
        const existingError = this.modal.querySelector('.form-error');
        if (existingError) {
            existingError.remove();
        }

        // Add new error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
        
        const modalBody = this.modal.querySelector('.modal-body');
        modalBody.insertBefore(errorDiv, modalBody.firstChild);
        modalBody.scrollTop = 0;
    }

    processRegistration(formData) {
        const eventPrice = this.currentEventData?.price || 0;
        
        if (eventPrice > 0) {
            // Handle paid event
            this.handlePaidEvent(formData);
        } else {
            // Handle free event
            this.handleFreeEvent(formData);
        }
    }

    async handleFreeEvent(formData) {
        try {
            this.showLoadingState('Completing Registration...');
            const userData = await this.collectUserDataWithFiles(formData);
            
            const registrationData = {
                event_id: this.currentEventData?.event_id || this.currentEventData?.id,
                event_slug: this.titleToId(this.currentEventTitle),
                event_title: this.currentEventTitle,
                amount: 0,
                currency: 'INR',
                registration_type: 'free',
                user_data: userData,
                request_timestamp: Date.now(),
                request_id: this.generateRequestId(),
                client_info: this.getClientInfo()
            };
            
            const result = await this.sendSecureRequest('api/events/register.php', registrationData);
            
            if (result.success) {
                this.showSuccessState(userData);
            } else {
                throw new Error(result.message || 'Registration failed');
            }
            
        } catch (error) {
            console.error('Error during free registration:', error);
            this.showFormError(`Registration failed: ${error.message}`);
            this.restoreFormFromLoading();
        }
    }

    async handlePaidEvent(formData) {
        try {
            this.showLoadingState('Processing Payment...');
            const userData = await this.collectUserDataWithFiles(formData);
            
            const orderData = {
                event_id: this.currentEventData?.event_id || this.currentEventData?.id,
                event_slug: this.titleToId(this.currentEventTitle),
                event_title: this.currentEventTitle,
                amount: this.currentEventData?.price || 0,
                currency: this.currentEventData?.currency || 'INR',
                user_data: userData,
                request_timestamp: Date.now(),
                request_id: this.generateRequestId(),
                client_info: this.getClientInfo()
            };
            
            const result = await this.sendSecureRequest('api/payments/create-order.php', orderData);
            
            console.log('Order creation result:', result);
            
            if (result.success) {
                this.initiateRazorpayPayment(result, orderData);
            } else {
                throw new Error(result.message || 'Failed to create order');
            }
            
        } catch (error) {
            console.error('Error creating order:', error);
            this.showFormError(`Payment initialization failed: ${error.message}`);
            this.restoreFormFromLoading();
        }
    }
    async sendSecureRequest(url, data) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Cache-Control': 'no-cache'
                },
                body: JSON.stringify(data),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Invalid response format - expected JSON');
            }
            
            return await response.json();
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timeout - please try again');
            }
            
            throw error;
        }
    }
    async collectUserDataWithFiles(formData) {
        const userData = this.collectUserData(formData);
        const fileInput = document.getElementById('idProof');
        const file = fileInput?.files?.[0];
        
        if (file) {
            try {
                const base64Data = await this.fileToBase64(file);
                userData.idProof = {
                    fileName: file.name,
                    fileSize: file.size,
                    fileType: file.type,
                    fileData: base64Data,
                    hasFile: true,
                    encoding: 'base64'
                };
            } catch (error) {
                console.error('Error encoding file:', error);
                throw new Error('Failed to process ID proof file');
            }
        }
        
        return userData;
    }
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    getClientInfo() {
        return {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            screen: {
                width: screen.width,
                height: screen.height
            }
        };
    }



    showLoadingState(customMessage = null) {
        const template = document.getElementById('registrationLoadingTemplate');
        const loadingClone = template.content.cloneNode(true);
        
        const modalBody = this.modal.querySelector('.modal-body');
        const modalFooter = this.modal.querySelector('.modal-footer');
        
        const title = loadingClone.querySelector('.loading-title');
        const message = loadingClone.querySelector('.loading-message');
        
        if (customMessage) {
            if (customMessage.includes('Payment')) {
                title.textContent = 'Processing Payment...';
                message.textContent = `Securely processing your payment for ${this.currentEventTitle}`;
            } else if (customMessage.includes('Registration')) {
                title.textContent = 'Completing Registration...';
                message.textContent = `Finalizing your registration for ${this.currentEventTitle}`;
            } else {
                title.textContent = 'Processing...';
                message.textContent = customMessage;
            }
        } else {
            title.textContent = 'Processing Registration...';
            message.textContent = `Please wait while we register you for ${this.currentEventTitle}`;
        }
        
        modalBody.innerHTML = '';
        modalBody.appendChild(loadingClone);
        modalFooter.innerHTML = '';
    }

    showSuccessState(userData) {
        const template = document.getElementById('registrationSuccessTemplate');
        const successClone = template.content.cloneNode(true);
        
        const greeting = successClone.querySelector('.success-greeting');
        greeting.textContent = `Thank you, ${userData.firstName}!`;
        
        const eventText = successClone.querySelector('.success-event');
        eventText.textContent = `You've been registered for ${this.currentEventTitle}`;
        
        const emailText = successClone.querySelector('.success-email');
        emailText.innerHTML = `<i class="fas fa-envelope"></i> Confirmation sent to ${userData.email}`;
        
        const phoneText = successClone.querySelector('.success-phone');
        phoneText.innerHTML = `<i class="fas fa-phone"></i> We may contact you at ${userData.phone}`;
        
        const modalBody = this.modal.querySelector('.modal-body');
        const modalFooter = this.modal.querySelector('.modal-footer');
        
        modalBody.innerHTML = '';
        modalBody.appendChild(successClone);
        
        modalFooter.innerHTML = `
            <button class="modal-btn primary" data-action="close">Great!</button>
        `;
        
        const closeBtn = modalFooter.querySelector('[data-action="close"]');
        closeBtn.addEventListener('click', () => this.closeModal());
        setTimeout(() => this.closeModal(), 5000);
    }

    collectUserData(formData) {
        try {
            // Validate FormData object
            if (!formData || typeof formData.get !== 'function') {
                throw new Error('Invalid FormData object provided');
            }
            
            const getFormValue = (fieldName, defaultValue = '') => {
                const value = formData.get(fieldName);
                if (value === null || value === undefined) {
                    return defaultValue;
                }
                return typeof value === 'string' ? value.trim() : value;
            };
            
            const getBooleanValue = (fieldName) => {
                const value = formData.get(fieldName);
                return value === 'on' || value === true || value === 'true';
            };
            
            const getFileInfo = () => {
                try {
                    const fileInput = document.getElementById('idProof');
                    const file = fileInput?.files?.[0];
                    
                    if (!file) {
                        return {
                            fileName: '',
                            fileSize: 0,
                            fileType: '',
                            hasFile: false
                        };
                    }
                    
                    return {
                        fileName: file.name || '',
                        fileSize: file.size || 0,
                        fileType: file.type || '',
                        hasFile: true,
                        fileLastModified: file.lastModified || Date.now()
                    };
                } catch (error) {
                    console.warn('Error getting file info:', error);
                    return {
                        fileName: '',
                        fileSize: 0,
                        fileType: '',
                        hasFile: false
                    };
                }
            };
            
            // Get mobile number for consistency
            const mobileNumber = getFormValue('mobileNumber');
            
            // Build user data object with proper validation and sanitization
            const userData = {
                // Personal Information (required fields)
                firstName: getFormValue('firstName'),
                lastName: getFormValue('lastName'),
                fullName: `${getFormValue('firstName')} ${getFormValue('lastName')}`.trim(),
                email: getFormValue('email').toLowerCase(),
                mobileNumber: mobileNumber,
                phone: mobileNumber, // For consistency with success state
                gender: getFormValue('gender'),
                dateOfBirth: getFormValue('dateOfBirth'),
                address: getFormValue('address'),
                
                // Event Details
                tshirtSize: getFormValue('tshirtSize'),
                runnerGroup: getFormValue('runnerGroup') || null,
                
                // Emergency Contact
                emergencyContactName: getFormValue('emergencyContactName'),
                emergencyContactMobile: getFormValue('emergencyContactMobile'),
                
                // File uploads (production-ready handling)
                idProof: getFileInfo(),
                
                // Terms and consent (proper boolean conversion)
                termsAccepted: getBooleanValue('termsAccepted'),
                newsletterConsent: getBooleanValue('newsletterConsent'),
                
                // Event and registration metadata
                eventTitle: this.currentEventTitle || 'Unknown Event',
                registrationDate: new Date().toISOString(),
                registrationTimestamp: Date.now(),
                
                // Additional metadata for production tracking
                userAgent: navigator.userAgent || 'Unknown',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',
                sessionId: this.generateSessionId(),
                
                // Calculate age from date of birth with validation
                age: this.calculateAge(getFormValue('dateOfBirth')),
                
                // Data integrity checks
                formVersion: '1.0',
                dataIntegrity: this.calculateDataHash(formData)
            };
            
            // Validate critical fields are not empty
            const criticalFields = ['firstName', 'lastName', 'email', 'mobileNumber'];
            for (const field of criticalFields) {
                if (!userData[field] || userData[field].length === 0) {
                    throw new Error(`Critical field ${field} is empty or invalid`);
                }
            }
            
            return userData;
            
        } catch (error) {
            console.error('Error collecting user data:', error);
            throw new Error(`Data collection failed: ${error.message}`);
        }
    }

    calculateAge(dateOfBirth) {
        try {
            if (!dateOfBirth || dateOfBirth.trim() === '') return null;
            
            const birthDate = new Date(dateOfBirth);
            const today = new Date();
            
            // Validate date is valid
            if (isNaN(birthDate.getTime())) {
                console.warn('Invalid birth date provided:', dateOfBirth);
                return null;
            }
            
            // Validate date is not in future
            if (birthDate > today) {
                console.warn('Birth date is in the future:', dateOfBirth);
                return null;
            }
            
            const age = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
            
            // Validate reasonable age range
            if (age < 0 || age > 120) {
                console.warn('Calculated age is unreasonable:', age);
                return null;
            }
            
            return age;
        } catch (error) {
            console.error('Error calculating age:', error);
            return null;
        }
    }
    
    /**
     * Generate a unique session ID for tracking purposes
     * @returns {string} Unique session identifier
     */
    generateSessionId() {
        try {
            const timestamp = Date.now().toString(36);
            const randomStr = Math.random().toString(36).substr(2, 5);
            return `${timestamp}-${randomStr}`;
        } catch (error) {
            console.error('Error generating session ID:', error);
            return `session-${Date.now()}`;
        }
    }
    
    /**
     * Calculate a simple hash of form data for integrity checking
     * @param {FormData} formData - The form data to hash
     * @returns {string} Simple hash string
     */
    calculateDataHash(formData) {
        try {
            let dataString = '';
            for (const [key, value] of formData.entries()) {
                if (typeof value === 'string') {
                    dataString += `${key}:${value.length}`;
                }
            }
            
            // Simple hash using string length and content
            let hash = 0;
            for (let i = 0; i < dataString.length; i++) {
                const char = dataString.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32-bit integer
            }
            
            return Math.abs(hash).toString(16);
        } catch (error) {
            console.error('Error calculating data hash:', error);
            return 'hash-error';
        }
    }

    initiateRazorpayPayment(orderResult, orderData) {
        // Extract data from your PHP response
        const { order_id, amount, currency, razorpaykey } = orderResult;
        
        const options = {
            "key": razorpaykey, // Use the key from your PHP response
            "amount": amount * 100, // Amount in paise (your PHP sends amount, not amount*100)
            "currency": currency,
            "name": "Fitness Conscious Goa",
            "description": `Registration for ${orderData.event_title}`,
            "order_id": order_id,
            "handler": (response) => {
                console.log('🎉 Payment successful! Payment ID:', response.razorpay_payment_id);
                // Payment successful - show success message directly
                this.showModalAfterPayment();
                this.showSuccessState(orderData.user_data);
            },
            "prefill": {
                "name": `${orderData.user_data.firstName} ${orderData.user_data.lastName}`,
                "email": orderData.user_data.email,
                "contact": orderData.user_data.mobileNumber
            },
            "notes": {
                "event_id": orderData.event_id,
                "event_title": orderData.event_title
            },
            "theme": {
                "color": "#28a745"
            },
            "modal": {
                "ondismiss": () => {
                    console.log('❌ Payment cancelled by user');
                    // Payment cancelled or closed - restore modal visibility
                    this.showModalAfterPayment();
                    this.showFormError('Payment was cancelled. Please try again.');
                    this.restoreFormFromLoading();
                }
            }
        };
        
        // Check if Razorpay is loaded
        if (typeof Razorpay === 'undefined') {
            console.error('Razorpay not loaded! Make sure to include: <script src="https://checkout.razorpay.com/v1/checkout.js"></script>');
            this.showFormError('Payment gateway not loaded. Please refresh the page and try again.');
            this.restoreFormFromLoading();
            return;
        }

        // Validate required options
        if (!order_id || !razorpaykey || !amount) {
            console.error('Missing required Razorpay options:', { order_id, razorpaykey, amount });
            this.showFormError('Invalid payment configuration. Please try again.');
            this.restoreFormFromLoading();
            return;
        }

        try {
            // Hide/minimize the registration modal when payment starts
            this.hideModalForPayment();
            
            // Create and open Razorpay payment interface
            const rzp = new Razorpay(options);
            
            // Handle Razorpay errors
            rzp.on('payment.failed', (response) => {
                console.error('❌ Payment failed:', response.error);
                this.showModalAfterPayment();
                this.showFormError(`Payment failed: ${response.error.description || 'Unknown error'}`);
                this.restoreFormFromLoading();
            });
            
            // Open payment interface
            rzp.open();
            
        } catch (error) {
            console.error('❌ Error initializing Razorpay:', error);
            this.showModalAfterPayment();
            this.showFormError('Failed to initialize payment. Please try again.');
            this.restoreFormFromLoading();
        }
    }

    hideModalForPayment() {
        // Hide the registration modal when Razorpay payment starts
        if (this.modal) {
            this.modal.style.display = 'none';
            this.modal.style.zIndex = '999'; // Lower z-index so Razorpay appears on top
            document.body.style.overflow = ''; // Restore body scroll for Razorpay
        }
    }

    showModalAfterPayment() {
        // Show the registration modal after payment (success/failure/cancel)
        if (this.modal) {
            this.modal.style.display = 'block';
            this.modal.style.zIndex = '10000'; // Restore high z-index
            document.body.style.overflow = 'hidden'; // Prevent body scroll
        }
    }

    verifyPayment(razorpayResponse, orderData, orderResult) {
        // Show modal back and display verification loading state
        this.showModalAfterPayment();
        this.showLoadingState('Verifying Payment...');
        
        const verificationData = {
            razorpay_order_id: razorpayResponse.razorpay_order_id,
            razorpay_payment_id: razorpayResponse.razorpay_payment_id,
            razorpay_signature: razorpayResponse.razorpay_signature,
            event_id: orderData.event_id,
            user_data: orderData.user_data,
            order_amount: orderResult.amount
        };

        fetch('api/payments/verify-payment.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(verificationData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Payment verified and registration completed successfully
                console.log('Payment verification successful:', data);
                this.showSuccessState(orderData.user_data);
            } else {
                throw new Error(data.message || 'Payment verification failed');
            }
        })
        .catch(error => {
            console.error('Error verifying payment:', error);
            // Ensure modal is visible for error display
            this.showModalAfterPayment();
            this.showFormError(`Payment verification failed: ${error.message}`);
            this.restoreFormFromLoading();
        });
    }

    restoreFormFromLoading() {
        // Restore the original form content
        const template = document.getElementById('registrationModalTemplate');
        const modalClone = template.content.cloneNode(true);
        
        // Update event title and price
        const titleElement = modalClone.querySelector('.event-title-placeholder');
        titleElement.textContent = `Registering for: ${this.currentEventTitle}`;
        this.updatePriceDisplay(modalClone, this.currentEventData);
        
        const modalBody = this.modal.querySelector('.modal-body');
        const modalFooter = this.modal.querySelector('.modal-footer');
        
        modalBody.innerHTML = '';
        
        // Get the modal body content from the template clone
        const templateModalBody = modalClone.querySelector('.modal-body');
        if (templateModalBody) {
            // Clone all child nodes from the template
            while (templateModalBody.firstChild) {
                modalBody.appendChild(templateModalBody.firstChild);
            }
        }
        
        modalFooter.innerHTML = `
            <button type="button" class="modal-btn secondary" data-action="cancel">Cancel</button>
            <button type="button" class="modal-btn primary" data-action="submit">${this.currentEventData?.price > 0 ? `Pay ₹${this.currentEventData.price} & Register` : 'Complete Registration'}</button>
        `;
        
        // Re-bind modal events
        this.bindModalEvents();
    }
}

// Initialize modal handler when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new EventRegistrationModal();
});