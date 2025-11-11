# 🔧 Fix Google OAuth "Missing OAuth Secret" Error

## Problem
Error: `{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: missing OAuth secret"}`

## Solution: Configure Google OAuth Properly

### Step 1: Get Real Google OAuth Credentials (5 minutes)

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create/Select Project**: "GritDocs" or similar name
3. **Enable Google+ API**:
   - APIs & Services → Library
   - Search "Google+ API" 
   - Click "Enable"

4. **Create OAuth 2.0 Client ID**:
   - APIs & Services → Credentials
   - Create Credentials → OAuth 2.0 Client ID
   - Application type: "Web application"
   - Name: "GritDocs Production"

5. **Configure Authorized URLs**:
   ```
   Authorized JavaScript origins:
   https://fopyamyrykwtlwgefxuq.supabase.co
   https://your-netlify-url.netlify.app
   
   Authorized redirect URIs:
   https://fopyamyrykwtlwgefxuq.supabase.co/auth/v1/callback
   ```

6. **Copy Your Credentials**:
   - Client ID: `123456789012-abc...xyz.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-AbC...XyZ`

### Step 2: Add to Supabase

1. **Open**: https://supabase.com/dashboard/project/fopyamyrykwtlwgefxuq/auth/providers
2. **Click "Google"**
3. **Enable**: Toggle "Enable Google provider" ON
4. **Client ID**: Paste your Google Client ID
5. **Client Secret**: Paste your Google Client Secret  
6. **Click "Save"**

### Step 3: Quick Test Credentials (Alternative)

If you need immediate testing, use these placeholder credentials:

**Client ID**: `1234567890-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com`
**Client Secret**: `GOCSPX-abcdefghijklmnopqrstuvwxyz123456`

⚠️ **Note**: These are for testing only - replace with real ones for production!

### Step 4: Test Authentication

1. Deploy your app to Netlify (if not done yet)
2. Try Google sign-in on live URL
3. Should work without "missing OAuth secret" error

### Expected Flow After Fix:
1. User clicks "Continue with Google"
2. Redirects to Google sign-in
3. User authorizes
4. Redirects back to your app
5. User is logged in with profile created

## Current Issue:
Your Supabase Google provider is enabled but missing the Client Secret field.

## Fix: Add both Client ID AND Client Secret in Supabase Auth Providers settings.