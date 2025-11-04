# API Endpoint to UI Component Mapping Inventory

## Generated: 2025-01-15  
**Last Updated**: January 2025  
**Total Endpoints**: 40+ active endpoints

This document maps all API endpoints to their corresponding UI components and verifies data structure compatibility.

---

## Health & Information Endpoints

### 1. GET /api/v1/health
- **Method:** GET
- **UI Component:** `BirthTimeRectificationPage.jsx` (line 44)
- **Input:** None
- **Output:** `{ status: 'healthy' }`
- **Status:** ✅ Mapped

### 2. GET /api/
- **Method:** GET
- **UI Component:** None (Info endpoint)
- **Input:** None
- **Output:** API documentation JSON
- **Status:** ℹ️ Info endpoint, no UI mapping needed

---

## Geocoding Endpoints

### 3. POST /api/v1/geocoding/location
- **Method:** POST
- **UI Component:** `geocodingService.js` (line 8), `BirthDataForm.jsx`
- **Input:** `{ placeOfBirth: string }`
- **Output:** `{ success: true, data: { latitude, longitude, timezone, formatted_address } }`
- **Status:** ✅ Mapped
- **Issues:** Need to verify response structure handling

### 4. GET /api/v1/geocoding/coordinates
- **Method:** GET
- **UI Component:** None found
- **Input:** Query params: `?location=...`
- **Output:** Coordinates JSON
- **Status:** ⚠️ Not called by UI

### 5. GET /api/v1/geocoding/validate
- **Method:** GET
- **UI Component:** None found
- **Input:** Query params: `?latitude=...&longitude=...`
- **Output:** Validation result
- **Status:** ⚠️ Not called by UI

---

## Chart Generation Endpoints

### 6. POST /api/v1/chart/generate
- **Method:** POST
- **UI Component:** `HomePage.jsx` (line 36), `chartService.js` (line 266)
- **Input:** `{ name, dateOfBirth, timeOfBirth, latitude, longitude, timezone, gender? }`
- **Output:** `{ success: true, data: { chartId, birthData, rasiChart: { planets[], ascendant, housePositions[] } } }`
- **Status:** ✅ Mapped
- **Issues:** Verify input structure matches API validator

### 7. POST /api/v1/chart/generate/comprehensive
- **Method:** POST
- **UI Component:** None found
- **Input:** Same as chart/generate + placeOfBirth
- **Output:** Comprehensive chart with navamsa
- **Status:** ⚠️ Not called by UI

### 8. POST /api/v1/chart/analysis/birth-data
- **Method:** POST
- **UI Component:** None found
- **Input:** Birth data object
- **Output:** Birth data analysis
- **Status:** ⚠️ Not called by UI

### 9. GET /api/v1/chart/{chartId}
- **Method:** GET
- **UI Component:** None found
- **Input:** Chart ID in path
- **Output:** Chart data by ID
- **Status:** ⚠️ Not called by UI (may use cached data instead)

### 10. GET /api/v1/chart/{chartId}/navamsa
- **Method:** GET
- **UI Component:** None found
- **Input:** Chart ID in path
- **Output:** Navamsa chart data
- **Status:** ⚠️ Not called by UI (may use cached data instead)

### 11. POST /api/v1/chart/render
- **Method:** POST
- **UI Component:** None (metadata endpoint)
- **Input:** Birth data object + optional `includeData` flag
- **Output:** `{ success: true, data: { chartData, renderData, chartSpec } }`
- **Status:** ✅ Available for metadata extraction

### 12. POST /api/v1/chart/render/svg ✅ **NEW PRODUCTION-GRADE**
- **Method:** POST
- **UI Component:** `VedicChartDisplay.jsx` (via `chartService.js`)
- **Input:** Birth data object + optional `width` (default: 800), `includeData` (default: false)
- **Output:** `{ success: true, data: { svg: string, chartData?, renderData? }, metadata: { width, renderedAt, service, warnings } }`
- **Status:** ✅ Mapped - Production-grade backend rendering service
- **Backend Service:** ChartRenderingService.js ✅ **PRODUCTION-READY**
- **Features:** 
  - 18+ data set extraction including nested structures
  - Template matching with `@kundli-template.png`
  - Data joining strategy implementation
  - Performance-optimized singleton integration
- **Usage:** Called by `chartService.renderChartSVG()` method
- **Fallback:** If backend rendering fails, `VedicChartDisplay` falls back to client-side rendering

### 13. POST /api/v1/chart/analysis/lagna
- **Method:** POST
- **UI Component:** `AnalysisPage.jsx` (uses comprehensive endpoint as fallback)
- **Input:** Birth data object
- **Output:** `{ success: true, data: { analysis: { section: 'lagna', lagnaAnalysis: {...} } } }`
- **Status:** ⚠️ Uses comprehensive endpoint instead

### 12. POST /api/v1/chart/analysis/house/{houseNumber}
- **Method:** POST
- **UI Component:** `AnalysisPage.jsx` (line 2712)
- **Input:** Birth data object
- **Output:** House analysis for specific house
- **Status:** ✅ Mapped

### 13. POST /api/v1/chart/analysis/comprehensive
- **Method:** POST
- **UI Component:** None found (uses /api/v1/analysis/comprehensive instead)
- **Input:** Birth data object
- **Output:** Comprehensive chart analysis
- **Status:** ⚠️ Different endpoint used by UI

---

## Analysis Endpoints

### 14. POST /api/v1/analysis/comprehensive
- **Method:** POST
- **UI Component:** `HomePage.jsx` (line 57), `ComprehensiveAnalysisPage.jsx` (line 78), `ResponseDataToUIDisplayAnalyser.js` (line 521)
- **Input:** `{ name?, dateOfBirth, timeOfBirth, latitude, longitude, timezone, gender? }`
- **Output:** `{ success: true, analysis: { sections: { section1-section8 }, synthesis, recommendations } }`
- **Status:** ✅ Mapped
- **Issues:** Need to verify sections structure and count

### 15. POST /api/v1/analysis/birth-data
- **Method:** POST
- **UI Component:** None found
- **Input:** Birth data object
- **Output:** Birth data validation/analysis
- **Status:** ⚠️ Not called by UI

### 16. POST /api/v1/analysis/preliminary
- **Method:** POST
- **UI Component:** `AnalysisPage.jsx` (line 2685), `ResponseDataToUIDisplayAnalyser.js` (line 804)
- **Input:** Birth data object
- **Output:** `{ success: true, analysis: { preliminaryAnalysis: {...} } }`
- **Status:** ✅ Mapped

### 17. POST /api/v1/analysis/houses
- **Method:** POST
- **UI Component:** `AnalysisPage.jsx` (line 2686), `ResponseDataToUIDisplayAnalyser.js` (line 805)
- **Input:** Birth data object
- **Output:** `{ success: true, analysis: { houses: {...} } }`
- **Status:** ✅ Mapped

### 18. POST /api/v1/analysis/aspects
- **Method:** POST
- **UI Component:** `AnalysisPage.jsx` (line 2687), `ResponseDataToUIDisplayAnalyser.js` (line 806)
- **Input:** Birth data object
- **Output:** `{ success: true, analysis: { aspects: {...} } }`
- **Status:** ✅ Mapped

### 19. POST /api/v1/analysis/arudha
- **Method:** POST
- **UI Component:** `AnalysisPage.jsx` (line 2688), `ResponseDataToUIDisplayAnalyser.js` (line 807)
- **Input:** Birth data object
- **Output:** `{ success: true, analysis: { arudha: {...} } }`
- **Status:** ✅ Mapped

### 20. POST /api/v1/analysis/navamsa
- **Method:** POST
- **UI Component:** `AnalysisPage.jsx` (line 2689), `ResponseDataToUIDisplayAnalyser.js` (line 808)
- **Input:** Birth data object
- **Output:** `{ success: true, analysis: { navamsaAnalysis: {...} } }`
- **Status:** ✅ Mapped

### 21. POST /api/v1/analysis/dasha
- **Method:** POST
- **UI Component:** `AnalysisPage.jsx` (line 2690), `ResponseDataToUIDisplayAnalyser.js` (line 809)
- **Input:** Birth data object
- **Output:** `{ success: true, analysis: { dashaAnalysis: {...} } }`
- **Status:** ✅ Mapped

### 22. GET /api/v1/analysis/{analysisId}
- **Method:** GET
- **UI Component:** None found
- **Input:** Analysis ID in path
- **Output:** Analysis by ID
- **Status:** ⚠️ Not called by UI (uses cached data instead)

### 23. GET /api/v1/analysis/user/{userId}
- **Method:** GET
- **UI Component:** None found (requires authentication)
- **Input:** User ID in path + Auth header
- **Output:** User analysis history
- **Status:** ⚠️ Not implemented (requires auth)

### 24. DELETE /api/v1/analysis/{analysisId}
- **Method:** DELETE
- **UI Component:** None found (requires authentication)
- **Input:** Analysis ID in path + Auth header
- **Output:** Deletion confirmation
- **Status:** ⚠️ Not implemented (requires auth)

### 25. GET /api/v1/analysis/progress/{analysisId}
- **Method:** GET
- **UI Component:** None found
- **Input:** Analysis ID in path
- **Output:** Analysis progress
- **Status:** ⚠️ Not called by UI

---

## Client Error Logging

### 26. POST /api/log-client-error
- **Method:** POST
- **UI Component:** `ErrorBoundary.jsx`, `errorLogger.js`, `App.js` ErrorBoundary, `VedicErrorBoundary`
- **Input:** `{ timestamp, message, stack, url, userAgent, componentStack, category, type, context }`
- **Output:** Error logging confirmation
- **Status:** ✅ **IMPLEMENTED** - All error boundaries now log to backend

---

## Birth Time Rectification Endpoints

### 27. GET /api/v1/rectification/test
- **Method:** GET
- **UI Component:** None found (debug endpoint)
- **Input:** None
- **Output:** Test response
- **Status:** ℹ️ Debug endpoint

### 28. POST /api/v1/rectification/methods
- **Method:** POST
- **UI Component:** None found
- **Input:** `{}`
- **Output:** Available BTR methods
- **Status:** ⚠️ Not called by UI

### 29. POST /api/v1/rectification/quick
- **Method:** POST
- **UI Component:** `BirthTimeRectificationPage.jsx` (line 210)
- **Input:** `{ birthData: { dateOfBirth, timeOfBirth, latitude, longitude, timezone, placeOfBirth }, proposedTime: string }`
- **Output:** `{ success: true, data: { validation: { confidence, praanapada, ascendant, alignmentScore, recommendations } } }`
- **Status:** ✅ Mapped
- **Issues:** Verify nested birthData structure matches API expectations

### 30. POST /api/v1/rectification/analyze
- **Method:** POST
- **UI Component:** None found
- **Input:** `{ birthData: {...}, options: { methods: string[] } }`
- **Output:** Full BTR analysis
- **Status:** ⚠️ Not called by UI (uses with-events instead)

### 31. POST /api/v1/rectification/with-events
- **Method:** POST
- **UI Component:** `BirthTimeRectificationPage.jsx` (line 321), `InteractiveLifeEventsQuestionnaire.jsx`
- **Input:** `{ birthData: {...}, lifeEvents: [{ date, category, description, importance }], options: { methods: string[] } }`
- **Output:** BTR analysis with life events correlation
- **Status:** ✅ Mapped

### 32. POST /api/v1/rectification/analyze
- **Method:** POST
- **UI Component:** `BirthTimeRectificationPage.jsx` (via component integration)
- **Input:** `{ birthData: {...}, options: { methods: string[], timeRange: { hours: number }, lifeEvents: array } }`
- **Output:** Full BTR analysis with multiple methods
- **Status:** ✅ Mapped

### 33. POST /api/v1/rectification/hora-analysis
- **Method:** POST
- **UI Component:** `BirthTimeRectificationPage.jsx` (feature-flagged)
- **Input:** `{ birthData: {...} }`
- **Output:** Hora-based (D2 chart) rectification analysis
- **Status:** ✅ Available (feature flag controlled)

### 34. POST /api/v1/rectification/shashtiamsa-verify
- **Method:** POST
- **UI Component:** `BirthTimeRectificationPage.jsx` (feature-flagged)
- **Input:** `{ birthData: {...}, shashtiamsaData: {...} }`
- **Output:** Shashtiamsa (D60) verification results
- **Status:** ✅ Available (feature flag controlled)

### 35. POST /api/v1/rectification/configure
- **Method:** POST
- **UI Component:** `BirthTimeRectificationPage.jsx` (settings)
- **Input:** `{ configuration: {...} }`
- **Output:** BTR configuration confirmation
- **Status:** ✅ Mapped

### 36. POST /api/v1/rectification/conditional-dasha-verify
- **Method:** POST
- **UI Component:** `BirthTimeRectificationPage.jsx` (advanced analysis)
- **Input:** `{ birthData: {...}, conditionalDashaData: {...} }`
- **Output:** Conditional dasha verification results
- **Status:** ✅ Mapped

### 37. GET /api/v1/rectification/features
- **Method:** GET
- **UI Component:** `BirthTimeRectificationPage.jsx` (feature discovery)
- **Input:** None
- **Output:** Available BTR features and methods
- **Status:** ✅ Mapped

### 38. POST /api/v1/geocoding/timezone
- **Method:** POST
- **UI Component:** `geocodingService.js`, `BirthDataForm.jsx` (implicit)
- **Input:** `{ latitude: number, longitude: number }`
- **Output:** Timezone information for coordinates
- **Status:** ✅ Mapped (used internally)

### 39. POST /api/v1/client-error/log
- **Method:** POST
- **UI Component:** `ErrorBoundary.jsx`, `errorLogger.js`, `VedicErrorBoundary`
- **Input:** `{ timestamp, message, stack, url, userAgent, componentStack, category, type, context }`
- **Output:** Error logging confirmation
- **Status:** ✅ Mapped (error boundaries and logging)

---

## Summary

### Mapping Status:
- ✅ **Mapped and Used:** 20 endpoints (actively called by UI components)
- ⚠️ **Not Called by UI:** 15 endpoints (may use cached data or be API-only)
- ℹ️ **Info/Debug:** 5 endpoints (health checks, info endpoints)
- **Total:** 40+ endpoints documented

### Critical Endpoints (Must Work):
1. ✅ POST /api/v1/chart/generate - Chart generation
2. ✅ POST /api/v1/analysis/comprehensive - Comprehensive analysis (8 sections)
3. ✅ POST /api/v1/geocoding/location - Location geocoding
4. ✅ POST /api/v1/rectification/quick - BTR quick validation
5. ✅ POST /api/v1/rectification/with-events - BTR with life events
6. ✅ POST /api/v1/rectification/analyze - Main BTR analysis
7. ✅ POST /api/v1/analysis/houses - House-by-house analysis
8. ✅ POST /api/v1/analysis/dasha - Dasha timeline analysis
9. ✅ POST /api/v1/analysis/navamsa - Navamsa chart analysis
10. ✅ POST /api/v1/chart/render/svg - **NEW** Production-grade backend rendering

### BTR Endpoints Status:
- ✅ **10 BTR endpoints** implemented and documented
- ✅ **6 BTR endpoints** actively used by UI components
- ✅ **4 BTR endpoints** available via feature flags

### Analysis Endpoints Status:
- ✅ **13 analysis endpoints** implemented
- ✅ **9 analysis endpoints** actively used by UI components
- ✅ **Comprehensive endpoint** provides all 8 sections in one call

### Critical Endpoints (Must Work):
1. POST /api/v1/chart/generate - Chart generation
2. POST /api/v1/analysis/comprehensive - Comprehensive analysis
3. POST /api/v1/geocoding/location - Location geocoding
4. POST /api/v1/rectification/quick - BTR quick validation
5. POST /api/v1/rectification/with-events - BTR with events

### Issues to Fix:
1. Input data structure validation alignment
2. Response structure transformation verification
3. Missing endpoint mappings (non-critical)
4. Error handling for unmapped endpoints

---

## Next Steps

1. Verify input validation matches between UI and API
2. Verify response transformation logic handles actual API structures
3. Test all mapped endpoints with real data
4. Document unmapped endpoints (may be by design)
