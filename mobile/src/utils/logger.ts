/**
 * Mobile Logger for GridGhost React Native App
 * Handles mobile-specific logging, error tracking, and crash reporting
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MobileLogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  category: string;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  screen?: string;
  action?: string;
  deviceInfo?: {
    platform: string;
    version: string;
    model?: string;
  };
  stackTrace?: string;
  crashData?: any;
}

export interface MobileErrorReport {
  sessionId: string;
  timestamp: string;
  device: any;
  app: {
    version: string;
    buildNumber: string;
  };
  errors: MobileLogEntry[];
  userActions: MobileLogEntry[];
  performance: {
    memoryUsage?: any;
    renderTime?: number;
  };
}

class MobileLogger {
  private sessionId: string;
  private logs: MobileLogEntry[] = [];
  private maxLogs = 1000;
  private userId?: string;
  private currentScreen?: string;
  private serverEndpoint = 'http://localhost:3000/api/logs';

  constructor() {
    this.sessionId = `mobile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.initializeSession();
  }

  private async initializeSession() {
    try {
      // Load any existing logs from storage
      const existingLogs = await AsyncStorage.getItem('gridghost_logs');
      if (existingLogs) {
        this.logs = JSON.parse(existingLogs).slice(-500); // Keep last 500 logs
      }

      // Log session start
      this.info('SESSION', 'Mobile app session started', {
        sessionId: this.sessionId,
        timestamp: new Date().toISOString()
      });

      // Set up error handling
      this.setupGlobalErrorHandling();
      
    } catch (error) {
      console.error('Failed to initialize mobile logger:', error);
    }
  }

  private setupGlobalErrorHandling() {
    // Handle unhandled promise rejections
    const globalAny = global as any;
    const originalHandler = globalAny.onunhandledrejection;
    globalAny.onunhandledrejection = (event: any) => {
      this.critical('UNHANDLED_REJECTION', 'Unhandled promise rejection', {
        reason: event?.reason,
        promise: event?.promise?.toString()
      });
      
      if (originalHandler) {
        originalHandler(event);
      }
    };

    // Handle React Native errors
    try {
      const ErrorUtils = require('ErrorUtils');
      ErrorUtils.setGlobalHandler((error: Error, isFatal: boolean) => {
        this.critical('GLOBAL_ERROR', `Global error (Fatal: ${isFatal})`, {
          error: error.message,
          stack: error.stack,
          isFatal
        });
        
        // Send error to backend immediately for critical errors
        if (isFatal) {
          this.sendLogsToServer();
        }
      });
    } catch (e) {
      console.warn('Could not setup global error handler:', e);
    }
  }

  private async persistLogs() {
    try {
      // Keep only recent logs to prevent storage overflow
      const recentLogs = this.logs.slice(-this.maxLogs);
      await AsyncStorage.setItem('gridghost_logs', JSON.stringify(recentLogs));
    } catch (error) {
      console.error('Failed to persist logs:', error);
    }
  }

  private formatLogEntry(entry: MobileLogEntry): string {
    const timestamp = entry.timestamp;
    const level = entry.level.toUpperCase().padEnd(8);
    const category = entry.category.padEnd(15);
    
    let formatted = `${timestamp} ${level} [MOBILE] ${category} ${entry.message}`;
    
    if (entry.userId) {
      formatted += ` | User: ${entry.userId}`;
    }
    
    if (entry.screen) {
      formatted += ` | Screen: ${entry.screen}`;
    }
    
    if (entry.action) {
      formatted += ` | Action: ${entry.action}`;
    }
    
    return formatted;
  }

  // Set current context
  setUserId(userId: string) {
    this.userId = userId;
    this.info('AUTH', 'User context updated', { userId });
  }

  setCurrentScreen(screenName: string) {
    this.currentScreen = screenName;
    this.debug('NAVIGATION', 'Screen changed', { screen: screenName });
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
    this.log('error', category, message, {
      ...context,
      error: error?.message,
      stack: error?.stack
    });
  }

  critical(category: string, message: string, context?: Record<string, any>) {
    this.log('critical', category, message, context);
    // Immediately try to send critical errors to server
    this.sendLogsToServer();
  }

  // Specific mobile logging methods
  logUserAction(action: string, details?: Record<string, any>) {
    this.log('info', 'USER_ACTION', action, {
      ...details,
      screen: this.currentScreen,
      userId: this.userId
    });
  }

  logAPICall(method: string, endpoint: string, statusCode?: number, duration?: number, error?: any) {
    const level = error ? 'error' : 'info';
    this.log(level, 'API_CALL', `${method} ${endpoint}`, {
      method,
      endpoint,
      statusCode,
      duration,
      error: error?.message,
      userId: this.userId
    });
  }

  logNavigation(from: string, to: string, params?: any) {
    this.log('info', 'NAVIGATION', `${from} -> ${to}`, {
      from,
      to,
      params,
      userId: this.userId
    });
  }

  logPerformance(metric: string, value: number, context?: Record<string, any>) {
    this.log('info', 'PERFORMANCE', `${metric}: ${value}`, {
      ...context,
      metric,
      value,
      screen: this.currentScreen
    });
  }

  logAuthEvent(event: 'login' | 'logout' | 'register' | 'refresh', result: 'success' | 'failure', details?: Record<string, any>) {
    this.log(result === 'success' ? 'info' : 'error', 'AUTH', `${event} ${result}`, {
      ...details,
      event,
      result,
      userId: this.userId
    });
  }

  private log(
    level: MobileLogEntry['level'],
    category: string,
    message: string,
    context?: Record<string, any>
  ) {
    const entry: MobileLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      context,
      userId: this.userId,
      screen: this.currentScreen,
      deviceInfo: {
        platform: 'react-native',
        version: '0.79.5'
      }
    };

    // Add to logs array
    this.logs.push(entry);

    // Console output for development
    if (__DEV__) {
      const colors = {
        debug: '',
        info: '🟢',
        warn: '🟡',
        error: '🔴',
        critical: '🟣'
      };
      
      console.log(`${colors[level]} ${this.formatLogEntry(entry)}`);
      
      if (context && Object.keys(context).length > 0) {
        console.log('   Context:', context);
      }
    }

    // Persist logs periodically
    if (this.logs.length % 10 === 0) {
      this.persistLogs();
    }

    // Send to server for high-priority logs
    if (level === 'error' || level === 'critical') {
      this.sendLogsToServer(true); // Send immediately for errors
    }
  }

  // Send logs to backend server
  async sendLogsToServer(immediate = false) {
    try {
      // In immediate mode, send recent logs only
      const logsToSend = immediate ? this.logs.slice(-50) : this.logs;
      
      if (logsToSend.length === 0) return;

      const response = await fetch(this.serverEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth header if user is logged in
          ...(this.userId && { 'Authorization': `Bearer ${await this.getAuthToken()}` })
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          platform: 'mobile',
          logs: logsToSend,
          deviceInfo: await this.getDeviceInfo()
        })
      });

      if (response.ok) {
        this.debug('LOGGING', `Sent ${logsToSend.length} logs to server`);
        
        // Clear sent logs if not immediate mode
        if (!immediate) {
          this.logs = [];
          await AsyncStorage.removeItem('gridghost_logs');
        }
      } else {
        this.warn('LOGGING', 'Failed to send logs to server', {
          status: response.status,
          statusText: response.statusText
        });
      }
    } catch (error) {
      // Don't log this error to avoid infinite loops
      console.warn('Failed to send logs to server:', error);
    }
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch {
      return null;
    }
  }

  private async getDeviceInfo() {
    try {
      // You might want to use react-native-device-info for more detailed info
      return {
        platform: 'react-native',
        version: '0.79.5',
        // Add more device info as needed
      };
    } catch {
      return {};
    }
  }

  // Get recent logs for debugging
  getRecentLogs(count = 100): MobileLogEntry[] {
    return this.logs.slice(-count);
  }

  // Get error logs only
  getErrorLogs(): MobileLogEntry[] {
    return this.logs.filter(log => log.level === 'error' || log.level === 'critical');
  }

  // Clear all logs
  async clearLogs() {
    this.logs = [];
    await AsyncStorage.removeItem('gridghost_logs');
    this.info('LOGGING', 'Logs cleared');
  }

  // Generate error report
  async generateErrorReport(): Promise<MobileErrorReport> {
    return {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      device: await this.getDeviceInfo(),
      app: {
        version: '1.0.0', // Get from app config
        buildNumber: '1'   // Get from app config
      },
      errors: this.getErrorLogs(),
      userActions: this.logs.filter(log => log.category === 'USER_ACTION'),
      performance: {
        // Add performance metrics as needed
      }
    };
  }

  // Export logs as text for sharing
  exportLogs(): string {
    return this.logs
      .map(entry => this.formatLogEntry(entry))
      .join('\n');
  }
}

// Create singleton instance
export const mobileLogger = new MobileLogger();

export default mobileLogger;