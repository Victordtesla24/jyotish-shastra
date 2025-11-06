import { CACHE_KEYS } from '../../utils/cacheKeys.js';
import { jsonSafe } from '../../utils/jsonSafe.js';
import { canonical, hash } from '../../utils/cachePolicy.js';

const STORAGE_PREFIX = 'btr:v2';
const TTL_MS = 2 * 60 * 60 * 1000; // Extended to 2 hours for realistic user sessions
const SCHEMA_VERSION = '2';

const CANONICAL_KEYS = {
  birthData: `${STORAGE_PREFIX}:birthData`,
  chartId: `${STORAGE_PREFIX}:chartId`,
  updatedAt: `${STORAGE_PREFIX}:updatedAt`,
  fingerprint: `${STORAGE_PREFIX}:fingerprint`,
  schema: `${STORAGE_PREFIX}:schema`,
  pageLoadId: `${STORAGE_PREFIX}:pageLoadId`
};

const isBrowser = typeof window !== 'undefined';
const isProduction = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production';

const CANONICAL_KEY_LIST = Object.values(CANONICAL_KEYS);

const getSessionStorage = () => (isBrowser ? window.sessionStorage : null);
const getLocalStorage = () => (isBrowser ? window.localStorage : null);

// CRITICAL FIX: Comprehensive logging system for debugging storage issues
const debugLog = (...args) => {
  if (!isProduction && typeof console !== 'undefined' && typeof console.debug === 'function') {
    console.debug('[UIDataSaver]', ...args);
  }
};

const infoLog = (...args) => {
  if (!isProduction && typeof console !== 'undefined' && typeof console.info === 'function') {
    console.info('[UIDataSaver]', ...args);
  }
};

const warnLog = (...args) => {
  if (!isProduction && typeof console !== 'undefined' && typeof console.warn === 'function') {
    console.warn('[UIDataSaver]', ...args);
  }
};

const errorLog = (...args) => {
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error('[UIDataSaver]', ...args);
  }
};

// Storage operation logging with context
const logStorageOperation = (operation, key, result, context = {}) => {
  if (!isProduction) {
    const logData = {
      operation,
      key,
      result,
      timestamp: nowISO(),
      ...context
    };
    debugLog(`Storage ${operation}:`, logData);
  }
};

// Session state logging for debugging
const logSessionState = (method, data) => {
  if (!isProduction) {
    infoLog(`${method} - Session State:`, {
      hasCanonicalData: !!readCanonicalBirthData(),
      sessionKeys: Object.keys(ensureSession()),
      storageKeys: getSessionStorage() ? Object.keys(getSessionStorage()).filter(k => k.includes('btr') || k.includes('session')) : [],
      timestamp: nowISO(),
      dataSize: data ? JSON.stringify(data).length : 0
    });
  }
};

const safeGet = (key) => {
  // CRITICAL FIX: Use global sessionStorage first (matches test environment)
  let storage = null;
  if (isBrowser) {
    if (typeof sessionStorage !== 'undefined') {
      storage = sessionStorage;
    } else {
      storage = getSessionStorage();
    }
  }
  if (!storage) {
    return null;
  }
  try {
    return storage.getItem(key);
  } catch (error) {
    errorLog('Failed to read key', key, error);
    return null;
  }
};

const safeSet = (key, value) => {
  // CRITICAL FIX: Use the same storage access pattern as safeGet() for consistency
  // This ensures we use the exact same storage object in all environments
  let storage = null;
  if (isBrowser) {
    if (typeof sessionStorage !== 'undefined') {
      storage = sessionStorage;
    } else {
      storage = getSessionStorage();
    }
  }
  if (!storage) {
    return;
  }
  try {
    if (value === undefined || value === null) {
      storage.removeItem(key);
    } else {
      storage.setItem(key, value);
    }
  } catch (error) {
    errorLog('Failed to write key', key, error);
    throw error;
  }
};

const safeRemove = (key) => {
  try {
    const sessionStorage = getSessionStorage();
    if (sessionStorage) {
      sessionStorage.removeItem(key);
    }
  } catch (error) {
    errorLog('Failed to remove key', key, error);
  }
};

const safeJSON = (text) => {
  if (!text || typeof text !== 'string') {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch (_error) {
    return null;
  }
};

const nowISO = () => new Date().toISOString();

const isExpired = (updatedAtISO, ttlMs = TTL_MS) => {
  if (!updatedAtISO) {
    return true;
  }
  const timestamp = Date.parse(updatedAtISO);
  if (Number.isNaN(timestamp)) {
    return true;
  }
  const age = Date.now() - timestamp;
  return age > ttlMs;
};

const normalizeBirthData = (data) => {
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Birth data must be a valid object'] };
  }
  
  const { name, dateOfBirth, timeOfBirth, latitude, longitude, timezone } = data;
  const errors = [];
  
  // Detailed validation with specific error messages
  if (!dateOfBirth) {
    errors.push('Date of birth is required');
  }
  if (!timeOfBirth) {
    errors.push('Time of birth is required');
  }
  if (!timezone || typeof timezone !== 'string') {
    errors.push('Valid timezone is required');
  }
  
  const latNum = Number(latitude);
  const lonNum = Number(longitude);
  if (Number.isNaN(latNum) || latNum < -90 || latNum > 90) {
    errors.push('Valid latitude (-90 to 90) is required');
  }
  if (Number.isNaN(lonNum) || lonNum < -180 || lonNum > 180) {
    errors.push('Valid longitude (-180 to 180) is required');
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  const normalizedName =
    typeof name === 'string' && name.trim().length > 0 ? name.trim() : undefined;
  
  return {
    valid: true,
    data: {
      name: normalizedName,
      dateOfBirth,
      timeOfBirth,
      latitude: latNum,
      longitude: lonNum,
      timezone
    }
  };
};

const prepareBirthDataForStorage = (data) => {
  const normalized = normalizeBirthData(data);
  if (!normalized.valid) {
    return null;
  }
  return {
    ...data,
    name: normalized.data.name ?? data.name ?? undefined,
    dateOfBirth: normalized.data.dateOfBirth,
    timeOfBirth: normalized.data.timeOfBirth,
    latitude: normalized.data.latitude,
    longitude: normalized.data.longitude,
    timezone: normalized.data.timezone
  };
};

const isValidBirthData = (data) => {
  const normalized = normalizeBirthData(data);
  return normalized.valid;
};

const fingerprintBirthData = (data) => {
  const normalized = normalizeBirthData(data);
  if (!normalized.valid) {
    return null;
  }
  const payload = {
    name: normalized.data.name || '',
    dateOfBirth: normalized.data.dateOfBirth,
    timeOfBirth: normalized.data.timeOfBirth,
    latitude: Number(normalized.data.latitude).toFixed(6),
    longitude: Number(normalized.data.longitude).toFixed(6),
    timezone: normalized.data.timezone
  };
  return hash(canonical(payload));
};

const removeLegacyBirthKeys = () => {
  removeSessionKey(CACHE_KEYS.BIRTH_DATA);
  removeSessionKey(CACHE_KEYS.BIRTH_DATA_SESSION);
};

const clearAllV2Keys = () => {
  // CRITICAL FIX: Use the exact same storage reference as safeGet() to ensure consistency
  // In test environments, we must use the exact same reference that safeGet() uses
  // This ensures we're operating on the same storage object in all environments
  
  // CRITICAL: Use the exact same logic as safeGet() to get the storage reference
  // Check global sessionStorage first (matches test environment usage)
  let storage = null;
  
  // Always check global sessionStorage first (matches test environment)
  if (typeof sessionStorage !== 'undefined') {
    storage = sessionStorage;
  } else if (isBrowser && typeof window !== 'undefined' && window.sessionStorage) {
    storage = window.sessionStorage;
  } else if (typeof global !== 'undefined' && global.sessionStorage) {
    storage = global.sessionStorage;
  }
  
  if (storage) {
    // CRITICAL: Remove all canonical keys using the same storage reference
    // This ensures we're operating on the exact same storage object that safeGet() uses
    CANONICAL_KEY_LIST.forEach((key) => {
      try {
        // Direct removeItem call on the same storage reference that safeGet() uses
        storage.removeItem(key);
      } catch (error) {
        errorLog('Failed to remove key', key, error);
      }
    });
  }
  removeLegacyBirthKeys();
};

const writeCanonicalBirthData = (data, fingerprint, updatedAtISO) => {
  const operations = [
    [CANONICAL_KEYS.birthData, JSON.stringify(data)],
    [CANONICAL_KEYS.updatedAt, updatedAtISO],
    [CANONICAL_KEYS.fingerprint, fingerprint],
    [CANONICAL_KEYS.schema, SCHEMA_VERSION]
  ];
  try {
    operations.forEach(([key, value]) => safeSet(key, value));
  } catch (error) {
    clearAllV2Keys();
    throw error;
  }
};

const readCanonicalBirthData = () => {
  const birthDataRaw = safeGet(CANONICAL_KEYS.birthData);
  const updatedAtISO = safeGet(CANONICAL_KEYS.updatedAt);
  const fingerprint = safeGet(CANONICAL_KEYS.fingerprint);
  const schema = safeGet(CANONICAL_KEYS.schema);

  if (!birthDataRaw || !updatedAtISO || !fingerprint || schema !== SCHEMA_VERSION) {
    return null;
  }

  if (isExpired(updatedAtISO)) {
    console.info('[UIDataSaver] Data expired, clearing all V2 keys');
    // CRITICAL: Clear all keys before returning null
    // This ensures expired data is removed from storage
    clearAllV2Keys();
    console.info('[UIDataSaver] expired birthData cleared');
    return null;
  }

  const birthData = safeJSON(birthDataRaw);
  if (!isValidBirthData(birthData)) {
    clearAllV2Keys();
    return null;
  }

  return {
    data: birthData,
    meta: {
      savedAtISO: updatedAtISO,
      fingerprint,
      schema: SCHEMA_VERSION
    }
  };
};

const writeSessionKey = (key, value) => {
  const storage = getSessionStorage();
  if (!storage) {
    return false;
  }

  if (value === null || value === undefined) {
    storage.removeItem(key);
    return true;
  }

  const serialized = jsonSafe.stringify(value);
  if (!serialized) {
    storage.removeItem(key);
    return false;
  }

  try {
    storage.setItem(key, serialized);
    return true;
  } catch (error) {
    errorLog('Failed to write session key', key, error);
    return false;
  }
};

const readSessionKey = (key) => {
  const storage = getSessionStorage();
  if (!storage) {
    return null;
  }

  try {
    return jsonSafe.parse(storage.getItem(key));
  } catch (error) {
    errorLog('Failed to read session key', key, error);
    storage.removeItem(key);
    return null;
  }
};

const removeSessionKey = (key) => {
  const storage = getSessionStorage();
  if (!storage) {
    return;
  }

  try {
    storage.removeItem(key);
  } catch (error) {
    errorLog('Failed to remove session key', key, error);
  }
};

const readLocalKey = (key) => {
  const storage = getLocalStorage();
  if (!storage) {
    return null;
  }

  try {
    return jsonSafe.parse(storage.getItem(key));
  } catch (error) {
    errorLog('Failed to read local key', key, error);
    storage.removeItem(key);
    return null;
  }
};

const writeLocalKey = (key, value) => {
  const storage = getLocalStorage();
  if (!storage) {
    return false;
  }

  if (value === null || value === undefined) {
    storage.removeItem(key);
    return true;
  }

  const serialized = jsonSafe.stringify(value);
  if (!serialized) {
    storage.removeItem(key);
    return false;
  }

  try {
    storage.setItem(key, serialized);
    return true;
  } catch (error) {
    errorLog('Failed to write local key', key, error);
    return false;
  }
};

const ensureSession = () => {
  const existing = readSessionKey(CACHE_KEYS.SESSION);
  if (existing && typeof existing === 'object') {
    return existing;
  }
  return {};
};

const updateSession = (updater) => {
  const current = ensureSession();
  const draft = { ...current };
  const result = typeof updater === 'function' ? updater(draft) : draft;
  const next = result && typeof result === 'object' ? result : draft;
  next.updatedAt = nowISO();
  writeSessionKey(CACHE_KEYS.SESSION, next);
  return next;
};

const readLegacyBirthDataCandidate = () => {
  // CRITICAL FIX: Simplified legacy migration - check only most common legacy keys
  const legacyKeys = [
    CACHE_KEYS.BIRTH_DATA,
    CACHE_KEYS.BIRTH_DATA_SESSION
  ];

  for (const key of legacyKeys) {
    const legacyData = readSessionKey(key);
    
    // Handle both stamped and direct data formats
    const birthData = legacyData?.data || legacyData;
    
    if (birthData && isValidBirthData(birthData)) {
      return {
        data: prepareBirthDataForStorage(birthData),
        fingerprint: fingerprintBirthData(birthData),
        updatedAtISO: nowISO(),
        chartId: legacyData?.chartId || null
      };
    }
  }

  return null;
};

const migrateLegacyIfPresent = () => {
  if (!isBrowser) {
    return;
  }

  // Skip if canonical data already exists
  if (readCanonicalBirthData()) {
    return;
  }

  // CRITICAL FIX: Simplified migration process
  const candidate = readLegacyBirthDataCandidate();
  if (!candidate?.data) {
    removeLegacyBirthKeys();
    return;
  }

  try {
    writeCanonicalBirthData(candidate.data, candidate.fingerprint, candidate.updatedAtISO);
    if (candidate.chartId) {
      safeSet(CANONICAL_KEYS.chartId, String(candidate.chartId));
    }
    console.info('[UIDataSaver] Legacy data migrated successfully');
    // CRITICAL FIX: Clear legacy keys after successful migration
    removeLegacyBirthKeys();
  } catch (error) {
    errorLog('Failed to migrate legacy birth data', error);
    // Clear problematic legacy data on migration failure
    removeLegacyBirthKeys();
  }
};

const generatePageLoadId = () => {
  if (!isBrowser) {
    return '';
  }
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `pl-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const detectReloadAndClear = () => {
  if (!isBrowser || typeof performance === 'undefined') {
    return;
  }

  // CRITICAL FIX: Disable aggressive clearing - only clear on hard refresh (F5/Ctrl+R)
  // Remove automatic clearing that was destroying user data on navigation
  console.info('[UIDataSaver] Page load detected - preserving existing data');

  const pageLoadId = generatePageLoadId();
  try {
    safeSet(CANONICAL_KEYS.pageLoadId, pageLoadId);
  } catch (error) {
    errorLog('Failed to assign pageLoadId', error);
  }
};

if (isBrowser) {
  detectReloadAndClear();
  migrateLegacyIfPresent();
}

const UIDataSaver = {
  getMeta() {
    const canonical = readCanonicalBirthData();
    return canonical ? canonical.meta : null;
  },

  setBirthData(birthData) {
    if (!isBrowser) {
      return false;
    }

    logStorageOperation('setBirthData', 'attempting', 'start', { dataReceived: !!birthData });

    const prepared = prepareBirthDataForStorage(birthData);
    if (!prepared) {
      warnLog('Attempted to set birth data with invalid payload.');
      logStorageOperation('setBirthData', 'validation', 'failed', { reason: 'invalid_payload' });
      this.clear();
      return false;
    }

    const fingerprint = fingerprintBirthData(prepared);
    if (!fingerprint) {
      warnLog('Unable to compute fingerprint for birth data.');
      logStorageOperation('setBirthData', 'fingerprint', 'failed', { reason: 'fingerprint_generation' });
      this.clear();
      return false;
    }

    const previous = readCanonicalBirthData();
    const previousFingerprint = previous?.meta?.fingerprint || null;
    const updatedAtISO = nowISO();

    try {
      writeCanonicalBirthData(prepared, fingerprint, updatedAtISO);
      if (previousFingerprint && previousFingerprint !== fingerprint) {
        safeRemove(CANONICAL_KEYS.chartId);
        logStorageOperation('setBirthData', 'chartId', 'cleared', { reason: 'fingerprint_change' });
      }
      logStorageOperation('setBirthData', 'canonical', 'success', { fingerprint, previousFingerprint });
      console.info('[UIDataSaver] setBirthData fp=', fingerprint, 'at', updatedAtISO);
    } catch (error) {
      errorLog('Failed to persist birth data', error);
      logStorageOperation('setBirthData', 'canonical', 'error', { error: error.message });
      return false;
    }

    updateSession((session) => ({
      ...session,
      birthData: prepared
    }));

    logSessionState('setBirthData', prepared);
    return true;
  },

  getBirthData() {
    if (!isBrowser) {
      return null;
    }

    let canonical = readCanonicalBirthData();
    if (canonical) {
      return canonical;
    }

    migrateLegacyIfPresent();
    canonical = readCanonicalBirthData();
    return canonical;
  },

  setChartId(chartId) {
    if (!isBrowser) {
      return;
    }

    if (!chartId) {
      warnLog('setChartId called without chartId.');
      return;
    }

    const value = String(chartId);
    const updatedAtISO = nowISO();
    try {
      safeSet(CANONICAL_KEYS.chartId, value);
      safeSet(CANONICAL_KEYS.updatedAt, updatedAtISO);
    } catch (error) {
      errorLog('Failed to persist chart id', error);
      clearAllV2Keys();
      return;
    }

    updateSession((session) => ({
      ...session,
      lastChartId: value
    }));
  },

  getChartId() {
    if (!isBrowser) {
      return null;
    }

    const updatedAtISO = safeGet(CANONICAL_KEYS.updatedAt);
    if (!updatedAtISO) {
      return null;
    }

    if (isExpired(updatedAtISO)) {
      clearAllV2Keys();
      console.info('[UIDataSaver] expired birthData cleared');
      return null;
    }

    const chartId = safeGet(CANONICAL_KEYS.chartId);
    return chartId || null;
  },

  clear() {
    clearAllV2Keys();
    removeLegacyBirthKeys();
    updateSession((session) => {
      const next = { ...session };
      delete next.birthData;
      delete next.lastChartId;
      return next;
    });
  },

  clearBirthData() {
    this.clear();
  },

  setLastChart(chartId, birthData) {
    if (!chartId) {
      warnLog('setLastChart called without chartId.');
      return;
    }

    this.setChartId(chartId);
    const payload = birthData || this.getBirthData()?.data || null;
    const record = {
      chartId: String(chartId),
      birthDataHash: payload ? fingerprintBirthData(payload) : null,
      savedAt: Date.now()
    };
    writeSessionKey(CACHE_KEYS.LAST_CHART, record);
  },

  saveSession(payload = {}) {
    try {
      if (payload.birthData) {
        this.setBirthData(payload.birthData);
      }

      if (payload.preferences) {
        writeLocalKey(`${STORAGE_PREFIX}:preferences`, payload.preferences);
      }

      updateSession((session) => ({
        ...session,
        ...payload,
        sessionId: session.sessionId || this.generateSessionId()
      }));

      return { success: true };
    } catch (error) {
      errorLog('Error saving session', error);
      if (error?.name === 'QuotaExceededError') {
        this.clearExpiredData();
        return { success: false, error: 'Storage quota exceeded. Old data cleared.' };
      }
      return { success: false, error: error?.message || 'Unknown error' };
    }
  },

  saveApiResponse(apiResponse) {
    try {
      if (!apiResponse || typeof apiResponse !== 'object') {
        throw new Error('API response payload required');
      }

      updateSession((session) => ({
        ...session,
        apiResponse: {
          ...(session.apiResponse || {}),
          ...apiResponse,
          timestamp: nowISO()
        }
      }));

      if (apiResponse.chart && apiResponse.chart.chartId) {
        this.setLastChart(apiResponse.chart.chartId, this.getBirthData()?.data || null);
      }

      return { success: true };
    } catch (error) {
      errorLog('Error saving API response', error);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  },

  saveComprehensiveAnalysis(analysisData) {
    try {
      if (!analysisData || typeof analysisData !== 'object') {
        throw new Error('Comprehensive analysis payload required');
      }

      const timestamp = nowISO();

      updateSession((session) => ({
        ...session,
        comprehensiveAnalysis: {
          ...(session.comprehensiveAnalysis || {}),
          ...analysisData,
          timestamp
        }
      }));

      writeSessionKey('comprehensive_analysis_data', {
        ...analysisData,
        timestamp
      });

      return { success: true };
    } catch (error) {
      errorLog('Error saving comprehensive analysis', error);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  },

  getComprehensiveAnalysis() {
    const session = ensureSession();
    return session.comprehensiveAnalysis || session.apiResponse || null;
  },

  getChartData() {
    const session = ensureSession();
    return session.apiResponse?.chart || null;
  },

  getAnalysisData() {
    const session = ensureSession();
    return session.apiResponse?.analysis || null;
  },

  getIndividualAnalysis(analysisType) {
    if (!analysisType) {
      return null;
    }

    const session = ensureSession();
    return session.analysis?.[analysisType] || null;
  },

  saveApiAnalysisResponse(analysisType, apiResponse) {
    try {
      if (!analysisType) {
        throw new Error('analysisType is required');
      }

      updateSession((session) => {
        const analysis = { ...(session.analysis || {}) };
        analysis[analysisType] = {
          ...apiResponse,
          timestamp: nowISO()
        };
        session.analysis = analysis;
        return session;
      });

      return { success: true };
    } catch (error) {
      errorLog(`Error saving ${analysisType} analysis`, error);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  },

  saveIndividualAnalysis(analysisType, analysisData) {
    return this.saveApiAnalysisResponse(analysisType, analysisData);
  },

  getHousesAnalysis() {
    return this.getIndividualAnalysis('houses');
  },

  getDashaAnalysis() {
    return this.getIndividualAnalysis('dasha');
  },

  getNavamsaAnalysis() {
    return this.getIndividualAnalysis('navamsa');
  },

  getAspectsAnalysis() {
    return this.getIndividualAnalysis('aspects');
  },

  getArudhaAnalysis() {
    return this.getIndividualAnalysis('arudha');
  },

  getLagnaAnalysis() {
    return this.getIndividualAnalysis('lagna');
  },

  getPreliminaryAnalysis() {
    return this.getIndividualAnalysis('preliminary');
  },

  loadSession() {
    try {
      const currentSession = ensureSession();
      const preferences = readLocalKey(`${STORAGE_PREFIX}:preferences`);
      const birthStamped = this.getBirthData();
      const birthData = birthStamped ? birthStamped.data : null;

      return {
        currentSession,
        preferences,
        birthData,
        meta: {
          birthDataMeta: birthStamped ? birthStamped.meta : null
        },
        loadedAt: nowISO()
      };
    } catch (error) {
      errorLog('Error loading session data', error);
      return null;
    }
  },

  hasCompleteSession() {
    const session = ensureSession();
    return Boolean(session.birthData && session.apiResponse?.chart);
  },

  clearExpiredData() {
    const storage = getLocalStorage();
    if (!storage) {
      return;
    }

    const now = Date.now();
    const expiryMs = 30 * 24 * 60 * 60 * 1000;

    Object.keys(storage)
      .filter((key) => key.startsWith(STORAGE_PREFIX))
      .forEach((key) => {
        const value = readLocalKey(key);
        const timestamp = value?.timestamp;
        if (!value || (timestamp && now - Date.parse(timestamp) > expiryMs)) {
          storage.removeItem(key);
        }
      });
  },

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  },

  clearAll() {
    this.clear();
    removeSessionKey(CACHE_KEYS.SESSION);
    removeSessionKey('comprehensive_analysis_data');

    const localStorage = getLocalStorage();
    if (localStorage) {
      Object.keys(localStorage)
        .filter((key) => key.startsWith(STORAGE_PREFIX))
        .forEach((key) => localStorage.removeItem(key));
    }
  },

  initializeBrowserEvents() {
    if (!isBrowser || typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    window.addEventListener('beforeunload', () => {
      try {
        safeSet(CANONICAL_KEYS.updatedAt, nowISO());
      } catch (error) {
        errorLog('Failed to refresh timestamp on unload', error);
      }
    });

    document.addEventListener('formDataChanged', (event) => {
      const detail = event?.detail;
      if (detail?.birthData) {
        UIDataSaver.setBirthData(detail.birthData);
      }
      if (detail?.chartId) {
        UIDataSaver.setChartId(detail.chartId);
      }
    });
  },

  triggerFormDataChange(newData) {
    if (!isBrowser) {
      return;
    }
    const event = new CustomEvent('formDataChanged', { detail: newData });
    document.dispatchEvent(event);
  },

  // CRITICAL FIX: Storage diagnostics for system health monitoring
  getDiagnostics() {
    if (!isBrowser) {
      return { error: 'Not in browser environment' };
    }

    const sessionStorage = getSessionStorage();
    const localStorage = getLocalStorage();
    const canonical = readCanonicalBirthData();
    const session = ensureSession();
    const timestamp = nowISO();

    // Calculate storage usage
    const getStorageUsage = (storage, prefix) => {
      if (!storage) return { keys: 0, totalSize: 0, prefixedKeys: 0, prefixedSize: 0 };
      
      const allKeys = Object.keys(storage);
      const prefixedKeys = allKeys.filter(k => k.startsWith(prefix));
      
      const totalSize = allKeys.reduce((size, key) => {
        const value = storage.getItem(key) || '';
        return size + key.length + value.length;
      }, 0);
      
      const prefixedSize = prefixedKeys.reduce((size, key) => {
        const value = storage.getItem(key) || '';
        return size + key.length + value.length;
      }, 0);

      return {
        keys: allKeys.length,
        totalSize,
        prefixedKeys: prefixedKeys.length,
        prefixedSize,
        prefixedKeysList: prefixedKeys
      };
    };

    const sessionUsage = getStorageUsage(sessionStorage, STORAGE_PREFIX);
    const localUsage = getStorageUsage(localStorage, STORAGE_PREFIX);

    // Data integrity checks
    const dataIntegrity = {
      hasCanonicalData: !!canonical,
      canonicalDataValid: canonical ? isValidBirthData(canonical.data) : false,
      sessionDataExists: Object.keys(session).length > 0,
      schemaVersion: canonical?.meta?.schema || 'none',
      fingerprintConsistent: canonical ? fingerprintBirthData(canonical.data) === canonical.meta.fingerprint : false,
      ttlStatus: canonical ? (isExpired(canonical.meta.savedAtISO) ? 'expired' : 'valid') : 'no_data'
    };

    // Performance metrics
    const performanceMetrics = {
      canonicalReadTime: (() => {
        const start = performance.now();
        readCanonicalBirthData();
        return performance.now() - start;
      })(),
      sessionReadTime: (() => {
        const start = performance.now();
        ensureSession();
        return performance.now() - start;
      })()
    };

    return {
      timestamp,
      version: SCHEMA_VERSION,
      ttl: TTL_MS / 1000 / 60, // TTL in minutes
      
      storage: {
        sessionStorage: {
          available: !!sessionStorage,
          usage: sessionUsage
        },
        localStorage: {
          available: !!localStorage,
          usage: localUsage
        }
      },
      
      dataIntegrity,
      performanceMetrics,
      
      // Health summary
      health: {
        overall: dataIntegrity.hasCanonicalData && dataIntegrity.canonicalDataValid && 
                 dataIntegrity.fingerprintConsistent && dataIntegrity.ttlStatus === 'valid' ? 'healthy' : 'issues',
        issues: [
          ...(!dataIntegrity.hasCanonicalData ? ['no_canonical_data'] : []),
          ...(!dataIntegrity.canonicalDataValid ? ['invalid_canonical_data'] : []),
          ...(!dataIntegrity.fingerprintConsistent ? ['fingerprint_mismatch'] : []),
          ...(dataIntegrity.ttlStatus === 'expired' ? ['data_expired'] : []),
          ...(performanceMetrics.canonicalReadTime > 100 ? ['slow_read_performance'] : []),
          ...(sessionUsage.totalSize > 5 * 1024 * 1024 ? ['high_storage_usage'] : []) // 5MB threshold
        ]
      }
    };
  },

  // Storage cleanup utilities
  runStorageCleanup(options = {}) {
    if (!isBrowser) {
      return { success: false, error: 'Not in browser environment' };
    }

    const { 
      clearExpired = true, 
      clearLegacy = true, 
      clearOrphaned = true,
      dryRun = false 
    } = options;

    const actions = [];
    const sessionStorage = getSessionStorage();
    getLocalStorage();

    try {
      // Clear expired data
      if (clearExpired && !dryRun) {
        this.clearExpiredData();
        actions.push('cleared_expired_data');
      } else if (clearExpired) {
        actions.push('would_clear_expired_data');
      }

      // Clear legacy keys
      if (clearLegacy) {
        if (!dryRun) {
          removeLegacyBirthKeys();
          actions.push('cleared_legacy_keys');
        } else {
          actions.push('would_clear_legacy_keys');
        }
      }

      // Clear orphaned keys (keys that don't match our patterns)
      if (clearOrphaned && sessionStorage) {
        const orphanedKeys = Object.keys(sessionStorage).filter(key => 
          key.includes('birth') || key.includes('chart') || key.includes('session')
        ).filter(key => 
          !key.startsWith(STORAGE_PREFIX) && 
          !Object.values(CACHE_KEYS).includes(key) &&
          !['current_session', 'jyotish_chart_generated', 'jyotish_session_timestamp'].includes(key)
        );

        if (orphanedKeys.length > 0) {
          if (!dryRun) {
            orphanedKeys.forEach(key => sessionStorage.removeItem(key));
            actions.push(`cleared_${orphanedKeys.length}_orphaned_keys`);
          } else {
            actions.push(`would_clear_${orphanedKeys.length}_orphaned_keys`);
          }
        }
      }

      return {
        success: true,
        actions,
        timestamp: nowISO()
      };
    } catch (error) {
      errorLog('Storage cleanup failed', error);
      return {
        success: false,
        error: error.message,
        actions
      };
    }
  },

  // Storage integrity verification
  verifyStorageIntegrity() {
    if (!isBrowser) {
      return { valid: false, error: 'Not in browser environment' };
    }

    const canonical = readCanonicalBirthData();
    const session = ensureSession();
    const issues = [];

    // Check canonical data integrity
    if (canonical) {
      const currentFingerprint = fingerprintBirthData(canonical.data);
      if (currentFingerprint !== canonical.meta.fingerprint) {
        issues.push({
          type: 'fingerprint_mismatch',
          description: 'Data fingerprint does not match stored fingerprint',
          severity: 'high'
        });
      }

      if (isExpired(canonical.meta.savedAtISO)) {
        issues.push({
          type: 'data_expired',
          description: `Data expired (TTL: ${TTL_MS / 1000 / 60} minutes)`,
          severity: 'medium'
        });
      }

      if (!isValidBirthData(canonical.data)) {
        issues.push({
          type: 'invalid_data',
          description: 'Canonical data fails validation',
          severity: 'high'
        });
      }
    } else {
      issues.push({
        type: 'no_canonical_data',
        description: 'No canonical birth data found',
        severity: 'medium'
      });
    }

    // Check session consistency
    if (canonical && session.birthData) {
      const sessionFingerprint = fingerprintBirthData(session.birthData);
      const canonicalFingerprint = canonical.meta.fingerprint;
      
      if (sessionFingerprint !== canonicalFingerprint) {
        issues.push({
          type: 'session_canonical_mismatch',
          description: 'Session data does not match canonical data',
          severity: 'medium'
        });
      }
    }

    return {
      valid: issues.filter(i => i.severity === 'high').length === 0,
      issues,
      timestamp: nowISO(),
      summary: {
        total: issues.length,
        high: issues.filter(i => i.severity === 'high').length,
        medium: issues.filter(i => i.severity === 'medium').length,
        low: issues.filter(i => i.severity === 'low').length
      }
    };
  },

  // Debug information export
  exportDebugInfo() {
    if (!isBrowser) {
      return null;
    }

    const diagnostics = this.getDiagnostics();
    const integrity = this.verifyStorageIntegrity();
    const canonical = readCanonicalBirthData();
    const session = ensureSession();

    return {
      timestamp: nowISO(),
      version: SCHEMA_VERSION,
      ttl_minutes: TTL_MS / 1000 / 60,
      
      diagnostics,
      integrity,
      
      data: {
        canonical: canonical ? {
          hasData: true,
          fingerprint: canonical.meta.fingerprint,
          schema: canonical.meta.schema,
          savedAt: canonical.meta.savedAtISO,
          dataSize: JSON.stringify(canonical.data).length
        } : null,
        
        session: {
          keyCount: Object.keys(session).length,
          hasApiResponse: !!session.apiResponse,
          hasComprehensiveAnalysis: !!session.comprehensiveAnalysis,
          dataSize: JSON.stringify(session).length
        }
      },
      
      environment: {
        userAgent: navigator.userAgent,
        storageQuota: 'sessionStorage' in window && 'localStorage' in window,
        performanceAPI: 'performance' in window,
        cryptoAPI: 'crypto' in window && 'randomUUID' in crypto
      }
    };
  }
};

if (isBrowser) {
  UIDataSaver.initializeBrowserEvents();
  window.UIDataSaver = UIDataSaver;
}

export default UIDataSaver;
