# Troubleshooting: Worker Not Deployed

If you're seeing errors like "The Cloudflare Worker at /api/chat is not deployed", follow these steps:

## Step 1: Check GitHub Actions

1. Go to your GitHub repository
2. Click on **Actions** tab
3. Look for "Deploy Cloudflare Worker" workflow
4. Check if it has run:
   - ✅ **Green checkmark** = Deployment succeeded
   - ❌ **Red X** = Deployment failed (check logs)
   - ⚪ **No runs** = Workflow hasn't been triggered

### If workflow hasn't run:
- Click **"Deploy Cloudflare Worker"** workflow
- Click **"Run workflow"** button (top right)
- Select branch: `main`
- Click **"Run workflow"**

### If workflow failed:
- Click on the failed run
- Check the error message
- Common issues:
  - Missing GitHub secrets (see Step 2)
  - Invalid Cloudflare credentials
  - Wrangler deployment error

## Step 2: Verify GitHub Secrets

Go to: **Settings** → **Secrets and variables** → **Actions**

Make sure these secrets exist:
- ✅ `COHERE_API_KEY`
- ✅ `CLOUDFLARE_API_TOKEN`
- ✅ `CLOUDFLARE_ACCOUNT_ID`

If any are missing, add them and re-run the workflow.

## Step 3: Check Cloudflare Dashboard

1. Go to: https://dash.cloudflare.com
2. Navigate to **Workers & Pages**
3. Look for a Worker named `cohere-api-proxy`

### If Worker doesn't exist:
- The deployment hasn't succeeded
- Re-run the GitHub Actions workflow

### If Worker exists:
4. Click on `cohere-api-proxy`
5. Go to **Settings** → **Variables**
6. Check if `COHERE_API_KEY` is set
   - If not set, add it manually (copy from GitHub Secrets)
7. Go to **Settings** → **Routes**
8. Check if route exists: `nandutangella.com/api/chat`
   - If not, add it manually or check `wrangler.toml`

## Step 4: Test the Worker

### Test 1: Direct Worker URL
Visit: `https://cohere-api-proxy.YOUR_SUBDOMAIN.workers.dev`

If this works, the Worker is deployed but the route isn't configured.

### Test 2: Custom Route
Visit: `https://nandutangella.com/api/chat`

Should return JSON:
```json
{
  "status": "Worker is running!",
  "method": "GET,
  "hasApiKey": true
}
```

If you get 404 or HTML:
- Route isn't configured (see Step 3.8)
- DNS might not be pointing to Cloudflare

## Step 5: Manual Deployment (Quick Fix)

If GitHub Actions isn't working, deploy manually:

```bash
# Install Wrangler
npm install -g wrangler@latest

# Login
wrangler login

# Set environment variable
echo "YOUR_COHERE_API_KEY" | wrangler secret put COHERE_API_KEY --env production

# Deploy
wrangler deploy --env production
```

This will:
- Deploy the Worker
- Set the API key from your input
- Configure the route from `wrangler.toml`

## Step 6: Verify Route Configuration

Check `wrangler.toml`:

```toml
[env.production]
routes = [
  { pattern = "nandutangella.com/api/chat", zone_name = "nandutangella.com" }
]
```

Make sure:
- Domain matches your actual domain
- Route pattern is correct: `yourdomain.com/api/chat`
- Zone name matches your Cloudflare zone

## Common Issues

### Issue: 405 Method Not Allowed
**Cause:** Worker is deployed but route isn't configured, or route is pointing to wrong Worker.

**Fix:**
1. Check Cloudflare Dashboard → Workers & Pages → Routes
2. Verify route `nandutangella.com/api/chat` points to `cohere-api-proxy`
3. If route doesn't exist, add it manually in Cloudflare Dashboard

### Issue: HTML response instead of JSON
**Cause:** Route is not pointing to Worker, or Worker isn't deployed.

**Fix:**
1. Verify Worker exists in Cloudflare Dashboard
2. Check route configuration
3. Re-deploy if needed

### Issue: "API key not configured"
**Cause:** Environment variable not set in Worker.

**Fix:**
1. Cloudflare Dashboard → Workers & Pages → `cohere-api-proxy`
2. Settings → Variables
3. Add `COHERE_API_KEY` with your key
4. Make sure it's set for "production" environment

## Still Not Working?

1. Check browser console for full error details
2. Check GitHub Actions logs for deployment errors
3. Check Cloudflare Worker logs: Dashboard → Workers & Pages → `cohere-api-proxy` → Logs
4. Verify your domain is on Cloudflare (DNS must be managed by Cloudflare for custom routes)
