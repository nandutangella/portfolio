# Troubleshooting 405 Error

## The 405 error is NOT related to your API key

A 405 "Method Not Allowed" error means:
- ❌ **NOT** an API key issue (that would be 401/403)
- ❌ **NOT** a trial account limitation (that would be 429/402)
- ✅ **IS** a routing/method handling issue

## Possible Causes

### 1. Function Not Deployed Yet
The function might not be deployed. Check:
- Cloudflare Dashboard → Workers & Pages → Your site → **Deployments**
- Make sure the latest deployment includes the `functions/` folder
- Wait a few minutes after pushing code

### 2. Function Not Recognized
Cloudflare Pages might not be detecting the function. Verify:
- File is at: `functions/api/chat.js` (exact path)
- File exports `onRequest` function
- Function is in the repository root's `functions/` folder

### 3. Check Function Logs
1. Go to Cloudflare Dashboard → Workers & Pages → Your site
2. Click **Logs** tab
3. Try the chat again
4. Check what errors appear in logs

### 4. Test the Function Directly
Try calling it directly in browser console:
```javascript
fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'test', chat_history: [], preamble: 'test', model: 'command-r-08-2024', temperature: 0.7, max_tokens: 150 })
}).then(r => r.json()).then(console.log).catch(console.error);
```

This will show the actual error message from the function.

## Quick Fixes to Try

1. **Redeploy manually:**
   - Cloudflare Dashboard → Workers & Pages → Your site
   - Click **Retry deployment** or trigger a new deployment

2. **Verify environment variable:**
   - Settings → Environment Variables
   - Make sure `COHERE_API_KEY` is set for **Production** environment

3. **Check function file location:**
   - Should be: `functions/api/chat.js` (relative to repo root)
   - Not: `functions/api/chat.ts` or any other location

4. **Clear cache and retry:**
   - Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
   - Or test in incognito mode

## If Still Not Working

The function might need to be in a different format. Try creating a `_functions` folder instead (some Cloudflare setups use this):

```bash
mkdir -p _functions/api
mv functions/api/chat.js _functions/api/chat.js
```

Then update your deployment configuration if needed.
