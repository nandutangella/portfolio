# Deployment Guide - GitHub Pages + Cloudflare Worker with GitHub Secrets

This guide shows you how to use GitHub environment secrets to store your API key and deploy a Cloudflare Worker for your GitHub Pages site.

## Overview

- **Static Site**: GitHub Pages (automatic deployment)
- **API Endpoint**: Cloudflare Worker at `/api/chat`
- **API Key Storage**: GitHub Secrets (secure, never exposed)
- **Deployment**: GitHub Actions (automated)
- **Security**: API key stays server-side, never in client code

---

## Step 1: Set Up GitHub Secrets

1. **Go to your GitHub repository:**
   - Navigate to: `https://github.com/YOUR_USERNAME/YOUR_REPO`
   - Go to **Settings** → **Secrets and variables** → **Actions**

2. **Add the following secrets:**
   - `COHERE_API_KEY` - Your Cohere API key
   - `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token (see Step 2)
   - `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID (see Step 2)

---

## Step 2: Get Cloudflare Credentials

### Get Cloudflare API Token

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click **Create Token**
3. Use the **Edit Cloudflare Workers** template (recommended for simplicity), or create a custom token with minimal permissions:
   - **Permissions:**
     - Account: `Workers Scripts:Edit` (required to deploy)
     - Account: `Workers Routes:Edit` (required for routes)
     - Account: `Account Settings:Read` (optional, for account info)
     - Zone: `Zone:Read` (only if using custom routes on your domain)
   - **Account Resources:** 
     - **Include** your account (required - make sure this is set!)
   - **Zone Resources:** 
     - Only needed if you want to restrict to specific zones
     - Leave empty if you want to use routes configured in `wrangler.toml`
4. Click **Continue to summary** → **Create Token**
5. Copy the token and add it to GitHub Secrets as `CLOUDFLARE_API_TOKEN`

**Important:** The "Edit Cloudflare Workers" template works fine, but it's more permissive than strictly necessary. For better security, you can create a custom token with only the permissions listed above.

### Get Cloudflare Account ID

1. Go to: https://dash.cloudflare.com/
2. Select any domain/zone
3. Scroll down to **API** section on the right sidebar
4. Copy the **Account ID**
5. Add it to GitHub Secrets as `CLOUDFLARE_ACCOUNT_ID`

---

## Step 3: Configure Cloudflare Worker Route

The Worker route is configured in `wrangler.toml`. Make sure it matches your domain:

```toml
[env.production]
routes = [
  { pattern = "yourdomain.com/api/chat", zone_name = "yourdomain.com" }
]
```

**Important:** Replace `yourdomain.com` with your actual domain.

---

## Step 4: Deploy

### Automatic Deployment

The GitHub Actions workflow (`.github/workflows/deploy-worker.yml`) will automatically:
- Deploy the Cloudflare Worker when you push changes to `worker.js`, `wrangler.toml`, or the workflow file
- Use GitHub secrets to set the `COHERE_API_KEY` environment variable
- Make the Worker available at `https://yourdomain.com/api/chat`

**To deploy:**
1. Push to `main` branch (if you changed worker files), or
2. Manually trigger: **Actions** → **Deploy Cloudflare Worker** → **Run workflow**

### Manual Deployment (Optional)

If you want to test locally first:

```bash
# Install Wrangler
npm install -g wrangler@latest

# Login to Cloudflare
wrangler login

# Deploy
wrangler deploy worker.js --env production
```

Then set the environment variable in Cloudflare Dashboard:
1. Go to **Workers & Pages** → `cohere-api-proxy`
2. **Settings** → **Variables**
3. Add `COHERE_API_KEY` with your API key

---

## Step 5: Verify Deployment

1. **Check GitHub Actions:**
   - Go to **Actions** tab in your repository
   - Verify the deployment workflow completed successfully

2. **Test the Worker:**
   - Visit: `https://yourdomain.com/api/chat` (GET request)
   - Should return: `{"status":"Worker is running!","hasApiKey":true,...}`

3. **Test the chat widget:**
   - Open your GitHub Pages site
   - Click the chat widget
   - Send a message
   - Should receive AI-generated response

---

## File Structure

```
Portfolio/
├── worker.js                    # Cloudflare Worker (API endpoint)
├── wrangler.toml                # Worker configuration
├── .github/
│   └── workflows/
│       └── deploy-worker.yml    # GitHub Actions workflow
├── functions/
│   └── api/
│       └── chat.js              # (Not used - kept for reference)
├── js/
│   └── chat.js                  # Client-side chat widget
└── index.html                   # Main page (deployed to GitHub Pages)
```

---

## How It Works

1. **GitHub Pages** serves your static site (HTML, CSS, JS)
2. **Cloudflare Worker** handles API requests at `/api/chat`
3. The Worker:
   - Receives requests from your chat widget
   - Uses `COHERE_API_KEY` from environment variables (set via GitHub secrets)
   - Proxies requests to Cohere API
   - Returns responses to your site

The API key is:
- ✅ Stored in GitHub Secrets (secure)
- ✅ Deployed to Cloudflare Worker via GitHub Actions
- ✅ Never exposed in client-side code
- ✅ Only accessible server-side in the Worker

---

## Troubleshooting

### Worker returns 500 error:
- ✅ Check that `COHERE_API_KEY` is set in GitHub Secrets
- ✅ Verify the key is correct in Cohere dashboard
- ✅ Check GitHub Actions logs: **Actions** → Your workflow run → **Deploy Worker with Secrets**
- ✅ Check Cloudflare Worker logs: **Workers & Pages** → `cohere-api-proxy` → **Logs**

### Worker not found (404):
- ✅ Verify the route is configured in `wrangler.toml`
- ✅ Check that your domain is added to Cloudflare
- ✅ Verify the route pattern matches exactly: `yourdomain.com/api/chat`
- ✅ Wait a few minutes for DNS propagation

### CORS errors:
- ✅ Cloudflare Worker handles CORS automatically
- ✅ If you see CORS errors, check that the Worker is deployed correctly
- ✅ Verify the Worker URL matches your site domain

### GitHub Actions workflow fails:
- ✅ Check that all required secrets are set in GitHub
- ✅ Verify `CLOUDFLARE_API_TOKEN` has correct permissions
- ✅ Ensure `CLOUDFLARE_ACCOUNT_ID` is correct
- ✅ Check workflow logs for specific error messages

### Chat widget not working:
- ✅ Open browser console (F12) and check for errors
- ✅ Verify the Worker is accessible: `https://yourdomain.com/api/chat`
- ✅ Check that the chat widget is calling the correct endpoint (`/api/chat`)

---

## Security Best Practices

✅ **DO:**
- Store API keys in GitHub Secrets (never in code)
- Use Cloudflare Worker to keep keys server-side
- Never commit API keys to git
- Use environment variables in your Worker
- Regularly rotate API keys

❌ **DON'T:**
- Commit API keys to your repository
- Expose API keys in client-side JavaScript
- Share API keys in screenshots or documentation
- Use the same API key for development and production

---

## Local Development

For local development:
- Use `chat-config.local.js` with your API key (this file is gitignored)
- The chat will use direct API calls when on `localhost`
- In production, it automatically uses the Cloudflare Worker

---

## Next Steps

1. ✅ Set up GitHub Secrets (Step 1)
2. ✅ Get Cloudflare credentials (Step 2)
3. ✅ Configure Worker route in `wrangler.toml` (Step 3)
4. ✅ Deploy (Step 4)
5. ✅ Test and verify (Step 5)

Your API key is now securely stored in GitHub Secrets and automatically deployed to Cloudflare Worker! 🎉

---

## Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
