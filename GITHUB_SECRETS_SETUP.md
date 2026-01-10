# GitHub Secrets Setup for Cloudflare Worker Deployment

This guide shows how to set up GitHub Actions to automatically deploy your Cloudflare Worker using secrets stored in GitHub.

## Step 1: Get Cloudflare API Token

1. Go to Cloudflare Dashboard: https://dash.cloudflare.com
2. Click your profile icon (top right) → **My Profile**
3. Go to **API Tokens** tab
4. Click **Create Token**
5. Use **Edit Cloudflare Workers** template, or create custom token with:
   - **Permissions:**
     - Account: `Cloudflare Workers:Edit`
     - Zone: `Zone:Read` (for adding routes)
   - **Account Resources:** Include your account
   - **Zone Resources:** Include `nandutangella.com`
6. Click **Continue to summary** → **Create Token**
7. **Copy the token** (you won't see it again!)

## Step 2: Get Cloudflare Account ID

1. In Cloudflare Dashboard, go to **Workers & Pages**
2. Your **Account ID** is shown in the right sidebar (under "Account")
3. Copy it (it's a long string like `abc123def456...`)

## Step 3: Add GitHub Secrets

1. Go to your GitHub repository: `https://github.com/nandutangella/portfolio`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add these three secrets:

### Secret 1: `CLOUDFLARE_API_TOKEN`
- **Name:** `CLOUDFLARE_API_TOKEN`
- **Value:** The API token you created in Step 1
- Click **Add secret**

### Secret 2: `CLOUDFLARE_ACCOUNT_ID`
- **Name:** `CLOUDFLARE_ACCOUNT_ID`
- **Value:** Your Account ID from Step 2
- Click **Add secret**

### Secret 3: `COHERE_API_KEY`
- **Name:** `COHERE_API_KEY`
- **Value:** Your Cohere API key
- Click **Add secret**

## Step 4: Verify Secrets

You should now have 3 secrets:
- ✅ `CLOUDFLARE_API_TOKEN`
- ✅ `CLOUDFLARE_ACCOUNT_ID`
- ✅ `COHERE_API_KEY`

## Step 5: Deploy

The workflow will automatically run when you:
- Push changes to `worker.js` or `wrangler.toml`
- Or manually trigger it: **Actions** tab → **Deploy Cloudflare Worker** → **Run workflow**

## How It Works

1. **GitHub Actions** detects changes to `worker.js`
2. **Installs Wrangler** CLI
3. **Deploys the Worker** using your Cloudflare API token
4. **Injects the COHERE_API_KEY** as an environment variable
5. **Adds the route** `nandutangella.com/api/chat`

## Manual Deployment (Alternative)

If you prefer to deploy manually:

```bash
# Set environment variable
export CLOUDFLARE_API_TOKEN="your-token"
export CLOUDFLARE_ACCOUNT_ID="your-account-id"
export COHERE_API_KEY="your-cohere-key"

# Deploy
wrangler deploy worker.js --env production
```

## Troubleshooting

### Workflow fails with "Authentication error"
- Verify `CLOUDFLARE_API_TOKEN` is correct
- Check the token has the right permissions
- Token might have expired (create a new one)

### Workflow fails with "Account ID not found"
- Verify `CLOUDFLARE_ACCOUNT_ID` is correct
- Check it matches your Cloudflare account

### Worker deployed but returns 500 "API key not configured"
- Verify `COHERE_API_KEY` secret is set correctly
- Check the secret name matches exactly: `COHERE_API_KEY`
- Re-run the workflow after fixing the secret

### Route not added
- The route step uses `|| true` to not fail if route exists
- Manually add route in Cloudflare Dashboard if needed:
  - Workers & Pages → `cohere-api-proxy` → Settings → Routes

## Security Notes

✅ **Secrets are encrypted** in GitHub
✅ **Never exposed** in logs or code
✅ **Only accessible** during workflow execution
✅ **API key** stays in Cloudflare Worker environment (not in client code)

## View Workflow Logs

1. Go to GitHub repository → **Actions** tab
2. Click on the latest workflow run
3. Click on **Deploy Worker** job to see logs
4. Check for any errors or warnings
