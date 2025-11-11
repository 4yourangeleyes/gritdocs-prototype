#!/bin/bash
# 🚀 Complete Google OAuth Setup for GritDocs

echo "🔧 Setting up Google OAuth for GritDocs..."

# Step 1: Create Google Cloud Project and get OAuth credentials
echo "📋 Google Cloud Console Setup Instructions:"
echo ""
echo "1. Go to: https://console.cloud.google.com/"
echo "2. Create new project: 'GritDocs'"
echo "3. Enable Google+ API"
echo "4. Go to Credentials → Create OAuth 2.0 Client ID"
echo "5. Application type: Web application"
echo "6. Authorized origins: https://fopyamyrykwtlwgefxuq.supabase.co"
echo "7. Redirect URIs: https://fopyamyrykwtlwgefxuq.supabase.co/auth/v1/callback"
echo ""

# Step 2: Update Supabase configuration
echo "🔑 After getting your Google OAuth credentials:"
echo "Go to: https://supabase.com/dashboard/project/fopyamyrykwtlwgefxuq/auth/providers"
echo "Click Google → Enable → Add your Client ID and Secret"
echo ""

# Step 3: Test the setup
echo "🧪 Testing commands after setup:"
echo "cd client && npm start"
echo "lighthouse http://localhost:3000 --output=html"
echo ""

# Step 4: Deploy to production
echo "🚀 Deploy to Netlify:"
echo "1. Import GitHub repo: 4yourangeleyes/gritdocs-prototype" 
echo "2. Add environment variables"
echo "3. Deploy!"
echo ""

echo "✅ Setup complete! Your app will have full Google OAuth."