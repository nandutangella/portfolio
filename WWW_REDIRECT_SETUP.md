# WWW Redirect and Index.html Masking Setup

## Overview

This guide helps you:
1. ✅ Mask `/index.html` from URLs (redirects to clean URLs)
2. ✅ Fix the 522 error for `www.nandutangella.com` by redirecting to `nandutangella.com`

## Solution Implemented

### 1. `_redirects` File

A `_redirects` file has been created that:
- Redirects `www.nandutangella.com` → `nandutangella.com` (301 permanent)
- Redirects `/index.html` → `/` (301 permanent)
- Redirects all nested `/index.html` paths to clean URLs

**Note:** The `_redirects` file works with:
- ✅ GitHub Pages (automatic)
- ✅ Cloudflare Pages (automatic)
- ✅ Netlify (automatic)

## DNS Configuration for WWW Subdomain

The 522 error occurs because `www.nandutangella.com` isn't properly configured. You need to set up DNS:

### Option A: Cloudflare DNS (Recommended)

1. **Go to Cloudflare Dashboard:**
   - Navigate to: https://dash.cloudflare.com/
   - Select your domain: `nandutangella.com`

2. **Add DNS Record for WWW:**
   - Go to **DNS** → **Records**
   - Click **Add record**
   - **Type:** `CNAME`
   - **Name:** `www`
   - **Target:** `nandutangella.com` (or your GitHub Pages CNAME target)
   - **Proxy status:** ✅ Proxied (orange cloud)
   - Click **Save**

3. **Verify:**
   - Wait 1-2 minutes for DNS propagation
   - Visit `www.nandutangella.com` - should redirect to `nandutangella.com`

### Option B: GitHub Pages Custom Domain

If using GitHub Pages:

1. **Add www to GitHub Pages:**
   - Go to your GitHub repository
   - **Settings** → **Pages** → **Custom domain**
   - Add: `www.nandutangella.com`
   - GitHub will automatically create the DNS record

2. **Update CNAME file (if needed):**
   - The `CNAME` file should contain: `nandutangella.com`
   - GitHub Pages handles both www and non-www automatically

### Option C: Cloudflare Page Rules (Alternative)

If DNS setup doesn't work, use Cloudflare Page Rules:

1. **Go to Cloudflare Dashboard:**
   - **Rules** → **Page Rules**
   - Click **Create Page Rule**

2. **Create Rule:**
   - **URL pattern:** `www.nandutangella.com/*`
   - **Setting:** Forwarding URL
   - **Status Code:** 301 - Permanent Redirect
   - **Destination URL:** `https://nandutangella.com/$1`
   - Click **Save and Deploy**

## Testing

After setup, test:

1. **WWW Redirect:**
   ```bash
   curl -I https://www.nandutangella.com
   # Should return: 301 Moved Permanently
   # Location: https://nandutangella.com/
   ```

2. **Index.html Masking:**
   - Visit: `https://nandutangella.com/index.html`
   - Should redirect to: `https://nandutangella.com/`
   - URL in browser should show `/` not `/index.html`

3. **Nested Pages:**
   - Visit: `https://nandutangella.com/books/index.html`
   - Should redirect to: `https://nandutangella.com/books/`

## Troubleshooting

### 522 Error Still Appears

1. **Check DNS:**
   - Verify `www` CNAME record exists in Cloudflare
   - Ensure it's proxied (orange cloud icon)

2. **Check GitHub Pages (if applicable):**
   - Verify custom domain is configured
   - Check repository settings → Pages → Custom domain

3. **Wait for Propagation:**
   - DNS changes can take up to 24 hours (usually 1-5 minutes)
   - Clear browser cache and try again

### Redirects Not Working

1. **GitHub Pages:**
   - Ensure `_redirects` file is in the root directory
   - File must be named exactly `_redirects` (no extension)
   - Push changes to the repository

2. **Cloudflare Pages:**
   - Ensure `_redirects` file is in the build output
   - Redeploy your site after adding the file

3. **Verify File Format:**
   - Each line should be: `source destination status_code`
   - No trailing slashes on destination (except for directory redirects)

## Additional Notes

- **301 vs 200 redirects:**
  - `301` = Permanent redirect (changes URL in browser, better for SEO)
  - `200` = Rewrite (serves content but keeps original URL - not supported by all hosts)

- **SEO Impact:**
  - 301 redirects are SEO-friendly
  - Search engines will update their indexes to the new URLs
  - Old URLs with `/index.html` will still work but redirect to clean URLs

## Files Modified

- ✅ `_redirects` - Added redirect rules for www and index.html masking
