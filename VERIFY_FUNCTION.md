# Verify Function is Deployed

## The HTML Response Means Function Isn't Deployed

If you're getting HTML back (like `"<html><he..."`), it means Cloudflare Pages is serving a 404 page instead of your function. This means **the function is not being recognized or deployed**.

## Critical Checks

### 1. Check Build Logs for Function Detection

In Cloudflare Dashboard:
1. Go to **Workers & Pages** → Your site → **Deployments**
2. Click on the latest deployment
3. Scroll to **Build Logs** section
4. **Look for:**
   - "Detected Functions: api/chat"
   - "Functions: 1 function detected"
   - Any mention of "functions" folder

**If you DON'T see function detection messages**, the function isn't being deployed.

### 2. Verify Function File is Committed

Check in your terminal:
```bash
git ls-files | grep functions
```

Should show: `functions/api/chat.js`

If it doesn't show up, the file isn't committed:
```bash
git add functions/api/chat.js
git commit -m "Add Pages Function"
git push
```

### 3. Check .gitignore

Make sure `functions/` is NOT in `.gitignore`:
```bash
cat .gitignore | grep -i functions
```

Should return nothing. If it shows `functions/` or `functions/**`, remove it from `.gitignore`.

### 4. Verify File Location

The function MUST be at:
```
Portfolio/
└── functions/
    └── api/
        └── chat.js
```

Relative to your repository root.

### 5. Check GitHub Repository

1. Go to your GitHub repo: `nandutangella/portfolio`
2. Navigate to `functions/api/chat.js`
3. Verify the file exists and has content
4. Check the file is in the `main` branch

### 6. Force Redeploy

If function exists but isn't detected:
1. Cloudflare Dashboard → Your site → **Deployments**
2. Click **Retry deployment** on the latest deployment
3. Or make a small change and push to trigger new deployment

## If Function Still Not Detected

Try creating the function in a different location structure. Some Cloudflare Pages setups require:

```
functions/
└── api/
    └── [chat].js    # Note: brackets for dynamic route
```

Or:

```
functions/
└── api/
    └── chat/
        └── index.js
```

But the standard `functions/api/chat.js` should work. The issue is likely that it's not being committed or detected during build.
