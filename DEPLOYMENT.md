# Deployment Guide - Chat API Key Setup with Cloudflare

## Cloudflare Workers Setup (Recommended for Cloudflare-hosted domains)

### Step 1: Create Cloudflare Worker

1. **Go to Cloudflare Dashboard:**
   - Navigate to: https://dash.cloudflare.com
   - Go to **Workers & Pages** → **Create** → **Create Worker**

2. **Add the Worker Code:**
   - Copy the code from `cloudflare-worker.js`
   - Paste it into the Cloudflare Worker editor
   - Name it: `cohere-proxy` (or any name you prefer)

3. **Add Environment Variable:**
   - In the Worker editor, go to **Settings** → **Variables**
   - Under **Environment Variables**, click **Add variable**
   - Name: `COHERE_API_KEY`
   - Value: Your Cohere API key
   - Click **Save**

4. **Deploy the Worker:**
   - Click **Deploy**
   - Note your Worker URL (e.g., `https://cohere-proxy.your-username.workers.dev`)

### Step 2: Update Your Code

1. **Update `js/chat.js`:**
   - Find the line: `const CLOUDFLARE_WORKER_URL = 'https://cohere-proxy.your-username.workers.dev';`
   - Replace with your actual Worker URL from Step 1

2. **Commit and Push:**
   ```bash
   git add js/chat.js
   git commit -m "Update Cloudflare Worker URL"
   git push
   ```

### Step 3: (Optional) Use Custom Domain

If you want to use a subdomain like `api.nandutangella.com`:

1. **In Cloudflare Worker:**
   - Go to **Settings** → **Triggers**
   - Under **Routes**, click **Add route**
   - Route: `api.nandutangella.com/*`
   - Zone: `nandutangella.com`
   - Click **Save**

2. **Update `js/chat.js`:**
   - Change `CLOUDFLARE_WORKER_URL` to: `https://api.nandutangella.com`

---

## Local Development

- **Localhost:** Uses `chat-config.local.js` with direct API calls (if API key is set)
- **Production:** Uses Cloudflare Worker proxy (secure, no keys in client code)

---

## Alternative: Direct API (Less Secure)

If you prefer to use the API directly in production (not recommended):

1. Remove the proxy logic from `chat.js`
2. Add API key via environment variables in your build process
3. **Warning:** This exposes the key in client-side code

---

## Troubleshooting

### Worker returns 500 error:
- Check that `COHERE_API_KEY` is set in Cloudflare Worker environment variables
- Verify the key is correct in Cohere dashboard

### CORS errors:
- Cloudflare Worker already handles CORS
- If issues persist, check Worker logs in Cloudflare dashboard

### Worker URL not working:
- Verify the Worker is deployed and active
- Check the URL format matches exactly
- Test the Worker URL directly in browser/Postman

---

## Security Notes

✅ **Secure:** API key stored in Cloudflare (server-side)  
✅ **Free:** Cloudflare Workers free tier includes 100,000 requests/day  
✅ **Fast:** Runs on Cloudflare's edge network (global CDN)  
✅ **No keys in git:** API key never committed to repository
