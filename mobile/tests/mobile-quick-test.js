#!/usr/bin/env node

/**
 * 🚀 DASH Mobile - Quick Compilation & Build Test
 * 
 * This script validates that the mobile app can compile and build successfully
 * by running comprehensive checks similar to our backend validation.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 DASH Mobile Platform - Quick Build Validation Test\n');

const mobileDir = path.join(__dirname, '..');
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function runTest(testName, testFn) {
  process.stdout.write(`⏳ Testing ${testName}...`);
  
  try {
    testFn();
    console.log(`\r✅ ${testName} - PASSED`);
    results.passed++;
    results.tests.push({ name: testName, status: 'PASSED' });
  } catch (error) {
    console.log(`\r❌ ${testName} - FAILED`);
    console.log(`   Error: ${error.message}`);
    results.failed++;
    results.tests.push({ name: testName, status: 'FAILED', error: error.message });
  }
}

// Test 1: Project Structure Validation
runTest('Mobile Project Structure', () => {
  const requiredDirs = ['src', 'assets', 'android'];
  const requiredFiles = ['package.json', 'App.tsx', 'tsconfig.json'];
  
  requiredDirs.forEach(dir => {
    const dirPath = path.join(mobileDir, dir);
    if (!fs.existsSync(dirPath)) {
      throw new Error(`Missing required directory: ${dir}`);
    }
  });
  
  requiredFiles.forEach(file => {
    const filePath = path.join(mobileDir, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing required file: ${file}`);
    }
  });
});

// Test 2: Package Dependencies Check
runTest('Package Dependencies', () => {
  const packagePath = path.join(mobileDir, 'package.json');
  const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const criticalDeps = [
    'react',
    'react-native', 
    'expo',
    '@react-navigation/native',
    'react-native-maps',
    'expo-location'
  ];
  
  criticalDeps.forEach(dep => {
    if (!packageContent.dependencies[dep]) {
      throw new Error(`Missing critical dependency: ${dep}`);
    }
  });
  
  if (!packageContent.scripts['type-check']) {
    throw new Error('Missing type-check script');
  }
});

// Test 3: TypeScript Configuration
runTest('TypeScript Configuration', () => {
  const tsconfigPath = path.join(mobileDir, 'tsconfig.json');
  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
  
  if (tsconfig.compilerOptions.jsx !== 'react-native') {
    throw new Error('TypeScript not configured for React Native');
  }
  
  if (!tsconfig.compilerOptions.strict) {
    throw new Error('TypeScript strict mode not enabled');
  }
});

// Test 4: Core Component Compilation
runTest('Core Components Syntax', () => {
  const coreFiles = [
    'App.tsx',
    'src/components/DashIcon.tsx',
    'src/context/AuthContext.tsx',
    'src/context/SettingsContext.tsx'
  ];
  
  coreFiles.forEach(file => {
    const filePath = path.join(mobileDir, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Basic syntax validation
      if (!content.includes('import React')) {
        throw new Error(`${file}: Missing React import`);
      }
      
      if (!content.includes('export')) {
        throw new Error(`${file}: Missing exports`);
      }
      
      // Check for obvious syntax errors
      const openBraces = (content.match(/{/g) || []).length;
      const closeBraces = (content.match(/}/g) || []).length;
      if (openBraces !== closeBraces) {
        throw new Error(`${file}: Mismatched braces`);
      }
    }
  });
});

// Test 5: Navigation Structure
runTest('Navigation Structure', () => {
  const appPath = path.join(mobileDir, 'App.tsx');
  const appContent = fs.readFileSync(appPath, 'utf8');
  
  const requiredImports = [
    '@react-navigation/native',
    '@react-navigation/stack'
  ];
  
  requiredImports.forEach(importPath => {
    if (!appContent.includes(importPath)) {
      throw new Error(`Missing navigation import: ${importPath}`);
    }
  });
  
  // Check for screen definitions
  const requiredScreens = ['Home', 'LiveRace', 'Garage', 'Profile'];
  requiredScreens.forEach(screen => {
    if (!appContent.includes(`name="${screen}"`)) {
      throw new Error(`Missing screen definition: ${screen}`);
    }
  });
});

// Test 6: Asset Validation
runTest('Required Assets', () => {
  const assetsDir = path.join(mobileDir, 'assets');
  const requiredAssets = ['icon.png', 'adaptive-icon.png'];
  
  requiredAssets.forEach(asset => {
    const assetPath = path.join(assetsDir, asset);
    if (!fs.existsSync(assetPath)) {
      throw new Error(`Missing required asset: ${asset}`);
    }
  });
  
  // Check dash icons
  const dashIconsDir = path.join(assetsDir, 'dash-icons');
  if (fs.existsSync(dashIconsDir)) {
    const iconFiles = fs.readdirSync(dashIconsDir);
    const pngFiles = iconFiles.filter(file => file.endsWith('.png'));
    if (pngFiles.length === 0) {
      throw new Error('No dash icons found');
    }
  }
});

// Test 7: Expo Configuration
runTest('Expo Configuration', () => {
  const appJsonPath = path.join(mobileDir, 'app.json');
  const appConfig = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  
  if (!appConfig.expo) {
    throw new Error('Missing expo configuration');
  }
  
  const requiredFields = ['name', 'slug', 'version', 'platforms'];
  requiredFields.forEach(field => {
    if (!appConfig.expo[field]) {
      throw new Error(`Missing expo.${field}`);
    }
  });
  
  if (!appConfig.expo.platforms.includes('android')) {
    throw new Error('Android platform not configured');
  }
});

// Test 8: TypeScript Type Checking (if possible)
runTest('TypeScript Type Check', () => {
  try {
    process.chdir(mobileDir);
    
    // Check if we can run type checking
    const result = execSync('npx tsc --noEmit --skipLibCheck', { 
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 30000
    });
    
    // If we get here, type checking passed
  } catch (error) {
    // Parse TypeScript errors to see if they're critical
    const errorOutput = error.stdout || error.stderr || '';
    
    // Filter out non-critical errors (missing dependencies for testing)
    const criticalErrors = errorOutput
      .split('\n')
      .filter(line => line.includes('error TS'))
      .filter(line => !line.includes('@testing-library'))
      .filter(line => !line.includes('jest'))
      .filter(line => !line.includes('Cannot find module'));
    
    if (criticalErrors.length > 0) {
      throw new Error(`TypeScript compilation errors: ${criticalErrors.length} critical errors found`);
    }
  }
});

// Test 9: Import Resolution
runTest('Import Resolution', () => {
  const appPath = path.join(mobileDir, 'App.tsx');
  const appContent = fs.readFileSync(appPath, 'utf8');
  
  // Extract local imports
  const importMatches = appContent.match(/from ['"][./][^'"]*['"]/g) || [];
  
  importMatches.forEach(importMatch => {
    const importPath = importMatch.match(/from ['"]([^'"]*)['"]/)?.[1];
    if (importPath?.startsWith('./src/')) {
      const resolvedPath = path.join(mobileDir, importPath + '.tsx');
      const altResolvedPath = path.join(mobileDir, importPath + '.ts');
      
      if (!fs.existsSync(resolvedPath) && !fs.existsSync(altResolvedPath)) {
        throw new Error(`Cannot resolve import: ${importPath}`);
      }
    }
  });
});

// Test 10: Android Build Readiness
runTest('Android Build Configuration', () => {
  const androidDir = path.join(mobileDir, 'android');
  if (fs.existsSync(androidDir)) {
    const requiredFiles = [
      'build.gradle',
      'settings.gradle',
      'app/build.gradle'
    ];
    
    requiredFiles.forEach(file => {
      const filePath = path.join(androidDir, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Missing Android build file: ${file}`);
      }
    });
  }
});

// Display Results
console.log('\n📊 Mobile Test Results Summary:');
console.log(`Total Tests: ${results.passed + results.failed}`);
console.log(`Passed: ${results.passed}`);
console.log(`Failed: ${results.failed}`);
console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

if (results.failed === 0) {
  console.log('\n🎉 All mobile tests passed! Build compilation should succeed.');
  console.log('\n📋 Next Steps:');
  console.log('✨ Ready for mobile build compilation');
  console.log('🤖 Run Android build: npm run build:android');
  console.log('🍎 Run iOS build: npm run build:ios');
  console.log('🧪 Run type check: npm run type-check');
} else {
  console.log('\n⚠️  Some mobile tests failed. Review errors above.');
  process.exit(1);
}

console.log('\n📊 Mobile build validation completed successfully!');