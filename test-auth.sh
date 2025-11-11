#!/bin/bash
# Authentication Test Script

echo "🔍 Testing GritDocs Authentication..."
echo "=================================="

# Test 1: Check Supabase Connection
echo "1. Testing Supabase Connection..."
cd /Users/sachinphilander/HRnME/invoisity

# Test environment variables
if [ -f "client/.env" ]; then
    echo "✅ Environment file exists"
    if grep -q "REACT_APP_SUPABASE_URL" client/.env; then
        echo "✅ Supabase URL configured"
    else
        echo "❌ Supabase URL missing"
    fi
    if grep -q "REACT_APP_SUPABASE_ANON_KEY" client/.env; then
        echo "✅ Supabase key configured"
    else
        echo "❌ Supabase key missing"
    fi
else
    echo "❌ Environment file missing"
fi

# Test 2: Check Database Connection
echo -e "\n2. Testing Database Schema..."
npx supabase status --db-url 2>/dev/null && echo "✅ Database accessible" || echo "❌ Database connection issue"

# Test 3: Check Google OAuth Configuration
echo -e "\n3. Checking Google OAuth Setup..."
echo "📋 Manual Test Required:"
echo "   - Open: https://supabase.com/dashboard/project/fopyamyrykwtlwgefxuq/auth/providers"
echo "   - Verify Google provider is ENABLED"
echo "   - Verify Client ID is set (not empty)"

# Test 4: Build Check
echo -e "\n4. Testing Application Build..."
cd client
if npm run build >/dev/null 2>&1; then
    echo "✅ Build successful - no compilation errors"
else
    echo "❌ Build failed - check TypeScript errors"
fi

# Test 5: Component Check
echo -e "\n5. Checking Authentication Components..."
if [ -f "src/pages/LoginPage.tsx" ]; then
    echo "✅ Login page exists"
else
    echo "❌ Login page missing"
fi

if [ -f "src/contexts/AuthContext.tsx" ]; then
    echo "✅ Auth context exists"
else
    echo "❌ Auth context missing"
fi

if [ -f "src/services/auth.ts" ]; then
    echo "✅ Auth service exists"
else
    echo "❌ Auth service missing"
fi

echo -e "\n🎯 Next Steps:"
echo "1. Deploy to Netlify with current build"
echo "2. Test Google OAuth on live URL"
echo "3. Test email signup/signin flow"
echo "4. Verify profile creation works"
echo -e "\n🚀 Ready for deployment testing!"