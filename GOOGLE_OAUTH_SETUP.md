# Google OAuth Setup Guide

To enable "Sign in with Google" functionality, you need to set up Google OAuth credentials.

## Step-by-Step Instructions

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Create a New Project (or select existing)
1. Click on the project dropdown at the top
2. Click "NEW PROJECT"
3. Give it a name (e.g., "SkillSwap")
4. Click "CREATE"

### 3. Enable Google+ API
1. In the left sidebar, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and click "ENABLE"

### 4. Configure OAuth Consent Screen
1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type
3. Click "CREATE"
4. Fill in the required information:
   - **App name**: SkillSwap
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click "SAVE AND CONTINUE"
6. Skip the "Scopes" section (click "SAVE AND CONTINUE")
7. Add test users if needed (for development)
8. Click "SAVE AND CONTINUE"

### 5. Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "CREATE CREDENTIALS" > "OAuth client ID"
3. Select "Web application"
4. Fill in:
   - **Name**: SkillSwap Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:5175` (your client URL)
     - `http://localhost:5173` (alternative port)
   - **Authorized redirect URIs**:
     - `http://localhost:5000/api/auth/google/callback`
5. Click "CREATE"

### 6. Copy Your Credentials
You'll see a modal with:
- **Client ID**: Starts with something like `123456789-abcdefgh.apps.googleusercontent.com`
- **Client Secret**: A random string

### 7. Add to Your .env File
Open `server/.env` and update:

```env
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
```

### 8. Restart Your Server
```bash
cd server
npm run dev
```

## Testing

1. Go to http://localhost:5175/login
2. Click "Continue with Google"
3. Sign in with your Google account
4. You should be redirected back to your dashboard!

## For Production

When deploying to production:

1. Go back to Google Cloud Console > Credentials
2. Edit your OAuth client
3. Add production URLs:
   - **Authorized JavaScript origins**: `https://yourdomain.com`
   - **Authorized redirect URIs**: `https://yourdomain.com/api/auth/google/callback`
4. Update your production `.env` file with the same credentials

## Troubleshooting

### Error: redirect_uri_mismatch
- Make sure the redirect URI in Google Cloud Console exactly matches your server URL
- The redirect URI should be: `http://localhost:5000/api/auth/google/callback`

### Error: Access blocked
- Add yourself as a test user in the OAuth consent screen
- Or publish your app (for production)

### Can't see Google button
- Make sure the Vite dev server restarted after creating the `.env` file
- Check browser console for errors
