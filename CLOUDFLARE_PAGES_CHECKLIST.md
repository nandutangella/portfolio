# Cloudflare Pages Settings Checklist

Based on your settings screenshot, here's what to verify:

## ✅ Already Correct

1. **API Key is Set:**
   - ✅ `COHERE_API_KEY` is configured as a Secret
   - ✅ Value is encrypted (shown as locked)
   - ✅ Set for Production environment

2. **Function File Location:**
   - ✅ File exists at: `functions/api/chat.js`
   - ✅ This is the correct location for Pages Functions

## 🔍 Things to Check/Update

### 1. Runtime Settings (Most Important)

**Current:** Compatibility date: May 2, 2025

**Action:** 
- Click the edit icon next to "Compatibility date"
- Set it to a recent date (e.g., `2025-01-27` or today's date)
- This ensures the function uses the latest runtime features

### 2. Build System Version

**Current:** Version 2

**Action:**
- Consider migrating to v3 (the banner suggests this)
- However, v2 should still work for Functions
- You can test with v2 first, then migrate if needed

### 3. Verify Function is Deployed

**Check:**
1. Go to **Deployments** tab (not Settings)
2. Click on the latest deployment
3. Check the build logs
4. Look for messages about Functions being detected
5. Should see something like: "Detected Functions: api/chat"

### 4. Test Function Directly

After deployment, test in browser console on your live site:

```javascript
fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    message: 'test', 
    chat_history: [], 
    preamble: 'test', 
    model: 'command-r-08-2024', 
    temperature: 0.7, 
    max_tokens: 150 
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

This will show the actual error message from the function.

## 🚨 If Function Still Returns 405

The 405 error with method/url in the response means the function IS running, but it's receiving a non-POST request. This could mean:

1. **Check the actual request method:**
   - The error response should include `method` and `url` fields
   - Check what method it's actually receiving

2. **Possible issue:** The function might be getting a GET request instead of POST
   - Check `chat.js` to ensure it's using `method: 'POST'`

3. **Deployment delay:**
   - Functions can take 1-2 minutes to deploy after code push
   - Wait a few minutes and try again

## Recommended Actions

1. ✅ Update Compatibility date to a recent date
2. ✅ Check Deployments tab to verify function is detected
3. ✅ Test function directly with the fetch code above
4. ✅ Check the actual error response to see what method it received
