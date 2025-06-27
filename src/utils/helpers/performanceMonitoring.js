/**
 * Production Performance Monitoring System
 * Comprehensive monitoring for Vedic Astrology API performance metrics
 *
 * Features:
 * - Response time tracking
 * - Error rate monitoring
 * - Swiss Ephemeris performance
 * - Concurrent request handling
 * - Memory and resource usage
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        validation_errors: 0,
        system_errors: 0
      },
      responseTimes: {
        chartGeneration: [],
        comprehensiveAnalysis: [],
        dashaAnalysis: [],
        navamsaAnalysis: [],
        houseAnalysis: [],
        validation: []
      },
      swissEphemeris: {
        successes: 0,
        failures: 0,
        fallbackToMoshier: 0,
        averageCalculationTime: 0
      },
      resources: {
        memoryUsage: [],
        cpuUsage: [],
        activeConnections: 0
      },
      errors: {
        validation: [],
        system: [],
        ephemeris: []
      }
    };

    this.thresholds = {
      responseTime: {
        chartGeneration: 5000, // 5 seconds
        analysisEndpoints: 10000, // 10 seconds
        validationOnly: 1000 // 1 second
      },
      errorRate: {
        maxSystemErrorRate: 0.01, // 1%
        maxEphemerisFailureRate: 0.05 // 5%
      },
      concurrency: {
        maxConcurrentRequests: 50,
        warningThreshold: 40
      }
    };

    this.startTime = Date.now();
    this.isProduction = process.env.NODE_ENV === 'production';

    // Start resource monitoring if in production
    if (this.isProduction) {
      this.startResourceMonitoring();
    }
  }

  /**
   * Track API request start
   */
  startRequest(endpoint, method = 'POST') {
    this.metrics.requests.total++;
    this.metrics.resources.activeConnections++;

    return {
      startTime: Date.now(),
      endpoint,
      method,
      requestId: this.generateRequestId()
    };
  }

  /**
   * Track API request completion
   */
  endRequest(requestInfo, status, error = null) {
    const duration = Date.now() - requestInfo.startTime;
    const { endpoint } = requestInfo;

    // Update connection count
    this.metrics.resources.activeConnections = Math.max(0, this.metrics.resources.activeConnections - 1);

    // Track success/failure
    if (status >= 200 && status < 300) {
      this.metrics.requests.successful++;
    } else if (status >= 400 && status < 500) {
      this.metrics.requests.validation_errors++;
      if (error) {
        this.metrics.errors.validation.push({
          timestamp: Date.now(),
          endpoint,
          error: error.message || error,
          status
        });
      }
    } else {
      this.metrics.requests.failed++;
      this.metrics.requests.system_errors++;
      if (error) {
        this.metrics.errors.system.push({
          timestamp: Date.now(),
          endpoint,
          error: error.message || error,
          status
        });
      }
    }

    // Track response times by endpoint type
    const endpointType = this.categorizeEndpoint(endpoint);
    if (this.metrics.responseTimes[endpointType]) {
      this.metrics.responseTimes[endpointType].push(duration);

      // Keep only last 100 measurements for memory efficiency
      if (this.metrics.responseTimes[endpointType].length > 100) {
        this.metrics.responseTimes[endpointType] = this.metrics.responseTimes[endpointType].slice(-100);
      }
    }

    // Check thresholds and alert if necessary
    this.checkThresholds(endpoint, duration, status);

    return {
      duration,
      status,
      endpoint,
      timestamp: Date.now()
    };
  }

  /**
   * Track Swiss Ephemeris calculation performance
   */
  trackSwissEphemeris(success, calculationTime, fallbackUsed = false) {
    const startTime = Date.now();

    if (success) {
      this.metrics.swissEphemeris.successes++;
    } else {
      this.metrics.swissEphemeris.failures++;
      this.metrics.errors.ephemeris.push({
        timestamp: startTime,
        calculationTime,
        fallbackUsed
      });
    }

    if (fallbackUsed) {
      this.metrics.swissEphemeris.fallbackToMoshier++;
    }

    // Update average calculation time
    const totalCalculations = this.metrics.swissEphemeris.successes + this.metrics.swissEphemeris.failures;
    if (totalCalculations > 0) {
      this.metrics.swissEphemeris.averageCalculationTime =
        ((this.metrics.swissEphemeris.averageCalculationTime * (totalCalculations - 1)) + calculationTime) / totalCalculations;
    }

    return {
      calculationTime,
      success,
      fallbackUsed,
      timestamp: startTime
    };
  }

  /**
   * Get comprehensive performance report
   */
  getPerformanceReport() {
    const uptime = Date.now() - this.startTime;
    const totalRequests = this.metrics.requests.total;

    const report = {
      timestamp: Date.now(),
      uptime: uptime,
      uptimeFormatted: this.formatDuration(uptime),
      requests: {
        total: totalRequests,
        successful: this.metrics.requests.successful,
        failed: this.metrics.requests.failed,
        validationErrors: this.metrics.requests.validation_errors,
        systemErrors: this.metrics.requests.system_errors,
        successRate: totalRequests > 0 ? (this.metrics.requests.successful / totalRequests) * 100 : 0,
        errorRate: totalRequests > 0 ? (this.metrics.requests.system_errors / totalRequests) * 100 : 0
      },
      responseTimes: this.calculateResponseTimeStats(),
      swissEphemeris: {
        ...this.metrics.swissEphemeris,
        successRate: this.calculateEphemerisSuccessRate(),
        fallbackRate: this.calculateEphemerisFallbackRate()
      },
      resources: {
        activeConnections: this.metrics.resources.activeConnections,
        averageMemoryUsage: this.calculateAverageMemoryUsage(),
        peakMemoryUsage: this.getPeakMemoryUsage(),
        currentMemoryUsage: this.getCurrentMemoryUsage()
      },
      alerts: this.generateAlerts(),
      health: this.calculateHealthStatus()
    };

    return report;
  }

  /**
   * Generate health alerts based on thresholds
   */
  generateAlerts() {
    const alerts = [];
    const report = this.getPerformanceReport();

    // Check error rate
    if (report.requests.errorRate > this.thresholds.errorRate.maxSystemErrorRate * 100) {
      alerts.push({
        level: 'CRITICAL',
        type: 'HIGH_ERROR_RATE',
        message: `System error rate (${report.requests.errorRate.toFixed(2)}%) exceeds threshold (${this.thresholds.errorRate.maxSystemErrorRate * 100}%)`,
        timestamp: Date.now()
      });
    }

    // Check ephemeris failure rate
    if (report.swissEphemeris.fallbackRate > this.thresholds.errorRate.maxEphemerisFailureRate * 100) {
      alerts.push({
        level: 'WARNING',
        type: 'HIGH_EPHEMERIS_FALLBACK',
        message: `Swiss Ephemeris fallback rate (${report.swissEphemeris.fallbackRate.toFixed(2)}%) exceeds threshold (${this.thresholds.errorRate.maxEphemerisFailureRate * 100}%)`,
        timestamp: Date.now()
      });
    }

    // Check concurrent connections
    if (this.metrics.resources.activeConnections > this.thresholds.concurrency.warningThreshold) {
      alerts.push({
        level: 'WARNING',
        type: 'HIGH_CONCURRENCY',
        message: `Active connections (${this.metrics.resources.activeConnections}) approaching limit (${this.thresholds.concurrency.maxConcurrentRequests})`,
        timestamp: Date.now()
      });
    }

    // Check response times
    const avgResponseTimes = this.calculateResponseTimeStats();
    Object.entries(avgResponseTimes).forEach(([endpoint, stats]) => {
      const threshold = this.thresholds.responseTime[endpoint];
      if (threshold && stats.average > threshold) {
        alerts.push({
          level: 'WARNING',
          type: 'SLOW_RESPONSE',
          message: `Average response time for ${endpoint} (${stats.average.toFixed(0)}ms) exceeds threshold (${threshold}ms)`,
          timestamp: Date.now()
        });
      }
    });

    return alerts;
  }

  /**
   * Calculate overall health status
   */
  calculateHealthStatus() {
    const alerts = this.generateAlerts();
    const criticalAlerts = alerts.filter(alert => alert.level === 'CRITICAL');
    const warningAlerts = alerts.filter(alert => alert.level === 'WARNING');

    if (criticalAlerts.length > 0) {
      return {
        status: 'CRITICAL',
        message: `${criticalAlerts.length} critical issue(s) detected`,
        alerts: criticalAlerts.length + warningAlerts.length
      };
    } else if (warningAlerts.length > 0) {
      return {
        status: 'WARNING',
        message: `${warningAlerts.length} warning(s) detected`,
        alerts: warningAlerts.length
      };
    } else {
      return {
        status: 'HEALTHY',
        message: 'All systems operating normally',
        alerts: 0
      };
    }
  }

  /**
   * Express middleware for automatic request tracking
   */
  expressMiddleware() {
    return (req, res, next) => {
      // Start tracking this request
      const requestInfo = this.startRequest(req.path, req.method);

      // Store request info for later use
      req.performanceInfo = requestInfo;

      // Override res.end to capture response
      const originalEnd = res.end;
      res.end = function(chunk, encoding) {
        // Track request completion
        const performanceMonitor = req.app.get('performanceMonitor') || global.performanceMonitor;
        if (performanceMonitor) {
          performanceMonitor.endRequest(requestInfo, res.statusCode, res.error);
        }

        // Call original end
        originalEnd.call(this, chunk, encoding);
      };

      next();
    };
  }

  // Helper methods
  categorizeEndpoint(endpoint) {
    if (endpoint.includes('/chart/generate')) return 'chartGeneration';
    if (endpoint.includes('/analysis/comprehensive')) return 'comprehensiveAnalysis';
    if (endpoint.includes('/analysis/dasha')) return 'dashaAnalysis';
    if (endpoint.includes('/analysis/navamsa')) return 'navamsaAnalysis';
    if (endpoint.includes('/analysis/houses')) return 'houseAnalysis';
    if (endpoint.includes('/analysis/')) return 'comprehensiveAnalysis'; // Default for analysis
    return 'validation';
  }

  calculateResponseTimeStats() {
    const stats = {};

    Object.entries(this.metrics.responseTimes).forEach(([endpoint, times]) => {
      if (times.length > 0) {
        const sorted = [...times].sort((a, b) => a - b);
        stats[endpoint] = {
          average: times.reduce((a, b) => a + b, 0) / times.length,
          median: sorted[Math.floor(sorted.length / 2)],
          p95: sorted[Math.floor(sorted.length * 0.95)],
          min: Math.min(...times),
          max: Math.max(...times),
          count: times.length
        };
      }
    });

    return stats;
  }

  calculateEphemerisSuccessRate() {
    const total = this.metrics.swissEphemeris.successes + this.metrics.swissEphemeris.failures;
    return total > 0 ? (this.metrics.swissEphemeris.successes / total) * 100 : 100;
  }

  calculateEphemerisFallbackRate() {
    const total = this.metrics.swissEphemeris.successes + this.metrics.swissEphemeris.failures;
    return total > 0 ? (this.metrics.swissEphemeris.fallbackToMoshier / total) * 100 : 0;
  }

  checkThresholds(endpoint, duration, status) {
    // Only log alerts in production to avoid test noise
    if (!this.isProduction) return;

    const endpointType = this.categorizeEndpoint(endpoint);
    const threshold = this.thresholds.responseTime[endpointType];

    if (threshold && duration > threshold) {
      console.warn(`[PERFORMANCE] Slow response detected: ${endpoint} took ${duration}ms (threshold: ${threshold}ms)`);
    }

    if (status >= 500) {
      console.error(`[PERFORMANCE] System error detected: ${endpoint} returned ${status}`);
    }
  }

  startResourceMonitoring() {
    // Monitor resource usage every 30 seconds in production
    const interval = this.isProduction ? 30000 : 60000;

    setInterval(() => {
      const memUsage = this.getCurrentMemoryUsage();
      this.metrics.resources.memoryUsage.push({
        timestamp: Date.now(),
        ...memUsage
      });

      // Keep only last 100 measurements
      if (this.metrics.resources.memoryUsage.length > 100) {
        this.metrics.resources.memoryUsage = this.metrics.resources.memoryUsage.slice(-100);
      }
    }, interval);
  }

  getCurrentMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      rss: usage.rss,
      heapTotal: usage.heapTotal,
      heapUsed: usage.heapUsed,
      external: usage.external,
      arrayBuffers: usage.arrayBuffers || 0
    };
  }

  calculateAverageMemoryUsage() {
    if (this.metrics.resources.memoryUsage.length === 0) return null;

    const totalHeapUsed = this.metrics.resources.memoryUsage.reduce((sum, usage) => sum + usage.heapUsed, 0);
    return {
      heapUsed: totalHeapUsed / this.metrics.resources.memoryUsage.length,
      measurements: this.metrics.resources.memoryUsage.length
    };
  }

  getPeakMemoryUsage() {
    if (this.metrics.resources.memoryUsage.length === 0) return null;

    return this.metrics.resources.memoryUsage.reduce((peak, current) => ({
      heapUsed: Math.max(peak.heapUsed, current.heapUsed),
      rss: Math.max(peak.rss, current.rss)
    }), { heapUsed: 0, rss: 0 });
  }

  generateRequestId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  /**
   * Export metrics for external monitoring systems
   */
  exportMetrics() {
    return {
      timestamp: Date.now(),
      metrics: this.metrics,
      thresholds: this.thresholds,
      performance: this.getPerformanceReport()
    };
  }

  /**
   * Reset metrics (useful for testing)
   */
  reset() {
    this.metrics = {
      requests: { total: 0, successful: 0, failed: 0, validation_errors: 0, system_errors: 0 },
      responseTimes: { chartGeneration: [], comprehensiveAnalysis: [], dashaAnalysis: [], navamsaAnalysis: [], houseAnalysis: [], validation: [] },
      swissEphemeris: { successes: 0, failures: 0, fallbackToMoshier: 0, averageCalculationTime: 0 },
      resources: { memoryUsage: [], cpuUsage: [], activeConnections: 0 },
      errors: { validation: [], system: [], ephemeris: [] }
    };
    this.startTime = Date.now();
  }
}

// Create global instance
const performanceMonitor = new PerformanceMonitor();

module.exports = {
  PerformanceMonitor,
  performanceMonitor
};
