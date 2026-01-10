/**
 * Cloudflare Pages Function - Cohere API Proxy
 * This runs as a serverless function on Cloudflare Pages
 * 
 * Setup:
 * 1. Add COHERE_API_KEY in Cloudflare Pages → Settings → Environment Variables
 * 2. Deploy your site - the function will be available at /api/chat
 */

export async function onRequest({ request, env }) {
	// Get origin from request for CORS
	const origin = request.headers.get('Origin') || request.headers.get('origin');
	
	// CORS headers for all responses
	const corsHeaders = {
		'Access-Control-Allow-Origin': origin || '*',
		'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

	// Only allow POST requests
	if (request.method !== 'POST') {
		return new Response(JSON.stringify({ 
			error: 'Method not allowed',
			method: request.method,
			url: request.url
		}), {
			status: 405,
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders,
			},
		});
	}

	// Get API key from Cloudflare Pages environment variable
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
