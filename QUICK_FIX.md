# Quick Fix: Set Environment Variable in Cloudflare Pages

Your function is deployed! You just need to set the `COHERE_API_KEY` environment variable.

## Steps:

1. **Go to Cloudflare Dashboard:**
   - https://dash.cloudflare.com
   - Navigate to **Workers & Pages** → Your site (should be `portfolio` or similar)

2. **Go to Settings:**
   - Click on your site
   - Go to **Settings** tab
   - Scroll down to **Environment Variables**

3. **Add Environment Variable:**
   - Click **Add variable**
   - **Variable name:** `COHERE_API_KEY`
   - **Value:** Your Cohere API key (copy from GitHub Secrets if needed)
   - **Environment:** Select **Production** (and optionally **Preview**)
   - Click **Save**

4. **Redeploy (if needed):**
   - Go to **Deployments** tab
   - Click **Retry deployment** on the latest deployment
   - OR make a small change and push to trigger a new deployment

5. **Test:**
   - Visit: `https://nandutangella.com/api/chat`
   - Should return: `{"status":"Function is running!","hasApiKey":true,...}`

## Alternative: Use GitHub Secrets (Automated)

If you want to use GitHub Secrets instead of manually setting it:

1. Make sure your GitHub Actions workflow runs (`.github/workflows/deploy-worker.yml`)
2. The workflow will set the environment variable automatically
3. But since you're using Cloudflare Pages (not just Worker), you might need to set it in Pages settings anyway

## Which Approach Are You Using?

Based on your logs, you're using **Cloudflare Pages** (not GitHub Pages). This is fine! You have two options:

### Option A: Cloudflare Pages (Current Setup)
- Set environment variable in Cloudflare Pages dashboard (see steps above)
- Function is already deployed ✅

### Option B: Switch to GitHub Pages + Worker
- Disconnect Cloudflare Pages from GitHub
- Use GitHub Pages for static site
- Deploy Worker separately via GitHub Actions
- This is what the current documentation describes

**For now, use Option A** - just set the environment variable in Cloudflare Pages dashboard and it should work!
