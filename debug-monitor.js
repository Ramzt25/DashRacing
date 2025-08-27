#!/usr/bin/env node
/**
 * GridGhost Debug Monitor - Real-time Logging and Error Tracking
 * 
 * This script provides comprehensive monitoring capabilities:
 * - Real-time log streaming from backend
 * - Mobile app error collection
 * - API endpoint monitoring
 * - Performance metrics tracking
 * - Automated error documentation
 */

import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';
import axios from 'axios';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GridGhostDebugMonitor {
  constructor() {
    this.logFile = path.join(__dirname, 'debug-session.log');
    this.errorReportFile = path.join(__dirname, 'error-analysis.json');
    this.backendUrl = 'http://localhost:4000';
    this.isMonitoring = false;
    this.errors = [];
    this.metrics = {
      totalRequests: 0,
      errorRequests: 0,
      slowRequests: 0,
      averageResponseTime: 0,
      responseTimes: []
    };
    
    this.setupConsole();
    this.initializeLog();
  }

  setupConsole() {
    // Enhanced console output with colors
    this.colors = {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      white: '\x1b[37m'
    };
  }

  log(level, category, message, data = null) {
    const timestamp = new Date().toISOString();
    const colorCode = {
      DEBUG: this.colors.cyan,
      INFO: this.colors.green,
      WARN: this.colors.yellow,
      ERROR: this.colors.red,
      CRITICAL: this.colors.magenta
    }[level] || this.colors.white;

    const logEntry = `${timestamp} [${level}] ${category}: ${message}`;
    
    // Console output with colors
    console.log(`${colorCode}${logEntry}${this.colors.reset}`);
    
    if (data) {
      console.log(`${this.colors.white}  Data: ${JSON.stringify(data, null, 2)}${this.colors.reset}`);
    }

    // File output
    fs.appendFileSync(this.logFile, logEntry + (data ? `\n  Data: ${JSON.stringify(data, null, 2)}` : '') + '\n');

    // Store errors for analysis
    if (level === 'ERROR' || level === 'CRITICAL') {
      this.errors.push({
        timestamp,
        level,
        category,
        message,
        data
      });
    }
  }

  initializeLog() {
    const header = `
======================================================================
GRIDGHOST DEBUG MONITOR SESSION
======================================================================
Session Start: ${new Date().toISOString()}
Backend URL: ${this.backendUrl}
Log File: ${this.logFile}
======================================================================

`;
    fs.writeFileSync(this.logFile, header);
    this.log('INFO', 'MONITOR', 'Debug monitor initialized');
  }

  async startMonitoring() {
    if (this.isMonitoring) {
      this.log('WARN', 'MONITOR', 'Already monitoring');
      return;
    }

    this.isMonitoring = true;
    this.log('INFO', 'MONITOR', 'Starting comprehensive monitoring...');

    // Start different monitoring components
    await Promise.all([
      this.monitorBackendHealth(),
      this.monitorAPIEndpoints(),
      this.connectToLogStream(),
      this.startPerformanceMonitoring()
    ]);
  }

  async monitorBackendHealth() {
    this.log('INFO', 'HEALTH', 'Starting backend health monitoring');
    
    const checkHealth = async () => {
      try {
        const start = Date.now();
        const response = await axios.get(`${this.backendUrl}/health`, { timeout: 5000 });
        const duration = Date.now() - start;
        
        this.log('INFO', 'HEALTH', `Backend healthy (${duration}ms)`, {
          status: response.status,
          data: response.data,
          responseTime: duration
        });

        this.updateMetrics('health', duration);
        
      } catch (error) {
        this.log('ERROR', 'HEALTH', 'Backend health check failed', {
          error: error.message,
          code: error.code,
          status: error.response?.status
        });
      }
    };

    // Check immediately, then every 30 seconds
    checkHealth();
    setInterval(checkHealth, 30000);
  }

  async monitorAPIEndpoints() {
    this.log('INFO', 'API', 'Starting API endpoint monitoring');
    
    const endpoints = [
      { path: '/', method: 'GET', name: 'Root' },
      { path: '/health', method: 'GET', name: 'Health' },
      { path: '/admin/health', method: 'GET', name: 'Admin Health' }
    ];

    const testEndpoint = async (endpoint) => {
      try {
        const start = Date.now();
        const response = await axios({
          method: endpoint.method,
          url: `${this.backendUrl}${endpoint.path}`,
          timeout: 10000
        });
        const duration = Date.now() - start;

        this.log('INFO', 'API', `${endpoint.name} endpoint OK (${duration}ms)`, {
          path: endpoint.path,
          status: response.status,
          responseTime: duration
        });

        this.updateMetrics(endpoint.path, duration);

      } catch (error) {
        this.log('ERROR', 'API', `${endpoint.name} endpoint failed`, {
          path: endpoint.path,
          error: error.message,
          status: error.response?.status,
          code: error.code
        });
      }
    };

    // Test all endpoints every 60 seconds
    const testAllEndpoints = () => {
      endpoints.forEach(endpoint => testEndpoint(endpoint));
    };

    testAllEndpoints();
    setInterval(testAllEndpoints, 60000);
  }

  async connectToLogStream() {
    try {
      this.log('INFO', 'STREAM', 'Connecting to log stream...');
      
      // Note: This would connect to a WebSocket log stream if implemented
      // For now, we'll poll the recent logs endpoint
      
      const pollLogs = async () => {
        try {
          const response = await axios.get(`${this.backendUrl}/api/logs/recent`, {
            timeout: 5000
          });
          
          if (response.data.success && response.data.recentLogs) {
            response.data.recentLogs.forEach(logEntry => {
              this.log('INFO', 'BACKEND_LOG', logEntry.message, {
                level: logEntry.level,
                category: logEntry.category,
                context: logEntry.context
              });
            });
          }
        } catch (error) {
          if (error.response?.status !== 401) { // Ignore auth errors for polling
            this.log('ERROR', 'STREAM', 'Failed to poll backend logs', {
              error: error.message,
              status: error.response?.status
            });
          }
        }
      };

      // Poll every 10 seconds
      setInterval(pollLogs, 10000);
      
    } catch (error) {
      this.log('ERROR', 'STREAM', 'Failed to connect to log stream', {
        error: error.message
      });
    }
  }

  startPerformanceMonitoring() {
    this.log('INFO', 'PERFORMANCE', 'Starting performance monitoring');
    
    const logMetrics = () => {
      const avgResponseTime = this.metrics.responseTimes.length > 0 
        ? this.metrics.responseTimes.reduce((a, b) => a + b, 0) / this.metrics.responseTimes.length 
        : 0;

      this.log('INFO', 'METRICS', 'Performance summary', {
        totalRequests: this.metrics.totalRequests,
        errorRequests: this.metrics.errorRequests,
        slowRequests: this.metrics.slowRequests,
        averageResponseTime: Math.round(avgResponseTime),
        errorRate: this.metrics.totalRequests > 0 
          ? ((this.metrics.errorRequests / this.metrics.totalRequests) * 100).toFixed(1) + '%'
          : '0%'
      });

      // Reset metrics for next interval
      this.metrics.responseTimes = [];
    };

    // Log metrics every 2 minutes
    setInterval(logMetrics, 120000);
  }

  updateMetrics(endpoint, responseTime) {
    this.metrics.totalRequests++;
    this.metrics.responseTimes.push(responseTime);
    
    if (responseTime > 1000) {
      this.metrics.slowRequests++;
    }
  }

  async generateErrorReport() {
    this.log('INFO', 'REPORT', 'Generating comprehensive error report...');
    
    const report = {
      sessionInfo: {
        startTime: new Date().toISOString(),
        duration: 'Active session',
        backendUrl: this.backendUrl,
        logFile: this.logFile
      },
      summary: {
        totalErrors: this.errors.length,
        criticalErrors: this.errors.filter(e => e.level === 'CRITICAL').length,
        errorsByCategory: this.groupErrorsByCategory(),
        mostFrequentErrors: this.getMostFrequentErrors()
      },
      errors: this.errors.slice(-50), // Last 50 errors
      metrics: this.metrics,
      recommendations: this.generateRecommendations()
    };

    fs.writeFileSync(this.errorReportFile, JSON.stringify(report, null, 2));
    
    this.log('INFO', 'REPORT', `Error report generated: ${this.errorReportFile}`);
    return report;
  }

  groupErrorsByCategory() {
    const grouped = {};
    this.errors.forEach(error => {
      grouped[error.category] = (grouped[error.category] || 0) + 1;
    });
    return grouped;
  }

  getMostFrequentErrors() {
    const errorCounts = {};
    this.errors.forEach(error => {
      const key = `${error.category}: ${error.message}`;
      errorCounts[key] = (errorCounts[key] || 0) + 1;
    });
    
    return Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([error, count]) => ({ error, count }));
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Check error rate
    if (this.metrics.totalRequests > 0) {
      const errorRate = (this.metrics.errorRequests / this.metrics.totalRequests) * 100;
      if (errorRate > 10) {
        recommendations.push({
          type: 'HIGH_ERROR_RATE',
          message: `Error rate is ${errorRate.toFixed(1)}% - investigate failed requests`,
          priority: 'HIGH'
        });
      }
    }

    // Check response times
    if (this.metrics.slowRequests > 0) {
      recommendations.push({
        type: 'SLOW_RESPONSES',
        message: `${this.metrics.slowRequests} slow requests detected - optimize performance`,
        priority: 'MEDIUM'
      });
    }

    // Check error patterns
    const errorsByCategory = this.groupErrorsByCategory();
    Object.entries(errorsByCategory).forEach(([category, count]) => {
      if (count > 5) {
        recommendations.push({
          type: 'RECURRING_ERROR',
          message: `Multiple errors in ${category} (${count} occurrences) - needs investigation`,
          priority: 'HIGH'
        });
      }
    });

    return recommendations;
  }

  displayRealTimeStats() {
    // Clear screen and show live stats
    process.stdout.write('\x1Bc'); // Clear screen
    
    console.log(`${this.colors.bright}${this.colors.cyan}
╔════════════════════════════════════════════════════════════════════╗
║                    GRIDGHOST DEBUG MONITOR                        ║
╚════════════════════════════════════════════════════════════════════╝${this.colors.reset}

${this.colors.green}📊 Real-time Stats:${this.colors.reset}
  • Total Requests: ${this.metrics.totalRequests}
  • Error Requests: ${this.metrics.errorRequests}
  • Slow Requests: ${this.metrics.slowRequests}
  • Total Errors Logged: ${this.errors.length}

${this.colors.yellow}⚡ Recent Activity:${this.colors.reset}
  • Last 5 errors: ${this.errors.slice(-5).map(e => `${e.category}: ${e.message}`).join('\n    ')}

${this.colors.blue}🎯 Quick Actions:${this.colors.reset}
  • Press 'r' for error report
  • Press 'c' to clear logs  
  • Press 'q' to quit
  • Press 's' to show settings

${this.colors.cyan}📁 Files:${this.colors.reset}
  • Logs: ${this.logFile}
  • Error Report: ${this.errorReportFile}
`);
  }

  setupInteractiveMode() {
    // Setup keyboard input for interactive commands
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', async (key) => {
      switch (key.toLowerCase()) {
        case 'r':
          await this.generateErrorReport();
          break;
        case 'c':
          this.errors = [];
          this.metrics = {
            totalRequests: 0,
            errorRequests: 0,
            slowRequests: 0,
            averageResponseTime: 0,
            responseTimes: []
          };
          this.log('INFO', 'MONITOR', 'Stats cleared');
          break;
        case 'q':
        case '\u0003': // Ctrl+C
          this.log('INFO', 'MONITOR', 'Shutting down monitor...');
          await this.generateErrorReport();
          process.exit(0);
          break;
        case 's':
          this.showSettings();
          break;
      }
    });

    // Update display every 5 seconds
    setInterval(() => {
      this.displayRealTimeStats();
    }, 5000);
  }

  showSettings() {
    console.log(`${this.colors.cyan}
⚙️  GridGhost Debug Monitor Settings:
────────────────────────────────────
Backend URL: ${this.backendUrl}
Log File: ${this.logFile}
Error Report: ${this.errorReportFile}
Health Check Interval: 30s
API Check Interval: 60s
Metrics Report Interval: 2m
${this.colors.reset}`);
  }

  stopMonitoring() {
    this.isMonitoring = false;
    this.log('INFO', 'MONITOR', 'Monitoring stopped');
  }
}

// CLI Usage
async function main() {
  const monitor = new GridGhostDebugMonitor();
  
  console.log(`${monitor.colors.green}🚀 Starting GridGhost Debug Monitor...${monitor.colors.reset}`);
  
  // Start monitoring
  await monitor.startMonitoring();
  
  // Start interactive mode
  monitor.setupInteractiveMode();
  monitor.displayRealTimeStats();
  
  // Graceful shutdown
  process.on('SIGINT', async () => {
    await monitor.generateErrorReport();
    process.exit(0);
  });
}

// Run if called directly
const currentModuleUrl = import.meta.url;
const currentFilePath = fileURLToPath(currentModuleUrl);
if (process.argv[1] === currentFilePath) {
  main().catch(error => {
    console.error('💥 Monitor failed to start:', error);
    process.exit(1);
  });
}

export default GridGhostDebugMonitor;