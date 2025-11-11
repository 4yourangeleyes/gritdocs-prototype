#!/bin/bash

# 🚀 GritDocs - Automated Netlify CLI Deployment

echo "🚀 GritDocs - Netlify CLI Deployment"
echo "===================================="

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
    echo "✅ Netlify CLI installed"
fi

# Login to Netlify (if not already logged in)
echo "🔐 Checking Netlify authentication..."
if ! netlify status &> /dev/null; then
    echo "Please log in to Netlify:"
    netlify login
fi

echo "✅ Netlify CLI ready"

# Ensure we're in the client directory
cd client

# Build the application
echo "🔨 Building production version..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to Netlify
    echo "🚀 Deploying to Netlify..."
    
    # Create site if it doesn't exist and deploy
    netlify deploy --prod --dir=build --message="Production deployment: Auth fixes for client presentation" --site=gritdocs-mvp || netlify deploy --prod --dir=build --message="Production deployment: Auth fixes for client presentation"
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 SUCCESS! Deployment complete!"
        echo ""
        echo "🌐 Your app is live at:"
        netlify status --json | grep -o '"url":"[^"]*' | cut -d'"' -f4
        echo ""
        echo "📋 Don't forget to set environment variables:"
        echo "1. Go to Netlify dashboard"
        echo "2. Site settings → Environment variables"
        echo "3. Add these variables:"
        echo ""
        echo "REACT_APP_SUPABASE_URL=https://fopyamyrykwtlwgefxuq.supabase.co"
        echo "REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvcHlhbXlyeWt3dGx3Z2VmeHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTgyMDAsImV4cCI6MjA3ODM3NDIwMH0.V9nIiQ0rUakLLeG88UgRoXDMG6SwohmFB95LGP3te8k"
        echo "REACT_APP_PROTOTYPE_MODE=true"
        echo ""
    else
        echo "❌ Deployment failed. Trying manual deploy..."
        echo "Please run: netlify deploy --prod --dir=build"
    fi
    
else
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi