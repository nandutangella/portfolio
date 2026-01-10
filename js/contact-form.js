/**
 * Contact Form Handler
 * Handles form submission with Cloudflare Turnstile verification
 */

(function() {
	'use strict';

	const form = document.getElementById('contactForm');
	if (!form) return;

	const submitButton = document.getElementById('submitButton');
	const formMessage = document.getElementById('formMessage');
	const inputs = form.querySelectorAll('input, textarea');
	
	let isSubmitting = false;
	let turnstileWidgetId = null;

	// Initialize Turnstile when script loads
	function initializeTurnstile() {
		if (typeof turnstile !== 'undefined') {
			const widget = document.getElementById('turnstile-widget');
			if (widget && !turnstileWidgetId) {
				try {
					// Use your Turnstile Site Key here (replace with your actual key)
					const siteKey = '0x4AAAAAAABkMYinukE1B5qy'; // TODO: Replace with your actual Turnstile Site Key
					
					turnstileWidgetId = turnstile.render(widget, {
						sitekey: siteKey,
						theme: 'auto',
						callback: function(token) {
							// Token is ready - user has completed the challenge
							console.log('Turnstile verified');
						},
						'error-callback': function() {
							console.error('Turnstile error occurred');
							showMessage('Security verification failed. Please refresh the page and try again.', 'error');
						},
						'expired-callback': function() {
							console.log('Turnstile token expired');
						}
					});
				} catch (error) {
					console.error('Turnstile render error:', error);
					showMessage('Unable to load security verification. Please refresh the page.', 'error');
				}
			}
		} else if (typeof turnstile === 'undefined') {
			// Script not loaded yet, will retry
			return false;
		}
		return true;
	}

	// Wait for Turnstile script to load
	function waitForTurnstile() {
		if (typeof turnstile !== 'undefined') {
			initializeTurnstile();
		} else {
			// Retry after a short delay
			setTimeout(waitForTurnstile, 100);
		}
	}

	// Start initialization when DOM is ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', waitForTurnstile);
	} else {
		waitForTurnstile();
	}

	// Also try when window loads (fallback)
	window.addEventListener('load', function() {
		if (!turnstileWidgetId) {
			waitForTurnstile();
		}
	});

	// Clear form message on input
	inputs.forEach(input => {
		input.addEventListener('input', () => {
			clearError(input);
			clearMessage();
		});
	});

	// Form submission
	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		
		if (isSubmitting) return;
		
		// Clear previous errors and messages
		clearAllErrors();
		clearMessage();

		// Validate form
		if (!validateForm()) {
			return;
		}

		// Get Turnstile token - wait a bit for it to be available
		let turnstileToken = getTurnstileToken();
		
		// If token not immediately available, wait a moment (user might have just completed it)
		if (!turnstileToken) {
			await new Promise(resolve => setTimeout(resolve, 100));
			turnstileToken = getTurnstileToken();
		}
		
		if (!turnstileToken) {
			showMessage('Please complete the security verification below.', 'error');
			// Scroll to Turnstile widget
			const turnstileWidget = document.querySelector('.cf-turnstile');
			if (turnstileWidget) {
				turnstileWidget.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
			return;
		}

		// Prepare form data
		const formData = {
			name: document.getElementById('name').value.trim(),
			email: document.getElementById('email').value.trim(),
			subject: document.getElementById('subject').value.trim(),
			message: document.getElementById('message').value.trim(),
			turnstileToken: turnstileToken
		};

		// Submit form
		await submitForm(formData);
	});

	/**
	 * Validate form fields
	 */
	function validateForm() {
		let isValid = true;
		const name = document.getElementById('name');
		const email = document.getElementById('email');
		const subject = document.getElementById('subject');
		const message = document.getElementById('message');

		// Validate name
		if (!name.value.trim()) {
			showError(name, 'Name is required');
			isValid = false;
		}

		// Validate email
		if (!email.value.trim()) {
			showError(email, 'Email is required');
			isValid = false;
		} else if (!isValidEmail(email.value.trim())) {
			showError(email, 'Please enter a valid email address');
			isValid = false;
		}

		// Validate subject
		if (!subject.value.trim()) {
			showError(subject, 'Subject is required');
			isValid = false;
		}

		// Validate message
		if (!message.value.trim()) {
			showError(message, 'Message is required');
			isValid = false;
		} else if (message.value.trim().length < 10) {
			showError(message, 'Message must be at least 10 characters');
			isValid = false;
		}

		return isValid;
	}

	/**
	 * Check if email is valid
	 */
	function isValidEmail(email) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	/**
	 * Get Turnstile token
	 */
	function getTurnstileToken() {
		// Turnstile automatically creates a hidden input with name="cf-turnstile-response"
		// when the challenge is completed
		const tokenInput = document.querySelector('input[name="cf-turnstile-response"]');
		if (tokenInput && tokenInput.value && tokenInput.value.length > 0) {
			return tokenInput.value;
		}

		// If no token found, the challenge hasn't been completed
		return null;
	}

	/**
	 * Submit form to API
	 */
	async function submitForm(formData) {
		isSubmitting = true;
		setButtonLoading(true);

		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData)
			});

			const data = await response.json();

			if (response.ok && data.success) {
				showMessage('Thank you! Your message has been sent successfully.', 'success');
				form.reset();
				// Reset Turnstile
				if (typeof turnstile !== 'undefined' && turnstileWidgetId !== null) {
					turnstile.reset(turnstileWidgetId);
				}
			} else {
				showMessage(data.error || 'Something went wrong. Please try again.', 'error');
			}
		} catch (error) {
			console.error('Form submission error:', error);
			showMessage('Network error. Please check your connection and try again.', 'error');
		} finally {
			isSubmitting = false;
			setButtonLoading(false);
		}
	}

	/**
	 * Show error for a field
	 */
	function showError(input, message) {
		const errorElement = document.getElementById(input.id + '-error');
		if (errorElement) {
			errorElement.textContent = message;
			errorElement.style.display = 'block';
		}
		input.classList.add('form-input-error');
		input.setAttribute('aria-invalid', 'true');
	}

	/**
	 * Clear error for a field
	 */
	function clearError(input) {
		const errorElement = document.getElementById(input.id + '-error');
		if (errorElement) {
			errorElement.textContent = '';
			errorElement.style.display = 'none';
		}
		input.classList.remove('form-input-error');
		input.setAttribute('aria-invalid', 'false');
	}

	/**
	 * Clear all errors
	 */
	function clearAllErrors() {
		inputs.forEach(input => clearError(input));
	}

	/**
	 * Show message
	 */
	function showMessage(message, type) {
		if (!formMessage) return;
		
		formMessage.textContent = message;
		formMessage.className = `form-message form-message-${type}`;
		formMessage.style.display = 'block';
		
		// Scroll to message
		formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		
		// Auto-hide success messages after 5 seconds
		if (type === 'success') {
			setTimeout(() => {
				clearMessage();
			}, 5000);
		}
	}

	/**
	 * Clear message
	 */
	function clearMessage() {
		if (formMessage) {
			formMessage.textContent = '';
			formMessage.className = 'form-message';
			formMessage.style.display = 'none';
		}
	}

	/**
	 * Set button loading state
	 */
	function setButtonLoading(loading) {
		if (!submitButton) return;
		
		const submitText = submitButton.querySelector('.submit-text');
		const submitLoader = submitButton.querySelector('.submit-loader');
		
		if (loading) {
			submitButton.disabled = true;
			submitButton.setAttribute('aria-busy', 'true');
			if (submitText) submitText.style.display = 'none';
			if (submitLoader) submitLoader.style.display = 'inline-block';
		} else {
			submitButton.disabled = false;
			submitButton.removeAttribute('aria-busy');
			if (submitText) submitText.style.display = 'inline';
			if (submitLoader) submitLoader.style.display = 'none';
		}
	}

})();
