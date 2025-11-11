#!/bin/bash

# GritDocs Netlify Deployment Script
# Deploy prototype version without API keys

echo "🚀 PREPARING GRITDOCS PROTOTYPE FOR NETLIFY"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the client directory"
    exit 1
fi

# Ensure prototype mode is enabled
echo "🔧 Configuring prototype mode..."
if ! grep -q "REACT_APP_PROTOTYPE_MODE=true" .env; then
    echo "REACT_APP_PROTOTYPE_MODE=true" >> .env
    echo "✅ Prototype mode enabled"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🏗️  Building production application..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ BUILD SUCCESSFUL!"
    echo ""
    echo "📊 Build Statistics:"
    echo "   Size: $(du -sh build 2>/dev/null | cut -f1 || echo 'Unknown')"
    echo "   Files: $(find build -type f 2>/dev/null | wc -l || echo 'Unknown') files"
    echo ""
    echo "🚀 NETLIFY DEPLOYMENT OPTIONS:"
    echo ""
    echo "Option 1: Drag & Drop Deployment (Easiest)"
    echo "   1. Go to https://app.netlify.com/"
    echo "   2. Drag the 'build' folder to the deploy area"
    echo "   3. Your site will be live in seconds!"
    echo ""
    echo "Option 2: Git-based Deployment (Recommended)"
    echo "   1. Push this code to GitHub/GitLab"
    echo "   2. Connect repository in Netlify dashboard"
    echo "   3. Auto-deploy on every push"
    echo ""
    echo "Option 3: Netlify CLI (if available)"
    echo "   1. npm install -g netlify-cli"
    echo "   2. netlify login"
    echo "   3. netlify deploy --prod --dir=build"
    echo ""
    echo "📋 PROTOTYPE FEATURES INCLUDED:"
    echo "   ✅ Full authentication flow (email + Google OAuth)"
    echo "   ✅ Intelligent document templates"
    echo "   ✅ Voice input simulation"
    echo "   ✅ Mobile-optimized UI"
    echo "   ✅ Database integration (Supabase)"
    echo "   ✅ Production-ready architecture"
    echo ""
    echo "🔮 UPGRADE PATH FOR PRODUCTION:"
    echo "   1. Add Gemini API key → Full AI document generation"
    echo "   2. Add Resend API key → Email document sending"
    echo "   3. Add OpenAI key → Enhanced AI features"
    echo "   4. Upgrade Supabase plan → Increased storage & bandwidth"
    echo ""
    echo "💡 CLIENT TESTING SCENARIOS:"
    echo "   • Create user accounts and profiles"
    echo "   • Generate invoices with intelligent templates"
    echo "   • Test voice input simulation"
    echo "   • Create contracts with context detection"
    echo "   • Add clients and manage relationships"
    echo "   • Test mobile experience across devices"
    echo ""
    echo "📄 Your prototype is ready to collect real user feedback!"
    echo "📁 Deploy the 'build' folder contents to Netlify"
else
    echo "❌ Build failed. Please check errors above."
    exit 1
fi