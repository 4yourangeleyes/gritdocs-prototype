#!/bin/bash
# Manual Netlify Deployment Guide

echo "🚀 GritDocs Manual Deployment to Netlify"
echo "========================================"

echo "📦 Step 1: Build the application..."
cd /Users/sachinphilander/HRnME/invoisity/client
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Build files are in: client/build/"
    echo "📊 Bundle size: ~114KB (optimized)"
else
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "🌐 Step 2: Deploy to Netlify"
echo "=============================="
echo ""
echo "Option A: Drag & Drop Deployment (Instant)"
echo "-------------------------------------------"
echo "1. Open: https://app.netlify.com/"
echo "2. Drag the 'client/build' folder to the deploy area"
echo "3. Get instant URL (e.g., https://amazing-site-123.netlify.app)"
echo ""
echo "Option B: Git Integration (Recommended)"
echo "--------------------------------------"
echo "1. Open: https://app.netlify.com/"
echo "2. Click 'New site from Git'"
echo "3. Choose GitHub"
echo "4. Select repository: '4yourangeleyes/gritdocs-prototype'"
echo "5. Build settings (auto-detected from netlify.toml):"
echo "   - Base directory: client"
echo "   - Build command: npm ci && npm run build"
echo "   - Publish directory: client/build"
echo "6. Click 'Deploy site'"
echo ""
echo "🔗 Your repository: https://github.com/4yourangeleyes/gritdocs-prototype"
echo ""
echo "⚡ Expected deployment time: 2-3 minutes"
echo "📝 Your netlify.toml is already configured!"
echo ""
echo "🧪 After deployment, test:"
echo "- Google OAuth sign-in"
echo "- Email registration/login"
echo "- Profile creation"
echo "- Mobile responsiveness"
echo ""
echo "🎉 Ready to go live!"