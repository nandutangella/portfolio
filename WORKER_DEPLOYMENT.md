# Cloudflare Worker Deployment Guide

## Why Use a Worker Instead of Pages Functions?

Cloudflare Workers are more reliable than Pages Functions for API endpoints:
- ✅ Independent deployment (not tied to Pages build)
- ✅ Better routing control
- ✅ Easier to debug
- ✅ More predictable behavior

## Step 1: Install Wrangler CLI

```bash
npm install -g wrangler
```

Or use npx (no installation needed):
```bash
npx wrangler --version
```

## Step 2: Login to Cloudflare

```bash
wrangler login
```

This will open your browser to authenticate.

## Step 3: Deploy the Worker

```bash
cd /Users/dev/Portfolio
wrangler deploy worker.js
```

This will:
- Create a new Worker named `cohere-api-proxy`
- Deploy it to Cloudflare
- Give you a `*.workers.dev` URL (we'll use a custom route instead)

## Step 4: Add Environment Variable

1. Go to Cloudflare Dashboard: https://dash.cloudflare.com
2. Navigate to **Workers & Pages** → `cohere-api-proxy`
3. Go to **Settings** → **Variables**
4. Click **Add variable**
5. Name: `COHERE_API_KEY`
6. Value: Your Cohere API key
7. Click **Save**

## Step 5: Add Custom Route

1. In Cloudflare Dashboard → **Workers & Pages** → `cohere-api-proxy`
2. Go to **Settings** → **Routes**
3. Click **Add route**
4. Route: `nandutangella.com/api/chat`
5. Zone: `nandutangella.com`
6. Click **Save**

**OR** use Wrangler to add the route:

```bash
wrangler routes add nandutangella.com/api/chat --zone-name nandutangella.com
```

## Step 6: Test the Worker

Visit: `https://nandutangella.com/api/chat`

You should see:
```json
{
  "status": "Worker is running!",
  "method": "GET",
  "hasApiKey": true
}
```

## Troubleshooting

### Worker returns 404:
- Check the route is added correctly in Cloudflare Dashboard
- Verify the route pattern matches exactly: `nandutangella.com/api/chat`
- Wait a few minutes for DNS propagation

### Worker returns 500 "API key not configured":
- Verify `COHERE_API_KEY` is set in Worker settings
- Make sure it's set for the correct environment (production)

### CORS errors:
- The Worker already includes CORS headers
- If you still see CORS errors, check the `Access-Control-Allow-Origin` header

## Update the Worker

After making changes to `worker.js`:

```bash
wrangler deploy worker.js
```

## View Logs

```bash
wrangler tail
```

This shows real-time logs from your Worker.

## Alternative: Deploy via Dashboard

1. Go to Cloudflare Dashboard → **Workers & Pages** → **Create** → **Worker**
2. Name it: `cohere-api-proxy`
3. Copy the contents of `worker.js` into the editor
4. Click **Save and Deploy**
5. Add environment variable and route as described above
