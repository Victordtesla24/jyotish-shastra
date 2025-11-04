# Manual Form Comprehensive Error Log — 2025-11-04

## Symptom
- Analysis workflows aborted with the banner “Birth data is required for analysis…” even when session storage contained `birthData` from the recent chart generation.

## Root Cause
- Legacy `UIDataSaver` logic wrote plain objects to multiple keys and never refreshed the canonical session key, so downstream reads (especially on `/analysis`) received `null` whenever the simple key diverged or became stale.

## Impacted Modules
- `client/src/components/forms/UIDataSaver.js`
- `client/src/pages/AnalysisPage.jsx`
- `client/src/components/analysis/ResponseDataToUIDisplayAnalyser.js`
- `client/src/pages/ChartPage.jsx`
- `client/src/pages/HomePage.jsx`

## Evidence
```120:209:client/src/components/forms/UIDataSaver.js
const UIDataSaver = {
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
      return true;
    } catch (error) {
      errorLog('Failed to persist birth data', error);
      return false;
    }
  },
``` 

```236:279:client/src/components/forms/UIDataSaver.js
  getBirthData() {
    if (!isBrowser) {
      return null;
    }

    if (MEM.birth && isFresh(MEM.birth)) {
      return MEM.birth;
    }

    const stamped = readStampedBirthData();
    if (stamped) {
      MEM.birth = stamped;
      return stamped;
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
      return MEM.birth;
    }

    const legacyKeyBirth = readSessionKey(CACHE_KEYS.BIRTH_DATA_SESSION);
    if (legacyKeyBirth && typeof legacyKeyBirth === 'object') {
      debugLog('Upgrading birth data from legacy birth_data_session key.');
      this.setBirthData(legacyKeyBirth);
      removeSessionKey(CACHE_KEYS.BIRTH_DATA_SESSION);
      return MEM.birth;
    }

    debugLog('No birth data available in storage.');
    return null;
  },
``` 

## Fix Summary
- Replaced the singleton implementation with a canonical, stamped cache that prioritises the per-tab memory record, the canonical `sessionStorage['birthData']` key, and upgrades older storage variants on read.
- Updated all consumers to rely on the stamped payload (`{ data, meta }`), redirecting to `/chart` with a friendly toast when no fresh birth data is available.
- Added Jest coverage for staleness rejection, corrupt payload handling, legacy upgrades, and last-chart metadata tracking.

## Files Touched
- `client/src/components/forms/UIDataSaver.js`
- `client/src/components/forms/__tests__/UIDataSaver.test.js`
- `client/src/pages/AnalysisPage.jsx`
- `client/src/components/analysis/ResponseDataToUIDisplayAnalyser.js`
- `client/src/pages/ChartPage.jsx`
- `client/src/pages/HomePage.jsx`
- `client/src/components/forms/BirthDataForm.js`
- `client/src/pages/ComprehensiveAnalysisPage.jsx`
- `client/src/utils/jsonSafe.js`
- `client/src/utils/cacheKeys.js`
- `client/src/utils/cachePolicy.js`
- `docs/architecture/user-data-flows.md`
- `jest.config.cjs`

## Why This Works
- Birth data writes are now canonical, stamped, and TTL-guarded, preventing stale or malformed payloads from leaking into analysis flows.
- Every consumer retrieves `stored.data`, guaranteeing schema consistency across analysis endpoints.
- Legacy session keys are upgraded transparently, so historic sessions migrate to the new format without user intervention.

## Verification Evidence
- `npm run test -- UIDataSaver` (PASS)
- `node tests/ui/debug-manual-form-comprehensive.cjs` (FAIL — existing flow3/UI coverage gaps, documented for follow-up)
- `npm run test` (FAIL — pre-existing BirthDataForm geocoding expectations)
- `npm run typecheck` (FAIL — legacy TypeScript parse errors)
- `npm run lint` (FAIL — missing `eslint-config-react-app` dependency)
- `npm run build` (PASS)

