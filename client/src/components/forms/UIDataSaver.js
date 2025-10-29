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
      sessionStorage.setItem(this.sessionKey, JSON.stringify(enhancedSessionData));

      // Save user preferences to localStorage
      if (data.preferences) {
        localStorage.setItem(`${this.storageKey}_preferences`, JSON.stringify(data.preferences));
      }

      // Save birth data for form persistence
      if (enhancedSessionData.birthData) {
        localStorage.setItem(`${this.storageKey}_birthData`, JSON.stringify(enhancedSessionData.birthData));
      }

      console.log('✅ UIDataSaver: Enhanced session saved successfully', {
        hasBirthData: !!enhancedSessionData.birthData,
        hasCoordinates: !!enhancedSessionData.coordinates,
        hasApiRequest: !!enhancedSessionData.apiRequest,
        hasApiResponse: !!enhancedSessionData.apiResponse,
        sessionId: enhancedSessionData.sessionId
      });

      return {
        success: true,
        sessionId: enhancedSessionData.sessionId,
        savedAt: enhancedSessionData.timestamp
      };
    } catch (error) {
      console.error('❌ UIDataSaver: Error saving session:', error);
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
          JSON.stringify({
            success: apiResponseData.success || true,
            analysis: apiResponseData.analysis,
            timestamp: timestamp
          })
        );
      }

      if (apiResponseData.chart || apiResponseData.rasiChart) {
        // CRITICAL FIX: Clear old chart data before saving new chart
        this.clearOldChartData();
        
        sessionStorage.setItem(
          `jyotish_api_chart_generate_${Date.now()}`,
          JSON.stringify({
            success: apiResponseData.success || true,
            chart: apiResponseData.chart || apiResponseData.rasiChart,
            timestamp: timestamp
          })
        );
      }

      // Update session with API response
      return this.saveSession({
        ...currentSession?.currentSession,
        apiResponse: updatedApiResponse
      });
    } catch (error) {
      console.error('❌ UIDataSaver: Error saving API response:', error);
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

      sessionStorage.setItem(key, JSON.stringify(comprehensiveData));

      console.log('✅ UIDataSaver: Comprehensive analysis saved (old cache cleared)', {
        key: key,
        hasSections: !!(comprehensiveData.analysis?.sections),
        sectionCount: comprehensiveData.analysis?.sections ? Object.keys(comprehensiveData.analysis.sections).length : 0,
        timestamp: timestamp
      });

      // Also update the main session
      return this.saveApiResponse(comprehensiveData);
    } catch (error) {
      console.error('❌ UIDataSaver: Error saving comprehensive analysis:', error);
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
        console.log(`🧹 UIDataSaver: Removed old comprehensive analysis: ${key}`);
      });

      console.log(`✅ UIDataSaver: Cleared ${oldKeys.length} old comprehensive analysis entries`);
    } catch (error) {
      console.error('❌ UIDataSaver: Error clearing old comprehensive analysis:', error);
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
        console.log(`🧹 UIDataSaver: Removed old chart data: ${key}`);
      });

      console.log(`✅ UIDataSaver: Cleared ${oldKeys.length} old chart entries`);
    } catch (error) {
      console.error('❌ UIDataSaver: Error clearing old chart data:', error);
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
        return JSON.parse(sessionStorage.getItem(latestKey));
      }

      // Check alternative storage patterns
      for (const key of keys.filter(k => k.includes('comprehensive'))) {
        try {
          const data = JSON.parse(sessionStorage.getItem(key));
          if (data?.analysis?.sections || data?.sections) return data;
        } catch (error) { continue; }
      }
      return null;
    } catch (error) {
      console.error('Error in getComprehensiveAnalysis:', error);
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

      console.log('📊 UIDataSaver: Getting chart data', {
        hasSession: !!session,
        hasApiResponse: !!session?.currentSession?.apiResponse,
        hasChart: !!chartData
      });

      return chartData || null;
    } catch (error) {
      console.error('❌ UIDataSaver: Error getting chart data:', error);
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

      console.log('📊 UIDataSaver: Getting analysis data', {
        hasSession: !!session,
        hasApiResponse: !!session?.currentSession?.apiResponse,
        hasAnalysis: !!analysisData,
        hasSections: !!sections
      });

      return analysisData || null;
    } catch (error) {
      console.error('❌ UIDataSaver: Error getting analysis data:', error);
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
        console.log(`📊 UIDataSaver: Getting ${analysisType} analysis from session`, {
          hasData: true,
          dataKeys: Object.keys(sessionAnalysisData[analysisType])
        });
        return sessionAnalysisData[analysisType];
      }

      // NEW: Try to get from API response pattern (matches test data)
      const apiKeys = Object.keys(sessionStorage).filter(key =>
        key.startsWith(`jyotish_api_analysis_${analysisType}_`)
      );

      if (apiKeys.length > 0) {
        // Get the most recent one (highest timestamp)
        const latestKey = apiKeys.sort().pop();
        const storedData = JSON.parse(sessionStorage.getItem(latestKey));

        console.log(`📊 UIDataSaver: Getting ${analysisType} analysis from API storage`, {
          key: latestKey,
          hasAnalysis: !!(storedData?.analysis),
          hasSuccess: !!(storedData?.success)
        });

        return storedData;
      }

      console.log(`📊 UIDataSaver: No ${analysisType} analysis found in standard storage pattern`);
      return null;
    } catch (error) {
      console.error(`❌ UIDataSaver: Error getting ${analysisType} analysis:`, error);
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

      sessionStorage.setItem(key, JSON.stringify(analysisData));

      // Also save to current session for quick access
      const session = this.loadSession();
      if (session?.currentSession) {
        if (!session.currentSession.analysis_data) {
          session.currentSession.analysis_data = {};
        }
        session.currentSession.analysis_data[analysisType] = analysisData;
        sessionStorage.setItem(this.sessionKey, JSON.stringify(session));
      }

      console.log(`💾 UIDataSaver: API ${analysisType} analysis saved`, {
        key,
        hasAnalysis: !!analysisData.analysis,
        timestamp: analysisData.timestamp
      });

      return { success: true, key, timestamp: analysisData.timestamp };
    } catch (error) {
      console.error(`❌ UIDataSaver: Error saving API ${analysisType} analysis:`, error);
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
      console.error(`❌ UIDataSaver: Error saving ${analysisType} analysis:`, error);
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
        console.log('✅ UIDataSaver: Found birth data in session.currentSession.birthData');
        return session.currentSession.birthData;
      }

      if (session?.birthData) {
        console.log('✅ UIDataSaver: Found birth data in session.birthData');
        return session.birthData;
      }

      // Production code only uses standard storage pattern - no backward compatibility or fallback methods

      console.log('❌ UIDataSaver: No birth data found in any storage location');
      return null;
    } catch (error) {
      console.error('❌ UIDataSaver: Error getting birth data:', error);
      return null;
    }
  }

  /**
   * Load saved session data with enhanced structure
   * @returns {Object} Loaded session data or null
   */
  loadSession() {
    try {
      // Load current session
      const sessionData = sessionStorage.getItem(this.sessionKey);
      const currentSession = sessionData ? JSON.parse(sessionData) : null;

      // Load persisted data
      const preferences = localStorage.getItem(`${this.storageKey}_preferences`);
      const birthData = localStorage.getItem(`${this.storageKey}_birthData`);

      const loadedData = {
        currentSession,
        preferences: preferences ? JSON.parse(preferences) : null,
        birthData: birthData ? JSON.parse(birthData) : null,
        loadedAt: new Date().toISOString()
      };

      console.log('📥 UIDataSaver: Session loaded', {
        hasCurrentSession: !!currentSession,
        hasPreferences: !!loadedData.preferences,
        hasBirthData: !!loadedData.birthData
      });

      return loadedData;
    } catch (error) {
      console.error('❌ UIDataSaver: Error loading session:', error);
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
      console.error('❌ UIDataSaver: Error checking session completeness:', error);
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
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (data.timestamp && (now - new Date(data.timestamp).getTime() > expiryTime)) {
          localStorage.removeItem(key);
        }
      } catch {
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
  }

  /**
   * Initialize browser event listeners for cleanup
   */
  initializeBrowserEvents() {
    // Clear session data on browser close
    window.addEventListener('beforeunload', () => {
      console.log('🧹 UIDataSaver: Cleaning up session data on browser close');
      // Keep only essential data, clear API responses
      Object.keys(sessionStorage)
        .filter(key => key.startsWith('jyotish_api_'))
        .forEach(key => sessionStorage.removeItem(key));
    });

    // Listen for form changes to replace old session data
    document.addEventListener('formDataChanged', (event) => {
      console.log('🔄 UIDataSaver: Form data changed, updating session');
      if (event.detail && event.detail.birthData) {
        this.saveSession({ birthData: event.detail.birthData });
      }
    });

    console.log('✅ UIDataSaver: Browser event listeners initialized');
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
