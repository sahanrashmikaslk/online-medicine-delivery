# Email Service Configuration Guide

Your online medicine delivery platform includes email functionality for:

- Welcome emails for new users
- Order confirmation emails
- Admin notifications

## Current Configuration

The email service is configured in the `auth` service using Nodemailer with Gmail:

### Environment Variables Required:

```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_APP_PASSWORD=your-app-specific-password
```

## Setting Up Gmail for Email Service

### Option 1: Gmail with App Password (Currently Configured)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:

   - Go to Google Account settings
   - Security → 2-Step Verification
   - App passwords → Select "Mail" → Generate
   - Use this 16-character password as `EMAIL_APP_PASSWORD`

3. **Update Kubernetes Secret**:

```bash
kubectl create secret generic email-config -n medicine-delivery \
  --from-literal=EMAIL_USER=your-gmail@gmail.com \
  --from-literal=EMAIL_APP_PASSWORD=your-app-password
```

4. **Update Deployment** (if needed):

```yaml
env:
  - name: EMAIL_USER
    valueFrom:
      secretKeyRef:
        name: email-config
        key: EMAIL_USER
  - name: EMAIL_APP_PASSWORD
    valueFrom:
      secretKeyRef:
        name: email-config
        key: EMAIL_APP_PASSWORD
```

## Alternative Email Providers

### Option 2: SendGrid (Recommended for Production)

1. **Create SendGrid Account**: https://sendgrid.com/
2. **Generate API Key**
3. **Update auth service configuration**:

```javascript
// Replace Gmail configuration with:
const emailTransporter = nodemailer.createTransporter({
  service: "SendGrid",
  auth: {
    user: "apikey",
    pass: process.env.SENDGRID_API_KEY,
  },
});
```

4. **Environment Variables**:

```env
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_USER=your-verified-sender@yourdomain.com
```

### Option 3: AWS SES

1. **Setup AWS SES**
2. **Update configuration**:

```javascript
const emailTransporter = nodemailer.createTransporter({
  SES: new AWS.SES({
    apiVersion: "2010-12-01",
    region: "us-east-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }),
});
```

### Option 4: Outlook/Office365

```javascript
const emailTransporter = nodemailer.createTransporter({
  service: "hotmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

## Testing Email Functionality

### 1. Check Current Configuration:

```bash
# Check if environment variables are set
kubectl exec -n medicine-delivery deployment/auth -- env | grep EMAIL
```

### 2. Test Order Email:

1. Place a test order
2. Check logs for email sending:

```bash
kubectl logs -n medicine-delivery deployment/auth | grep -i email
kubectl logs -n medicine-delivery deployment/notification | grep -i email
```

### 3. Test Welcome Email:

1. Register a new user
2. Check email delivery

## Troubleshooting

### Common Issues:

1. **Gmail "Less secure app access" error**:

   - Use App Password instead of regular password
   - Ensure 2FA is enabled

2. **Authentication failed**:

   - Verify EMAIL_USER and EMAIL_APP_PASSWORD are correct
   - Check if App Password is generated correctly

3. **Rate limiting**:

   - Gmail has sending limits (500 emails/day for free accounts)
   - Consider upgrading to business email service

4. **Emails going to spam**:
   - Set up SPF, DKIM, and DMARC records
   - Use a custom domain with proper DNS configuration

### Checking Email Service Status:

```bash
# Check auth service logs
kubectl logs -n medicine-delivery deployment/auth | tail -50

# Check notification service logs
kubectl logs -n medicine-delivery deployment/notification | tail -50

# Test email endpoint directly
curl -X POST http://your-domain/api/auth/send-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-admin-token" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<h1>Test Message</h1>"
  }'
```

## Production Recommendations

1. **Use a dedicated email service** (SendGrid, AWS SES, Mailgun)
2. **Set up custom domain** for professional appearance
3. **Configure email templates** for consistent branding
4. **Implement email queue** for better reliability
5. **Add email analytics** to track delivery rates
6. **Set up bounce handling** for failed deliveries

## Current Email Templates

### Welcome Email Features:

- Professional HTML template
- Platform introduction
- Direct link to platform
- Contact information

### Order Confirmation Features:

- Order details with itemized list
- Total amount and delivery address
- Order tracking information
- Customer service contact

## Monitoring Email Performance

```bash
# Check email sending frequency
kubectl logs -n medicine-delivery deployment/auth | grep "email sent" | wc -l

# Monitor for email errors
kubectl logs -n medicine-delivery deployment/auth | grep -i "email.*error"
```

The email system is fully functional and ready for production use with proper configuration of the environment variables.
