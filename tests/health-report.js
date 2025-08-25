#!/usr/bin/env node

/**
 * DASH Racing Platform - System Health Report
 * Quick overview of platform status and performance
 */

const axios = require('axios');
const WebSocket = require('ws');

const API_BASE = 'http://localhost:4000';
const WS_BASE = 'ws://localhost:3001';

console.log('📊 DASH Racing Platform - System Health Report\n');
console.log('═'.repeat(60));

async function generateHealthReport() {
  const report = {
    timestamp: new Date().toISOString(),
    serverStatus: 'unknown',
    websocketStatus: 'unknown',
    apiEndpoints: {
      health: false,
      auth: false,
      cars: false,
      ai: false,
      livemap: false,
      vehicles: false
    },
    performance: {
      responseTime: null,
      availability: null
    },
    recommendations: []
  };

  console.log('🔍 Checking Core Services...\n');

  // 1. Server Health Check
  try {
    const start = Date.now();
    const response = await axios.get(`${API_BASE}/health`, { timeout: 5000 });
    const responseTime = Date.now() - start;
    
    if (response.status === 200 && response.data.status === 'healthy') {
      report.serverStatus = 'healthy';
      report.performance.responseTime = responseTime;
      console.log(`✅ Backend Server: Healthy (${responseTime}ms)`);
    } else {
      report.serverStatus = 'unhealthy';
      console.log(`⚠️  Backend Server: Unhealthy`);
    }
  } catch (error) {
    report.serverStatus = 'offline';
    console.log(`❌ Backend Server: Offline - ${error.message}`);
    report.recommendations.push('Start the backend server');
  }

  // 2. WebSocket Check
  try {
    await new Promise((resolve, reject) => {
      const ws = new WebSocket(WS_BASE);
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('Connection timeout'));
      }, 3000);

      ws.on('open', () => {
        clearTimeout(timeout);
        ws.close();
        resolve();
      });

      ws.on('error', reject);
    });
    
    report.websocketStatus = 'online';
    console.log(`✅ WebSocket Server: Online`);
  } catch (error) {
    report.websocketStatus = 'offline';
    console.log(`❌ WebSocket Server: Offline - ${error.message}`);
    report.recommendations.push('Check WebSocket server configuration');
  }

  console.log('\n🔧 API Endpoint Status...\n');

  // 3. API Endpoints Check
  const endpoints = [
    { name: 'health', url: '/health', method: 'GET', authRequired: false },
    { name: 'vehicles', url: '/vehicles/search?make=Toyota', method: 'GET', authRequired: false },
    { name: 'auth', url: '/auth/login', method: 'POST', authRequired: false, expectStatus: 400 },
    { name: 'cars', url: '/cars', method: 'GET', authRequired: true, expectStatus: 401 },
    { name: 'ai', url: '/ai/analyze-performance', method: 'POST', authRequired: true, expectStatus: 400 },
    { name: 'livemap', url: '/livemap/nearby?lat=40&lon=-74', method: 'GET', authRequired: true, expectStatus: 401 }
  ];

  for (const endpoint of endpoints) {
    try {
      const config = { timeout: 3000 };
      let response;
      
      if (endpoint.method === 'GET') {
        response = await axios.get(`${API_BASE}${endpoint.url}`, config);
      } else {
        response = await axios.post(`${API_BASE}${endpoint.url}`, {}, config);
      }
      
      const expectedStatus = endpoint.expectStatus || 200;
      if (response.status === expectedStatus) {
        report.apiEndpoints[endpoint.name] = true;
        console.log(`✅ ${endpoint.name.toUpperCase()} API: Available`);
      } else {
        console.log(`⚠️  ${endpoint.name.toUpperCase()} API: Unexpected status ${response.status}`);
      }
    } catch (error) {
      const expectedStatus = endpoint.expectStatus || 200;
      if (error.response && error.response.status === expectedStatus) {
        report.apiEndpoints[endpoint.name] = true;
        console.log(`✅ ${endpoint.name.toUpperCase()} API: Available (${error.response.status})`);
      } else {
        console.log(`❌ ${endpoint.name.toUpperCase()} API: ${error.message}`);
        if (!endpoint.authRequired) {
          report.recommendations.push(`Fix ${endpoint.name} API endpoint`);
        }
      }
    }
  }

  // 4. Performance Assessment
  const availableEndpoints = Object.values(report.apiEndpoints).filter(Boolean).length;
  const totalEndpoints = Object.keys(report.apiEndpoints).length;
  report.performance.availability = ((availableEndpoints / totalEndpoints) * 100).toFixed(1);

  console.log('\n📈 Performance Metrics...\n');
  console.log(`🎯 API Availability: ${report.performance.availability}% (${availableEndpoints}/${totalEndpoints})`);
  if (report.performance.responseTime) {
    console.log(`⚡ Response Time: ${report.performance.responseTime}ms`);
    
    if (report.performance.responseTime < 100) {
      console.log(`🚀 Excellent response time!`);
    } else if (report.performance.responseTime < 300) {
      console.log(`👍 Good response time`);
    } else {
      console.log(`⚠️  Response time could be improved`);
      report.recommendations.push('Optimize server response time');
    }
  }

  // 5. Overall Status
  console.log('\n' + '═'.repeat(60));
  console.log('📋 OVERALL SYSTEM STATUS\n');
  
  let overallStatus = 'UNKNOWN';
  let statusIcon = '❓';
  
  if (report.serverStatus === 'healthy' && report.websocketStatus === 'online') {
    if (parseFloat(report.performance.availability) >= 80) {
      overallStatus = 'OPERATIONAL';
      statusIcon = '✅';
    } else {
      overallStatus = 'DEGRADED';
      statusIcon = '⚠️';
    }
  } else if (report.serverStatus === 'healthy' || report.websocketStatus === 'online') {
    overallStatus = 'PARTIAL OUTAGE';
    statusIcon = '🔶';
  } else {
    overallStatus = 'MAJOR OUTAGE';
    statusIcon = '❌';
  }

  console.log(`${statusIcon} Status: ${overallStatus}`);
  console.log(`🏆 Availability: ${report.performance.availability}%`);
  console.log(`🗓️  Last Check: ${new Date().toLocaleString()}`);

  // 6. Recommendations
  if (report.recommendations.length > 0) {
    console.log('\n🔧 Recommendations:\n');
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  } else {
    console.log('\n🎉 All systems are running optimally!');
  }

  // 7. Next Steps
  console.log('\n📋 Quick Actions:\n');
  
  if (overallStatus === 'OPERATIONAL') {
    console.log('✨ Ready for production deployment');
    console.log('🧪 Run comprehensive tests: `npm test`');
    console.log('🚀 Deploy to Azure: `azd up`');
  } else {
    console.log('🔧 Fix identified issues');
    console.log('🔄 Re-run health check');
    console.log('🧪 Run quick test: `node quick-test.js`');
  }

  console.log('\n' + '═'.repeat(60));
  
  return report;
}

// Run health report
generateHealthReport()
  .then(() => {
    console.log('\n📊 Health report completed successfully!');
  })
  .catch(error => {
    console.error('\n💥 Health report failed:', error.message);
    process.exit(1);
  });