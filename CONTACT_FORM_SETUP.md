# Contact Form Setup Guide

The contact form is now set up with Cloudflare Turnstile bot protection and email sending via Resend.

## Required Setup

### 1. Cloudflare Turnstile Keys

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → Turnstile
2. Create a new site
3. Copy your **Site Key** and **Secret Key**

#### Update Site Key in HTML
Edit `contact/index.html` and replace the Turnstile site key:
```html
<div class="cf-turnstile" data-sitekey="YOUR_SITE_KEY_HERE" data-theme="auto" data-callback="turnstileCallback"></div>
```

#### Add Secret Key to Worker
Add the secret key as an environment variable:
- **Variable Name**: `TURNSTILE_SECRET_KEY`
- **Value**: Your Turnstile Secret Key

### 2. Resend API Key (for Email Sending)

1. Sign up at [Resend](https://resend.com) (free tier available)
2. Create an API key
3. Add it to your Cloudflare Worker environment variables:
   - **Variable Name**: `RESEND_API_KEY`
   - **Value**: Your Resend API key

### 3. Contact Email Address

The form sends emails to `me@nandutangella.com` by default. To change this:
- **Variable Name**: `CONTACT_EMAIL`
- **Value**: Your email address

### 4. Update Resend "From" Address

In `worker.js`, update the `from` field in the email sending section:
```javascript
from: 'Contact Form <onboarding@resend.dev>', // Change to your verified domain
```

To use your own domain:
1. Add your domain in Resend dashboard
2. Verify DNS records
3. Update the `from` field to use your verified domain

## Environment Variables Summary

Add these to your Cloudflare Worker (via Dashboard or GitHub Secrets):

| Variable | Description | Required |
|----------|-------------|----------|
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret key | Yes (for bot protection) |
| `RESEND_API_KEY` | Resend API key for sending emails | Yes (for email functionality) |
| `CONTACT_EMAIL` | Email to receive submissions | No (defaults to me@nandutangella.com) |

## Testing

1. Visit `/contact/` on your site
2. Fill out the form
3. Complete the Turnstile challenge
4. Submit the form
5. Check your email inbox

## Troubleshooting

### Form not submitting
- Check browser console for errors
- Verify Turnstile site key is correct
- Ensure Turnstile widget is visible and completed

### Emails not sending
- Verify `RESEND_API_KEY` is set correctly
- Check Resend dashboard for API usage/errors
- Verify the `from` email domain is verified in Resend

### Turnstile verification failing
- Verify `TURNSTILE_SECRET_KEY` matches your Turnstile site
- Check that the site key in HTML matches the secret key in Worker

## Alternative Email Services

If you prefer not to use Resend, you can modify `worker.js` to use:
- SendGrid
- Mailgun
- AWS SES
- Or any other email service with a REST API
