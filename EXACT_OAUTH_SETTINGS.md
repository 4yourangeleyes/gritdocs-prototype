# 🎯 EXACT Google OAuth Settings for: https://gritdocs-mvp.netlify.app

## 🔧 GOOGLE CLOUD CONSOLE CONFIGURATION

### Step 1: Edit Your OAuth Client
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth client: "GritDocs Production" 
3. Click the **pencil icon** (Edit)

### Step 2: Copy-Paste These EXACT Settings

#### Authorized JavaScript Origins:
```
https://fopyamyrykwtlwgefxuq.supabase.co
https://gritdocs-mvp.netlify.app
```

#### Authorized Redirect URIs:
```
https://fopyamyrykwtlwgefxuq.supabase.co/auth/v1/callback
https://gritdocs-mvp.netlify.app/
```

### Step 3: Save Changes
Click **"Save"** in Google Cloud Console

## 🔄 SUPABASE CONFIGURATION UPDATE

### Optional: Update Site URL
1. Go to: https://supabase.com/dashboard/project/fopyamyrykwtlwgefxuq/auth/settings
2. Set **Site URL**: `https://gritdocs-mvp.netlify.app`
3. **Additional redirect URLs**: `https://gritdocs-mvp.netlify.app/**`

## ✅ TESTING STEPS

1. **Wait 2-5 minutes** after saving Google settings (propagation time)
2. **Go to**: https://gritdocs-mvp.netlify.app/login
3. **Click**: "Continue with Google"
4. **Expected**: Google OAuth popup opens
5. **Sign in** with Google account
6. **Expected**: Redirects back to https://gritdocs-mvp.netlify.app/ (logged in)

## 🐛 EXACT ERROR FIX

### Before (Error):
```
Error 400: redirect_uri_mismatch
The redirect URI in the request does not match the ones authorized for the OAuth client.
```

### After (Working):
```
✅ Google OAuth popup opens
✅ User signs in successfully  
✅ Redirects to: https://gritdocs-mvp.netlify.app/
✅ User profile created automatically
✅ User logged into dashboard
```

## 📋 COPY-PASTE CHECKLIST

### Google Cloud Console Settings:
- [ ] JavaScript Origins: `https://gritdocs-mvp.netlify.app` ✓
- [ ] Redirect URI: `https://gritdocs-mvp.netlify.app/` ✓
- [ ] Supabase callback: `https://fopyamyrykwtlwgefxuq.supabase.co/auth/v1/callback` ✓
- [ ] Clicked "Save" ✓

### Test Results:
- [ ] Waited 2-5 minutes ✓
- [ ] Google OAuth popup works ✓
- [ ] Successful login and redirect ✓
- [ ] User profile created ✓

## 🚀 YOUR DEPLOYMENT IS READY!

URL: https://gritdocs-mvp.netlify.app
Status: ✅ Live and configured for Google OAuth

Once you add those exact URLs to Google Cloud Console, your OAuth will work perfectly!