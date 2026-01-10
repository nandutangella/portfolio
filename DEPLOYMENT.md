# Deployment Guide - AI Chat Setup with Cloudflare Pages Functions

## Cloudflare Pages Functions Setup

This uses Cloudflare Pages Functions, which run on the same domain as your site, eliminating CORS issues.

### Step 1: Add Environment Variable

1. **Go to Cloudflare Dashboard:**
   - Navigate to: https://dash.cloudflare.com
   - Go to **Workers & Pages** → Your site (`nandutangella.com`)

2. **Add Environment Variable:**
   - Go to **Settings** → **Environment Variables**
   - Click **Add variable**
   - Name: `COHERE_API_KEY`
   - Value: Your Cohere API key
   - Environment: **Production** (and optionally **Preview** for testing)
   - Click **Save**

### Step 2: Deploy Your Site

The Pages Function is already set up in `functions/api/chat.js`. When you deploy:

1. Push your code to your repository
2. Cloudflare Pages will automatically:
   - Detect the `functions/` folder
   - Deploy the function at `/api/chat`
   - Make it available at `https://nandutangella.com/api/chat`

### Step 3: Verify It's Working

1. Open your site in production
2. Open the browser console
3. Try the chat - it should work without CORS errors
4. The function will be called at `/api/chat` (same domain, no CORS)

---

## Local Development

- **Localhost:** Uses `chat-config.local.js` with direct API calls (if API key is set)
- **Production:** Uses Cloudflare Pages Function at `/api/chat` (secure, no keys in client code)

---

## Troubleshooting

### Function returns 500 error:
- Check that `COHERE_API_KEY` is set in Cloudflare Pages environment variables
- Verify the key is correct in Cohere dashboard
- Check Cloudflare Pages logs: **Workers & Pages** → Your site → **Logs**

### CORS errors:
- Pages Functions run on the same domain, so CORS shouldn't be an issue
- If you see CORS errors, check that the function is deployed correctly

### Function not found (404):
- Verify the `functions/api/chat.js` file exists
- Check that your site is deployed (not just preview)
- Ensure the function file is in the correct location: `functions/api/chat.js`

---

## Security Notes

✅ **Secure:** API key stored in Cloudflare Pages (server-side)  
✅ **Free:** Cloudflare Pages Functions free tier includes 100,000 requests/day  
✅ **Fast:** Runs on Cloudflare's edge network (global CDN)  
✅ **No keys in git:** API key never committed to repository  
✅ **No CORS issues:** Function runs on same domain as your site

---

## File Structure

```
Portfolio/
├── functions/
│   └── api/
│       └── chat.js          # Pages Function (handles API calls)
├── js/
│   └── chat.js              # Client-side chat widget
└── index.html               # Main page
```

The function at `functions/api/chat.js` will be available at `https://nandutangella.com/api/chat`.
