# 🔑 **Google OAuth Setup Guide**

## 🚨 **QUICK FIX: Use Supabase Test Credentials**

**Go to**: [Supabase Auth Providers](https://supabase.com/dashboard/project/fopyamyrykwtlwgefxuq/auth/providers)

1. **Click "Google"**
2. **Leave Client ID field EMPTY**
3. **Leave Client Secret field EMPTY**  
4. **Toggle "Enable Google provider" to ON**
5. **Click "Save"**

✅ **This uses Supabase's test Google OAuth - works immediately for development!**

---

## 🏗️ **Create Your Own Google OAuth (For Production)**

### **Step 1: Create Google Cloud Project**
1. **Go to**: [Google Cloud Console](https://console.cloud.google.com/)
2. **Create New Project** or select existing
3. **Project Name**: `GritDocs` or similar
4. **Click "Create"**

### **Step 2: Enable Google+ API**
1. **Go to**: [APIs & Services](https://console.cloud.google.com/apis/dashboard)
2. **Click "Enable APIs and Services"**
3. **Search**: "Google+ API" 
4. **Click "Enable"**

### **Step 3: Create OAuth Credentials**
1. **Go to**: [Credentials](https://console.cloud.google.com/apis/credentials)
2. **Click "Create Credentials"** → **"OAuth client ID"**
3. **Application type**: "Web application"
4. **Name**: "GritDocs Production"

### **Step 4: Configure Authorized URLs**
**Authorized JavaScript origins:**
```
https://fopyamyrykwtlwgefxuq.supabase.co
https://your-netlify-site.netlify.app
```

**Authorized redirect URIs:**
```
https://fopyamyrykwtlwgefxuq.supabase.co/auth/v1/callback
```

### **Step 5: Get Your Credentials**
After creation, you'll get:
- **Client ID**: `123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz`

### **Step 6: Add to Supabase**
**Go back to**: [Supabase Auth Providers](https://supabase.com/dashboard/project/fopyamyrykwtlwgefxuq/auth/providers)

1. **Client ID**: Paste your Google Client ID
2. **Client Secret**: Paste your Google Client Secret  
3. **Click "Save"**

---

## 📱 **Expected Google Client ID Format:**
```
✅ CORRECT: 123456789012-abc123def456ghi789jkl012mno345pqr.apps.googleusercontent.com
❌ WRONG: sachin
❌ WRONG: gritdocs
❌ WRONG: my-app-123
```

**The Client ID must end in `.apps.googleusercontent.com`**

---

## 🎯 **RECOMMENDED: Start with Supabase Test OAuth**

**For immediate testing:**
1. Use empty Client ID/Secret (Supabase handles it)
2. Deploy and test your app
3. Create custom Google OAuth later for production

**This gets your app working in 2 minutes instead of 20!** 🚀