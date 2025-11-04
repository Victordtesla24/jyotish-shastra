# Manual E2E Validation: UIDataSaver Persistence & Anti-Stale Cache

**Date Created**: 2025-11-04  
**Related Plan**: fix-uidatasaver-persistence.plan.md  
**Purpose**: Validate UIDataSaver canonical storage, TTL-based staleness detection, and Analysis page data flow

## Prerequisites

- [ ] Backend running on `localhost:3001`
- [ ] Frontend running on `localhost:3002` (or configured port)
- [ ] Chrome DevTools or equivalent browser developer tools
- [ ] Clean browser session (no cached data from previous sessions)

## Test Sequence

### Test 1: Analysis Page Without Birth Data (Redirect Validation)

**Objective**: Verify that Analysis page redirects when no birth data exists

**Steps**:
1. Clear all browser storage:
   ```javascript
   // In DevTools Console
   sessionStorage.clear();
   localStorage.clear();
   ```

2. Hard refresh Analysis page (`Ctrl+Shift+R` or `Cmd+Shift+R`)

3. Open DevTools Network tab

**Expected Results**:
- ✅ NO `/api/v1/analysis/*` requests are made
- ✅ Page redirects to `/chart` or `/` (homepage)
- ✅ Console shows: `"❌ No fresh birth data found, redirecting to chart generation"`
- ✅ No JavaScript errors in console

**Actual Results**:
- [ ] Pass
- [ ] Fail - Details: ___________________

---

### Test 2: Chart Generation & Canonical Storage Verification

**Objective**: Verify birth data is saved to canonical key with proper structure

**Steps**:
1. Navigate to Chart page (or Homepage with chart form)

2. Fill in birth data form:
   ```
   Name: Test User
   Date of Birth: 1990-01-01
   Time of Birth: 12:00
   Place: Mumbai, Maharashtra, India
   ```

3. Click "Generate Chart"

4. After successful generation, open DevTools Application tab → Session Storage

5. Inspect `sessionStorage['birthData']`:
   ```javascript
   // In DevTools Console
   const stored = JSON.parse(sessionStorage.getItem('birthData'));
   console.log('Birth Data Structure:', stored);
   console.log('Has data property:', 'data' in stored);
   console.log('Has meta property:', 'meta' in stored);
   console.log('Meta keys:', stored.meta ? Object.keys(stored.meta) : 'N/A');
   ```

**Expected Results**:
- ✅ `sessionStorage['birthData']` exists
- ✅ Structure is: `{data: {...birthData}, meta: {savedAt, dataHash, version}}`
- ✅ `meta.savedAt` is a recent timestamp (within last minute)
- ✅ `meta.dataHash` is a hex string starting with 'h' (e.g., `ha4b2af39`)
- ✅ `meta.version` is `1`
- ✅ `data` contains all birth form fields

**Actual Results**:
- [ ] Pass
- [ ] Fail - Details: ___________________

**Debug Output**:
```
Paste console.log output here
```

---

### Test 3: Analysis Page Data Flow Validation

**Objective**: Verify Analysis page uses birth data from canonical storage and sends correct API requests

**Steps**:
1. With chart already generated (from Test 2), navigate to Analysis page

2. Open DevTools Network tab

3. Filter for requests to `/api/v1/analysis/`

4. Click on a comprehensive analysis request

5. Inspect Request Payload:
   ```javascript
   // In DevTools Console
   // Monitor outgoing requests
   let requestBodies = [];
   const originalFetch = window.fetch;
   window.fetch = function(...args) {
     if (args[0].includes('/analysis/')) {
       const body = args[1]?.body;
       if (body) {
         requestBodies.push({
           url: args[0],
           body: JSON.parse(body)
         });
       }
     }
     return originalFetch.apply(this, args);
   };
   
   // After some requests:
   console.log('Analysis Request Bodies:', requestBodies);
   ```

**Expected Results**:
- ✅ POST requests to `/api/v1/analysis/comprehensive` are made
- ✅ Request body includes birth data fields:
  - `name`
  - `dateOfBirth`
  - `timeOfBirth`
  - `placeOfBirth`
  - `latitude`
  - `longitude`
  - `timezone`
- ✅ NO console errors like "Birth data is required..."
- ✅ Analysis sections load successfully

**Actual Results**:
- [ ] Pass
- [ ] Fail - Details: ___________________

**Sample Request Body**:
```json
Paste actual request body here
```

---

### Test 4: Staleness Detection (TTL Expiration)

**Objective**: Verify that stale data (older than 15 minutes) is rejected

**Steps**:
1. With valid birth data in storage, open DevTools Console

2. Manually expire the data:
   ```javascript
   // Get current stored data
   const stored = JSON.parse(sessionStorage.getItem('birthData'));
   
   // Set savedAt to 17 minutes ago (past 15-minute TTL)
   const SEVENTEEN_MINUTES = 17 * 60 * 1000;
   stored.meta.savedAt = Date.now() - SEVENTEEN_MINUTES;
   
   // Save back
   sessionStorage.setItem('birthData', JSON.stringify(stored));
   
   console.log('Birth data artificially aged by 17 minutes');
   console.log('New savedAt:', new Date(stored.meta.savedAt).toISOString());
   ```

3. Reload the Analysis page (F5)

4. Observe behavior

**Expected Results**:
- ✅ Analysis page detects stale data
- ✅ Redirects to `/chart` or `/` 
- ✅ Console shows: `"[UIDataSaver] getBirthData: Canonical key data is stale, rejecting"`
- ✅ Stale `sessionStorage['birthData']` is removed
- ✅ NO API calls to `/api/v1/analysis/*`

**Actual Results**:
- [ ] Pass
- [ ] Fail - Details: ___________________

---

### Test 5: Data Mutation Detection (Hash Change)

**Objective**: Verify that changing birth data generates new hash and analysis uses updated data

**Steps**:
1. With a chart already generated, note the current `dataHash`:
   ```javascript
   const stored = JSON.parse(sessionStorage.getItem('birthData'));
   const oldHash = stored.meta.dataHash;
   console.log('Original hash:', oldHash);
   ```

2. Navigate back to Chart page

3. Change birth time (e.g., from `12:00` to `14:30`)

4. Re-generate chart

5. Check new hash:
   ```javascript
   const newStored = JSON.parse(sessionStorage.getItem('birthData'));
   const newHash = newStored.meta.dataHash;
   console.log('New hash:', newHash);
   console.log('Hash changed:', oldHash !== newHash);
   ```

6. Navigate to Analysis page

7. Inspect analysis API request bodies

**Expected Results**:
- ✅ `meta.dataHash` changes after re-generation
- ✅ New hash is different from old hash
- ✅ Analysis API requests use NEW birth time (14:30)
- ✅ Analysis results reflect updated birth data
- ✅ No cached/stale analysis from previous data

**Actual Results**:
- [ ] Pass
- [ ] Fail - Details: ___________________

**Hashes**:
- Old hash: _______________
- New hash: _______________
- Changed: [ ] Yes [ ] No

---

## Verification Checklist

After completing all 5 tests:

- [ ] Test 1 passed: Analysis page redirects without data
- [ ] Test 2 passed: Canonical storage structure is correct
- [ ] Test 3 passed: Analysis API requests include birth data
- [ ] Test 4 passed: Stale data is rejected (TTL)
- [ ] Test 5 passed: Data mutations detected via hash

**Overall Status**: [ ] ALL PASS [ ] FAILURES FOUND

---

## Debugging Tips

### If Test 1 Fails (No Redirect):

Check:
```javascript
// In Console
console.log('getBirthData result:', UIDataSaver.getBirthData());
console.log('Session keys:', Object.keys(sessionStorage));
```

### If Test 2 Fails (Wrong Structure):

Check:
```javascript
// In Console
const raw = sessionStorage.getItem('birthData');
console.log('Raw value:', raw);
console.log('Parsed:', JSON.parse(raw));
console.log('Type check:', typeof JSON.parse(raw));
```

### If Test 3 Fails (No Birth Data in Requests):

Check:
```javascript
// In Console
console.log('Birth data retrieval:', UIDataSaver.getBirthData());
console.log('Has .data property:', UIDataSaver.getBirthData()?.data);
```

### If Test 4 Fails (Stale Data Not Rejected):

Check:
```javascript
// In Console
import { CACHE_TTL_MS, isFresh } from './utils/cachePolicy.js';
const stored = JSON.parse(sessionStorage.getItem('birthData'));
console.log('TTL:', CACHE_TTL_MS);
console.log('Age:', Date.now() - stored.meta.savedAt);
console.log('Is fresh:', isFresh(stored));
```

### If Test 5 Fails (Hash Doesn't Change):

Check:
```javascript
// In Console
console.log('Birth data before:', UIDataSaver.getBirthData().data);
// Re-generate chart
console.log('Birth data after:', UIDataSaver.getBirthData().data);
console.log('Hash comparison:', UIDataSaver.getBirthData().meta.dataHash);
```

---

## Notes

- All tests should be run in sequence
- Use a fresh browser session for reproducibility
- Document any unexpected behaviors
- Check browser console for debug messages (only visible in non-production mode)

---

## Sign-off

Tested by: _________________  
Date: _________________  
Environment: [ ] Development [ ] Staging [ ] Production  
Browser: _________________  
Result: [ ] Pass [ ] Fail

**Issues Found**:
```
List any issues or unexpected behaviors
```

**Follow-up Actions**:
```
List any required fixes or improvements
```

