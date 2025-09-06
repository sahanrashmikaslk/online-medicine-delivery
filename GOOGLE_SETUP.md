# Setup Google Sign-In and Email Service

## URGENT: Fix Google OAuth Origin Error

You're getting the error: "The given origin is not allowed for the given client ID" because your Google OAuth client is configured for the old domain.

**Quick Fix Steps:**

1. Go to Google Cloud Console: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client: Look for client ID `1050334836326-2jg080g9dm516nqpql4vh8niocg17itv`
3. Edit the client and ADD this new origin:
   - Add: `http://34.128.184.43.nip.io`
4. Save changes (may take 5-10 minutes to propagate)

**After this fix, Google Sign-In will work at**: `http://34.128.184.43.nip.io/login`

---

## Current Domain Configuration

**Production URL**: `http://34.128.184.43.nip.io` (Single unified domain)

The application now uses a single domain through the ingress controller for consistent access to both frontend and API services.

## Setup Instructions

### 1. Google OAuth Setup

1. **Go to Google Cloud Console**:

   - Visit: https://console.cloud.google.com/
   - Select your project: `ethereal-atlas-470405-g5`

2. **Enable APIs**:

   ```bash
   # Enable Google Identity API
   gcloud services enable identitytoolkit.googleapis.com

   # Enable Gmail API (for email service)
   gcloud services enable gmail.googleapis.com
   ```

3. **Create OAuth 2.0 Credentials**:

   - Go to: APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application Type: Web Application
   - Name: "Online Medicine Delivery"
   - Authorized JavaScript origins:
     - `http://34.128.184.43.nip.io`
     - `http://localhost:3000` (for development)
   - Authorized redirect URIs:
     - `http://34.128.184.43.nip.io/login`
     - `http://34.128.184.43.nip.io/register`

4. **Copy Client ID**: Save the generated Client ID

### 2. Gmail App Password Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to: Google Account → Security → 2-Step Verification → App passwords
   - Select app: Mail
   - Select device: Other (Custom name) → "Medicine Delivery"
   - Copy the generated 16-character password

### 3. Current Kubernetes Configuration

The application is already configured with the required secrets. Current configuration:

```bash
# Check existing secrets
kubectl -n medicine-delivery describe secret app-secrets

# The following secrets are already configured:
# - google-client-id
# - email-user
# - email-app-password
# - jwt-secret
# - database-password
```

### 4. Frontend Environment

Current frontend configuration:

```env
VITE_API_URL=http://34.128.184.43.nip.io/api
VITE_API_BASE=http://34.128.184.43.nip.io/api
VITE_GOOGLE_CLIENT_ID=1050334836326-2jg080g9dm516nqpql4vh8niocg17itv.apps.googleusercontent.com
```

### 5. Database Schema

The database schema supports both local and Google authentication:

```sql
-- Current users table structure:
-- id (primary key)
-- email (unique)
-- password_hash (nullable for Google users)
-- role (ADMIN/CUSTOMER)
-- name (from Google profile)
-- google_id (Google user ID)
-- auth_provider (local/google)
-- profile_picture (Google profile image)
-- created_at
```

## Email Features

1. **Welcome Email**: Sent automatically when users register (both local and Google)
2. **Order Confirmation**: Sent when orders are placed with order details
3. **Custom Email API**: Available at `/api/auth/send-email` for other services
4. **Email Templates**: HTML templates with branding and order information

## Authentication Flow

### Local Registration/Login

1. User provides email/password
2. Password is hashed and stored
3. JWT token issued with user information
4. Welcome email sent

### Google Sign-In

1. User clicks Google Sign-In button
2. Google OAuth flow initiated
3. Google token verified server-side
4. User created or updated in database
5. JWT token issued with Google profile information
6. Welcome email sent for new users

## Security Features

1. **Google OAuth 2.0**: Secure authentication with Google
2. **JWT Tokens**: Consistent token format for both login methods
3. **Password Hashing**: bcrypt for local passwords
4. **CORS Protection**: Configured for cross-origin requests
5. **Helmet Security**: Security headers applied
6. **User Profile**: Name and profile picture from Google
7. **Provider Tracking**: Tracks authentication method used

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/register` - Local user registration
- `POST /api/auth/login` - Local user login
- `POST /api/auth/google` - Google OAuth authentication
- `GET /api/auth/me` - Get current user information
- `GET /api/auth/health` - Service health check

### Email Endpoints

- `POST /api/auth/send-email` - Send custom email
- `POST /api/auth/send-order-confirmation` - Send order confirmation email

## Testing

1. **Access Frontend**: Go to `http://34.128.184.43.nip.io`
2. **Test Catalog**: Browse medicines at `/catalog`
3. **Test Local Auth**: Register/login with email/password
4. **Test Google Sign-In**: Use Google button on login/register pages
5. **Test Email Service**: Register to receive welcome email
6. **Test API Health**: Check `http://34.128.184.43.nip.io/api/auth/health`

## Verification Steps

Verify the system is working:

```bash
# Test frontend access
curl -I http://34.128.184.43.nip.io

# Test API gateway health
curl http://34.128.184.43.nip.io/api/auth/health

# Test catalog API
curl http://34.128.184.43.nip.io/api/catalog/medicines

# Check service status
kubectl -n medicine-delivery get pods
kubectl -n medicine-delivery get services
kubectl -n medicine-delivery get ingress
```

## Troubleshooting

- **"Google Sign-In not available"**: Check if VITE_GOOGLE_CLIENT_ID is set in frontend
- **"Invalid Google credential"**: Verify client ID and authorized origins in Google Console
- **"Origin not allowed"**: Add `http://34.128.184.43.nip.io` to Google OAuth origins
- **Email not sending**: Check Gmail app password and email-user secret
- **API calls failing**: Verify ingress configuration and service endpoints
- **Database errors**: Check PostgreSQL connection and schema
