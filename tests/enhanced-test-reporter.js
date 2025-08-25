#!/usr/bin/env node
/**
 * Enhanced Test Reporter for DashRacing Platform
 * Provides comprehensive test reports with detailed analysis of errors, issues, and successes
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class EnhancedTestReporter {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      platform: 'DashRacing Platform',
      testSuites: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        passRate: 0
      },
      errors: [],
      recommendations: [],
      detailedAnalysis: {}
    };
    
    this.colors = {
      green: '\x1b[32m',
      red: '\x1b[31m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      reset: '\x1b[0m',
      bold: '\x1b[1m',
      dim: '\x1b[2m'
    };
  }

  async runComprehensiveTests() {
    console.log(`${this.colors.bold}${this.colors.blue}
╔══════════════════════════════════════════════════════════════╗
║              DashRacing Enhanced Test Suite                  ║
║           Comprehensive Error Analysis & Reporting          ║
╚══════════════════════════════════════════════════════════════╝
${this.colors.reset}\n`);

    try {
      // 1. Infrastructure Tests
      await this.runInfrastructureTests();
      
      // 2. Integration Tests  
      await this.runIntegrationTests();
      
      // 3. Performance Tests
      await this.runPerformanceTests();
      
      // 4. Security Tests
      await this.runSecurityTests();
      
      // 5. API Comprehensive Tests
      await this.runAPITests();
      
      // 6. Generate comprehensive reports
      await this.generateDetailedReport();
      await this.generateHTMLReport();
      
    } catch (error) {
      this.logError('Test Suite Execution', error);
    }
    
    return this.results;
  }

  async runInfrastructureTests() {
    console.log(`${this.colors.cyan}🏗️  Running Infrastructure Tests...${this.colors.reset}`);
    
    const testSuite = {
      name: 'Infrastructure',
      tests: [],
      passed: 0,
      failed: 0,
      issues: []
    };

    // Test 1: Health Check
    try {
      console.log(`  ${this.colors.dim}• Health Check${this.colors.reset}`);
      execSync('node health-check.js', { cwd: __dirname, stdio: 'pipe' });
      testSuite.tests.push({ name: 'Health Check', status: 'PASSED', details: 'All services operational' });
      testSuite.passed++;
    } catch (error) {
      const errorDetails = this.analyzeError(error);
      testSuite.tests.push({ 
        name: 'Health Check', 
        status: 'FAILED', 
        error: error.message,
        analysis: errorDetails,
        recommendation: 'Start backend services before running tests'
      });
      testSuite.failed++;
      testSuite.issues.push('Backend services not running');
    }

    // Test 2: Dependencies Check
    try {
      console.log(`  ${this.colors.dim}• Dependencies Check${this.colors.reset}`);
      execSync('node check-dependencies.js', { cwd: __dirname, stdio: 'pipe' });
      testSuite.tests.push({ name: 'Dependencies Check', status: 'PASSED', details: 'All dependencies satisfied' });
      testSuite.passed++;
    } catch (error) {
      const errorDetails = this.analyzeError(error);
      testSuite.tests.push({ 
        name: 'Dependencies Check', 
        status: 'FAILED', 
        error: error.message,
        analysis: errorDetails,
        recommendation: 'Run npm install to fix missing dependencies'
      });
      testSuite.failed++;
    }

    this.results.testSuites.push(testSuite);
    this.logTestSuiteResult('Infrastructure', testSuite);
  }

  async runIntegrationTests() {
    console.log(`${this.colors.cyan}🔗 Running Integration Tests...${this.colors.reset}`);
    
    const testSuite = {
      name: 'Integration',
      tests: [],
      passed: 0,
      failed: 0,
      issues: []
    };

    try {
      console.log(`  ${this.colors.dim}• API Endpoints Integration${this.colors.reset}`);
      const result = execSync('npm run test:integration', { 
        cwd: __dirname, 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      // Parse Jest output for detailed results
      const testResults = this.parseJestOutput(result);
      testSuite.tests = testResults.tests;
      testSuite.passed = testResults.passed;
      testSuite.failed = testResults.failed;
      
      if (testResults.failed > 0) {
        testSuite.issues.push('Some integration tests failed - check API connectivity');
      }
      
    } catch (error) {
      const errorDetails = this.analyzeError(error);
      testSuite.tests.push({ 
        name: 'Integration Tests', 
        status: 'FAILED', 
        error: error.message,
        analysis: errorDetails,
        recommendation: 'Ensure backend is running and accessible'
      });
      testSuite.failed++;
      testSuite.issues.push('Integration test suite failed to execute');
    }

    this.results.testSuites.push(testSuite);
    this.logTestSuiteResult('Integration', testSuite);
  }

  async runPerformanceTests() {
    console.log(`${this.colors.cyan}⚡ Running Performance Tests...${this.colors.reset}`);
    
    const testSuite = {
      name: 'Performance',
      tests: [],
      passed: 0,
      failed: 0,
      issues: [],
      metrics: {}
    };

    try {
      console.log(`  ${this.colors.dim}• Load Testing${this.colors.reset}`);
      const result = execSync('npm run test:performance', { 
        cwd: __dirname, 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      const testResults = this.parseJestOutput(result);
      const performanceMetrics = this.extractPerformanceMetrics(result);
      
      testSuite.tests = testResults.tests;
      testSuite.passed = testResults.passed;
      testSuite.failed = testResults.failed;
      testSuite.metrics = performanceMetrics;
      
      if (performanceMetrics.avgResponseTime > 500) {
        testSuite.issues.push('High response times detected');
      }
      
    } catch (error) {
      const errorDetails = this.analyzeError(error);
      testSuite.tests.push({ 
        name: 'Performance Tests', 
        status: 'FAILED', 
        error: error.message,
        analysis: errorDetails,
        recommendation: 'Check server performance and database optimization'
      });
      testSuite.failed++;
      testSuite.issues.push('Performance test suite failed to execute');
    }

    this.results.testSuites.push(testSuite);
    this.logTestSuiteResult('Performance', testSuite);
  }

  async runSecurityTests() {
    console.log(`${this.colors.cyan}🔒 Running Security Tests...${this.colors.reset}`);
    
    const testSuite = {
      name: 'Security',
      tests: [],
      passed: 0,
      failed: 0,
      issues: [],
      vulnerabilities: []
    };

    try {
      console.log(`  ${this.colors.dim}• Security Vulnerability Scan${this.colors.reset}`);
      const result = execSync('npm run test:security', { 
        cwd: __dirname, 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      const testResults = this.parseJestOutput(result);
      const securityIssues = this.extractSecurityIssues(result);
      
      testSuite.tests = testResults.tests;
      testSuite.passed = testResults.passed;
      testSuite.failed = testResults.failed;
      testSuite.vulnerabilities = securityIssues;
      
    } catch (error) {
      const errorDetails = this.analyzeError(error);
      testSuite.tests.push({ 
        name: 'Security Tests', 
        status: 'FAILED', 
        error: error.message,
        analysis: errorDetails,
        recommendation: 'Review authentication and input validation'
      });
      testSuite.failed++;
      testSuite.issues.push('Security test suite failed to execute');
    }

    this.results.testSuites.push(testSuite);
    this.logTestSuiteResult('Security', testSuite);
  }

  async runAPITests() {
    console.log(`${this.colors.cyan}🌐 Running Comprehensive API Tests...${this.colors.reset}`);
    
    const testSuite = {
      name: 'API Comprehensive',
      tests: [],
      passed: 0,
      failed: 0,
      issues: []
    };

    try {
      console.log(`  ${this.colors.dim}• Full API Test Suite${this.colors.reset}`);
      const result = execSync('npm run test:api', { 
        cwd: __dirname, 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      const testResults = this.parseJestOutput(result);
      testSuite.tests = testResults.tests;
      testSuite.passed = testResults.passed;
      testSuite.failed = testResults.failed;
      
    } catch (error) {
      const errorDetails = this.analyzeError(error);
      testSuite.tests.push({ 
        name: 'API Tests', 
        status: 'FAILED', 
        error: error.message,
        analysis: errorDetails,
        recommendation: 'Check API endpoint availability and authentication'
      });
      testSuite.failed++;
      testSuite.issues.push('API test suite failed to execute');
    }

    this.results.testSuites.push(testSuite);
    this.logTestSuiteResult('API', testSuite);
  }

  analyzeError(error) {
    const analysis = {
      type: 'Unknown',
      category: 'General',
      severity: 'Medium',
      possibleCauses: [],
      suggestedFixes: []
    };

    const errorMessage = error.message || error.toString();
    
    // Connection errors
    if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('connect ECONNREFUSED')) {
      analysis.type = 'Connection Error';
      analysis.category = 'Infrastructure';
      analysis.severity = 'High';
      analysis.possibleCauses = ['Service not running', 'Incorrect port', 'Firewall blocking'];
      analysis.suggestedFixes = ['Start the backend service', 'Check port configuration', 'Verify firewall settings'];
    }
    
    // Authentication errors
    else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      analysis.type = 'Authentication Error';
      analysis.category = 'Security';
      analysis.severity = 'High';
      analysis.possibleCauses = ['Invalid credentials', 'Expired token', 'Missing authentication'];
      analysis.suggestedFixes = ['Check login credentials', 'Refresh authentication token', 'Verify auth headers'];
    }
    
    // Database errors
    else if (errorMessage.includes('database') || errorMessage.includes('prisma')) {
      analysis.type = 'Database Error';
      analysis.category = 'Infrastructure';
      analysis.severity = 'High';
      analysis.possibleCauses = ['Database not running', 'Connection string incorrect', 'Migration needed'];
      analysis.suggestedFixes = ['Start database service', 'Check DATABASE_URL', 'Run database migrations'];
    }
    
    // Timeout errors
    else if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
      analysis.type = 'Timeout Error';
      analysis.category = 'Performance';
      analysis.severity = 'Medium';
      analysis.possibleCauses = ['Slow response', 'Network issues', 'Server overload'];
      analysis.suggestedFixes = ['Increase timeout', 'Check network connectivity', 'Optimize server performance'];
    }

    return analysis;
  }

  parseJestOutput(output) {
    const results = {
      tests: [],
      passed: 0,
      failed: 0,
      total: 0
    };

    try {
      // Extract test results from Jest output
      const lines = output.split('\n');
      let inTestResults = false;
      
      for (const line of lines) {
        if (line.includes('✓') || line.includes('✗')) {
          const testName = line.replace(/[✓✗]/g, '').trim();
          const status = line.includes('✓') ? 'PASSED' : 'FAILED';
          
          results.tests.push({
            name: testName,
            status: status,
            details: status === 'PASSED' ? 'Test completed successfully' : 'Test failed - check error details'
          });
          
          if (status === 'PASSED') {
            results.passed++;
          } else {
            results.failed++;
          }
          results.total++;
        }
      }
    } catch (error) {
      // Fallback parsing
      results.tests.push({
        name: 'Jest Output Parsing',
        status: 'FAILED',
        error: 'Could not parse test output',
        details: output.substring(0, 500)
      });
      results.failed = 1;
      results.total = 1;
    }

    return results;
  }

  extractPerformanceMetrics(output) {
    const metrics = {
      avgResponseTime: 0,
      maxResponseTime: 0,
      minResponseTime: 0,
      throughput: 0,
      errorRate: 0
    };

    // Extract performance metrics from output
    const responseTimeMatch = output.match(/average response time: (\d+)ms/i);
    if (responseTimeMatch) {
      metrics.avgResponseTime = parseInt(responseTimeMatch[1]);
    }

    return metrics;
  }

  extractSecurityIssues(output) {
    const issues = [];
    
    // Look for security-related failures in output
    if (output.includes('SQL injection')) {
      issues.push({ type: 'SQL Injection', severity: 'High', status: 'Detected' });
    }
    
    if (output.includes('XSS')) {
      issues.push({ type: 'Cross-Site Scripting', severity: 'High', status: 'Detected' });
    }
    
    return issues;
  }

  logError(context, error) {
    this.results.errors.push({
      context,
      message: error.message,
      timestamp: new Date().toISOString(),
      analysis: this.analyzeError(error)
    });
  }

  logTestSuiteResult(suiteName, suite) {
    const total = suite.passed + suite.failed;
    const passRate = total > 0 ? Math.round((suite.passed / total) * 100) : 0;
    
    if (suite.failed === 0) {
      console.log(`  ${this.colors.green}✅ ${suiteName}: ${suite.passed}/${total} passed (${passRate}%)${this.colors.reset}`);
    } else {
      console.log(`  ${this.colors.red}❌ ${suiteName}: ${suite.passed}/${total} passed (${passRate}%)${this.colors.reset}`);
      if (suite.issues.length > 0) {
        suite.issues.forEach(issue => {
          console.log(`    ${this.colors.yellow}⚠️  ${issue}${this.colors.reset}`);
        });
      }
    }
  }

  async generateDetailedReport() {
    console.log(`\n${this.colors.cyan}📊 Generating Detailed Test Report...${this.colors.reset}`);
    
    // Calculate overall summary
    this.results.testSuites.forEach(suite => {
      this.results.summary.total += (suite.passed + suite.failed);
      this.results.summary.passed += suite.passed;
      this.results.summary.failed += suite.failed;
    });
    
    this.results.summary.passRate = this.results.summary.total > 0 
      ? Math.round((this.results.summary.passed / this.results.summary.total) * 100) 
      : 0;

    // Generate recommendations
    this.generateRecommendations();
    
    // Save detailed JSON report
    const reportPath = path.join(__dirname, 'comprehensive-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    console.log(`${this.colors.green}✅ Detailed report saved: ${reportPath}${this.colors.reset}`);
    
    // Display summary
    this.displaySummary();
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.summary.failed > 0) {
      recommendations.push({
        priority: 'High',
        category: 'Test Failures',
        action: 'Fix failing tests to achieve 100% pass rate',
        details: `${this.results.summary.failed} tests are currently failing`
      });
    }
    
    // Check for infrastructure issues
    const infraSuite = this.results.testSuites.find(s => s.name === 'Infrastructure');
    if (infraSuite && infraSuite.failed > 0) {
      recommendations.push({
        priority: 'Critical',
        category: 'Infrastructure',
        action: 'Start backend services and verify connections',
        details: 'Infrastructure tests indicate services are not running'
      });
    }
    
    // Check for security issues
    const securitySuite = this.results.testSuites.find(s => s.name === 'Security');
    if (securitySuite && securitySuite.vulnerabilities && securitySuite.vulnerabilities.length > 0) {
      recommendations.push({
        priority: 'High',
        category: 'Security',
        action: 'Address security vulnerabilities',
        details: `${securitySuite.vulnerabilities.length} security issues detected`
      });
    }
    
    if (this.results.summary.passRate === 100) {
      recommendations.push({
        priority: 'Low',
        category: 'Optimization',
        action: 'Consider performance optimizations',
        details: 'All tests passing - focus on performance improvements'
      });
    }
    
    this.results.recommendations = recommendations;
  }

  displaySummary() {
    console.log(`\n${this.colors.bold}${this.colors.blue}📋 Comprehensive Test Summary${this.colors.reset}`);
    console.log(`${this.colors.bold}===============================${this.colors.reset}`);
    console.log(`Total Tests: ${this.results.summary.total}`);
    console.log(`${this.colors.green}Passed: ${this.results.summary.passed}${this.colors.reset}`);
    console.log(`${this.colors.red}Failed: ${this.results.summary.failed}${this.colors.reset}`);
    console.log(`Pass Rate: ${this.results.summary.passRate}%`);
    
    if (this.results.summary.passRate === 100) {
      console.log(`\n${this.colors.bold}${this.colors.green}🎉 PERFECT SCORE: 100% Functionality Achieved!${this.colors.reset}`);
    } else {
      console.log(`\n${this.colors.yellow}⚠️  ${100 - this.results.summary.passRate}% improvement needed for 100% functionality${this.colors.reset}`);
    }
    
    if (this.results.recommendations.length > 0) {
      console.log(`\n${this.colors.bold}🔧 Recommendations:${this.colors.reset}`);
      this.results.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. [${rec.priority}] ${rec.action}`);
        console.log(`   ${this.colors.dim}${rec.details}${this.colors.reset}`);
      });
    }
  }

  async generateHTMLReport() {
    const htmlReport = this.generateHTMLContent();
    const reportPath = path.join(__dirname, 'test-report.html');
    fs.writeFileSync(reportPath, htmlReport);
    console.log(`${this.colors.green}✅ HTML report saved: ${reportPath}${this.colors.reset}`);
  }

  generateHTMLContent() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DashRacing Platform - Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 20px; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; border-left: 4px solid #007bff; }
        .metric.success { border-left-color: #28a745; }
        .metric.warning { border-left-color: #ffc107; }
        .metric.danger { border-left-color: #dc3545; }
        .test-suite { margin-bottom: 25px; border: 1px solid #ddd; border-radius: 5px; }
        .suite-header { background: #007bff; color: white; padding: 10px 15px; font-weight: bold; }
        .suite-content { padding: 15px; }
        .test-item { padding: 8px 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
        .test-item:last-child { border-bottom: none; }
        .status-passed { color: #28a745; font-weight: bold; }
        .status-failed { color: #dc3545; font-weight: bold; }
        .recommendations { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin-top: 20px; }
        .error-details { background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; padding: 10px; margin-top: 10px; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏁 DashRacing Platform</h1>
            <h2>Comprehensive Test Report</h2>
            <p>Generated: ${this.results.timestamp}</p>
        </div>
        
        <div class="summary">
            <div class="metric ${this.results.summary.passRate === 100 ? 'success' : 'warning'}">
                <h3>${this.results.summary.passRate}%</h3>
                <p>Pass Rate</p>
            </div>
            <div class="metric success">
                <h3>${this.results.summary.passed}</h3>
                <p>Tests Passed</p>
            </div>
            <div class="metric ${this.results.summary.failed > 0 ? 'danger' : 'success'}">
                <h3>${this.results.summary.failed}</h3>
                <p>Tests Failed</p>
            </div>
            <div class="metric">
                <h3>${this.results.summary.total}</h3>
                <p>Total Tests</p>
            </div>
        </div>
        
        ${this.results.testSuites.map(suite => `
            <div class="test-suite">
                <div class="suite-header">
                    ${suite.name} Tests (${suite.passed}/${suite.passed + suite.failed} passed)
                </div>
                <div class="suite-content">
                    ${suite.tests.map(test => `
                        <div class="test-item">
                            <span>${test.name}</span>
                            <span class="status-${test.status.toLowerCase()}">${test.status}</span>
                        </div>
                        ${test.error ? `<div class="error-details"><strong>Error:</strong> ${test.error}</div>` : ''}
                    `).join('')}
                </div>
            </div>
        `).join('')}
        
        ${this.results.recommendations.length > 0 ? `
            <div class="recommendations">
                <h3>🔧 Recommendations for 100% Functionality</h3>
                <ul>
                    ${this.results.recommendations.map(rec => `
                        <li><strong>[${rec.priority}]</strong> ${rec.action}<br>
                        <small>${rec.details}</small></li>
                    `).join('')}
                </ul>
            </div>
        ` : `
            <div class="recommendations" style="background: #d4edda; border-color: #c3e6cb;">
                <h3>🎉 Perfect Score Achieved!</h3>
                <p>All tests are passing - the DashRacing Platform is 100% functional!</p>
            </div>
        `}
    </div>
</body>
</html>`;
  }
}

// Execute if run directly
if (require.main === module) {
  const reporter = new EnhancedTestReporter();
  reporter.runComprehensiveTests().then(results => {
    console.log(`\n${reporter.colors.bold}Test execution completed!${reporter.colors.reset}`);
    process.exit(results.summary.failed > 0 ? 1 : 0);
  }).catch(error => {
    console.error(`${reporter.colors.red}Fatal error: ${error.message}${reporter.colors.reset}`);
    process.exit(1);
  });
}

module.exports = EnhancedTestReporter;