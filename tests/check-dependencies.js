/**
 * Dependency Checker
 * Verifies all required dependencies are available before running tests
 */

const fs = require('fs');
const path = require('path');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function checkDependencies() {
  console.log(`${colors.bold}${colors.blue}📦 Checking Dependencies${colors.reset}\n`);

  const requiredDeps = [
    'axios',
    'ws',
    'jest',
    '@types/jest',
    'typescript',
    'ts-jest'
  ];

  let allFound = true;

  // Check if node_modules exists
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log(`${colors.red}❌ node_modules directory not found${colors.reset}`);
    console.log(`${colors.yellow}💡 Run: npm install${colors.reset}\n`);
    return false;
  }

  // Check each dependency
  for (const dep of requiredDeps) {
    const depPath = path.join(nodeModulesPath, dep);
    if (fs.existsSync(depPath)) {
      console.log(`${colors.green}✅ ${dep}${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ ${dep} - Missing${colors.reset}`);
      allFound = false;
    }
  }

  console.log('');

  if (allFound) {
    console.log(`${colors.bold}${colors.green}🎉 All dependencies found!${colors.reset}`);
    return true;
  } else {
    console.log(`${colors.bold}${colors.red}⚠️  Missing dependencies. Run: npm install${colors.reset}`);
    return false;
  }
}

if (require.main === module) {
  const success = checkDependencies();
  process.exit(success ? 0 : 1);
}

module.exports = { checkDependencies };