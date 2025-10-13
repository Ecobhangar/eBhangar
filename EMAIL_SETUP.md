# Email Notification Setup Guide

eBhangar automatically sends email notifications to admin when new bookings are created.

## Quick Setup (Gmail - Free)

### Step 1: Create App Password
1. Go to your Google Account settings: https://myaccount.google.com/
2. Select **Security** → **2-Step Verification** (enable if not enabled)
3. Go back to Security → Select **App passwords**
4. Generate a new app password for "Mail"
5. Copy the 16-character password

### Step 2: Add Environment Variables in Replit

Add these secrets in your Replit project (Secrets tab):

```
ADMIN_EMAIL=your-email@gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
```

**Optional (already configured):**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

### Step 3: Restart Server
Click "Stop" and then "Run" to restart the application.

---

## Email Notification Format

When a customer creates a booking, admin receives:

**Subject:** 🔔 New Booking: [Customer Name] - ₹[Amount]

**Email contains:**
- Customer details (name, phone, address)
- Items selected with quantities
- Total estimated value
- Booking ID for reference
- Admin WhatsApp: +919226255355

---

## Current Status

✅ **Without Email Config:**
- Bookings work normally
- Email notifications are logged to console only
- Dashboard notifications still work

✅ **With Email Config:**
- Automatic email to admin on new bookings
- Plus dashboard notifications

---

## Alternative Email Providers

### Using Other SMTP Services (free options):

**Outlook/Hotmail:**
```
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
```

**SendGrid (Free tier - 100 emails/day):**
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

**Mailgun (Free tier - 5000 emails/month):**
```
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASSWORD=your-mailgun-password
```

---

## Troubleshooting

**Email not sending?**
1. Check Replit Secrets are correctly set
2. Check server logs for email errors
3. Verify Gmail App Password (not regular password)
4. Make sure 2-Step Verification is enabled on Gmail

**Admin WhatsApp Number:**
Currently set to: **+919226255355**

This number is displayed in all email notifications for quick contact.
