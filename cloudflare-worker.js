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
		// Handle CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
					'Access-Control-Max-Age': '86400',
				},
			});
		}

		// Only allow POST requests
		if (request.method !== 'POST') {
			return new Response(JSON.stringify({ error: 'Method not allowed' }), {
				status: 405,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
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
					'Access-Control-Allow-Origin': '*',
				},
			});
		}

		try {
			const requestBody = await request.json();

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

			const data = await response.json();

			return new Response(JSON.stringify(data), {
				status: response.status,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Headers': 'Content-Type',
				},
			});
		} catch (error) {
			return new Response(JSON.stringify({ error: error.message }), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
				},
			});
		}
	},
};
