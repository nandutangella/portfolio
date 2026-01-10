/**
 * Chat Widget Configuration
 * 
 * FREE API OPTIONS (Recommended):
 * 
 * 1. HUGGING FACE (Free tier available):
 *    - Sign up at https://huggingface.co
 *    - Get API token from https://huggingface.co/settings/tokens
 *    - Set HUGGINGFACE_API_KEY below
 *    - Uses free inference API (limited but free)
 * 
 * 2. COHERE (Free tier available):
 *    - Sign up at https://cohere.com
 *    - Get API key from dashboard
 *    - Set COHERE_API_KEY below
 * 
 * 3. OPENAI (Paid, but most powerful):
 *    - Get API key from https://platform.openai.com/api-keys
 *    - Requires payment method
 *    - Set OPENAI_API_KEY below
 * 
 * Note: Without an API key, the chat will use intelligent fallback responses
 * based on keyword matching (completely free, no setup required).
 * 
 * SECURITY: For production, use a backend proxy to keep API keys secure.
 */

// Free API Options (choose one):
// IMPORTANT: Never commit API keys to git! Use environment variables or a backend proxy.
// Copy this file to chat-config.local.js and add your keys there (add .local.js to .gitignore)
window.HUGGINGFACE_API_KEY = ''; // Free tier available at huggingface.co
window.COHERE_API_KEY = ''; // Free tier available at cohere.com

// Paid Option:
window.OPENAI_API_KEY = ''; // Requires payment method

// API Provider Selection (auto-detects based on which key is set)
// Options: 'huggingface', 'cohere', 'openai', or 'fallback' (no key)
