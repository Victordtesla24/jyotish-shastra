/**
 * Continuous Server Console Logs Monitoring Script
 * 
 * Monitors both Frontend (Port 3002) and Backend (Port 3001) server logs
 * for runtime errors, warnings, and exceptions.
 * 
 * Phase 5: Continuous Server Console Logs Monitoring & Runtime Error Fixing
 */

import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MONITORING_CONFIG = {
  frontend: {
    port: 3002,
    name: 'Frontend Server (Port 3002)',
    healthCheck: 'http://localhost:3002',
    logFile: path.join(__dirname, '..', 'logs', 'servers', 'frontend-console.log')
  },
  backend: {
    port: 3001,
    name: 'Backend Server (Port 3001)',
    healthCheck: 'http://localhost:3001/api/v1/health',
    logFile: path.join(__dirname, '..', 'logs', 'servers', 'back-end-server-logs.log')
  },
  monitoringInterval: 5000, // Check every 5 seconds
  errorKeywords: [
    'error',
    'Error',
    'ERROR',
    'exception',
    'Exception',
    'EXCEPTION',
    'failed',
    'Failed',
    'FAILED',
    'warning',
    'Warning',
    'WARNING',
    'critical',
    'Critical',
    'CRITICAL'
  ]
};

class ServerLogMonitor {
  constructor(config) {
    this.config = config;
    this.errors = [];
    this.warnings = [];
    this.lastCheckTime = Date.now();
    this.initializeLogFile();
  }

  initializeLogFile() {
    const logDir = path.dirname(this.config.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // Initialize log file with header
    const header = `\n=== Server Log Monitoring Started: ${new Date().toISOString()} ===\n`;
    if (!fs.existsSync(this.config.logFile)) {
      fs.writeFileSync(this.config.logFile, header, 'utf8');
    }
  }

  async checkServerHealth() {
    try {
      const response = await this.fetchWithTimeout(this.config.healthCheck, 3000);
      return {
        healthy: true,
        statusCode: response.statusCode || 200,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  fetchWithTimeout(url, timeout = 3000) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        timeout: timeout
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode, data });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  analyzeLogFile() {
    if (!fs.existsSync(this.config.logFile)) {
      return { errors: [], warnings: [], newEntries: [] };
    }

    const logContent = fs.readFileSync(this.config.logFile, 'utf8');
    const lines = logContent.split('\n');
    
    // Get lines added since last check
    const lastCheckTimestamp = this.lastCheckTime;
    const newEntries = [];
    const errors = [];
    const warnings = [];

    lines.forEach((line, index) => {
      // Check if line contains error keywords
      if (!line || typeof line !== 'string') {
        return;
      }
      const hasError = this.config.errorKeywords && this.config.errorKeywords.some(keyword => 
        line.includes(keyword)
      );

      if (hasError) {
        // Determine if it's an error or warning
        const isWarning = line.toLowerCase().includes('warning');
        const isError = line.toLowerCase().includes('error') || 
                       line.toLowerCase().includes('exception') ||
                       line.toLowerCase().includes('failed');

        if (isError && !isWarning) {
          errors.push({
            line: index + 1,
            content: line.trim(),
            timestamp: this.extractTimestamp(line) || new Date().toISOString()
          });
        } else if (isWarning) {
          warnings.push({
            line: index + 1,
            content: line.trim(),
            timestamp: this.extractTimestamp(line) || new Date().toISOString()
          });
        }
      }
    });

    this.lastCheckTime = Date.now();
    return { errors, warnings, newEntries };
  }

  extractTimestamp(line) {
    // Try to extract timestamp from log line
    const timestampRegex = /(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2})/;
    const match = line.match(timestampRegex);
    return match ? match[1] : null;
  }

  logMonitoringResult(health, logAnalysis) {
    const timestamp = new Date().toISOString();
    const logEntry = `\n[${timestamp}] ${this.config.name} Monitoring:\n`;
    const healthStatus = `  Health Status: ${health.healthy ? '✅ HEALTHY' : '❌ UNHEALTHY'}\n`;
    const errorCount = `  Errors Found: ${logAnalysis.errors.length}\n`;
    const warningCount = `  Warnings Found: ${logAnalysis.warnings.length}\n`;

    let errorsLog = '';
    if (logAnalysis.errors.length > 0) {
      errorsLog = '  ERRORS:\n';
      logAnalysis.errors.forEach((error, idx) => {
        errorsLog += `    [${idx + 1}] Line ${error.line}: ${error.content.substring(0, 100)}\n`;
      });
    }

    let warningsLog = '';
    if (logAnalysis.warnings.length > 0) {
      warningsLog = '  WARNINGS:\n';
      logAnalysis.warnings.forEach((warning, idx) => {
        warningsLog += `    [${idx + 1}] Line ${warning.line}: ${warning.content.substring(0, 100)}\n`;
      });
    }

    const fullLog = logEntry + healthStatus + errorCount + warningCount + errorsLog + warningsLog;
    console.log(fullLog);

    // Write to monitoring log file
    const monitoringLogFile = path.join(__dirname, '..', 'logs', 'servers', 'monitoring.log');
    fs.appendFileSync(monitoringLogFile, fullLog, 'utf8');

    return {
      timestamp,
      health,
      errors: logAnalysis.errors,
      warnings: logAnalysis.warnings
    };
  }

  async monitor() {
    const health = await this.checkServerHealth();
    const logAnalysis = this.analyzeLogFile();
    return this.logMonitoringResult(health, logAnalysis);
  }
}

class ComprehensiveMonitor {
  constructor() {
    this.frontendMonitor = new ServerLogMonitor(MONITORING_CONFIG.frontend);
    this.backendMonitor = new ServerLogMonitor(MONITORING_CONFIG.backend);
    this.isRunning = false;
    this.monitoringResults = [];
  }

  async start() {
    if (this.isRunning) {
      console.log('⚠️  Monitoring already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting Comprehensive Server Log Monitoring...\n');
    console.log(`📊 Monitoring Interval: ${MONITORING_CONFIG.monitoringInterval / 1000} seconds\n`);

    // Initial check
    await this.performCheck();

    // Set up interval
    this.intervalId = setInterval(async () => {
      await this.performCheck();
    }, MONITORING_CONFIG.monitoringInterval);
  }

  async stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    console.log('\n🛑 Server Log Monitoring Stopped');
  }

  async performCheck() {
    console.log('\n' + '='.repeat(80));
    console.log(`Monitoring Check: ${new Date().toISOString()}`);
    console.log('='.repeat(80));

    // Check Frontend
    console.log('\n📱 Frontend Server Monitoring:');
    const frontendResult = await this.frontendMonitor.monitor();
    this.monitoringResults.push({
      server: 'frontend',
      ...frontendResult
    });

    // Check Backend
    console.log('\n🔧 Backend Server Monitoring:');
    const backendResult = await this.backendMonitor.monitor();
    this.monitoringResults.push({
      server: 'backend',
      ...backendResult
    });

    // Summary
    const totalErrors = frontendResult.errors.length + backendResult.errors.length;
    const totalWarnings = frontendResult.warnings.length + backendResult.warnings.length;

    console.log('\n' + '-'.repeat(80));
    console.log('📊 SUMMARY:');
    console.log(`  Total Errors: ${totalErrors}`);
    console.log(`  Total Warnings: ${totalWarnings}`);
    console.log(`  Frontend Health: ${frontendResult.health.healthy ? '✅' : '❌'}`);
    console.log(`  Backend Health: ${backendResult.health.healthy ? '✅' : '❌'}`);
    console.log('-'.repeat(80));

    // Alert on errors
    if (totalErrors > 0) {
      console.log('\n⚠️  ERRORS DETECTED - Review logs for details');
    }
  }

  generateReport() {
    const reportFile = path.join(__dirname, '..', 'logs', 'servers', 'monitoring-report.json');
    const report = {
      generatedAt: new Date().toISOString(),
      totalChecks: this.monitoringResults.length,
      summary: {
        totalErrors: this.monitoringResults.reduce((sum, r) => sum + r.errors.length, 0),
        totalWarnings: this.monitoringResults.reduce((sum, r) => sum + r.warnings.length, 0),
        frontendUnhealthyCount: this.monitoringResults.filter(r => r.server === 'frontend' && !r.health.healthy).length,
        backendUnhealthyCount: this.monitoringResults.filter(r => r.server === 'backend' && !r.health.healthy).length
      },
      results: this.monitoringResults
    };

    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2), 'utf8');
    console.log(`\n📄 Monitoring report saved to: ${reportFile}`);
    return report;
  }
}

// Main execution
async function main() {
  const monitor = new ComprehensiveMonitor();

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\n🛑 Received SIGINT, stopping monitoring...');
    await monitor.stop();
    monitor.generateReport();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n\n🛑 Received SIGTERM, stopping monitoring...');
    await monitor.stop();
    monitor.generateReport();
    process.exit(0);
  });

  // Start monitoring
  await monitor.start();
}

// Run if executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule || process.argv[1] && process.argv[1].endsWith('monitor-server-logs.js')) {
  main().catch((error) => {
    console.error('❌ Monitoring Error:', error);
    process.exit(1);
  });
}

export { ComprehensiveMonitor, ServerLogMonitor };

