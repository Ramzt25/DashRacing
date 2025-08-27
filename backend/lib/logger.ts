/**
 * Comprehensive Logging System for GridGhost/DashRacing
 * Provides centralized error tracking, action logging, and debugging capabilities
 */
import { writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  category: string;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  requestId?: string;
  stackTrace?: string;
  platform?: 'backend' | 'mobile' | 'admin' | 'test';
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface ErrorAnalysis {
  type: string;
  category: 'Authentication' | 'Database' | 'Network' | 'Validation' | 'Logic' | 'Infrastructure' | 'Performance' | 'Security';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  possibleCauses: string[];
  suggestedFixes: string[];
  frequency: number;
  firstSeen: string;
  lastSeen: string;
  affectedUsers: string[];
  relatedErrors: string[];
}

class GridGhostLogger {
  private logDir: string;
  private errorStats: Map<string, ErrorAnalysis> = new Map();
  private sessionId: string;
  private logBuffer: LogEntry[] = [];
  private bufferSize = 100;

  constructor() {
    this.logDir = join(process.cwd(), 'logs');
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Ensure logs directory exists
    if (!existsSync(this.logDir)) {
      mkdirSync(this.logDir, { recursive: true });
    }

    // Initialize session log
    this.initializeSession();
  }

  private initializeSession() {
    const sessionInfo = {
      sessionId: this.sessionId,
      startTime: new Date().toISOString(),
      platform: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      environment: {
        SUPABASE_URL: process.env.SUPABASE_URL ? 'Set' : 'Missing',
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'Set' : 'Missing',
        DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Missing',
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Set' : 'Missing'
      }
    };

    this.writeToFile('session.log', `\n--- NEW SESSION STARTED ---\n${JSON.stringify(sessionInfo, null, 2)}\n`);
  }

  private writeToFile(filename: string, content: string) {
    const filepath = join(this.logDir, filename);
    try {
      appendFileSync(filepath, content);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  private analyzeError(error: Error | any): ErrorAnalysis {
    const errorKey = error.message || error.toString();
    const existing = this.errorStats.get(errorKey);
    
    if (existing) {
      existing.frequency++;
      existing.lastSeen = new Date().toISOString();
      return existing;
    }

    // Analyze error type and create new analysis
    const analysis: ErrorAnalysis = {
      type: 'Unknown Error',
      category: 'Logic',
      severity: 'Medium',
      possibleCauses: [],
      suggestedFixes: [],
      frequency: 1,
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      affectedUsers: [],
      relatedErrors: []
    };

    const errorMessage = errorKey.toLowerCase();

    // Authentication errors
    if (errorMessage.includes('unauthorized') || errorMessage.includes('401') || errorMessage.includes('token')) {
      analysis.type = 'Authentication Error';
      analysis.category = 'Authentication';
      analysis.severity = 'High';
      analysis.possibleCauses = ['Invalid credentials', 'Expired token', 'Missing auth headers'];
      analysis.suggestedFixes = ['Refresh authentication', 'Check token validity', 'Verify auth flow'];
    }
    
    // Database errors
    else if (errorMessage.includes('database') || errorMessage.includes('prisma') || errorMessage.includes('sql')) {
      analysis.type = 'Database Error';
      analysis.category = 'Database';
      analysis.severity = 'Critical';
      analysis.possibleCauses = ['Database connection lost', 'Query timeout', 'Schema mismatch', 'Migration needed'];
      analysis.suggestedFixes = ['Check database connection', 'Run migrations', 'Verify query syntax', 'Check database status'];
    }
    
    // Network errors
    else if (errorMessage.includes('econnrefused') || errorMessage.includes('timeout') || errorMessage.includes('network')) {
      analysis.type = 'Network Error';
      analysis.category = 'Network';
      analysis.severity = 'High';
      analysis.possibleCauses = ['Service unavailable', 'Network connectivity', 'Firewall blocking', 'DNS issues'];
      analysis.suggestedFixes = ['Check service status', 'Verify network connection', 'Test connectivity', 'Check firewall rules'];
    }
    
    // Validation errors
    else if (errorMessage.includes('validation') || errorMessage.includes('invalid') || errorMessage.includes('required')) {
      analysis.type = 'Validation Error';
      analysis.category = 'Validation';
      analysis.severity = 'Medium';
      analysis.possibleCauses = ['Missing required fields', 'Invalid data format', 'Business rule violation'];
      analysis.suggestedFixes = ['Check input validation', 'Verify data format', 'Review business rules'];
    }

    // React Native specific errors
    else if (errorMessage.includes('metro') || errorMessage.includes('react-native') || errorMessage.includes('android')) {
      analysis.type = 'Mobile Platform Error';
      analysis.category = 'Infrastructure';
      analysis.severity = 'High';
      analysis.possibleCauses = ['Build configuration', 'Platform compatibility', 'Missing dependencies'];
      analysis.suggestedFixes = ['Check build configuration', 'Verify platform setup', 'Install missing dependencies'];
    }

    this.errorStats.set(errorKey, analysis);
    return analysis;
  }

  private formatLogEntry(entry: LogEntry): string {
    const timestamp = entry.timestamp;
    const level = entry.level.toUpperCase().padEnd(8);
    const category = entry.category.padEnd(15);
    const platform = entry.platform ? `[${entry.platform.toUpperCase()}]`.padEnd(10) : ''.padEnd(10);
    
    let formatted = `${timestamp} ${level} ${platform} ${category} ${entry.message}`;
    
    if (entry.userId) {
      formatted += ` | User: ${entry.userId}`;
    }
    
    if (entry.requestId) {
      formatted += ` | Req: ${entry.requestId}`;
    }
    
    if (entry.component) {
      formatted += ` | Component: ${entry.component}`;
    }
    
    if (entry.action) {
      formatted += ` | Action: ${entry.action}`;
    }
    
    if (entry.context && Object.keys(entry.context).length > 0) {
      formatted += `\n    Context: ${JSON.stringify(entry.context, null, 2)}`;
    }
    
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      formatted += `\n    Metadata: ${JSON.stringify(entry.metadata, null, 2)}`;
    }
    
    if (entry.stackTrace) {
      formatted += `\n    Stack: ${entry.stackTrace}`;
    }
    
    return formatted + '\n';
  }

  // Main logging methods
  debug(category: string, message: string, context?: Record<string, any>) {
    this.log('debug', category, message, context);
  }

  info(category: string, message: string, context?: Record<string, any>) {
    this.log('info', category, message, context);
  }

  warn(category: string, message: string, context?: Record<string, any>) {
    this.log('warn', category, message, context);
  }

  error(category: string, message: string, error?: Error | any, context?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      category,
      message,
      context,
      stackTrace: error?.stack,
      platform: 'backend'
    };

    if (error) {
      const analysis = this.analyzeError(error);
      entry.metadata = { errorAnalysis: analysis };
    }

    this.log('error', category, message, context, entry);
  }

  critical(category: string, message: string, error?: Error | any, context?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'critical',
      category,
      message,
      context,
      stackTrace: error?.stack,
      platform: 'backend'
    };

    if (error) {
      const analysis = this.analyzeError(error);
      entry.metadata = { errorAnalysis: analysis };
    }

    this.log('critical', category, message, context, entry);
  }

  // Action logging for user activities
  logAction(
    userId: string, 
    action: string, 
    component: string, 
    details?: Record<string, any>,
    requestId?: string
  ) {
    this.log('info', 'USER_ACTION', `${action} in ${component}`, details, {
      timestamp: new Date().toISOString(),
      level: 'info',
      category: 'USER_ACTION',
      message: `${action} in ${component}`,
      context: details,
      userId,
      requestId: requestId || this.generateRequestId(),
      platform: 'backend',
      component,
      action
    });
  }

  // Request logging for API calls
  logRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    userId?: string,
    requestId?: string
  ) {
    this.log('info', 'HTTP_REQUEST', `${method} ${url} - ${statusCode} (${duration}ms)`, {
      method,
      url,
      statusCode,
      duration,
      userId
    }, {
      timestamp: new Date().toISOString(),
      level: 'info',
      category: 'HTTP_REQUEST',
      message: `${method} ${url} - ${statusCode} (${duration}ms)`,
      userId,
      requestId: requestId || this.generateRequestId(),
      platform: 'backend',
      metadata: { method, url, statusCode, duration }
    });
  }

  private log(
    level: LogEntry['level'], 
    category: string, 
    message: string, 
    context?: Record<string, any>,
    entry?: LogEntry
  ) {
    const logEntry: LogEntry = entry || {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      context,
      platform: 'backend'
    };

    // Add to buffer
    this.logBuffer.push(logEntry);

    // Console output with colors
    const colors = {
      debug: '\x1b[36m',   // cyan
      info: '\x1b[32m',    // green
      warn: '\x1b[33m',    // yellow
      error: '\x1b[31m',   // red
      critical: '\x1b[35m', // magenta
      reset: '\x1b[0m'
    };

    console.log(`${colors[level]}${this.formatLogEntry(logEntry)}${colors.reset}`);

    // Write to appropriate log files
    this.writeToFile('all.log', this.formatLogEntry(logEntry));
    
    if (level === 'error' || level === 'critical') {
      this.writeToFile('errors.log', this.formatLogEntry(logEntry));
    }

    // Flush buffer if needed
    if (this.logBuffer.length >= this.bufferSize) {
      this.flushBuffer();
    }
  }

  private flushBuffer() {
    if (this.logBuffer.length === 0) return;

    const bufferContent = this.logBuffer.map(entry => this.formatLogEntry(entry)).join('');
    this.writeToFile('buffer.log', bufferContent);
    this.logBuffer = [];
  }

  // Generate error reports
  generateErrorReport(): string {
    const report = {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      errorSummary: {
        totalErrors: Array.from(this.errorStats.values()).reduce((sum, error) => sum + error.frequency, 0),
        uniqueErrors: this.errorStats.size,
        criticalErrors: Array.from(this.errorStats.values()).filter(e => e.severity === 'Critical').length,
        highSeverityErrors: Array.from(this.errorStats.values()).filter(e => e.severity === 'High').length
      },
      topErrors: Array.from(this.errorStats.entries())
        .sort(([,a], [,b]) => b.frequency - a.frequency)
        .slice(0, 10)
        .map(([message, analysis]) => ({ message, ...analysis })),
      errorsByCategory: this.groupErrorsByCategory()
    };

    const reportContent = JSON.stringify(report, null, 2);
    this.writeToFile(`error-report-${Date.now()}.json`, reportContent);
    
    return reportContent;
  }

  private groupErrorsByCategory() {
    const grouped: Record<string, number> = {};
    for (const analysis of this.errorStats.values()) {
      grouped[analysis.category] = (grouped[analysis.category] || 0) + analysis.frequency;
    }
    return grouped;
  }

  // Get real-time stats
  getStats() {
    return {
      sessionId: this.sessionId,
      bufferSize: this.logBuffer.length,
      totalErrors: Array.from(this.errorStats.values()).reduce((sum, error) => sum + error.frequency, 0),
      uniqueErrors: this.errorStats.size,
      recentEntries: this.logBuffer.slice(-10)
    };
  }

  // Clean shutdown
  shutdown() {
    this.flushBuffer();
    this.generateErrorReport();
    this.info('SYSTEM', 'Logger shutdown complete');
  }
}

// Create singleton instance
export const logger = new GridGhostLogger();

// Graceful shutdown handling
process.on('SIGINT', () => {
  logger.shutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.shutdown();
  process.exit(0);
});

export default logger;