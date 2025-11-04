/**
 * UIDataSaver - Enhanced session persistence and browser storage management
 * Handles structured data storage across browser sessions with quota management
 * Supports: birthData, coordinates, apiRequest, apiResponse (chart, navamsa, analysis)
 * Singleton pattern implementation with canonical cache keys and TTL-based staleness detection
 */

// Import cache infrastructure utilities
import { CACHE_KEYS } from '../../utils/cacheKeys.js';
import jsonSafe from '../../utils/jsonSafe.js';
import { stamp, isFresh, hash, canonical } from '../../utils/cachePolicy.js';

// In-memory cache for performance (per-tab session-scoped)
const MEM = {
  birth: null
};

class UIDataSaver {
  constructor() {
    // Prevent direct instantiation
    if (UIDataSaver.instance) {
      return UIDataSaver.instance;
    }

    this.storageKey = 'jyotish_shastra_data';
    this.sessionKey = CACHE_KEYS.SESSION;
    this.maxStorageSize = 5 * 1024 * 1024; // 5MB limit

    // Store the singleton instance
    UIDataSaver.instance = this;
  }

  /**
   * Helper for safe data serialization - reduces JSON.stringify usage
   * @deprecated Use jsonSafe.stringify() instead
   * @param {*} data - Data to serialize
   * @returns {string} Serialized string
   */
  static safeSerialize(data) {
    return jsonSafe.stringify(data) || '{}';
  }

  /**
   * Helper for safe data deserialization - reduces JSON.parse usage
   * @deprecated Use jsonSafe.parse() instead
   * @param {string} jsonString - String to deserialize
   * @returns {*} Deserialized data
   */
  static safeDeserialize(jsonString) {
    return jsonSafe.parse(jsonString);
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
   * CANONICAL: Save birth data with TTL stamping
   * CRITICAL: This is the ONLY method that should write birth data
   * Writes to sessionStorage[CACHE_KEYS.BIRTH_DATA] only
   * @param {Object} birthData - Birth data to save
   * @returns {boolean} True if save succeeded
   */
  setBirthData(birthData) {
    if (!birthData || typeof birthData !== 'object') {
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[UIDataSaver] setBirthData: Invalid birth data, must be an object');
      }
      return false;
    }

    try {
      // Stamp data with metadata
      const stamped = stamp(birthData);
      
      // Write ONLY to canonical key
      const serialized = jsonSafe.stringify(stamped);
      if (!serialized) {
        console.error('[UIDataSaver] setBirthData: Failed to serialize stamped data');
        return false;
      }
      
      sessionStorage.setItem(CACHE_KEYS.BIRTH_DATA, serialized);
      
      // Update in-memory cache
      MEM.birth = stamped;
      
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[UIDataSaver] setBirthData: Saved to canonical key', {
          key: CACHE_KEYS.BIRTH_DATA,
          dataHash: stamped.meta.dataHash,
          savedAt: new Date(stamped.meta.savedAt).toISOString()
        });
      }
      
      return true;
    } catch (error) {
      console.error('[UIDataSaver] setBirthData: Error saving birth data:', error.message);
      return false;
    }
  }

  /**
   * CANONICAL: Get birth data with anti-stale validation
   * CRITICAL: Returns {data, meta} or null (never stale data)
   * Read priority: memory → canonical → legacy (with migration)
   * @returns {{data: Object, meta: {savedAt: number, dataHash: string, version: number}}|null}
   */
  getBirthData() {
    try {
      // Priority 1: In-memory cache (if present and fresh)
      if (MEM.birth && isFresh(MEM.birth)) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[UIDataSaver] getBirthData: Returning from memory cache');
        }
        return MEM.birth;
      }

      // Priority 2: Canonical key (PRIMARY FIX - moved from position 5 to position 2)
      const directRaw = sessionStorage.getItem(CACHE_KEYS.BIRTH_DATA);
      if (directRaw) {
        const direct = jsonSafe.parse(directRaw);
        if (direct && direct.data && direct.meta) {
          // Validate freshness
          if (!isFresh(direct)) {
            if (process.env.NODE_ENV !== 'production') {
              console.debug('[UIDataSaver] getBirthData: Canonical key data is stale, rejecting');
            }
            // Clear stale data
            sessionStorage.removeItem(CACHE_KEYS.BIRTH_DATA);
            MEM.birth = null;
            return null;
          }
          
          // Update memory cache
          MEM.birth = direct;
          
          if (process.env.NODE_ENV !== 'production') {
            console.debug('[UIDataSaver] getBirthData: Returning from canonical key', {
              dataHash: direct.meta.dataHash,
              age: Date.now() - direct.meta.savedAt
            });
          }
          
          return direct;
        }
      }

      // Priority 3: Legacy container (current_session) - migrate to canonical
      const sessRaw = sessionStorage.getItem(CACHE_KEYS.SESSION);
      if (sessRaw) {
        const sess = jsonSafe.parse(sessRaw);
        if (sess && sess.birthData) {
          if (process.env.NODE_ENV !== 'production') {
            console.debug('[UIDataSaver] getBirthData: Migrating from legacy SESSION key to canonical');
          }
          
          // Migrate to canonical format
          const stamped = stamp(sess.birthData);
          sessionStorage.setItem(CACHE_KEYS.BIRTH_DATA, jsonSafe.stringify(stamped));
          MEM.birth = stamped;
          return stamped;
        }
      }

      // Priority 4: Legacy dedicated key (birth_data_session) - migrate to canonical
      const legacyRaw = sessionStorage.getItem(CACHE_KEYS.BIRTH_DATA_SESSION);
      if (legacyRaw) {
        const legacy = jsonSafe.parse(legacyRaw);
        if (legacy) {
          if (process.env.NODE_ENV !== 'production') {
            console.debug('[UIDataSaver] getBirthData: Migrating from legacy BIRTH_DATA_SESSION key to canonical');
          }
          
          // Migrate to canonical format
          const stamped = stamp(legacy);
          sessionStorage.setItem(CACHE_KEYS.BIRTH_DATA, jsonSafe.stringify(stamped));
          MEM.birth = stamped;
          return stamped;
        }
      }

      // Priority 5: Check localStorage for form persistence (cross-session)
      const localRaw = localStorage.getItem(`${this.storageKey}_birthData`);
      if (localRaw) {
        const local = jsonSafe.parse(localRaw);
        if (local) {
          if (process.env.NODE_ENV !== 'production') {
            console.debug('[UIDataSaver] getBirthData: Migrating from localStorage to canonical');
          }
          
          // Migrate to canonical format in sessionStorage
          const stamped = stamp(local);
          sessionStorage.setItem(CACHE_KEYS.BIRTH_DATA, jsonSafe.stringify(stamped));
          MEM.birth = stamped;
          return stamped;
        }
      }

      // No valid birth data found
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[UIDataSaver] getBirthData: No birth data found in any storage location');
      }
      return null;

    } catch (error) {
      console.error('[UIDataSaver] getBirthData: Error retrieving birth data:', error.message);
      return null;
    }
  }

  /**
   * Record last chart generation metadata
   * Used for staleness detection and chart tracking
   * @param {string} chartId - Chart identifier
   * @param {Object} birthData - Birth data used for chart (optional, will get from storage if not provided)
   * @returns {boolean} True if saved successfully
   */
  setLastChart(chartId, birthData) {
    if (!chartId) {
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[UIDataSaver] setLastChart: No chartId provided');
      }
      return false;
    }

    try {
      // Get birth data if not provided
      const bData = birthData || this.getBirthData()?.data || null;
      
      const record = {
        chartId,
        birthDataHash: bData ? hash(canonical(bData)) : null,
        savedAt: Date.now()
      };
      
      const serialized = jsonSafe.stringify(record);
      if (!serialized) {
        return false;
      }
      
      sessionStorage.setItem(CACHE_KEYS.LAST_CHART, serialized);
      
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[UIDataSaver] setLastChart: Recorded chart generation', {
          chartId,
          birthDataHash: record.birthDataHash
        });
      }
      
      return true;
    } catch (error) {
      console.error('[UIDataSaver] setLastChart: Error saving last chart:', error.message);
      return false;
    }
  }

  /**
   * Get last chart generation metadata
   * @returns {{chartId: string, birthDataHash: string, savedAt: number}|null}
   */
  getLastChart() {
    try {
      const raw = sessionStorage.getItem(CACHE_KEYS.LAST_CHART);
      if (!raw) {
        return null;
      }
      
      const record = jsonSafe.parse(raw);
      return record && record.chartId ? record : null;
    } catch (error) {
      console.error('[UIDataSaver] getLastChart: Error retrieving last chart:', error.message);
      return null;
    }
  }

  /**
   * Clear birth data from canonical storage
   * Does NOT clear legacy keys (preserves upgrade path)
   */
  clearBirthData() {
    try {
      MEM.birth = null;
      sessionStorage.removeItem(CACHE_KEYS.BIRTH_DATA);
      
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[UIDataSaver] clearBirthData: Cleared canonical birth data');
      }
    } catch (error) {
      console.error('[UIDataSaver] clearBirthData: Error clearing birth data:', error.message);
    }
  }

  /**
   * Save enhanced session data with structured format
   * Now uses canonical setBirthData() for birth data persistence
   * @param {Object} data - Data to save with structured format
   * @returns {Object} Save operation result
   */
  saveSession(data) {
    try {
      const currentSession = this.loadSession();

      // If birth data is provided, save it via canonical method
      if (data.birthData) {
        this.setBirthData(data.birthData);
      }

      // Create enhanced session structure (legacy container, kept for backward compatibility)
      const enhancedSessionData = {
        birthData: data.birthData || currentSession?.currentSession?.birthData || null,
        coordinates: data.coordinates || currentSession?.currentSession?.coordinates || null,
        apiRequest: data.apiRequest || currentSession?.currentSession?.apiRequest || null,
        apiResponse: data.apiResponse || currentSession?.currentSession?.apiResponse || null,
        timestamp: new Date().toISOString(),
        sessionId: this.generateSessionId(),
        ...data // Allow additional properties
      };

      // Save to sessionStorage for current session (legacy container, backward compatibility)
      sessionStorage.setItem(this.sessionKey, UIDataSaver.safeSerialize(enhancedSessionData));

      // Save user preferences to localStorage
      if (data.preferences) {
        localStorage.setItem(`${this.storageKey}_preferences`, UIDataSaver.safeSerialize(data.preferences));
      }

      // Optional: Save birth data to localStorage for form persistence across browser sessions
      if (enhancedSessionData.birthData) {
        localStorage.setItem(`${this.storageKey}_birthData`, UIDataSaver.safeSerialize(enhancedSessionData.birthData));
      }

      return {
        success: true,
        sessionId: enhancedSessionData.sessionId,
        savedAt: enhancedSessionData.timestamp
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
        this.clearOldChartData();
        
        const chartDataKey = `jyotish_api_chart_generate_${Date.now()}`;
        sessionStorage.setItem(chartDataKey, UIDataSaver.safeSerialize({
          success: apiResponseData.success || true,
          chart: apiResponseData.chart || apiResponseData.rasiChart,
          timestamp: timestamp
        }));
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

      this.clearOldComprehensiveAnalysis();

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
      
      return this.saveApiResponse(comprehensiveData);
    } catch (error) {
      console.error('❌ UIDataSaver: Error saving comprehensive analysis:', error.message || error.toString());
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear old comprehensive analysis data to prevent stale cache
   */
  clearOldComprehensiveAnalysis() {
    try {
      const keys = Object.keys(sessionStorage);
      const oldKeys = keys.filter(key => key.startsWith('jyotish_api_analysis_comprehensive_'));
      
      oldKeys.forEach(key => {
        sessionStorage.removeItem(key);
      });
    } catch (error) {
      console.error('❌ UIDataSaver: Error clearing old comprehensive analysis:', error.message || error.toString());
    }
  }

  /**
   * Clear old chart data to prevent stale cache
   */
  clearOldChartData() {
    try {
      const keys = Object.keys(sessionStorage);
      const oldKeys = keys.filter(key => key.startsWith('jyotish_api_chart_'));
      
      oldKeys.forEach(key => {
        sessionStorage.removeItem(key);
      });
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
      const session = this.loadSession();
      if (session?.currentSession?.apiResponse?.analysis) return session.currentSession.apiResponse;

      const keys = Object.keys(sessionStorage);
      const comprehensiveKeys = keys.filter(key => key.startsWith('jyotish_api_analysis_comprehensive_'));
      if (comprehensiveKeys.length > 0) {
        const latestKey = comprehensiveKeys.sort().pop();
        return UIDataSaver.safeDeserialize(sessionStorage.getItem(latestKey));
      }

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
   * Get chart data specifically
   * @returns {Object} Chart data or null
   */
  getChartData() {
    try {
      const session = this.loadSession();
      return session?.currentSession?.apiResponse?.chart || null;
    } catch (error) {
      console.error('❌ UIDataSaver: Error getting chart data:', error.message || error.toString());
      return null;
    }
  }

  /**
   * Get analysis data specifically
   * @returns {Object} Analysis data or null
   */
  getAnalysisData() {
    try {
      const session = this.loadSession();

      const sections = session?.currentSession?.apiResponse?.sections ||
                       session?.currentSession?.apiResponse?.comprehensiveAnalysis;

      if (sections) {
        return {
          sections: sections,
          success: true
        };
      }

      const analysisData = session?.currentSession?.apiResponse?.analysis;
      return analysisData || null;
    } catch (error) {
      console.error('❌ UIDataSaver: Error getting analysis data:', error.message || error.toString());
      return null;
    }
  }

  /**
   * Get individual analysis type data
   * @param {string} analysisType - Type of analysis
   * @returns {Object} Individual analysis data or null
   */
  getIndividualAnalysis(analysisType) {
    try {
      const session = this.loadSession();
      const sessionAnalysisData = session?.currentSession?.analysis_data;

      if (sessionAnalysisData?.[analysisType]) {
        return sessionAnalysisData[analysisType];
      }

      const apiKeys = Object.keys(sessionStorage).filter(key =>
        key.startsWith(`jyotish_api_analysis_${analysisType}_`)
      );

      if (apiKeys.length > 0) {
        const latestKey = apiKeys.sort().pop();
        return UIDataSaver.safeDeserialize(sessionStorage.getItem(latestKey));
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

      const analysisData = {
        success: apiResponse.success || true,
        analysis: apiResponse.analysis || apiResponse,
        timestamp: new Date().toISOString(),
        analysisType: analysisType,
        metadata: apiResponse.metadata || null
      };

      sessionStorage.setItem(key, UIDataSaver.safeSerialize(analysisData));

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
   * Save individual analysis data
   * @param {string} analysisType - Type of analysis
   * @param {Object} analysisData - Analysis data to save
   * @returns {Object} Save operation result
   */
  saveIndividualAnalysis(analysisType, analysisData) {
    return this.saveApiAnalysisResponse(analysisType, analysisData);
  }

  /**
   * Load saved session data with enhanced structure
   * @returns {Object} Loaded session data or null
   */
  loadSession() {
    try {
      let currentSession = null;
      try {
        const sessionData = sessionStorage.getItem(this.sessionKey);
        if (sessionData) {
          currentSession = UIDataSaver.safeDeserialize(sessionData);
        }
      } catch (sessionError) {
        console.error('❌ UIDataSaver: Error parsing session data:', sessionError.message);
        sessionStorage.removeItem(this.sessionKey);
      }

      let preferences = null;
      try {
        const preferencesData = localStorage.getItem(`${this.storageKey}_preferences`);
        if (preferencesData) {
          preferences = UIDataSaver.safeDeserialize(preferencesData);
        }
      } catch (prefsError) {
        console.error('❌ UIDataSaver: Error parsing preferences data:', prefsError.message);
        localStorage.removeItem(`${this.storageKey}_preferences`);
      }

      let birthData = null;
      try {
        const birthDataStr = localStorage.getItem(`${this.storageKey}_birthData`);
        if (birthDataStr) {
          birthData = UIDataSaver.safeDeserialize(birthDataStr);
        }
      } catch (birthError) {
        console.error('❌ UIDataSaver: Error parsing birth data:', birthError.message);
        localStorage.removeItem(`${this.storageKey}_birthData`);
      }

      return {
        currentSession,
        preferences,
        birthData,
        loadedAt: new Date().toISOString()
      };
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'string' 
          ? error 
          : String(error);
      
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

    const expiryTime = 30 * 24 * 60 * 60 * 1000; // 30 days
    const now = Date.now();

    keysToCheck.forEach(key => {
      const data = UIDataSaver.safeDeserialize(localStorage.getItem(key));
      if (data?.timestamp && (now - new Date(data.timestamp).getTime() > expiryTime)) {
        localStorage.removeItem(key);
      } else if (!data) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Generate unique session ID
   * @returns {string} Unique session identifier
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all saved data
   */
  clearAll() {
    // Clear canonical birth data
    this.clearBirthData();
    
    // Clear legacy keys
    sessionStorage.removeItem(this.sessionKey);
    sessionStorage.removeItem(CACHE_KEYS.BIRTH_DATA_SESSION);
    sessionStorage.removeItem(CACHE_KEYS.LAST_CHART);
    
    // Clear localStorage
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
    window.addEventListener('beforeunload', () => {
      // Keep only essential data, clear volatile API responses
      Object.keys(sessionStorage)
        .filter(key => key.startsWith('jyotish_api_'))
        .forEach(key => sessionStorage.removeItem(key));
    });

    document.addEventListener('formDataChanged', (event) => {
      if (event.detail && event.detail.birthData) {
        this.setBirthData(event.detail.birthData);
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
