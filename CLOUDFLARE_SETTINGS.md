# Cloudflare Managed Transforms Settings

## Recommended Settings for Your Portfolio Site

### HTTP Request Headers

**Enable:**
- ✅ **Add visitor location headers** - Useful for analytics and personalization
- ✅ **Add "True-Client-IP" header** - Helps with accurate IP detection

**Disable:**
- ❌ **Add TLS client auth headers** - Not needed unless using mTLS
- ❌ **Remove visitor IP headers** - Conflicts with "Add True-Client-IP"
- ❌ **Add leaked credentials checks header** - Not needed for static site

### HTTP Response Headers

**Enable:**
- ✅ **Remove "X-Powered-By" headers** - Security best practice (hides server info)
- ✅ **Add security headers** - Adds XSS protection and other security headers

## Important Notes

1. **Don't enable conflicting options**: If "Add True-Client-IP" is enabled, "Remove visitor IP headers" should be disabled (and vice versa).

2. **Security headers**: The "Add security headers" option adds important security headers like:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `X-XSS-Protection: 1; mode=block`
   
   These complement your `_headers` file.

3. **CORS**: Managed Transforms don't affect CORS headers - those are handled by your Cloudflare Worker.

## How to Configure

1. Go to Cloudflare Dashboard → Your Domain → **Rules** → **Settings**
2. Under **Managed Transforms**, configure as above
3. Click **Save**
