# 🔧 COMPLETE Google OAuth Configuration Guide

## 🎯 YOUR CURRENT SETUP
```
Supabase Project: fopyamyrykwtlwgefxuq.supabase.co
Google Client ID: [YOUR-CLIENT-ID].apps.googleusercontent.com
Google Client Secret: GOCSPX-[YOUR-CLIENT-SECRET]
GitHub Repo: 4yourangeleyes/gritdocs-prototype
```

## 📋 GOOGLE CLOUD CONSOLE SETTINGS

### 1. Authorized JavaScript Origins
Add these EXACT domains (no trailing slashes):
```
https://fopyamyrykwtlwgefxuq.supabase.co
https://your-netlify-url.netlify.app
http://localhost:3000
```

### 2. Authorized Redirect URIs  
Add these EXACT URLs (with paths):
```
https://fopyamyrykwtlwgefxuq.supabase.co/auth/v1/callback
https://your-netlify-url.netlify.app/
http://localhost:3000/
```

**🚨 CRITICAL: Replace "your-netlify-url" with your actual Netlify domain!**

## 🏗️ SUPABASE CONFIGURATION

### Auth Providers Settings:
```
Provider: Google
Enabled: ✅ ON
Client ID: [YOUR-CLIENT-ID].apps.googleusercontent.com
Client Secret: GOCSPX-[YOUR-CLIENT-SECRET]
```

### Site URL (Authentication Settings):
```
Site URL: https://your-netlify-url.netlify.app
```

### Redirect URLs (Additional redirect URLs):
```
https://your-netlify-url.netlify.app/**
http://localhost:3000/**
```

## 🌐 NETLIFY DEPLOYMENT

### Build Settings (netlify.toml - already configured):
```
[build]
  base = "client"
  command = "npm ci && npm run build"  
  publish = "build"
```

### Environment Variables (if needed):
```
REACT_APP_SUPABASE_URL=https://fopyamyrykwtlwgefxuq.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvcHlhbXlyeWt3dGx3Z2VmeHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTgyMDAsImV4cCI6MjA3ODM3NDIwMH0.V9nIiQ0rUakLLeG88UgRoXDMG6SwohmFB95LGP3te8k
```

## 🔄 OAUTH FLOW EXPLANATION

### How it works:
1. **User clicks "Continue with Google"**
2. **App redirects to**: `https://accounts.google.com/oauth/authorize?...`
3. **User signs in with Google**
4. **Google redirects to**: `https://fopyamyrykwtlwgefxuq.supabase.co/auth/v1/callback`
5. **Supabase processes auth**  
6. **Supabase redirects to**: `https://your-netlify-url.netlify.app/`
7. **App detects user session and shows dashboard**

## ✅ STEP-BY-STEP FIX

### Step 1: Get Your Netlify URL
Find your deployment URL in Netlify dashboard. Example:
```
https://inspiring-pasteur-abc123.netlify.app
```

### Step 2: Update Google Cloud Console
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click edit (pencil) on your OAuth client
3. Add JavaScript origins:
   ```
   https://fopyamyrykwtlwgefxuq.supabase.co
   https://inspiring-pasteur-abc123.netlify.app
   ```
4. Add Redirect URIs:
   ```
   https://fopyamyrykwtlwgefxuq.supabase.co/auth/v1/callback
   https://inspiring-pasteur-abc123.netlify.app/
   ```
5. Click "Save"

### Step 3: Update Supabase (Optional)
1. Go to: https://supabase.com/dashboard/project/fopyamyrykwtlwgefxuq/auth/settings
2. Set Site URL: `https://inspiring-pasteur-abc123.netlify.app`
3. Add redirect URLs: `https://inspiring-pasteur-abc123.netlify.app/**`

### Step 4: Test
1. Wait 2-5 minutes for Google changes to propagate
2. Try Google sign-in on your Netlify URL
3. Should work without redirect_uri_mismatch error

## 🐛 COMMON ISSUES & FIXES

### "redirect_uri_mismatch"
- ❌ Missing Netlify URL in Google OAuth settings
- ✅ Add your exact Netlify domain to redirect URIs

### "unauthorized_client"  
- ❌ Wrong redirect URI format
- ✅ Use exact Supabase callback: `/auth/v1/callback`

### "invalid_request"
- ❌ Trailing slashes in JavaScript origins  
- ✅ No trailing slashes in origins, but with paths in redirects

## 📞 WHAT'S YOUR NETLIFY URL?

Once you provide your Netlify deployment URL, I can give you the EXACT settings to copy-paste into Google Cloud Console!

Example format: `https://amazing-site-123.netlify.app`