import { CACHE_KEYS } from '../../utils/cacheKeys.js';
import { jsonSafe } from '../../utils/jsonSafe.js';
import { CACHE_TTL_MS, stamp, isFresh, canonical, hash } from '../../utils/cachePolicy.js';

const MEM = { birth: null };
const STORAGE_PREFIX = 'jyotish_shastra_data';

const isBrowser = typeof window !== 'undefined';
const isProduction = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production';

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

const sanitizeBirthData = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const {
    name,
    dateOfBirth,
    timeOfBirth,
    placeOfBirth,
    latitude,
    longitude,
    timezone,
    gender,
    chartId
  } = payload;

  const sanitized = {
    name: name ?? null,
    dateOfBirth: dateOfBirth ?? null,
    timeOfBirth: timeOfBirth ?? null,
    placeOfBirth: placeOfBirth ?? null,
    latitude: latitude ?? null,
    longitude: longitude ?? null,
    timezone: timezone ?? null,
    gender: gender ?? null
  };

  if (chartId) {
    sanitized.chartId = chartId;
  }

  Object.keys(sanitized).forEach((key) => {
    if (sanitized[key] === null || sanitized[key] === undefined) {
      delete sanitized[key];
    }
  });

  return sanitized;
};

const updateSession = (updater) => {
  const current = ensureSession();
  const draft = { ...current };
  const result = typeof updater === 'function' ? updater(draft) : draft;
  const next = result && typeof result === 'object' ? result : draft;
  next.updatedAt = new Date().toISOString();
  writeSessionKey(CACHE_KEYS.SESSION, next);
  return next;
};

const readStampedBirthData = () => {
  const stamped = readSessionKey(CACHE_KEYS.BIRTH_DATA);
  if (!stamped) {
    removeSessionKey(CACHE_KEYS.BIRTH_DATA);
    return null;
  }

  if (!stamped.data || !stamped.meta) {
    removeSessionKey(CACHE_KEYS.BIRTH_DATA);
    return null;
  }

  if (!isFresh(stamped)) {
    debugLog('Cached birth data stale, clearing canonical key.');
    removeSessionKey(CACHE_KEYS.BIRTH_DATA);
    return null;
  }

  return stamped;
};

const sessionBirthFresh = (session) => {
  const savedAt = session?.meta?.birthDataSavedAt;
  if (typeof savedAt !== 'number') {
    return true;
  }
  return Date.now() - savedAt <= CACHE_TTL_MS;
};

const UIDataSaver = {
  presentBirthData(stamped) {
    if (!stamped || !stamped.data) {
      return null;
    }

    const base = typeof stamped.data === 'object' ? { ...stamped.data } : {};
    base.data = stamped.data;
    base.meta = stamped.meta;
    return base;
  },

  /**
   * Persist birth data in canonical, stamped form.
   * @param {object} birthData
   * @returns {boolean}
   */
  setBirthData(birthData) {
    if (!birthData || typeof birthData !== 'object') {
      warnLog('Attempted to set birth data with invalid payload.');
      return false;
    }

    const storage = getSessionStorage();
    if (!storage) {
      return false;
    }

    const stamped = stamp(birthData);
    const serialized = jsonSafe.stringify(stamped);
    if (!serialized) {
      warnLog('Failed to serialize birth data for storage.');
      return false;
    }

    const sanitized = sanitizeBirthData(birthData);

    try {
      storage.setItem(CACHE_KEYS.BIRTH_DATA, serialized);
      storage.removeItem(CACHE_KEYS.BIRTH_DATA_SESSION);
      MEM.birth = stamped;

      updateSession((session) => {
        session.birthData = birthData;
        session.meta = {
          ...(session.meta || {}),
          birthDataHash: stamped.meta.dataHash,
          birthDataSavedAt: stamped.meta.savedAt
        };
        return session;
      });

      writeLocalKey(`${STORAGE_PREFIX}_birthData`, birthData);

      if (sanitized) {
        writeSessionKey(CACHE_KEYS.BIRTH_DATA_SESSION, sanitized);
        writeLocalKey('jyotish_birth_data', sanitized);
        debugLog('Persisted legacy birth data keys', sanitized);
      }
      return true;
    } catch (error) {
      errorLog('Failed to persist birth data', error);
      return false;
    }
  },

  /**
   * @returns {{ data: object, meta: { savedAt: number, dataHash: string, version: number }} | null}
   */
  getBirthData() {
    if (!isBrowser) {
      return null;
    }

    if (MEM.birth && isFresh(MEM.birth)) {
      return this.presentBirthData(MEM.birth);
    }

    const stamped = readStampedBirthData();
    if (stamped) {
      MEM.birth = stamped;
      return this.presentBirthData(stamped);
    }

    const session = ensureSession();
    if (!sessionBirthFresh(session)) {
      debugLog('Session birth data exceeded TTL; clearing cache.');
      this.clearBirthData();
      return null;
    }

    const legacySessionBirth = session.birthData || session?.currentSession?.birthData;
    if (legacySessionBirth && typeof legacySessionBirth === 'object') {
      debugLog('Upgrading birth data from session container.');
      this.setBirthData(legacySessionBirth);
      return this.presentBirthData(MEM.birth);
    }

    const legacyKeyBirth = readSessionKey(CACHE_KEYS.BIRTH_DATA_SESSION);
    if (legacyKeyBirth && typeof legacyKeyBirth === 'object') {
      debugLog('Upgrading birth data from legacy birth_data_session key.');
      this.setBirthData(legacyKeyBirth);
      removeSessionKey(CACHE_KEYS.BIRTH_DATA_SESSION);
      return this.presentBirthData(MEM.birth);
    }

    debugLog('No birth data available in storage.');
    return null;
  },

  setLastChart(chartId, birthData) {
    if (!chartId) {
      warnLog('setLastChart called without chartId.');
      return;
    }

    const payload = birthData || this.getBirthData()?.data || null;
    const record = {
      chartId,
      birthDataHash: payload ? hash(canonical(payload)) : null,
      savedAt: Date.now()
    };

    writeSessionKey(CACHE_KEYS.LAST_CHART, record);
    updateSession((session) => {
      session.lastChart = record;
      return session;
    });
  },

  clearBirthData() {
    MEM.birth = null;
    removeSessionKey(CACHE_KEYS.BIRTH_DATA);
    removeSessionKey(CACHE_KEYS.BIRTH_DATA_SESSION);
    updateSession((session) => {
      if (session.meta) {
        delete session.meta.birthDataHash;
        delete session.meta.birthDataSavedAt;
      }
      delete session.birthData;
      return session;
    });
    writeLocalKey(`${STORAGE_PREFIX}_birthData`, null);
  },

  saveSession(payload = {}) {
    try {
      if (payload.birthData) {
        this.setBirthData(payload.birthData);
      }

      if (payload.preferences) {
        writeLocalKey(`${STORAGE_PREFIX}_preferences`, payload.preferences);
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
          timestamp: new Date().toISOString()
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

      const timestamp = new Date().toISOString();

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
          timestamp: new Date().toISOString()
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

  saveIndividualAnalysis(analysisType, analysisData) {
    return this.saveApiAnalysisResponse(analysisType, analysisData);
  },

  loadSession() {
    try {
      const currentSession = ensureSession();
      const preferences = readLocalKey(`${STORAGE_PREFIX}_preferences`);
      const birthStamped = this.getBirthData();
      const birthData = birthStamped ? birthStamped.data : null;

      return {
        currentSession,
        preferences,
        birthData,
        meta: {
          birthDataMeta: birthStamped ? birthStamped.meta : null
        },
        loadedAt: new Date().toISOString()
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
        if (!value || (timestamp && now - new Date(timestamp).getTime() > expiryMs)) {
          storage.removeItem(key);
        }
      });
  },

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  },

  clearAll() {
    const sessionStorage = getSessionStorage();
    const localStorage = getLocalStorage();

    if (sessionStorage) {
      sessionStorage.removeItem(CACHE_KEYS.SESSION);
      sessionStorage.removeItem(CACHE_KEYS.BIRTH_DATA);
      sessionStorage.removeItem(CACHE_KEYS.BIRTH_DATA_SESSION);
      sessionStorage.removeItem(CACHE_KEYS.LAST_CHART);
    }

    if (localStorage) {
      Object.keys(localStorage)
        .filter((key) => key.startsWith(STORAGE_PREFIX))
        .forEach((key) => localStorage.removeItem(key));
    }

    MEM.birth = null;
  },

  initializeBrowserEvents() {
    if (!isBrowser) {
      return;
    }

    window.addEventListener('beforeunload', () => {
      const storage = getSessionStorage();
      if (!storage) {
        return;
      }

      if (!storage.getItem(CACHE_KEYS.BIRTH_DATA) && MEM.birth) {
        const serialized = jsonSafe.stringify(MEM.birth);
        if (serialized) {
          storage.setItem(CACHE_KEYS.BIRTH_DATA, serialized);
        }
      }
    });

    document.addEventListener('formDataChanged', (event) => {
      const detail = event?.detail;
      if (detail?.birthData) {
        this.setBirthData(detail.birthData);
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

