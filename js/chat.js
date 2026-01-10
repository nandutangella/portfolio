/**
 * Chat Widget - AI Assistant with Generative AI
 * Demonstrates interest in AI and product design
 */

(function() {
	'use strict';

	// Configuration - Free and paid API options
	const HUGGINGFACE_API_KEY = window.HUGGINGFACE_API_KEY || '';
	const COHERE_API_KEY = window.COHERE_API_KEY || '';
	const OPENAI_API_KEY = window.OPENAI_API_KEY || '';
	
	// Auto-detect which API to use (prioritize free options)
	let API_PROVIDER = 'fallback';
	let API_KEY = '';
	
	if (HUGGINGFACE_API_KEY) {
		API_PROVIDER = 'huggingface';
		API_KEY = HUGGINGFACE_API_KEY;
	} else if (COHERE_API_KEY) {
		API_PROVIDER = 'cohere';
		API_KEY = COHERE_API_KEY;
	} else if (OPENAI_API_KEY) {
		API_PROVIDER = 'openai';
		API_KEY = OPENAI_API_KEY;
	}
	
	// Debug mode: only log in development
	const isDevelopment = window.location.hostname === 'localhost' || 
	                      window.location.hostname === '127.0.0.1' ||
	                      window.location.hostname === '';
	
	// In production, always use AI via Cloudflare Worker (API key is in Worker)
	// In development, use AI if API key is available, otherwise use fallback
	const USE_AI = isDevelopment 
		? (API_PROVIDER !== 'fallback')  // Local dev: only if API key is set
		: true;  // Production: always use AI via proxy (API key in Cloudflare Worker)
	
	// In production, force Cohere provider (via proxy)
	const PRODUCTION_API_PROVIDER = isDevelopment ? API_PROVIDER : 'cohere';
	
	// Debug: Log API key detection (development only)
	if (isDevelopment) {
		console.log('API Key Detection:', {
			huggingface: HUGGINGFACE_API_KEY ? 'Set' : 'Not set',
			cohere: COHERE_API_KEY ? 'Set (' + COHERE_API_KEY.substring(0, 10) + '...)' : 'Not set',
			openai: OPENAI_API_KEY ? 'Set' : 'Not set'
		});
		console.log('Selected API Provider:', PRODUCTION_API_PROVIDER, USE_AI ? '(AI Enabled)' : '(Using Fallback)');
	}

	// DOM Elements
	const chatWidget = document.getElementById('chatWidget');
	const chatBackdrop = document.getElementById('chatBackdrop');
	const chatContainer = document.getElementById('chatContainer');
	const chatClose = document.getElementById('chatClose');
	const chatForm = document.getElementById('chatForm');
	const chatFormInner = document.getElementById('chatFormInner');
	const chatInput = document.getElementById('chatInput');
	const chatInputInner = document.getElementById('chatInputInner');
	const chatMessages = document.getElementById('chatMessages');

	// State
	let isOpen = false;
	let messageHistory = [];

	// Knowledge base for responses (first person)
	const knowledgeBase = {
		greetings: [
			"Hello! I'm Nandu. Ask me anything about design, AI, or my work!",
			"Hi there! I'd love to chat about product design, AI, or my portfolio.",
			"Hey! I'm here to answer your questions about my work in design and AI."
		],
		design: [
			"I specialize in human-computer interaction and user experience design. I'm passionate about creating products that are useful, usable, and desirable.",
			"My design philosophy centers around understanding user needs and creating intuitive experiences. I've worked on AI-powered platforms like LivePerson's chat builder.",
			"Design isn't just about aesthetics—it's about solving real problems. I focus on creating experiences that matter, using both traditional design principles and modern AI tools."
		],
		ai: [
			"AI is transforming product design. I have experience designing AI-powered chat platforms and analytics tools that help businesses understand and optimize customer interactions.",
			"Generative AI opens up new possibilities for designers. It can help with ideation, prototyping, and creating more personalized user experiences.",
			"I'm interested in how AI can enhance the design process while maintaining a human-centered approach. The best AI tools augment human creativity, not replace it."
		],
		portfolio: [
			"I've worked on projects for companies like LivePerson, First American Title, and Terradatum. My portfolio includes AI chat builders, real estate analytics platforms, and mobile applications.",
			"Some notable projects I've worked on include AI Chat Analytics, AI Chat Builder, and the Aergo Real Estate Analytics Platform. Each project demonstrates my focus on user-centered design.",
			"You can explore my portfolio above to see detailed case studies of my work in product design, AI platforms, and user experience."
		],
		experience: [
			"I have extensive experience in product design, working with cross-functional teams to bring ideas from concept to reality.",
			"My work spans web and mobile applications, with a particular focus on creating intuitive interfaces for complex data and AI systems.",
			"I combine design thinking with technical understanding to create products that are both beautiful and functional."
		],
		skills: [
			"My skills include UI/UX design, human-computer interaction, prototyping, user research, and working with modern design tools like Figma.",
			"I'm experienced in designing for AI-powered platforms, understanding how to make complex systems feel simple and intuitive.",
			"Beyond design tools, I understand the technical aspects of product development, which helps me create designs that are both innovative and feasible."
		],
		default: [
			"That's an interesting question! I'm passionate about creating products that make a difference. Would you like to know more about my design process or specific projects?",
			"Great question! I focus on combining design thinking with modern technology to solve real user problems. What aspect interests you most?",
			"I'd love to help! My work spans product design, AI platforms, and user experience. What would you like to explore further?"
		]
	};

	// Mobile detection
	const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
	const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
	
	// Visual Viewport API for keyboard detection
	let visualViewport = null;
	let keyboardHeight = 0;
	let initialViewportHeight = window.innerHeight;
	
	// Initialize visual viewport when available
	if (window.visualViewport) {
		visualViewport = window.visualViewport;
		initialViewportHeight = visualViewport.height;
	}

	// Initialize chat
	function initChat() {
		if (!chatWidget || !chatContainer || !chatInput) return;

		// Close button handler
		if (chatClose) {
			chatClose.addEventListener('click', closeChat);
		}

		// Backdrop click handler
		if (chatBackdrop) {
			chatBackdrop.addEventListener('click', closeChat);
		}

		// Form submission
		if (chatForm) {
			chatForm.addEventListener('submit', handleSubmit);
		}
		if (chatFormInner) {
			chatFormInner.addEventListener('submit', handleSubmit);
		}

		// Focus input to open chat and blur page
		chatInput.addEventListener('focus', () => {
			if (!isOpen) {
				openChat();
				// Focus inner input after opening
				setTimeout(() => {
					if (chatInputInner) {
						chatInputInner.focus();
					}
				}, 150);
			}
		});
		
		if (chatInputInner) {
			chatInputInner.addEventListener('focus', () => {
				handleInputFocus();
			});
			
			chatInputInner.addEventListener('blur', () => {
				handleInputBlur();
			});
			
			// Handle input changes for better UX
			chatInputInner.addEventListener('input', () => {
				// Smooth scroll to bottom as user types
				requestAnimationFrame(() => {
					scrollToBottom();
				});
			});
		}

		// Close on escape key
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && isOpen) {
				closeChat();
			}
		});

		// Visual Viewport API for keyboard handling (mobile)
		if (visualViewport && isMobile) {
			visualViewport.addEventListener('resize', handleViewportResize);
			visualViewport.addEventListener('scroll', handleViewportScroll);
		}
		
		// Fallback for older browsers
		if (isMobile && !visualViewport) {
			window.addEventListener('resize', handleWindowResize);
		}
	}
	
	// Handle viewport resize (keyboard show/hide)
	function handleViewportResize() {
		if (!isOpen || !chatContainer || !visualViewport) return;
		
		const currentHeight = visualViewport.height;
		const heightDiff = initialViewportHeight - currentHeight;
		
		// Keyboard is likely open if viewport shrunk significantly
		if (heightDiff > 150) {
			keyboardHeight = heightDiff;
			adjustChatForKeyboard(true);
		} else {
			keyboardHeight = 0;
			adjustChatForKeyboard(false);
		}
	}
	
	// Handle viewport scroll (keyboard adjustments)
	function handleViewportScroll() {
		if (!isOpen || !chatContainer || !chatInputInner) return;
		
		// Keep input visible above keyboard
		requestAnimationFrame(() => {
			scrollToBottom();
		});
	}
	
	// Fallback window resize handler
	function handleWindowResize() {
		if (!isOpen || !chatContainer) return;
		
		const currentHeight = window.innerHeight;
		const heightDiff = initialViewportHeight - currentHeight;
		
		if (heightDiff > 150) {
			keyboardHeight = heightDiff;
			adjustChatForKeyboard(true);
		} else {
			keyboardHeight = 0;
			adjustChatForKeyboard(false);
		}
	}
	
	// Adjust chat container for keyboard
	function adjustChatForKeyboard(keyboardOpen) {
		if (!chatContainer) return;
		
		if (keyboardOpen && isMobile) {
			chatContainer.style.height = `${visualViewport ? visualViewport.height : window.innerHeight}px`;
			chatContainer.style.maxHeight = `${visualViewport ? visualViewport.height : window.innerHeight}px`;
			
			// Scroll to bottom after keyboard appears
			setTimeout(() => {
				scrollToBottom();
			}, 100);
		} else {
			// Reset to full height
			chatContainer.style.height = '';
			chatContainer.style.maxHeight = '';
		}
	}
	
	// Handle input focus
	function handleInputFocus() {
		if (!isMobile) return;
		
		// Prevent body scroll
		document.body.style.overflow = 'hidden';
		document.body.style.position = 'fixed';
		document.body.style.width = '100%';
		
		// Scroll to bottom
		setTimeout(() => {
			scrollToBottom();
		}, 300); // Wait for keyboard animation
	}
	
	// Handle input blur
	function handleInputBlur() {
		if (!isMobile) return;
		
		// Restore body scroll
		setTimeout(() => {
			document.body.style.overflow = '';
			document.body.style.position = '';
			document.body.style.width = '';
		}, 100);
	}

	// Open chat
	function openChat() {
		if (!chatWidget || !chatContainer) return;
		
		isOpen = true;
		chatWidget.classList.add('active');
		document.body.classList.add('chat-open');
		
		// Store initial viewport height (update if visual viewport is available)
		if (visualViewport) {
			initialViewportHeight = visualViewport.height;
		} else {
			initialViewportHeight = window.innerHeight;
		}
		
		// Prevent body scroll on mobile
		if (isMobile) {
			document.body.style.overflow = 'hidden';
		}
		
		// Scroll to bottom
		requestAnimationFrame(() => {
			scrollToBottom();
		});
	}

	// Close chat
	function closeChat() {
		if (!chatWidget) return;
		
		isOpen = false;
		chatWidget.classList.remove('active');
		document.body.classList.remove('chat-open');
		
		// Reset keyboard height
		keyboardHeight = 0;
		
		// Restore body scroll
		document.body.style.overflow = '';
		document.body.style.position = '';
		document.body.style.width = '';
		
		// Reset chat container height
		if (chatContainer) {
			chatContainer.style.height = '';
			chatContainer.style.maxHeight = '';
		}
		
		// Blur inputs
		if (chatInput) {
			chatInput.blur();
		}
		if (chatInputInner) {
			chatInputInner.blur();
		}
	}

	// Handle form submission
	async function handleSubmit(e) {
		e.preventDefault();
		
		const message = (chatInput && chatInput.value.trim()) || (chatInputInner && chatInputInner.value.trim());
		if (!message) return;

		// Add user message
		addMessage(message, 'user');
		
		// Clear inputs
		if (chatInput) chatInput.value = '';
		if (chatInputInner) chatInputInner.value = '';
		
		// Show typing indicator
		showTypingIndicator();
		
		try {
			let response;
			if (USE_AI) {
				// Use generative AI
				if (isDevelopment) {
					console.log('Calling AI API:', PRODUCTION_API_PROVIDER);
				}
				response = await generateAIResponse(message);
				if (isDevelopment) {
					console.log('AI Response received:', response.substring(0, 50) + '...');
				}
			} else {
				// Use fallback knowledge base
				if (isDevelopment) {
					console.log('Using fallback responses (no API key detected)');
				}
				await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
				response = generateResponse(message);
			}
			
			hideTypingIndicator();
			addMessage(response, 'bot');
		} catch (error) {
			console.error('Error generating response:', error);
			console.error('Error details:', error.message);
			hideTypingIndicator();
			// Fallback to knowledge base on error
			if (isDevelopment) {
				console.log('Falling back to keyword-based responses');
			}
			const fallbackResponse = generateResponse(message);
			addMessage(fallbackResponse, 'bot');
		}
	}

	// Add message to chat
	function addMessage(text, type) {
		if (!chatMessages) return;

		const messageDiv = document.createElement('div');
		messageDiv.className = `chat-message chat-message-${type}`;
		
		const contentDiv = document.createElement('div');
		contentDiv.className = 'chat-message-content';
		
		const p = document.createElement('p');
		p.textContent = text;
		
		contentDiv.appendChild(p);
		messageDiv.appendChild(contentDiv);
		chatMessages.appendChild(messageDiv);
		
		// Save to history
		messageHistory.push({ text, type, timestamp: Date.now() });
		
		// Scroll to bottom
		scrollToBottom();
	}

	// Show typing indicator
	function showTypingIndicator() {
		if (!chatMessages) return;

		const typingDiv = document.createElement('div');
		typingDiv.className = 'chat-message chat-message-bot';
		typingDiv.id = 'typingIndicator';
		
		const typingContent = document.createElement('div');
		typingContent.className = 'chat-typing';
		
		for (let i = 0; i < 3; i++) {
			const dot = document.createElement('div');
			dot.className = 'chat-typing-dot';
			typingContent.appendChild(dot);
		}
		
		typingDiv.appendChild(typingContent);
		chatMessages.appendChild(typingDiv);
		
		scrollToBottom();
	}

	// Hide typing indicator
	function hideTypingIndicator() {
		const typingIndicator = document.getElementById('typingIndicator');
		if (typingIndicator) {
			typingIndicator.remove();
		}
	}

	// Scroll to bottom of messages (optimized for mobile)
	function scrollToBottom() {
		if (!chatMessages) return;
		
		// Use smooth scroll for better UX
		chatMessages.scrollTo({
			top: chatMessages.scrollHeight,
			behavior: 'smooth'
		});
		
		// Fallback for browsers that don't support scrollTo
		if (typeof chatMessages.scrollTo !== 'function') {
			chatMessages.scrollTop = chatMessages.scrollHeight;
		}
	}

	// Generate AI response using selected API provider
	async function generateAIResponse(userMessage) {
		// Build conversation context
		const conversationHistory = messageHistory
			.slice(-6) // Last 6 messages for context
			.map(msg => ({
				role: msg.type === 'user' ? 'user' : 'assistant',
				content: msg.text
			}));

		// System prompt to guide the AI
		const systemPrompt = `You are Nandu, a product designer specializing in human-computer interaction, user experience design, and AI-powered products. You're passionate about creating useful, usable, and desirable products. 

Key facts about you:
- You've worked on projects for companies like LivePerson, First American Title, and Terradatum
- Your portfolio includes AI chat builders, real estate analytics platforms, and mobile applications
- Notable projects: AI Chat Analytics, AI Chat Builder, Aergo Real Estate Analytics Platform
- You specialize in UI/UX design, prototyping, user research, and work with tools like Figma
- You're interested in how AI can enhance the design process while maintaining a human-centered approach

Always respond in first person (I, me, my). Be conversational, helpful, and authentic. Keep responses concise (2-3 sentences typically).`;

		try {
			if (isDevelopment) {
				console.log(`Using ${PRODUCTION_API_PROVIDER} API provider`);
			}
			let response;
			
			switch (PRODUCTION_API_PROVIDER) {
				case 'huggingface':
					response = await callHuggingFaceAPI(userMessage, systemPrompt, conversationHistory);
					break;
				case 'cohere':
					response = await callCohereAPI(userMessage, systemPrompt, conversationHistory);
					break;
				case 'openai':
					response = await callOpenAIAPI(userMessage, systemPrompt, conversationHistory);
					break;
				default:
					throw new Error('No API provider configured');
			}
			
			return response;
		} catch (error) {
			console.error(`${PRODUCTION_API_PROVIDER} API error:`, error);
			// Log more details for debugging
			if (error.message) {
				console.error('Error details:', error.message);
			}
			throw error;
		}
	}

	// Hugging Face API (Free tier available)
	async function callHuggingFaceAPI(userMessage, systemPrompt, conversationHistory) {
		// Using Hugging Face Inference API with a free conversational model
		const model = 'microsoft/DialoGPT-medium'; // Free conversational model
		
		// Build prompt from conversation
		let prompt = systemPrompt + '\n\n';
		conversationHistory.forEach(msg => {
			prompt += `${msg.role === 'user' ? 'User' : 'Nandu'}: ${msg.content}\n`;
		});
		prompt += `User: ${userMessage}\nNandu:`;

		const response = await fetch(
			`https://api-inference.huggingface.co/models/${model}`,
			{
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${API_KEY}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					inputs: prompt,
					parameters: {
						max_new_tokens: 100,
						temperature: 0.7,
						return_full_text: false
					}
				})
			}
		);

		if (!response.ok) {
			throw new Error(`Hugging Face API error: ${response.status}`);
		}

		const data = await response.json();
		
		// Handle Hugging Face response format
		if (Array.isArray(data) && data[0] && data[0].generated_text) {
			return data[0].generated_text.trim();
		} else if (data.error) {
			throw new Error(data.error);
		}
		
		// Fallback: try to extract text from response
		return JSON.stringify(data).substring(0, 150);
	}

	// Cohere API (Free tier available)
	async function callCohereAPI(userMessage, systemPrompt, conversationHistory) {
		// Build conversation for Cohere
		const messages = conversationHistory.map(msg => ({
			role: msg.role === 'user' ? 'USER' : 'CHATBOT',
			message: msg.content
		}));

		// Check if we should use a proxy (for production) or direct API (for local dev)
		// Use proxy if: on production domain OR no API key available
		// Use direct API if: on localhost AND API key is available
		const isLocalhost = window.location.hostname === 'localhost' || 
		                   window.location.hostname === '127.0.0.1' ||
		                   window.location.hostname === '';
		// In production, always use proxy (API key is in Cloudflare Worker)
		// In development, use proxy if no API key, otherwise use direct API
		const useProxy = !isLocalhost || !API_KEY;
		
		// Cloudflare Worker URL - Update this with your actual worker URL
		// Format: https://cohere-proxy.your-username.workers.dev
		// Or if using custom domain: https://api.yourdomain.com
		const CLOUDFLARE_WORKER_URL = 'https://cohere-proxy.wispy-king-9050.workers.dev';
		
		const apiEndpoint = useProxy 
			? CLOUDFLARE_WORKER_URL  // Cloudflare Worker proxy (production)
			: 'https://api.cohere.ai/v1/chat';     // Direct API call (local dev only)

		// Try available models in order (fallback if one doesn't work)
		const modelsToTry = ['command-r-08-2024', 'command-r-plus-08-2024', 'command-a-03-2025'];
		
		for (const model of modelsToTry) {
			try {
				const requestHeaders = {
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				};
				
				// Only add Authorization header if using direct API (not proxy)
				if (!useProxy && API_KEY) {
					requestHeaders['Authorization'] = `Bearer ${API_KEY}`;
				}

				const response = await fetch(apiEndpoint, {
					method: 'POST',
					headers: requestHeaders,
					body: JSON.stringify({
						message: userMessage,
						chat_history: messages,
						preamble: systemPrompt,
						model: model,
						temperature: 0.7,
						max_tokens: 150
					})
				});

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({}));
					// If model not found, try next model
					if (errorData.message && errorData.message.includes('removed') && modelsToTry.indexOf(model) < modelsToTry.length - 1) {
						if (isDevelopment) {
							console.warn(`Model ${model} not available, trying next...`);
						}
						continue;
					}
					const errorMessage = errorData.message || `HTTP ${response.status}`;
					if (isDevelopment) {
						console.error('Cohere API error response:', errorData);
					}
					throw new Error(`Cohere API error: ${errorMessage}`);
				}

				const data = await response.json();
				
				// Cohere returns response in 'text' field
				if (data.text) {
					if (isDevelopment) {
						console.log(`Successfully used model: ${model}`);
					}
					return data.text.trim();
				} else {
					if (isDevelopment) {
						console.warn('Unexpected Cohere response format:', data);
					}
					throw new Error('Unexpected response format from Cohere API');
				}
			} catch (error) {
				// If this is the last model, throw the error
				if (modelsToTry.indexOf(model) === modelsToTry.length - 1) {
					throw error;
				}
				// Otherwise, try next model
				continue;
			}
		}
		
		throw new Error('All Cohere models failed');
	}

	// OpenAI API (Paid, but most powerful)
	async function callOpenAIAPI(userMessage, systemPrompt, conversationHistory) {
		const messages = [
			{ role: 'system', content: systemPrompt },
			...conversationHistory,
			{ role: 'user', content: userMessage }
		];

		const response = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${API_KEY}`
			},
			body: JSON.stringify({
				model: 'gpt-3.5-turbo',
				messages: messages,
				temperature: 0.7,
				max_tokens: 150
			})
		});

		if (!response.ok) {
			throw new Error(`OpenAI API error: ${response.status}`);
		}

		const data = await response.json();
		return data.choices[0].message.content.trim();
	}

	// Generate fallback response based on user input (keyword matching)
	function generateResponse(userMessage) {
		const message = userMessage.toLowerCase();
		
		// Check for keywords and return relevant response
		if (message.match(/\b(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b/)) {
			return getRandomResponse(knowledgeBase.greetings);
		}
		
		if (message.match(/\b(design|ui|ux|user experience|interface|visual|aesthetic|prototype|wireframe|figma|sketch)\b/)) {
			return getRandomResponse(knowledgeBase.design);
		}
		
		if (message.match(/\b(ai|artificial intelligence|machine learning|chatbot|generative|gpt|llm|neural)\b/)) {
			return getRandomResponse(knowledgeBase.ai);
		}
		
		if (message.match(/\b(portfolio|projects|work|case study|examples|what has|what did|show me)\b/)) {
			return getRandomResponse(knowledgeBase.portfolio);
		}
		
		if (message.match(/\b(experience|background|career|worked|companies|clients)\b/)) {
			return getRandomResponse(knowledgeBase.experience);
		}
		
		if (message.match(/\b(skills|abilities|tools|technologies|what can|expertise)\b/)) {
			return getRandomResponse(knowledgeBase.skills);
		}
		
		// Default response
		return getRandomResponse(knowledgeBase.default);
	}

	// Get random response from array
	function getRandomResponse(responses) {
		return responses[Math.floor(Math.random() * responses.length)];
	}

	// Initialize on DOM ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initChat);
	} else {
		initChat();
	}

})();
