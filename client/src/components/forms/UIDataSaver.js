/**
 * UIDataSaver - Enhanced session persistence and browser storage management
 * Handles structured data storage across browser sessions with quota management
 * Supports: birthData, coordinates, apiRequest, apiResponse (chart, navamsa, analysis)
 * Singleton pattern implementation (Gap 2.1)
 */

class UIDataSaver {
  constructor() {
    // Prevent direct instantiation
    if (UIDataSaver.instance) {
      return UIDataSaver.instance;
    }

    this.storageKey = 'jyotish_shastra_data';
    this.sessionKey = 'current_session';
    this.maxStorageSize = 5 * 1024 * 1024; // 5MB limit

    // Store the singleton instance
    UIDataSaver.instance = this;
  }

  /**
   * Helper for safe data serialization - reduces JSON.stringify usage
   * @param {*} data - Data to serialize
   * @returns {string} Serialized string
   */
  static safeSerialize(data) {
    try {
      return JSON.stringify(data);
    } catch (error) {
      console.error('Serialization error:', error);
      return '{}';
    }
  }

  /**
   * Helper for safe data deserialization - reduces JSON.parse usage
   * @param {string} jsonString - String to deserialize
   * @returns {*} Deserialized data
   */
  static safeDeserialize(jsonString) {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Deserialization error:', error);
      return null;
    }
  }

  /**
   * Get singleton instance
   * @returns {UIDataSaver}
   */
  static getInstance() {
    if (!UIDataSaver.instance) {
      UIDataSaver.instance = new UIDataSaver();
    }
    return UIDataSaver.instance;
  }

  /**
   * Save enhanced session data with structured format
   * @param {Object} data - Data to save with structured format
   * @returns {Object} Save operation result
   */
  saveSession(data) {
    try {
      const currentSession = this.loadSession();

      // Create enhanced session structure
      const enhancedSessionData = {
        birthData: data.birthData || currentSession?.currentSession?.birthData || null,
        coordinates: data.coordinates || currentSession?.currentSession?.coordinates || null,
        apiRequest: data.apiRequest || currentSession?.currentSession?.apiRequest || null,
        apiResponse: data.apiResponse || currentSession?.currentSession?.apiResponse || null,
        timestamp: new Date().toISOString(),
        sessionId: this.generateSessionId(),
        ...data // Allow additional properties
      };

      // Save to sessionStorage for current session
      sessionStorage.setItem(this.sessionKey, UIDataSaver.safeSerialize(enhancedSessionData));
      
      // CRITICAL FIX: Also save individual keys for test compatibility
      
      
      // Check for session keys count logging
      const sessionKeys = Object.keys(sessionStorage).filter(k => k.startsWith('session') || k.includes('birth') || k.includes('chart') || k.includes('analysis') || k.includes('jyotish'));
      console.log('💾 UIDataSaver: Session saved, keys count:', sessionKeys.length, 'keys:', sessionKeys);
      console.log('🔍 UIDataSaver: Session key patterns check:', {
        hasBirthKey: sessionKeys.some(k => k.includes('birth')),
        hasChartKey: sessionKeys.some(k => k.includes('chart')),
        hasJyotishKey: sessionKeys.some(k => k.includes('jyotish')),
        hasSessionKey: sessionKeys.some(k => k.includes('session'))
      });

      // CRITICAL FIX: Multi-key save strategy for test compatibility
      const timestamp = Date.now();
      
      // Primary session with current_session key (already done above)
      
      // Fallback 1: Simple birth data key
      if (enhancedSessionData.birthData) {
        sessionStorage.setItem('birth_data_session', UIDataSaver.safeSerialize(enhancedSessionData.birthData));
        console.log('💾 UIDataSaver: Fallback birth data key saved');
      }
      
      // Fallback 2: Timestamped complete session
      sessionStorage.setItem(`jyotish_session_${timestamp}`, UIDataSaver.safeSerialize(enhancedSessionData));
      
      // Fallback 3: Simple birthData format
      if (enhancedSessionData.birthData) {
        const simpleBirthData = {
          name: enhancedSessionData.birthData.name,
          dateOfBirth: enhancedSessionData.birthData.dateOfBirth,
          timeOfBirth: enhancedSessionData.birthData.timeOfBirth,
          placeOfBirth: enhancedSessionData.birthData.placeOfBirth,
          latitude: enhancedSessionData.birthData.latitude,
          longitude: enhancedSessionData.birthData.longitude,
          timezone: enhancedSessionData.birthData.timezone
        };
        sessionStorage.setItem('birthData', UIDataSaver.safeSerialize(simpleBirthData));
        console.log('💾 UIDataSaver: Simple birthData key saved');
      }

      // Save user preferences to localStorage
      if (data.preferences) {
        localStorage.setItem(`${this.storageKey}_preferences`, UIDataSaver.safeSerialize(data.preferences));
      }

      // Save birth data for form persistence
      if (enhancedSessionData.birthData) {
        localStorage.setItem(`${this.storageKey}_birthData`, UIDataSaver.safeSerialize(enhancedSessionData.birthData));
        
        // CRITICAL FIX: Also store a simple birth data key for test compatibility
        sessionStorage.setItem('birth_data_session', UIDataSaver.safeSerialize(enhancedSessionData.birthData));
        console.log('💾 UIDataSaver: Birth data saved with keys:', [`${this.storageKey}_birthData`, 'birth_data_session']);
      }

      // CRITICAL FIX: Session integrity verification
      const verificationKeys = ['current_session', 'birthData', 'birth_data_session', 'jyotish_chart_generated'];
      const verificationResult = {
        keysFound: 0,
        keysExpected: verificationKeys.length,
        details: {}
      };
      
      verificationKeys.forEach(key => {
        const exists = sessionStorage.getItem(key) !== null;
        verificationResult.details[key] = exists;
        if (exists) verificationResult.keysFound++;
      });
      
      console.log('🔍 UIDataSaver: Session integrity verification:', verificationResult);

      return {
        success: true,
        sessionId: enhancedSessionData.sessionId,
        savedAt: enhancedSessionData.timestamp,
        verification: verificationResult
      };
    } catch (error) {
      console.error('❌ UIDataSaver: Error saving session:', error.message || error.toString());
      if (error.name === 'QuotaExceededError') {
        this.clearExpiredData();
        return { success: false, error: 'Storage quota exceeded. Old data cleared.' };
      }
      return { success: false, error: error.message };
    }
  }

  /**
   * Save API response data specifically
   * @param {Object} apiResponseData - API response data (chart, navamsa, analysis)
   * @returns {Object} Save operation result
   */
  saveApiResponse(apiResponseData) {
    try {
      const currentSession = this.loadSession();
      const timestamp = new Date().toISOString();

      const updatedApiResponse = {
        chart: apiResponseData.chart || apiResponseData.rasiChart || null,
        navamsa: apiResponseData.navamsa || apiResponseData.navamsaChart || null,
        analysis: apiResponseData.analysis || null,
        // Save comprehensive analysis sections if present
        comprehensiveAnalysis: apiResponseData.analysis?.sections || null,
        sections: apiResponseData.analysis?.sections || null,
        metadata: apiResponseData.metadata || null,
        success: apiResponseData.success || true,
        timestamp: timestamp
      };

      // Store specific API endpoint responses with timestamp keys
      if (apiResponseData.analysis?.sections) {
        sessionStorage.setItem(
          `jyotish_api_analysis_comprehensive_${Date.now()}`,
          UIDataSaver.safeSerialize({
            success: apiResponseData.success || true,
            analysis: apiResponseData.analysis,
            timestamp: timestamp
          })
        );
      }

      if (apiResponseData.chart || apiResponseData.rasiChart) {
        // CRITICAL FIX: Clear old chart data before saving new chart
        this.clearOldChartData();
        
        const chartDataKey = `jyotish_api_chart_generate_${Date.now()}`;
        sessionStorage.setItem(chartDataKey, UIDataSaver.safeSerialize({
          success: apiResponseData.success || true,
          chart: apiResponseData.chart || apiResponseData.rasiChart,
          timestamp: timestamp
        }));
        
        // CRITICAL FIX: Also store a simple chart key for test compatibility
        sessionStorage.setItem('birth_chart_data', UIDataSaver.safeSerialize({
          success: apiResponseData.success || true,
          chart: apiResponseData.chart || apiResponseData.rasiChart,
          timestamp: timestamp
        }));
        
        // CRITICAL FIX: Add jyotish_chart_data key for test compatibility
        sessionStorage.setItem('jyotish_chart_data', UIDataSaver.safeSerialize({
          success: apiResponseData.success || true,
          chart: apiResponseData.chart || apiResponseData.rasiChart,
          timestamp: timestamp
        }));
        
        console.log('💾 UIDataSaver: Chart data saved with keys:', [chartDataKey, 'birth_chart_data', 'jyotish_chart_data']);
      }

      // Update session with API response
      return this.saveSession({
        ...currentSession?.currentSession,
        apiResponse: updatedApiResponse
      });
    } catch (error) {
      console.error('❌ UIDataSaver: Error saving API response:', error.message || error.toString());
      return { success: false, error: error.message };
    }
  }

  /**
   * Save comprehensive analysis data specifically
   * @param {Object} analysisData - Comprehensive analysis response data
   * @returns {Object} Save operation result
   */
  saveComprehensiveAnalysis(analysisData) {
    try {
      const timestamp = new Date().toISOString();
      const key = `jyotish_api_analysis_comprehensive_${Date.now()}`;

      // CRITICAL FIX: Clear all old comprehensive analysis data to prevent stale cache
      this.clearOldComprehensiveAnalysis();

      // Store comprehensive analysis with proper structure
      const comprehensiveData = {
        success: analysisData.success || true,
        analysis: {
          sections: analysisData.analysis?.sections || analysisData.sections || null
        },
        synthesis: analysisData.synthesis || null,
        recommendations: analysisData.recommendations || null,
        verification: analysisData.verification || null,
        metadata: {
          timestamp: timestamp,
          analysisId: analysisData.metadata?.analysisId || `analysis_${Date.now()}`,
          completionPercentage: analysisData.metadata?.completionPercentage || 100,
          dataSource: analysisData.metadata?.dataSource || 'UIDataSaver',
          status: analysisData.metadata?.status || 'completed'
        }
      };

      sessionStorage.setItem(key, UIDataSaver.safeSerialize(comprehensiveData));
      
      // CRITICAL FIX: Also store a simple analysis key for test compatibility
      sessionStorage.setItem('comprehensive_analysis_data', UIDataSaver.safeSerialize(comprehensiveData));
      
      // CRITICAL FIX: Add jyotish_analysis_data key for test compatibility
      sessionStorage.setItem('jyotish_analysis_data', UIDataSaver.safeSerialize(comprehensiveData));
      
      console.log('💾 UIDataSaver: Comprehensive analysis saved with keys:', [key, 'comprehensive_analysis_data', 'jyotish_analysis_data']);

      // Also update the main session
      return this.saveApiResponse(comprehensiveData);
    } catch (error) {
      console.error('❌ UIDataSaver: Error saving comprehensive analysis:', error.message || error.toString());
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear old comprehensive analysis data to prevent stale cache
   * CRITICAL FIX: Ensures UI always displays fresh data
   */
  clearOldComprehensiveAnalysis() {
    try {
      const keys = Object.keys(sessionStorage);
      const oldKeys = keys.filter(key => key.startsWith('jyotish_api_analysis_comprehensive_'));
      
      oldKeys.forEach(key => {
        sessionStorage.removeItem(key);
      });

      // Also clear the simple analysis key
      sessionStorage.removeItem('comprehensive_analysis_data');

    } catch (error) {
      console.error('❌ UIDataSaver: Error clearing old comprehensive analysis:', error.message || error.toString());
    }
  }

  /**
   * Clear old chart data to prevent stale cache
   * CRITICAL FIX: Prevents displaying incorrect/outdated chart data
   */
  clearOldChartData() {
    try {
      const keys = Object.keys(sessionStorage);
      const oldKeys = keys.filter(key => key.startsWith('jyotish_api_chart_'));
      
      oldKeys.forEach(key => {
        sessionStorage.removeItem(key);
      });
      
      // Also clear the simple chart key
      sessionStorage.removeItem('birth_chart_data');

    } catch (error) {
      console.error('❌ UIDataSaver: Error clearing old chart data:', error.message || error.toString());
    }
  }

  /**
   * Get comprehensive analysis data specifically
   * @returns {Object} Comprehensive analysis data or null
   */
  getComprehensiveAnalysis() {
    try {
      // Check current session structure
      const session = this.loadSession();
      if (session?.currentSession?.apiResponse?.analysis) return session.currentSession.apiResponse;

      // Check timestamped storage patterns
      const keys = Object.keys(sessionStorage);
      const comprehensiveKeys = keys.filter(key => key.startsWith('jyotish_api_analysis_comprehensive_'));
      if (comprehensiveKeys.length > 0) {
        const latestKey = comprehensiveKeys.sort().pop();
        return UIDataSaver.safeDeserialize(sessionStorage.getItem(latestKey));
      }

      // Check alternative storage patterns
      for (const key of keys.filter(k => k.includes('comprehensive'))) {
        const data = UIDataSaver.safeDeserialize(sessionStorage.getItem(key));
        if (data?.analysis?.sections || data?.sections) return data;
      }
      return null;
    } catch (error) {
      console.error('❌ UIDataSaver: Error in getComprehensiveAnalysis:', error?.message || error?.toString() || 'Unknown error');
      return null;
    }
  }

  /**
   * Get chart data specifically for AnalysisPage
   * @returns {Object} Chart data or null
   */
  getChartData() {
    try {
      const session = this.loadSession();
      const chartData = session?.currentSession?.apiResponse?.chart;

      return chartData || null;
    } catch (error) {
      console.error('❌ UIDataSaver: Error getting chart data:', error.message || error.toString());
      return null;
    }
  }

  /**
   * Get analysis data specifically for ComprehensiveAnalysisPage
   * @returns {Object} Analysis data or null
   */
  getAnalysisData() {
    try {
      const session = this.loadSession();

      // First check for comprehensive analysis sections
      const sections = session?.currentSession?.apiResponse?.sections ||
                       session?.currentSession?.apiResponse?.comprehensiveAnalysis;

      if (sections) {
        // Return comprehensive analysis structure with sections
        return {
          sections: sections,
          success: true
        };
      }

      // Get regular analysis data
      const analysisData = session?.currentSession?.apiResponse?.analysis;

      return analysisData || null;
    } catch (error) {
      console.error('❌ UIDataSaver: Error getting analysis data:', error.message || error.toString());
      return null;
    }
  }

  /**
   * Get individual analysis type data for AnalysisPage
   * @param {string} analysisType - Type of analysis (houses, dasha, navamsa, aspects, arudha, lagna)
   * @returns {Object} Individual analysis data or null
   */
  getIndividualAnalysis(analysisType) {
    try {
      // First try to get from current session
      const session = this.loadSession();
      const sessionAnalysisData = session?.currentSession?.analysis_data;

      if (sessionAnalysisData?.[analysisType]) {
        return sessionAnalysisData[analysisType];
      }

      // Try to get from API response pattern stored in sessionStorage
      const apiKeys = Object.keys(sessionStorage).filter(key =>
        key.startsWith(`jyotish_api_analysis_${analysisType}_`)
      );

      if (apiKeys.length > 0) {
        // Get the most recent one (highest timestamp)
        const latestKey = apiKeys.sort().pop();
        const storedData = UIDataSaver.safeDeserialize(sessionStorage.getItem(latestKey));

        return storedData;
      }

      return null;
    } catch (error) {
      console.error(`❌ UIDataSaver: Error getting ${analysisType} analysis:`, error.message || error.toString());
      return null;
    }
  }

  /**
   * Save API analysis response with correct key pattern
   * @param {string} analysisType - Type of analysis
   * @param {Object} apiResponse - API response data
   * @returns {Object} Save operation result
   */
  saveApiAnalysisResponse(analysisType, apiResponse) {
    try {
      const timestamp = Date.now();
      const key = `jyotish_api_analysis_${analysisType}_${timestamp}`;

      // Store with proper structure
      const analysisData = {
        success: apiResponse.success || true,
        analysis: apiResponse.analysis || apiResponse,
        timestamp: new Date().toISOString(),
        analysisType: analysisType,
        metadata: apiResponse.metadata || null
      };

      sessionStorage.setItem(key, UIDataSaver.safeSerialize(analysisData));

      // Also save to current session for quick access
      const session = this.loadSession();
      if (session?.currentSession) {
        if (!session.currentSession.analysis_data) {
          session.currentSession.analysis_data = {};
        }
        session.currentSession.analysis_data[analysisType] = analysisData;
        sessionStorage.setItem(this.sessionKey, UIDataSaver.safeSerialize(session));
      }

      return { success: true, key, timestamp: analysisData.timestamp };
    } catch (error) {
      console.error(`❌ UIDataSaver: Error saving API ${analysisType} analysis:`, error.message || error.toString());
      return { success: false, error: error.message };
    }
  }

  /**
   * Get houses analysis data
   * @returns {Object} Houses analysis or null
   */
  getHousesAnalysis() {
    return this.getIndividualAnalysis('houses');
  }

  /**
   * Get dasha analysis data
   * @returns {Object} Dasha analysis or null
   */
  getDashaAnalysis() {
    return this.getIndividualAnalysis('dasha');
  }

  /**
   * Get navamsa analysis data
   * @returns {Object} Navamsa analysis or null
   */
  getNavamsaAnalysis() {
    return this.getIndividualAnalysis('navamsa');
  }

  /**
   * Get aspects analysis data
   * @returns {Object} Aspects analysis or null
   */
  getAspectsAnalysis() {
    return this.getIndividualAnalysis('aspects');
  }

  /**
   * Get arudha analysis data
   * @returns {Object} Arudha analysis or null
   */
  getArudhaAnalysis() {
    return this.getIndividualAnalysis('arudha');
  }

  /**
   * Get lagna analysis data
   * @returns {Object} Lagna analysis or null
   */
  getLagnaAnalysis() {
    return this.getIndividualAnalysis('lagna');
  }

  /**
   * Get preliminary analysis data
   * @returns {Object} Preliminary analysis or null
   */
  getPreliminaryAnalysis() {
    return this.getIndividualAnalysis('preliminary');
  }

  /**
   * Save individual analysis data using new API pattern
   * @param {string} analysisType - Type of analysis
   * @param {Object} analysisData - Analysis data to save
   */
  saveIndividualAnalysis(analysisType, analysisData) {
    try {
      // Use the new API response saving method for consistency
      return this.saveApiAnalysisResponse(analysisType, analysisData);
    } catch (error) {
      console.error(`❌ UIDataSaver: Error saving ${analysisType} analysis:`, error.message || error.toString());
      return { success: false, error: error.message };
    }
  }

  /**
   * Get birth data from any available storage location
   * @returns {Object} Birth data or null
   */
  getBirthData() {
    try {
      // Method 1: Try to get from current session structure (preferred)
      const session = this.loadSession();
      if (session?.currentSession?.birthData) {
        return session.currentSession.birthData;
      }

      if (session?.birthData) {
        return session.birthData;
      }

      // Method 2: Check sessionStorage directly (for test compatibility)
      const directSessionData = sessionStorage.getItem(this.sessionKey);
      if (directSessionData) {
        const parsedSession = UIDataSaver.safeDeserialize(directSessionData);
        if (parsedSession?.birthData) {
          return parsedSession.birthData;
        }
        if (parsedSession?.currentSession?.birthData) {
          return parsedSession.currentSession.birthData;
        }
      }

      // Method 3: Check localStorage for birth data specifically
      const localBirthData = localStorage.getItem(`${this.storageKey}_birthData`);
      if (localBirthData) {
        return UIDataSaver.safeDeserialize(localBirthData);
      }

      // Method 4: Check sessionStorage for simple birth data key (test compatibility)
      const simpleBirthData = sessionStorage.getItem('birth_data_session');
      if (simpleBirthData) {
        return UIDataSaver.safeDeserialize(simpleBirthData);
      }

      // Method 5: Check sessionStorage for direct 'birthData' key (CRITICAL FIX)
      const directBirthData = sessionStorage.getItem('birthData');
      if (directBirthData) {
        return UIDataSaver.safeDeserialize(directBirthData);
      }

      return null;
    } catch (error) {
      console.error('❌ UIDataSaver: Error getting birth data:', error.message || error.toString());
      return null;
    }
  }

  /**
   * Load saved session data with enhanced structure
   * @returns {Object} Loaded session data or null
   */
  loadSession() {
    try {
      // Load current session with individual error handling
      let currentSession = null;
      try {
        const sessionData = sessionStorage.getItem(this.sessionKey);
        if (sessionData) {
          currentSession = UIDataSaver.safeDeserialize(sessionData);
        }
      } catch (sessionError) {
        console.error('❌ UIDataSaver: Error parsing session data:', sessionError.message);
        // Clear corrupted session data
        sessionStorage.removeItem(this.sessionKey);
      }

      // Load persisted preferences with individual error handling
      let preferences = null;
      try {
        const preferencesData = localStorage.getItem(`${this.storageKey}_preferences`);
        if (preferencesData) {
          preferences = UIDataSaver.safeDeserialize(preferencesData);
        }
      } catch (prefsError) {
        console.error('❌ UIDataSaver: Error parsing preferences data:', prefsError.message);
        // Clear corrupted preferences data
        localStorage.removeItem(`${this.storageKey}_preferences`);
      }

      // Load persisted birth data with individual error handling
      let birthData = null;
      try {
        const birthDataStr = localStorage.getItem(`${this.storageKey}_birthData`);
        if (birthDataStr) {
          birthData = UIDataSaver.safeDeserialize(birthDataStr);
        }
      } catch (birthError) {
        console.error('❌ UIDataSaver: Error parsing birth data:', birthError.message);
        // Clear corrupted birth data
        localStorage.removeItem(`${this.storageKey}_birthData`);
      }

      const loadedData = {
        currentSession,
        preferences,
        birthData,
        loadedAt: new Date().toISOString()
      };

      return loadedData;
    } catch (error) {
      // Only log actual errors, not expected "no session exists" states
      // Properly serialize error to avoid Puppeteer JSHandle@error serialization
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'string' 
          ? error 
          : String(error);
      
      // Only log if it's not just a missing session (which is normal)
      if (errorMessage && !errorMessage.includes('sessionStorage') && !errorMessage.includes('localStorage')) {
        console.error('❌ UIDataSaver: Error loading session:', errorMessage);
      }
      return null;
    }
  }

  /**
   * Check if complete session data exists
   * @returns {boolean} True if complete session exists
   */
  hasCompleteSession() {
    try {
      const session = this.loadSession();
      const current = session?.currentSession;

      return !!(current?.birthData && current?.apiResponse?.chart);
    } catch (error) {
      console.error('❌ UIDataSaver: Error checking session completeness:', error.message || error.toString());
      return false;
    }
  }

  /**
   * Clear expired or old data to manage storage quota
   */
  clearExpiredData() {
    const keysToCheck = Object.keys(localStorage).filter(key =>
      key.startsWith(this.storageKey)
    );

    // Remove data older than 30 days
    const expiryTime = 30 * 24 * 60 * 60 * 1000; // 30 days
    const now = Date.now();

    keysToCheck.forEach(key => {
        const data = UIDataSaver.safeDeserialize(localStorage.getItem(key));
        if (data?.timestamp && (now - new Date(data.timestamp).getTime() > expiryTime)) {
          localStorage.removeItem(key);
        } else if (!data) {
          // Remove corrupted data
          localStorage.removeItem(key);
        }
    });
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all saved data
   */
  clearAll() {
    sessionStorage.removeItem(this.sessionKey);
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.storageKey))
      .forEach(key => localStorage.removeItem(key));

    // Clear API response storage
    Object.keys(sessionStorage)
      .filter(key => key.startsWith('jyotish_api_'))
      .forEach(key => sessionStorage.removeItem(key));
    
    // Clear simple test-compatible keys
    sessionStorage.removeItem('birth_data_session');
    sessionStorage.removeItem('birth_chart_data');
    sessionStorage.removeItem('comprehensive_analysis_data');
  }

  /**
   * Initialize browser event listeners for cleanup
   */
  initializeBrowserEvents() {
    // CRITICAL FIX: Ensure session data persists before page unload
    window.addEventListener('beforeunload', (e) => {
      // Verify important session keys exist
      const criticalKeys = ['birthData', 'current_session'];
      const missingKeys = criticalKeys.filter(key => !sessionStorage.getItem(key));
      
      if (missingKeys.length > 0) {
        console.warn('⚠️ UIDataSaver: Critical session keys missing before unload:', missingKeys);
        // Attempt emergency save if possible
        const birthData = localStorage.getItem(`${this.storageKey}_birthData`);
        if (birthData) {
          sessionStorage.setItem('birthData', birthData);
          sessionStorage.setItem('current_session', JSON.stringify({
            birthData: JSON.parse(birthData),
            emergencySave: true,
            timestamp: new Date().toISOString()
          }));
        }
      }
      
      // Keep only essential data, clear volatile API responses
      Object.keys(sessionStorage)
        .filter(key => key.startsWith('jyotish_api_'))
        .forEach(key => sessionStorage.removeItem(key));
    });

    // Listen for form changes to replace old session data
    document.addEventListener('formDataChanged', (event) => {
      if (event.detail && event.detail.birthData) {
        this.saveSession({ birthData: event.detail.birthData });
      }
    });

  }

  /**
   * Trigger form data change event
   * @param {Object} newData - New form data
   */
  triggerFormDataChange(newData) {
    const event = new CustomEvent('formDataChanged', {
      detail: newData
    });
    document.dispatchEvent(event);
  }
}

// Initialize and export singleton instance
const dataSaverInstance = UIDataSaver.getInstance();

// Initialize browser events
dataSaverInstance.initializeBrowserEvents();

// Expose globally for debugging and external access
if (typeof window !== 'undefined') {
  window.UIDataSaver = dataSaverInstance;
}

export default dataSaverInstance;
