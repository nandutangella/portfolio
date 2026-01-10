/**
 * Cloudflare Worker - Cohere API Proxy
 * Keeps API key secure on Cloudflare's edge
 * 
 * Setup:
 * 1. Go to Cloudflare Dashboard → Workers & Pages
 * 2. Create a new Worker
 * 3. Paste this code
 * 4. Add COHERE_API_KEY in Settings → Variables → Environment Variables
 * 5. Deploy and note your worker URL (e.g., cohere-proxy.your-username.workers.dev)
 * 6. Update chat.js with your worker URL
 */

export default {
	async fetch(request, env) {
		// Get origin from request for CORS
		const origin = request.headers.get('Origin');
		
		// CORS headers for all responses - use specific origin if provided, otherwise *
		const corsHeaders = {
			'Access-Control-Allow-Origin': origin || '*',
			'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
			'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization',
			'Access-Control-Allow-Credentials': 'false',
			'Access-Control-Max-Age': '86400',
		};

		// Handle CORS preflight - must return early
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: corsHeaders,
			});
		}

		// Only allow POST requests
		if (request.method !== 'POST') {
			return new Response(JSON.stringify({ error: 'Method not allowed' }), {
				status: 405,
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			});
		}

		// Get API key from Cloudflare environment variable
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
	},
};
