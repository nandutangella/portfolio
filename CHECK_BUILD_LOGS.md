# Critical: Check Build Logs for Function Detection

## The HTML 405 Response Means Function Isn't Deployed

The diagnostic shows you're getting an **HTML 405 page** instead of JSON. This means Cloudflare Pages is serving a default error page, **not your function**.

## ⚠️ CRITICAL CHECK: Build Logs

You **MUST** check the build logs to see if the function is being detected:

### Steps:

1. **Go to Cloudflare Dashboard:**
   - Navigate to: https://dash.cloudflare.com
   - Go to **Workers & Pages** → Your site (`nandutangella`)

2. **Open Latest Deployment:**
   - Click on the **Deployments** tab
   - Click on the most recent deployment (the one that says "Success")

3. **Scroll to Build Logs:**
   - Look for a section called "Build Logs" or "Build Output"
   - Scroll through the logs

4. **Look for Function Detection:**
   You should see messages like:
   - ✅ "Detected Functions: api/chat"
   - ✅ "Functions: 1 function detected"
   - ✅ "Compiling functions..."
   - ✅ Any mention of "functions" folder

   **If you DON'T see these messages**, the function is NOT being deployed.

## What to Do If Function Not Detected

### Option 1: Verify File is in Repository

1. Go to GitHub: https://github.com/nandutangella/portfolio
2. Navigate to `functions/api/chat.js`
3. Verify the file exists and has content
4. Check it's in the `main` branch

### Option 2: Force Redeploy

1. Make a small change to trigger new deployment:
   ```bash
   echo " " >> README.md  # or any file
   git add .
   git commit -m "Trigger redeploy"
   git push
   ```

2. Wait for deployment to complete
3. Check build logs again

### Option 3: Test Function with GET

I've added a GET handler to the function. After redeploying, test:

Visit in browser: `https://nandutangella.com/api/chat`

If the function is working, you should see:
```json
{
  "status": "Function is running!",
  "method": "GET",
  "url": "https://...",
  "hasApiKey": true
}
```

If you see HTML or 404, the function is NOT deployed.

## Next Steps

1. **Check build logs** (most important!)
2. **Share what you see** - Do you see function detection messages?
3. If no detection, we'll need to troubleshoot the build configuration
