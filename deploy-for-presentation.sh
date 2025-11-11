#!/bin/bash

# 🚀 GritDocs - Quick Deployment for Client Presentation

echo "🚀 GritDocs - Preparing for Client Presentation"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "client/package.json" ]; then
  echo "❌ Error: Please run this script from the project root directory"
  exit 1
fi

echo ""
echo "📋 Pre-deployment checks..."

# Check if .env exists
if [ ! -f "client/.env" ]; then
  echo "❌ Error: client/.env file not found"
  echo "Creating .env file with production settings..."
  
  cat > client/.env << EOL
# GritDocs - Supabase Configuration
REACT_APP_SUPABASE_URL=https://fopyamyrykwtlwgefxuq.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvcHlhbXlyeWt3dGx3Z2VmeHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTgyMDAsImV4cCI6MjA3ODM3NDIwMH0.V9nIiQ0rUakLLeG88UgRoXDMG6SwohmFB95LGP3te8k

# Prototype Mode - Using fallback templates for testing
REACT_APP_PROTOTYPE_MODE=true
EOL
  
  echo "✅ .env file created"
else
  echo "✅ .env file found"
fi

# Check node_modules
if [ ! -d "client/node_modules" ]; then
  echo "📦 Installing dependencies..."
  cd client && npm install && cd ..
else
  echo "✅ Dependencies already installed"
fi

echo ""
echo "🔨 Building production version..."

cd client
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
  
  # Show build stats
  echo ""
  echo "📊 Build Statistics:"
  echo "Build size: $(du -sh build 2>/dev/null | cut -f1 || echo 'Unknown')"
  echo "Main JS: $(ls -lh build/static/js/main.*.js 2>/dev/null | awk '{print $5}' || echo 'Unknown')"
  echo "Main CSS: $(ls -lh build/static/css/main.*.css 2>/dev/null | awk '{print $5}' || echo 'Unknown')"
  
  echo ""
  echo "🎉 SUCCESS! Your app is ready for deployment!"
  echo ""
  echo "📋 Next Steps:"
  echo "1. Go to: https://app.netlify.com/"
  echo "2. Drag the 'build' folder to Netlify"
  echo "3. Or connect your GitHub repo for auto-deployment"
  echo ""
  echo "🔧 Environment Variables for Netlify:"
  echo "REACT_APP_SUPABASE_URL=https://fopyamyrykwtlwgefxuq.supabase.co"
  echo "REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvcHlhbXlyeWt3dGx3Z2VmeHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTgyMDAsImV4cCI6MjA3ODM3NDIwMH0.V9nIiQ0rUakLLeG88UgRoXDMG6SwohmFB95LGP3te8k"
  echo "REACT_APP_PROTOTYPE_MODE=true"
  echo ""
  echo "🎯 Demo URLs to test:"
  echo "- Authentication: /login"
  echo "- Dashboard: /"
  echo "- Document generation: /chat"
  echo "- Client management: /clients" 
  echo ""
  echo "🚀 Your MVP is ready for tomorrow's client presentation!"
  
else
  echo "❌ Build failed! Check the errors above."
  exit 1
fi

cd ..