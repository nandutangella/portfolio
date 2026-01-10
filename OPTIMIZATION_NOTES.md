# Site Optimization Notes

## Email Configuration ✅
- **Contact form submissions are sent to**: `me@nandutangella.com` (default)
- Configured in `worker.js` line 173: `const contactEmail = env.CONTACT_EMAIL || 'me@nandutangella.com';`
- To change: Set `CONTACT_EMAIL` environment variable in Cloudflare Worker

## Removed Files ✅
- **Deleted**: `js/contact_form.js` (old jQuery-based form, not used)

## Script Loading Optimization ✅
- Added `defer` attribute to all script tags for non-blocking loading
- Scripts now load in parallel and execute after DOM is ready
- This improves page load performance

## Unused Files (Not Loaded, Safe to Keep or Delete)
The following files exist in `/js/` but are **not loaded** by any pages:
- `jquery.js` - Old jQuery library (not used)
- `jquery.easing.1.3.js` - jQuery easing plugin (not used)
- `jquery.filterable.js` - jQuery filterable plugin (not used)
- `jquery.prettyPhoto.js` - jQuery lightbox plugin (not used)
- `mongolab.js` - Old MongoDB module (not used)
- `project.js` - Old Angular project (not used)
- `scrollto.js` - Old scroll library (not used, native scrollTo used instead)
- `less-1.3.0.min.js` - LESS CSS preprocessor (not used)

**Note**: These files don't affect performance since they're not loaded. You can delete them to clean up the repository, or keep them for reference.

## Performance Improvements Made
1. ✅ Scripts load with `defer` (non-blocking)
2. ✅ Removed duplicate contact form file
3. ✅ Turnstile script loads with `defer`
4. ✅ Fonts use `preconnect` for faster loading
5. ✅ Images use `loading="lazy"` for deferred loading

## Additional Optimization Opportunities
- Consider using a CDN for fonts (already using Google Fonts)
- Minify CSS/JS in production (if not already done)
- Consider code splitting for chat.js (only load on pages that need it)
