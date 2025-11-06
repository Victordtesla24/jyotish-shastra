/**
 * UIDataSaver Diagnostic Test Suite
 * Comprehensive analysis of persistence issues
 */

import UIDataSaver from './UIDataSaver.js';

const testBirthData = {
  name: "Test User",
  dateOfBirth: "1990-01-15",
  timeOfBirth: "14:30",
  latitude: 19.076,
  longitude: 72.8777,
  timezone: "Asia/Kolkata"
};

class UIDataSaverDiagnostic {
  constructor() {
    this.testResults = [];
    this.sessionStorageKeys = [];
  }

  log(test, status, details) {
    const result = {
      test,
      status,
      details,
      timestamp: new Date().toISOString(),
      sessionStorageState: this.captureSessionStorageState()
    };
    this.testResults.push(result);
    console.log(`🔍 [UIDataSaver Debug] ${test}: ${status}`, details);
  }

  captureSessionStorageState() {
    const state = {};
    const prefixes = ['btr:v2:', 'birthData', 'current_session', 'birth_data'];
    
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (prefixes.some(prefix => key.startsWith(prefix))) {
        try {
          state[key] = sessionStorage.getItem(key);
        } catch (e) {
          state[key] = `<ERROR: ${e.message}>`;
        }
      }
    }
    return state;
  }

  async runDiagnostic() {
    console.log('🚀 Starting UIDataSaver Diagnostic Analysis...');
    
    // Clear any existing data first
    UIDataSaver.clear();
    this.log("Initial State", "INFO", "Cleared all existing data");

    // Test 1: Basic setBirthData functionality
    try {
      const result = UIDataSaver.setBirthData(testBirthData);
      this.log("setBirthData", result ? "PASS" : "FAIL", {
        returned: result,
        inputData: testBirthData
      });
    } catch (error) {
      this.log("setBirthData", "ERROR", {
        error: error.message,
        stack: error.stack
      });
    }

    // Test 2: Immediate getBirthData retrieval
    try {
      const retrieved = UIDataSaver.getBirthData();
      const hasData = retrieved && retrieved.data;
      this.log("getBirthData (immediate)", hasData ? "PASS" : "FAIL", {
        retrieved,
        hasValidData: hasData,
        dataMatches: hasData ? JSON.stringify(retrieved.data) === JSON.stringify(testBirthData) : false
      });
    } catch (error) {
      this.log("getBirthData (immediate)", "ERROR", {
        error: error.message,
        stack: error.stack
      });
    }

    // Test 3: SessionStorage direct inspection
    const storageState = this.captureSessionStorageState();
    this.log("SessionStorage State", Object.keys(storageState).length > 0 ? "PASS" : "FAIL", storageState);

    // Test 4: Check canonical keys
    const canonicalKeys = {
      birthData: 'btr:v2:birthData',
      chartId: 'btr:v2:chartId', 
      updatedAt: 'btr:v2:updatedAt',
      fingerprint: 'btr:v2:fingerprint',
      schema: 'btr:v2:schema',
      pageLoadId: 'btr:v2:pageLoadId'
    };

    Object.entries(canonicalKeys).forEach(([name, key]) => {
      const value = sessionStorage.getItem(key);
      this.log(`Canonical Key: ${name}`, value ? "PRESENT" : "MISSING", {
        key,
        value: value ? (value.length > 100 ? `${value.substring(0, 100)}...` : value) : null
      });
    });

    // Test 5: TTL and expiration logic
    try {
      const meta = UIDataSaver.getMeta();
      this.log("TTL Metadata", meta ? "PASS" : "FAIL", {
        meta,
        isExpired: meta ? this.checkExpiry(meta.savedAtISO) : "No meta available"
      });
    } catch (error) {
      this.log("TTL Metadata", "ERROR", {
        error: error.message
      });
    }

    // Test 6: Simulate page refresh behavior
    this.simulateRefreshDetection();

    // Test 7: Chart ID persistence
    try {
      UIDataSaver.setChartId("test-chart-123");
      const chartId = UIDataSaver.getChartId();
      this.log("Chart ID Persistence", chartId === "test-chart-123" ? "PASS" : "FAIL", {
        set: "test-chart-123",
        retrieved: chartId
      });
    } catch (error) {
      this.log("Chart ID Persistence", "ERROR", {
        error: error.message
      });
    }

    // Test 8: Cross-method integration
    this.testCrossMethodIntegration();

    // Test 9: Storage quota and limitations
    this.testStorageLimitations();

    console.log('✅ UIDataSaver Diagnostic Complete');
    return this.generateReport();
  }

  checkExpiry(savedAtISO) {
    if (!savedAtISO) return "No timestamp";
    const timestamp = Date.parse(savedAtISO);
    if (Number.isNaN(timestamp)) return "Invalid timestamp";
    const age = Date.now() - timestamp;
    const TTL_MS = 15 * 60 * 1000; // 15 minutes
    return {
      age: `${Math.floor(age / 1000)}s`,
      isExpired: age > TTL_MS,
      ttlRemaining: `${Math.floor((TTL_MS - age) / 1000)}s`
    };
  }

  simulateRefreshDetection() {
    // Check if refresh detection logic would trigger
    const hasNavigation = typeof performance !== 'undefined' && typeof performance.getEntriesByType === 'function';
    const hasNavigationAPI = hasNavigation && performance.getEntriesByType('navigation').length > 0;
    
    this.log("Refresh Detection Setup", hasNavigationAPI ? "AVAILABLE" : "LIMITED", {
      hasPerformanceAPI: typeof performance !== 'undefined',
      hasNavigationEntries: hasNavigationAPI,
      currentNavigationType: hasNavigationAPI ? performance.getEntriesByType('navigation')[0]?.type : 'unknown',
      fallbackAvailable: typeof performance !== 'undefined' && typeof performance.navigation !== 'undefined'
    });
  }

  testCrossMethodIntegration() {
    try {
      // Test the interaction between different methods
      UIDataSaver.setBirthData(testBirthData);
      const birthData = UIDataSaver.getBirthData();
      
      UIDataSaver.setChartId("integration-test-123");
      const chartId = UIDataSaver.getChartId();

      const integrationWorks = birthData?.data && chartId === "integration-test-123";
      
      this.log("Cross-Method Integration", integrationWorks ? "PASS" : "FAIL", {
        birthDataAvailable: !!birthData?.data,
        chartIdMatches: chartId === "integration-test-123",
        bothMethodsWork: integrationWorks
      });
    } catch (error) {
      this.log("Cross-Method Integration", "ERROR", {
        error: error.message
      });
    }
  }

  testStorageLimitations() {
    try {
      // Test storage quota by trying to store large data
      const largeData = {
        ...testBirthData,
        largeField: 'x'.repeat(1000) // 1KB of data
      };
      
      const canStoreLargeData = UIDataSaver.setBirthData(largeData);
      this.log("Storage Limitations", canStoreLargeData ? "PASS" : "FAIL", {
        canStoreLargeData,
        storageQuotaExceeded: false // Will be true if quota exceeded error caught
      });
      
      // Clean up
      UIDataSaver.setBirthData(testBirthData);
    } catch (error) {
      this.log("Storage Limitations", "QUOTA_EXCEEDED", {
        error: error.message,
        quotaExceeded: error.name === 'QuotaExceededError'
      });
    }
  }

  generateReport() {
    const report = {
      summary: {
        totalTests: this.testResults.length,
        passed: this.testResults.filter(r => r.status === 'PASS').length,
        failed: this.testResults.filter(r => r.status === 'FAIL').length,
        errors: this.testResults.filter(r => r.status === 'ERROR').length
      },
      criticalIssues: this.testResults.filter(r => r.status === 'FAIL' || r.status === 'ERROR'),
      allResults: this.testResults,
      recommendations: this.generateRecommendations()
    };

    console.log('📊 UIDataSaver Diagnostic Report:', report);
    return report;
  }

  generateRecommendations() {
    const issues = this.testResults.filter(r => r.status === 'FAIL' || r.status === 'ERROR');
    const recommendations = [];

    if (issues.some(i => i.test === 'setBirthData')) {
      recommendations.push('CRITICAL: setBirthData is not working - check storage write operations');
    }
    
    if (issues.some(i => i.test === 'getBirthData (immediate)')) {
      recommendations.push('CRITICAL: getBirthData is not working - check storage read operations');
    }

    if (issues.some(i => i.test.includes('Canonical Key'))) {
      recommendations.push('Storage keys not being written correctly - check safeSet operation');
    }

    if (issues.some(i => i.test === 'TTL Metadata')) {
      recommendations.push('TTL logic may be causing immediate expiration - check timestamp handling');
    }

    if (recommendations.length === 0) {
      recommendations.push('No critical issues found - data should be persisting correctly');
    }

    return recommendations;
  }
}

// Auto-run diagnostic when this module is loaded in development
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  window.UIDataSaverDiagnostic = UIDataSaverDiagnostic;
  console.log('🔧 UIDataSaver Diagnostic loaded. Run: new UIDataSaverDiagnostic().runDiagnostic()');
}

export default UIDataSaverDiagnostic;
