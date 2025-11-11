#!/usr/bin/env node

// GritDocs Setup Validation Script
console.log('🔍 Validating GritDocs Setup...\n');

// Check environment variables
const requiredEnvVars = [
  'REACT_APP_SUPABASE_URL',
  'REACT_APP_SUPABASE_ANON_KEY'
];

let hasErrors = false;

console.log('📋 Environment Variables:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: Missing!`);
    hasErrors = true;
  }
});

// Check if .env file exists
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('\n✅ .env file exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  requiredEnvVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`✅ ${varName} found in .env`);
    } else {
      console.log(`❌ ${varName} missing from .env`);
      hasErrors = true;
    }
  });
} else {
  console.log('\n❌ .env file not found!');
  hasErrors = true;
}

// Check package.json
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  console.log('\n✅ package.json exists');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const requiredDeps = ['@supabase/supabase-js', 'react-router-dom'];
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
    } else {
      console.log(`❌ ${dep}: Missing!`);
      hasErrors = true;
    }
  });
}

console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ Setup has issues - please fix the errors above');
  process.exit(1);
} else {
  console.log('✅ Setup looks good! Ready for deployment');
  console.log('🚀 Run: npm run build && npm start');
}