# Quick Cloudflare Worker Setup

## 1. Create Worker in Cloudflare Dashboard

1. Go to: https://dash.cloudflare.com → **Workers & Pages** → **Create Worker**
2. Name: `cohere-proxy`
3. Copy code from `cloudflare-worker.js` and paste into editor
4. Click **Deploy**

## 2. Add API Key

1. In Worker editor → **Settings** → **Variables**
2. Click **Add variable**
3. Name: `COHERE_API_KEY`
4. Value: `IswNB5IfpnegFv0ACkLgYzXBhp4F5Y3FYEu4fSSt`
5. Click **Save**

## 3. Get Your Worker URL

After deploying, you'll see a URL like:
- `https://cohere-proxy.your-username.workers.dev`

## 4. Update chat.js

Open `js/chat.js` and find line ~396:
```javascript
const CLOUDFLARE_WORKER_URL = 'https://cohere-proxy.your-username.workers.dev';
```

Replace with your actual Worker URL from step 3.

## 5. Test

1. Deploy your site
2. Open the chat
3. Send a message
4. Check browser console - should see "Using cohere API provider"

## Optional: Custom Domain

To use `api.nandutangella.com`:

1. In Cloudflare Worker → **Settings** → **Triggers**
2. Under **Routes** → **Add route**
3. Route: `api.nandutangella.com/*`
4. Zone: `nandutangella.com`
5. Update `CLOUDFLARE_WORKER_URL` in chat.js to: `https://api.nandutangella.com`

---

**That's it!** Your chat will now use the Cloudflare Worker proxy securely. 🎉
