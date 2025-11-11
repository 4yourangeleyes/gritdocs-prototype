#!/bin/bash
# Debug OAuth Flow Script

echo "🔍 Debugging OAuth Flow Issues"
echo "=============================="

echo "1. Testing site accessibility..."
curl -s -o /dev/null -w "Status: %{http_code}\n" https://gritdocs-mvp.netlify.app

echo -e "\n2. Checking for JavaScript errors..."
echo "📋 Manual test required:"
echo "   - Open browser dev tools (F12)"
echo "   - Go to https://gritdocs-mvp.netlify.app/login"
echo "   - Check Console tab for errors"
echo "   - Try Google OAuth and watch Network tab"

echo -e "\n3. Expected OAuth Flow:"
echo "   Step 1: Click 'Continue with Google'"
echo "   Step 2: Google popup opens"
echo "   Step 3: Sign in with Google"
echo "   Step 4: Redirect to: https://gritdocs-mvp.netlify.app/?code=..."
echo "   Step 5: App processes auth code and creates session"
echo "   Step 6: Redirect to homepage with user logged in"

echo -e "\n4. Common Loading Issues:"
echo "   ❌ JavaScript error during auth processing"
echo "   ❌ Infinite redirect loop"
echo "   ❌ Session not being created properly"
echo "   ❌ Auth context not updating"

echo -e "\n5. Debug Steps:"
echo "   1. Open dev tools Console tab"
echo "   2. Try OAuth again"
echo "   3. Look for errors in Console"
echo "   4. Check Network tab for failed requests"
echo "   5. Check if auth token is being processed"

echo -e "\n6. Quick Fixes to Try:"
echo "   - Clear browser cache and cookies"
echo "   - Try incognito/private browser window"
echo "   - Check if Netlify deployment is complete"
echo "   - Verify no JavaScript errors on login page"

echo -e "\n🎯 Next Steps:"
echo "1. Update Google OAuth app name in Google Cloud Console"
echo "2. Check browser dev tools for errors during OAuth"
echo "3. Test in incognito window"
echo "4. Report any console errors found"