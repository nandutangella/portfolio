# Debug Steps for 405 Error

## Current Status
✅ Deployment successful  
✅ API key configured  
✅ Function file exists at `functions/api/chat.js`  
❌ Function returning 405 (Method Not Allowed)

## Critical Check: Build Logs

In the deployment details page you're viewing:

1. **Scroll down to find "Build Logs" section**
2. **Look for messages like:**
   - "Detected Functions: api/chat"
   - "Functions: 1 function detected"
   - Any errors about the functions folder

**If you DON'T see function detection messages**, the function isn't being deployed.

## Test the Function Directly

Open browser console on `https://nandutangella.com` and run:

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
.then(data => {
  console.log('Response:', data);
  // Check what method it received
  if (data.method) {
    console.log('Function received method:', data.method);
  }
})
.catch(err => console.error('Error:', err));
```

This will show:
- The actual error response
- What HTTP method the function received (in the `method` field)
- The URL it received

## If Function Not Detected in Build Logs

The function might not be in the deployed files. Check:

1. **Verify function is committed to git:**
   ```bash
   git ls-files | grep functions
   ```
   Should show: `functions/api/chat.js`

2. **Check if function is in .gitignore:**
   ```bash
   cat .gitignore | grep functions
   ```
   Should be empty (functions folder should NOT be ignored)

3. **Verify file exists in repository:**
   - Check GitHub → Your repo → `functions/api/chat.js`
   - File should exist and be committed

## If Function IS Detected But Still 405

The function is running but receiving wrong method. Check the error response - it should include:
```json
{
  "error": "Method not allowed",
  "method": "GET",  // or whatever method it received
  "url": "https://..."
}
```

This tells us what's actually happening.
