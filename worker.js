/**
 * Cloudflare Worker - API Handler
 * 
 * This Worker handles API requests for:
 * - Chat widget (Cohere API proxy)
 * - Contact form submissions (with Turnstile verification and email sending)
 * 
 * DEPLOYMENT:
 * - Automatic: GitHub Actions workflow (`.github/workflows/deploy-worker.yml`)
 *   - Uses GitHub Secrets for API keys
 *   - Deploys on push to main branch
 * 
 * - Manual: 
 *   1. Install Wrangler: npm install -g wrangler
 *   2. Login: wrangler login
 *   3. Deploy: wrangler deploy worker.js --env production
 * 
 * ENVIRONMENT VARIABLES:
 * - COHERE_API_KEY: For chat functionality
 * - TURNSTILE_SECRET_KEY: For contact form bot protection
 * - RESEND_API_KEY: For sending emails (or use alternative email service)
 * - CONTACT_EMAIL: Email address to receive contact form submissions (default: me@nandutangella.com)
 * 
 * ROUTE:
 * - Configured in wrangler.toml
 * - Routes: yourdomain.com/api/chat, yourdomain.com/api/contact
 */

export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const path = url.pathname;
		
		// Get origin from request for CORS
		const origin = request.headers.get('Origin') || request.headers.get('origin');
		
		// CORS headers for all responses
		const corsHeaders = {
			'Access-Control-Allow-Origin': origin || '*',
			'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
			'Access-Control-Allow-Headers': 'Content-Type, Accept',
			'Access-Control-Max-Age': '86400',
		};

		// Handle OPTIONS preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: corsHeaders,
			});
		}

		// Route to appropriate handler
		if (path === '/api/contact' || path.endsWith('/api/contact')) {
			return handleContactForm(request, env, corsHeaders);
		} else if (path === '/api/chat' || path.endsWith('/api/chat')) {
			return handleChat(request, env, corsHeaders);
		}

		// Handle GET requests (for testing)
		if (request.method === 'GET') {
			return new Response(JSON.stringify({ 
				status: 'Worker is running!',
				method: 'GET',
				url: request.url,
				endpoints: ['/api/chat', '/api/contact'],
				timestamp: new Date().toISOString()
			}), {
				status: 200,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		return new Response(JSON.stringify({ error: 'Not found' }), {
			status: 404,
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders,
			},
		});
	}
};

/**
 * Handle contact form submissions
 */
async function handleContactForm(request, env, corsHeaders) {
	if (request.method !== 'POST') {
		return new Response(JSON.stringify({ 
			error: 'Method not allowed',
			method: request.method,
			allowedMethods: ['POST', 'OPTIONS']
		}), {
			status: 405,
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders,
			},
		});
	}

	try {
		// Parse request body
		let requestBody;
		try {
			requestBody = await request.json();
		} catch (parseError) {
			return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		// Validate required fields
		const { name, email, subject, message, turnstileToken } = requestBody;
		
		if (!name || !email || !subject || !message) {
			return new Response(JSON.stringify({ error: 'Missing required fields' }), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		// Verify Turnstile token
		if (!turnstileToken) {
			return new Response(JSON.stringify({ error: 'Security verification required' }), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		// Verify Turnstile with Cloudflare
		const turnstileSecret = env.TURNSTILE_SECRET_KEY;
		if (turnstileSecret) {
			const turnstileResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					secret: turnstileSecret,
					response: turnstileToken,
				}),
			});

			const turnstileData = await turnstileResponse.json();
			
			if (!turnstileData.success) {
				return new Response(JSON.stringify({ error: 'Security verification failed' }), {
					status: 403,
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders,
					},
				});
			}
		}

		// Send email using Resend
		const resendApiKey = env.RESEND_API_KEY;
		const contactEmail = env.CONTACT_EMAIL || 'me@nandutangella.com';
		
		if (!resendApiKey) {
			// Fallback: Log the submission (for development)
			console.log('Contact form submission:', { name, email, subject, message });
			return new Response(JSON.stringify({ 
				success: true,
				message: 'Form submitted (email not configured)'
			}), {
				status: 200,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		// Send email via Resend
		const emailResponse = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${resendApiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				from: 'Contact Form <onboarding@resend.dev>', // Update with your verified domain
				to: [contactEmail],
				subject: `Contact Form: ${subject}`,
				html: `
					<h2>New Contact Form Submission</h2>
					<p><strong>Name:</strong> ${escapeHtml(name)}</p>
					<p><strong>Email:</strong> ${escapeHtml(email)}</p>
					<p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
					<p><strong>Message:</strong></p>
					<p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
					<hr>
					<p><small>Sent from nandutangella.com contact form</small></p>
				`,
				text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
Sent from nandutangella.com contact form
				`,
			}),
		});

		if (!emailResponse.ok) {
			const errorData = await emailResponse.text();
			console.error('Email sending failed:', errorData);
			return new Response(JSON.stringify({ 
				error: 'Failed to send email. Please try again later.' 
			}), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		const emailData = await emailResponse.json();

		return new Response(JSON.stringify({ 
			success: true,
			message: 'Your message has been sent successfully!'
		}), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders,
			},
		});

	} catch (error) {
		console.error('Contact form error:', error);
		return new Response(JSON.stringify({ 
			error: error.message || 'Internal server error',
			type: error.name || 'Error'
		}), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders,
			},
		});
	}
}

/**
 * Handle chat API requests (Cohere proxy)
 */
async function handleChat(request, env, corsHeaders) {
	// Handle GET requests (for testing)
	if (request.method === 'GET') {
		return new Response(JSON.stringify({ 
			status: 'Chat API is running!',
			method: 'GET',
			hasApiKey: !!env.COHERE_API_KEY,
			timestamp: new Date().toISOString()
		}), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders,
			},
		});
	}

	// Only allow POST requests for API calls
	if (request.method !== 'POST') {
		return new Response(JSON.stringify({ 
			error: 'Method not allowed',
			method: request.method,
			allowedMethods: ['GET', 'POST', 'OPTIONS']
		}), {
			status: 405,
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders,
			},
		});
	}

	// Get API key from environment variable
	const API_KEY = env.COHERE_API_KEY;
	
	if (!API_KEY) {
		return new Response(JSON.stringify({ error: 'API key not configured' }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders,
			},
		});
	}

	try {
		// Parse request body
		let requestBody;
		try {
			requestBody = await request.json();
		} catch (parseError) {
			return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		// Forward request to Cohere API
		const response = await fetch('https://api.cohere.ai/v1/chat', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${API_KEY}`,
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
			body: JSON.stringify(requestBody),
		});

		// Parse response
		let data;
		try {
			data = await response.json();
		} catch (jsonError) {
			return new Response(JSON.stringify({ 
				error: 'Invalid response from Cohere API',
				status: response.status 
			}), {
				status: 502,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		return new Response(JSON.stringify(data), {
			status: response.status,
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders,
			},
		});
	} catch (error) {
		return new Response(JSON.stringify({ 
			error: error.message || 'Internal server error',
			type: error.name || 'Error'
		}), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders,
			},
		});
	}
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
	const map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	};
	return String(text).replace(/[&<>"']/g, m => map[m]);
}
