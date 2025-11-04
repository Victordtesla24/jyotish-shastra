import { CACHE_KEYS } from '../../utils/cacheKeys.js';
import { jsonSafe } from '../../utils/jsonSafe.js';
import { canonical, hash } from '../../utils/cachePolicy.js';

const STORAGE_PREFIX = 'btr:v2';
const TTL_MS = 15 * 60 * 1000;
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

const debugLog = (...args) => {
  if (!isProduction && typeof console !== 'undefined' && typeof console.debug === 'function') {
    console.debug('[UIDataSaver]', ...args);
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

const safeGet = (key) => {
  const storage = getSessionStorage();
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
  const storage = getSessionStorage();
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
    safeSet(key, null);
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
  return Date.now() - timestamp > ttlMs;
};

const normalizeBirthData = (data) => {
  if (!data || typeof data !== 'object') {
    return null;
  }
  const { name, dateOfBirth, timeOfBirth, latitude, longitude, timezone } = data;
  if (!dateOfBirth || !timeOfBirth || typeof timezone !== 'string' || !timezone) {
    return null;
  }
  const latNum = Number(latitude);
  const lonNum = Number(longitude);
  if (Number.isNaN(latNum) || Number.isNaN(lonNum)) {
    return null;
  }
  const normalizedName =
    typeof name === 'string' && name.trim().length > 0 ? name.trim() : undefined;
  return {
    name: normalizedName,
    dateOfBirth,
    timeOfBirth,
    latitude: latNum,
    longitude: lonNum,
    timezone
  };
};

const prepareBirthDataForStorage = (data) => {
  const normalized = normalizeBirthData(data);
  if (!normalized) {
    return null;
  }
  return {
    ...data,
    name: normalized.name ?? data.name ?? undefined,
    dateOfBirth: normalized.dateOfBirth,
    timeOfBirth: normalized.timeOfBirth,
    latitude: normalized.latitude,
    longitude: normalized.longitude,
    timezone: normalized.timezone
  };
};

const isValidBirthData = (data) => Boolean(normalizeBirthData(data));

const fingerprintBirthData = (data) => {
  const normalized = normalizeBirthData(data);
  if (!normalized) {
    return null;
  }
  const payload = {
    name: normalized.name || '',
    dateOfBirth: normalized.dateOfBirth,
    timeOfBirth: normalized.timeOfBirth,
    latitude: Number(normalized.latitude).toFixed(6),
    longitude: Number(normalized.longitude).toFixed(6),
    timezone: normalized.timezone
  };
  return hash(canonical(payload));
};

const removeLegacyBirthKeys = () => {
  removeSessionKey(CACHE_KEYS.BIRTH_DATA);
  removeSessionKey(CACHE_KEYS.BIRTH_DATA_SESSION);
};

const clearAllV2Keys = () => {
  CANONICAL_KEY_LIST.forEach((key) => safeRemove(key));
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
  const stamped = readSessionKey(CACHE_KEYS.BIRTH_DATA);
  if (stamped && stamped.data && isValidBirthData(stamped.data)) {
    return {
      data: prepareBirthDataForStorage(stamped.data),
      fingerprint: fingerprintBirthData(stamped.data),
      updatedAtISO: nowISO(),
      chartId: stamped?.data?.chartId || null
    };
  }

  const legacyBirth = readSessionKey(CACHE_KEYS.BIRTH_DATA_SESSION);
  if (legacyBirth && isValidBirthData(legacyBirth)) {
    return {
      data: prepareBirthDataForStorage(legacyBirth),
      fingerprint: fingerprintBirthData(legacyBirth),
      updatedAtISO: nowISO()
    };
  }

  const sessionContainer = ensureSession();
  const sessionBirth = sessionContainer?.birthData;
  if (sessionBirth && isValidBirthData(sessionBirth)) {
    return {
      data: prepareBirthDataForStorage(sessionBirth),
      fingerprint: fingerprintBirthData(sessionBirth),
      updatedAtISO: nowISO()
    };
  }

  return null;
};

const migrateLegacyIfPresent = () => {
  if (!isBrowser) {
    return;
  }

  if (readCanonicalBirthData()) {
    return;
  }

  const candidate = readLegacyBirthDataCandidate();
  if (!candidate || !candidate.data || !candidate.fingerprint) {
    removeLegacyBirthKeys();
    return;
  }

  try {
    writeCanonicalBirthData(candidate.data, candidate.fingerprint, candidate.updatedAtISO);
    if (candidate.chartId) {
      safeSet(CANONICAL_KEYS.chartId, String(candidate.chartId));
    }
  } catch (error) {
    errorLog('Failed to migrate legacy birth data', error);
  } finally {
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

  const navEntries =
    typeof performance.getEntriesByType === 'function'
      ? performance.getEntriesByType('navigation')
      : null;

  const navigationEntry = navEntries && navEntries.length > 0 ? navEntries[0] : null;
  const isReload =
    navigationEntry?.type === 'reload' ||
    (performance.navigation && performance.navigation.type === 1);

  if (isReload) {
    clearAllV2Keys();
    console.info('[UIDataSaver] refresh detected → cleared session cache');
  }

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

    const prepared = prepareBirthDataForStorage(birthData);
    if (!prepared) {
      warnLog('Attempted to set birth data with invalid payload.');
      this.clear();
      return false;
    }

    const fingerprint = fingerprintBirthData(prepared);
    if (!fingerprint) {
      warnLog('Unable to compute fingerprint for birth data.');
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
      }
      console.info('[UIDataSaver] setBirthData fp=', fingerprint, 'at', updatedAtISO);
    } catch (error) {
      errorLog('Failed to persist birth data', error);
      return false;
    }

    updateSession((session) => ({
      ...session,
      birthData: prepared
    }));

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
  }
};

if (isBrowser) {
  UIDataSaver.initializeBrowserEvents();
  window.UIDataSaver = UIDataSaver;
}

export default UIDataSaver;

