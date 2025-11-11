# 🚨 **SUPABASE CONFIGURATION FIX NEEDED**

## 🔍 **Issues Identified:**

### **1. Missing Database Table:**
- **Error**: `Could not find the table 'public.profiles' in the schema cache`
- **Cause**: The `profiles` table doesn't exist in your Supabase database
- **Impact**: User registration and profile management won't work

### **2. Google OAuth Not Enabled:**
- **Error**: `{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}`
- **Cause**: Google OAuth provider is disabled in Supabase Authentication settings
- **Impact**: Users can't sign in with Google

---

## 🛠️ **URGENT FIXES REQUIRED:**

### **Fix 1: Create Profiles Table**

**Go to**: [Supabase Dashboard](https://supabase.com/dashboard/project/fopyamyrykwtlwgefxuq) → SQL Editor

**Run this SQL:**
```sql
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  company_name TEXT,
  registration_number TEXT,
  jurisdiction TEXT DEFAULT 'New Zealand',
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create clients table (for future use)
CREATE TABLE public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clients
CREATE POLICY "Users can manage own clients" ON public.clients
  USING (auth.uid() = user_id);

-- Create documents table (for future use)
CREATE TABLE public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('invoice', 'contract', 'quote')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  document_number TEXT NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  subtotal DECIMAL(10,2),
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2),
  currency TEXT DEFAULT 'NZD',
  due_date DATE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for documents
CREATE POLICY "Users can manage own documents" ON public.documents
  USING (auth.uid() = user_id);
```

### **Fix 2: Enable Google OAuth**

**Go to**: [Supabase Dashboard](https://supabase.com/dashboard/project/fopyamyrykwtlwgefxuq) → Authentication → Providers

**Steps:**
1. **Click on "Google"** in the provider list
2. **Toggle "Enable Google provider"** to ON
3. **Add Google OAuth credentials:**

   **For Development/Testing (Quick Setup):**
   ```
   Client ID: [Use Supabase's development client ID or create your own]
   Client Secret: [Use Supabase's development secret or create your own]
   ```

   **For Production (Recommended):**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized domains: `fopyamyrykwtlwgefxuq.supabase.co`
   - Add redirect URIs: `https://fopyamyrykwtlwgefxuq.supabase.co/auth/v1/callback`

4. **Save Configuration**

---

## 🚀 **Quick Setup Option (For Immediate Testing):**

### **Skip Google OAuth for Now:**
If you want to get the app working immediately, you can:

1. **Fix the database** (run the SQL above)
2. **Test with email/password** registration first
3. **Enable Google OAuth** later when you have time to set up Google Cloud Console

### **Alternative: Use Supabase's Test Google OAuth:**
Supabase provides test Google OAuth that works without setup:
1. In Authentication → Providers → Google
2. Use the default test credentials (if available)
3. This works for development/testing

---

## 📋 **Step-by-Step Fix Instructions:**

### **Step 1: Fix Database (5 minutes)**
1. **Open**: [Supabase SQL Editor](https://supabase.com/dashboard/project/fopyamyrykwtlwgefxuq/sql)
2. **Paste**: The entire SQL script above
3. **Click**: "Run" button
4. **Verify**: Tables appear in Table Editor

### **Step 2: Enable Google OAuth (2 minutes)**  
1. **Open**: [Supabase Authentication](https://supabase.com/dashboard/project/fopyamyrykwtlwgefxuq/auth/providers)
2. **Click**: "Google" provider
3. **Toggle**: "Enable Google provider" to ON
4. **Save**: Configuration

### **Step 3: Test Your App (2 minutes)**
1. **Go to**: Your deployed Netlify site
2. **Try**: Email/password registration (should work now)
3. **Try**: Google sign-in (should work if configured)
4. **Verify**: Profile gets created in Supabase dashboard

---

## ⚠️ **Important Notes:**

### **Database Security:**
- **Row Level Security (RLS)** is enabled - users can only see their own data
- **Automatic profile creation** - profiles are created when users sign up
- **Proper foreign key relationships** - data integrity maintained

### **Authentication:**
- **Email/password** will work immediately after database setup
- **Google OAuth** needs provider enabled in Supabase settings
- **Automatic profile handling** for both auth methods

### **Production Considerations:**
- **Custom Google OAuth** recommended for production
- **Email confirmation** can be enabled in Auth settings
- **Rate limiting** available in Auth settings

---

## 🎯 **Expected Results After Fixes:**

### **Email/Password Registration:**
✅ User creates account → Profile automatically created in database → Login works

### **Google OAuth (when enabled):**
✅ User clicks Google sign-in → OAuth popup → Profile created → User logged in

### **App Functionality:**
✅ User dashboard loads → Can add clients → Can generate documents → Full functionality

---

## 🚨 **Fix These Issues First:**

**Priority 1**: Create database tables (SQL script above)
**Priority 2**: Enable Google OAuth provider
**Priority 3**: Test user registration flow

**Once these are fixed, your app will work perfectly! 🎉**

**Need help with any of these steps? Let me know which part needs clarification!**