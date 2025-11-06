# Implementation Plan: BTR Accuracy & Metrics Enhancement

## IMPLEMENTATION STATUS: Phase 7 COMPLETE - Ready for Phase 8 Final Validation (85% - 22/26 tasks)
**Last Updated**: 2025-11-06T13:28:00+11:00
**Phases Complete**: 0-Planning ✓, 1-Foundation ✓, 2-Horizons ✓, 3-Metrics ✓, 4-Integration ✓, 5-Core Tests ✓, 6-Evidence ✓, 7-CI/Deployment ✓
**Current Phase**: Phase 8 (Final Validation) - 3 steps remaining
**LOC Implemented**: 5,250+ lines (core + tests + CI/deployment) across 27 files
**Test Coverage**: 48 comprehensive tests (BPHS + Horizons + Golden Case)
**Quality**: ✅ Zero ESLint errors, production-ready code, deployment-ready configuration
**CI/CD**: ✅ Test scripts, environment config, smoke tests, deployment docs complete

## [Overview]

Add comprehensive accuracy metrics, validation, and evidence generation to the existing Birth Time Rectification (BTR) system without modifying core BPHS methods. This implementation layers a metrics/validation system on top of existing BTR functionality to meet all success criteria (SC-1 through SC-7) while maintaining minimal code changes and zero breaking changes to existing APIs.

**Scope:** 
- Add JPL Horizons validation client with record/replay fixture support
- Implement BTRMetrics module calculating M1-M5 metrics
- Add ΔT/TT/UT1 time scale conversion utilities
- Expand test coverage with BPHS method validation and Horizons accuracy tests
- Generate EVIDENCE.md and SOURCES.md with provenance tracking
- Configure CI test gates for deployment validation
- Document manual Render deployment process with post-deploy smoke tests

**Context:**
The BTR system is already operational on Render.com with 10 API endpoints and core BPHS methods (Praanapada, Gulika, Moon, Events) implemented. This enhancement adds scientific rigor through astronomical validation (JPL Horizons), formal metrics (M1-M5), and evidence generation without disrupting existing functionality.

**Approach:**
TypeScript-first for new code with strict types, fixture-based testing (no live API calls in CI), flat JSON storage for metrics/reports, and read-only endpoints to serve generated artifacts. Manual Render deployment with documented process (no automatic hooks yet).

## [Types]

TypeScript interfaces and type definitions for all new modules.

```typescript
// src/types/metrics.ts
export interface EphemerisAccuracyMetric {
  body: 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn';
  ourLongitude: number;
  jplLongitude: number;
  deltaLongitude: number;
  withinThreshold: boolean;
  threshold: number;
  timeScale: 'TT' | 'UT1' | 'UTC';
  julianDay: number;
}

export interface CrossMethodConvergence {
  methods: string[];
  rectifiedTimes: { method: string; time: string; offsetMinutes: number }[];
  maxSpreadMinutes: number;
  medianAbsoluteDeviation: number;
  withinThreshold: boolean;
  threshold: number;
}

export interface EnsembleConfidence {
  weights: { [method: string]: number };
  scores: { [method: string]: number };
  weightedScore: number;
  confidence: number; // 0-1
  breakdown: { method: string; contribution: number }[];
}

export interface EventFitAgreement {
  totalEvents: number;
  alignedEvents: number;
  percentage: number;
  withinThreshold: boolean;
  threshold: number;
  mismatches: { event: string; reason: string }[];
}

export interface GeocodingPrecision {
  bbox: [number, number, number, number]; // [minLat, minLon, maxLat, maxLon]
  diagonalMeters: number;
  confidence: number; // OpenCage confidence (bbox-based)
  withinThreshold: boolean;
  threshold: number; // meters
  warning: string | null;
}

export interface BTRMetricsResult {
  timestamp: string;
  chartId: string;
  birthData: any;
  m1_ephemerisAccuracy: EphemerisAccuracyMetric[];
  m2_crossMethodConvergence: CrossMethodConvergence;
  m3_ensembleConfidence: EnsembleConfidence;
  m4_eventFitAgreement: EventFitAgreement;
  m5_geocodingPrecision: GeocodingPrecision;
  overallPassed: boolean;
  failedCriteria: string[];
}

// src/types/horizons.ts
export interface HorizonsQuery {
  target: string; // '10' for Sun, '301' for Moon, etc.
  observer: string; // '@399' for geocentric
  startTime: string; // ISO 8601
  stopTime: string;
  step: string; // '1h', '1d', etc.
  quantities: string; // '1' for astrometric position
}

export interface HorizonsResponse {
  query: HorizonsQuery;
  apiVersion: string;
  provenance: {
    source: 'JPL Horizons';
    url: string;
    timestamp: string;
  };
  results: {
    julianDay: number;
    longitude: number; // degrees
    latitude: number;
    distance: number; // AU
    timeScale: 'TT';
  }[];
}

export interface HorizonsFixture {
  filename: string;
  query: HorizonsQuery;
  response: HorizonsResponse;
  recordedAt: string;
}

// src/types/timeScales.ts
export interface TimeScaleConversion {
  civilTime: Date;
  timezone: string;
  utc: Date;
  tt: Date; // Terrestrial Time
  ut1: Date; // Universal Time (Earth rotation)
  julianDayTT: number;
  julianDayUT1: number;
  deltaT: number; // TT - UT1 in seconds
  deltaTSource: 'IERS' | 'estimate';
}

export interface DeltaTRecord {
  year: number;
  month: number;
  deltaT: number; // seconds
  source: 'IERS' | 'USNO' | 'estimate';
}
```

## [Files]

Breakdown of new files to create and existing files to modify.

### New Files to Create

**Metrics & Adapters (Core New Modules):**
1. `src/metrics/BTRMetrics.ts` - Main metrics calculation engine (M1-M5)
2. `src/adapters/horizonsClient.ts` - JPL Horizons record/replay client
3. `src/adapters/timeScales.ts` - ΔT/TT/UT1/UTC conversion utilities
4. `src/adapters/geocoding.ts` - OpenCage bbox→meters utility
5. `src/types/metrics.ts` - TypeScript type definitions for metrics
6. `src/types/horizons.ts` - TypeScript types for Horizons API
7. `src/types/timeScales.ts` - TypeScript types for time scales

**API Routes (Read-Only Endpoints):**
8. `src/api/routes/metrics.js` - `/api/v1/rectification/metrics/*` endpoints

**Test Files:**
9. `tests/unit/metrics/BTRMetrics.test.ts` - Unit tests for metrics calculations
10. `tests/unit/adapters/horizonsClient.test.ts` - Horizons client tests with fixtures
11. `tests/unit/adapters/timeScales.test.ts` - Time scale conversion tests
12. `tests/integration/btr/bphs-methods.test.js` - BPHS method validation (Praanapada, Gulika)
13. `tests/integration/btr/horizons-accuracy.test.ts` - M1 accuracy tests vs Horizons
14. `tests/integration/btr/golden-case.test.js` - Pune 1985 golden case validation

**Fixtures & Data:**
15. `fixtures/horizons/sun_2451545.0.json` - J2000.0 Sun position fixture
16. `fixtures/horizons/moon_2451545.0.json` - J2000.0 Moon position fixture
17. `fixtures/horizons/mars_2451545.0.json` - J2000.0 Mars position fixture
18. `fixtures/btr/pune_1985-10-24_0230.json` - Golden case: Pune, India test data
19. `src/adapters/data/deltaT_iers.json` - IERS ΔT table (1973-2023)

**Scripts & Evidence:**
20. `scripts/generate-evidence.js` - Generate EVIDENCE.md from metrics
21. `scripts/record-horizons-fixtures.js` - Record mode: refresh Horizons fixtures
22. `scripts/post-deploy-smoke.js` - Post-deployment validation script
23. `EVIDENCE.md` - Generated evidence document (template → generated)
24. `SOURCES.md` - Authoritative references document

**Configuration:**
25. `.env.example` - Update with new BTR/Horizons/metrics env vars

### Existing Files to Modify

**Minimal Modifications (Validation/Integration Points Only):**
1. `src/services/analysis/BirthTimeRectificationService.js`
   - **Change**: Add optional `metrics: BTRMetrics` constructor parameter
   - **Purpose**: Allow metrics calculation to be triggered after rectification
   - **Lines**: ~10 LOC addition (dependency injection pattern)

2. `src/api/routes/index.js`
   - **Change**: Add `import metricsRouter from './metrics.js'` and `app.use('/api/v1/rectification/metrics', metricsRouter)`
   - **Lines**: ~3 LOC addition

3. `package.json`
   - **Change**: Add new test scripts (`test:btr:accuracy`, `test:btr:horizons`, `evidence:generate`)
   - **Lines**: ~5 LOC addition

4. `.gitignore`
   - **Change**: Add `/metrics/btr/*.json`, `/reports/btr/*.html`, `!fixtures/horizons/*.json` (keep fixtures)
   - **Lines**: ~3 LOC addition

5. `render.yaml`
   - **Change**: Add new env vars (`HORIZONS_ENABLED`, `BTR_METRICS_DIR`, etc.)
   - **Lines**: ~8 LOC addition

**Total Estimated LOC**: ~400-500 new lines (excluding tests and fixtures)

## [Functions]

New functions and modified functions with exact signatures.

### New Functions

**BTRMetrics.ts:**
```typescript
export class BTRMetrics {
  constructor(
    horizonsClient: HorizonsClient,
    timeScales: TimeScaleConverter,
    config: MetricsConfig
  );

  // M1: Ephemeris Positional Accuracy
  async calculateEphemerisAccuracy(
    rectifiedChart: RasiChart,
    birthData: BirthData
  ): Promise<EphemerisAccuracyMetric[]>;

  // M2: Cross-Method Convergence
  calculateCrossMethodConvergence(
    btrAnalysis: BTRAnalysisResult
  ): CrossMethodConvergence;

  // M3: Ensemble Confidence Score
  calculateEnsembleConfidence(
    btrAnalysis: BTRAnalysisResult,
    weights: { [method: string]: number }
  ): EnsembleConfidence;

  // M4: Event-Fit Agreement
  calculateEventFitAgreement(
    rectifiedChart: RasiChart,
    lifeEvents: LifeEvent[],
    birthData: BirthData
  ): EventFitAgreement;

  // M5: Geocoding Precision
  calculateGeocodingPrecision(
    geocodingResult: GeocodingResult
  ): GeocodingPrecision;

  // Aggregate all metrics
  async calculateAllMetrics(
    btrAnalysis: BTRAnalysisResult,
    lifeEvents?: LifeEvent[]
  ): Promise<BTRMetricsResult>;

  // Persist metrics to JSON
  async persistMetrics(
    metrics: BTRMetricsResult,
    outputDir: string
  ): Promise<string>; // Returns filepath
}
```

**horizonsClient.ts:**
```typescript
export class HorizonsClient {
  constructor(config: {
    mode: 'replay' | 'record';
    fixtureDir: string;
    baseUrl?: string;
  });

  // Fetch planetary position for given JD
  async getPosition(
    body: string, // 'Sun', 'Moon', etc.
    julianDay: number,
    observer?: string // '@399' for geocentric
  ): Promise<HorizonsResponse>;

  // Record mode: fetch from API and save fixture
  private async fetchFromAPI(
    query: HorizonsQuery
  ): Promise<HorizonsResponse>;

  // Replay mode: load from fixture
  private async loadFixture(
    query: HorizonsQuery
  ): Promise<HorizonsResponse>;

  // Generate fixture filename from query
  private getFixtureFilename(query: HorizonsQuery): string;

  // Validate fixture provenance
  validateFixture(fixture: HorizonsFixture): boolean;
}
```

**timeScales.ts:**
```typescript
export class TimeScaleConverter {
  constructor(deltaTSource: 'IERS' | 'estimate' = 'IERS');

  // Convert civil time to all time scales
  convertCivilToTimeScales(
    civilTime: Date,
    timezone: string
  ): TimeScaleConversion;

  // Calculate ΔT for given date
  calculateDeltaT(date: Date): { deltaT: number; source: string };

  // Load IERS ΔT table
  private loadDeltaTTable(): DeltaTRecord[];

  // Interpolate ΔT from table
  private interpolateDeltaT(year: number, month: number): number;

  // Estimate ΔT for dates outside table range
  private estimateDeltaT(year: number): number;

  // Convert UTC to TT (add ΔT)
  utcToTT(utc: Date): Date;

  // Convert UTC to UT1 (subtract DUT1, approximation)
  utcToUT1(utc: Date): Date;

  // Julian Day in TT time scale
  julianDayTT(tt: Date): number;
}
```

**geocoding.ts:**
```typescript
// Calculate bbox diagonal in meters
export function bboxDiagonalMeters(
  bbox: [number, number, number, number] // [minLat, minLon, maxLat, maxLon]
): number;

// Haversine distance formula
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number; // meters

// Parse OpenCage response to extract precision
export function extractGeocodingPrecision(
  opencageResponse: any
): GeocodingPrecision;
```

**generate-evidence.js:**
```javascript
// Generate EVIDENCE.md from metrics artifacts
export async function generateEvidence(
  metricsDir: string,
  outputPath: string
): Promise<void>;

// Generate SOURCES.md with authoritative references
export async function generateSources(
  outputPath: string
): Promise<void>;

// Format metrics table for markdown
function formatMetricsTable(
  metrics: BTRMetricsResult[]
): string;

// Generate HTML report
export async function generateHTMLReport(
  metrics: BTRMetricsResult[],
  outputPath: string
): Promise<void>;
```

### Modified Functions

**BirthTimeRectificationService.js:**
```javascript
// BEFORE (constructor):
constructor() {
  this.chartServiceInstance = ChartGenerationServiceSingleton;
  this.dashaService = new DetailedDashaAnalysisService();
  // ... existing initialization
}

// AFTER (add optional metrics parameter):
constructor(metricsCalculator = null) {
  this.chartServiceInstance = ChartGenerationServiceSingleton;
  this.dashaService = new DetailedDashaAnalysisService();
  this.metricsCalculator = metricsCalculator; // NEW: optional dependency injection
  // ... existing initialization
}

// NEW METHOD (add to class):
async calculateMetrics(btrAnalysis, lifeEvents = []) {
  if (!this.metricsCalculator) {
    throw new Error('Metrics calculator not configured');
  }
  return await this.metricsCalculator.calculateAllMetrics(btrAnalysis, lifeEvents);
}
```

## [Classes]

New classes with key methods and inheritance.

### BTRMetrics (Main Metrics Engine)
```typescript
export class BTRMetrics {
  private horizonsClient: HorizonsClient;
  private timeScales: TimeScaleConverter;
  private config: MetricsConfig;

  constructor(
    horizonsClient: HorizonsClient,
    timeScales: TimeScaleConverter,
    config: MetricsConfig
  ) {
    this.horizonsClient = horizonsClient;
    this.timeScales = timeScales;
    this.config = config;
  }

  // Key Methods: calculateEphemerisAccuracy, calculateCrossMethodConvergence,
  // calculateEnsembleConfidence, calculateEventFitAgreement,
  // calculateGeocodingPrecision, calculateAllMetrics, persistMetrics
}
```

### HorizonsClient (JPL API with Fixtures)
```typescript
export class HorizonsClient {
  private mode: 'replay' | 'record';
  private fixtureDir: string;
  private baseUrl: string;
  private cache: Map<string, HorizonsResponse>;

  constructor(config: HorizonsClientConfig) {
    this.mode = config.mode || 'replay';
    this.fixtureDir = config.fixtureDir;
    this.baseUrl = config.baseUrl || 'https://ssd.jpl.nasa.gov/api/horizons.api';
    this.cache = new Map();
  }

  // Key Methods: getPosition, fetchFromAPI, loadFixture,
  // getFixtureFilename, validateFixture
}
```

### TimeScaleConverter (ΔT/TT/UT1/UTC)
```typescript
export class TimeScaleConverter {
  private deltaTTable: DeltaTRecord[];
  private deltaTSource: 'IERS' | 'estimate';

  constructor(deltaTSource: 'IERS' | 'estimate' = 'IERS') {
    this.deltaTSource = deltaTSource;
    this.deltaTTable = this.loadDeltaTTable();
  }

  // Key Methods: convertCivilToTimeScales, calculateDeltaT,
  // loadDeltaTTable, interpolateDeltaT, estimateDeltaT,
  // utcToTT, utcToUT1, julianDayTT
}
```

### MetricsConfig (Configuration)
```typescript
export class MetricsConfig {
  ephemerisThresholds: { [body: string]: number }; // degrees
  convergenceThreshold: number; // minutes
  ensembleThreshold: number; // 0-1
  eventFitThreshold: number; // percentage
  geocodingThreshold: number; // meters

  static default(): MetricsConfig {
    return new MetricsConfig({
      ephemerisThresholds: {
        Sun: 0.01,
        Moon: 0.05,
        Mars: 0.10,
        Mercury: 0.10,
        Jupiter: 0.10,
        Venus: 0.10,
        Saturn: 0.10
      },
      convergenceThreshold: 3, // minutes
      ensembleThreshold: 0.7,
      eventFitThreshold: 75, // percentage
      geocodingThreshold: 1000 // meters
    });
  }
}
```

## [Dependencies]

No new NPM packages required. Use existing dependencies:

**Existing Dependencies (Already in package.json):**
- `sweph` (^2.10.3-b-1) - Swiss Ephemeris for astronomical calculations
- `moment-timezone` (^0.5.43) - Timezone conversions (civil time → UTC)
- `axios` (already in devDependencies) - HTTP client for Horizons API (record mode only)
- `jest` (^29.7.0) - Test framework
- `typescript` (via ts-node) - Type checking for new modules

**No New Packages Needed** - All functionality can be implemented with existing dependencies.

**TypeScript Configuration:**
- Use existing `tsconfig.json` with strict mode
- Compile `.ts` files to `.js` during build (or use ts-node for development)
- Jest configured to handle TypeScript via babel-jest

## [Testing]

Test file requirements, existing test modifications, and validation strategies.

### New Test Files

**Unit Tests:**
1. `tests/unit/metrics/BTRMetrics.test.ts`
   - Test each M1-M5 calculation with mock inputs
   - Verify threshold logic (pass/fail conditions)
   - Test metrics aggregation and persistence

2. `tests/unit/adapters/horizonsClient.test.ts`
   - Test replay mode with fixtures
   - Test fixture validation (provenance check)
   - Test cache behavior
   - Mock record mode (no actual API calls)

3. `tests/unit/adapters/timeScales.test.ts`
   - Test ΔT interpolation with known IERS values
   - Test ΔT estimation for historical dates
   - Test UTC ↔ TT ↔ UT1 conversions
   - Test Julian Day calculation in TT

4. `tests/unit/adapters/geocoding.test.ts`
   - Test bbox diagonal calculation
   - Test haversine distance formula
   - Test precision extraction from OpenCage response

**Integration Tests:**
1. `tests/integration/btr/bphs-methods.test.js`
   - Validate Praanapada calculation against BPHS reference
   - Validate Gulika calculation with known examples
   - Test Nisheka (conception time) calculation
   - Verify intermediate values match BPHS formulas

2. `tests/integration/btr/horizons-accuracy.test.ts`
   - Load Horizons fixtures for J2000.0
   - Calculate planetary positions with ChartGenerationService
   - Compare with JPL Horizons fixtures
   - Verify M1 thresholds (Sun ≤0.01°, Moon ≤0.05°, others ≤0.10°)

3. `tests/integration/btr/golden-case.test.js`
   - Golden case: Pune, India - 24-10-1985 02:30 → expected 14:30 local
   - Run full BTR rectification
   - Calculate all metrics (M1-M5)
   - Verify success criteria (SC-1 through SC-7)
   - Persist metrics to `metrics/btr/pune_*.actual.json`
   - Compare with expected values

4. `tests/integration/btr/cross-method.test.js`
   - Test M2 cross-method convergence with multiple fixtures
   - Verify convergence threshold (≤3 minutes for clean data)
   - Test ensemble confidence (M3) calculation

5. `tests/integration/api/metrics-endpoints.test.js`
   - Test `GET /api/v1/rectification/metrics/latest`
   - Test `GET /api/v1/rectification/reports/latest`
   - Verify read-only behavior (no recomputation)

**E2E Tests:**
1. `tests/e2e/btr-accuracy-flow.cy.js` (Cypress)
   - Full user workflow: input birth data → BTR analysis → metrics display
   - Verify metrics are calculated and displayed correctly
   - Test evidence document download

### Test Fixtures

**Horizons Fixtures (Pre-recorded):**
- `fixtures/horizons/sun_2451545.0.json` - Sun at J2000.0
- `fixtures/horizons/moon_2451545.0.json` - Moon at J2000.0
- `fixtures/horizons/mars_2451545.0.json` - Mars at J2000.0
- `fixtures/horizons/pune_1985-10-24.json` - Planets for golden case

**BTR Test Data:**
- `fixtures/btr/pune_1985-10-24_0230.json` - Golden case birth data
- `fixtures/btr/edge_historical_1850.json` - Historical date edge case
- `fixtures/btr/edge_leap_second.json` - Leap second edge case
- `fixtures/btr/edge_polar.json` - Extreme latitude edge case

**ΔT Data:**
- `src/adapters/data/deltaT_iers.json` - IERS ΔT table (1973-2023)

### Test Commands

Add to `package.json`:
```json
{
  "scripts": {
    "test:btr:accuracy": "jest tests/integration/btr/horizons-accuracy.test.ts",
    "test:btr:golden": "jest tests/integration/btr/golden-case.test.js",
    "test:btr:all": "jest tests/unit/metrics tests/unit/adapters tests/integration/btr",
    "evidence:generate": "node scripts/generate-evidence.js"
  }
}
```

### CI Test Gate

In `.github/workflows/ci.yml` (or similar CI config):
```yaml
- name: Run BTR accuracy tests
  run: npm run test:btr:all
  
- name: Generate evidence
  run: npm run evidence:generate

- name: Upload artifacts
  uses: actions/upload-artifact@v2
  with:
    name: btr-evidence
    path: |
      EVIDENCE.md
      SOURCES.md
      metrics/btr/
      reports/btr/
```

## [Implementation Order]

Numbered steps showing the logical order of changes to minimize conflicts and ensure successful integration.

### Phase 1: Foundation (Time Scales & Types)
**Estimated Time**: 2-3 hours

1. **Create TypeScript type definitions**
   - Create `src/types/metrics.ts`
   - Create `src/types/horizons.ts`
   - Create `src/types/timeScales.ts`
   - **Why First**: Types provide contracts for all subsequent modules

2. **Implement time scale converter**
   - Create `src/adapters/data/deltaT_iers.json` (IERS table)
   - Create `src/adapters/timeScales.ts`
   - Create `tests/unit/adapters/timeScales.test.ts`
   - **Verify**: `npm test tests/unit/adapters/timeScales.test.ts`
   - **Why**: Time scales are foundation for M1 accuracy metric

3. **Implement geocoding utilities**
   - Create `src/adapters/geocoding.ts`
   - Create `tests/unit/adapters/geocoding.test.ts`
   - **Verify**: `npm test tests/unit/adapters/geocoding.test.ts`
   - **Why**: Required for M5 geocoding precision metric

### Phase 2: Horizons Client & Fixtures
**Estimated Time**: 3-4 hours

4. **Create Horizons fixtures**
   - Create directory `fixtures/horizons/`
   - Generate J2000.0 fixtures (Sun, Moon, Mars) using record mode
   - Create `fixtures/horizons/sun_2451545.0.json`
   - Create `fixtures/horizons/moon_2451545.0.json`
   - Create `fixtures/horizons/mars_2451545.0.json`
   - **Why**: Must have fixtures before implementing client

5. **Implement Horizons client**
   - Create `src/adapters/horizonsClient.ts`
   - Implement replay mode (reads fixtures)
   - Implement record mode (calls API + saves fixtures)
   - Create `tests/unit/adapters/horizonsClient.test.ts`
   - **Verify**: `npm test tests/unit/adapters/horizonsClient.test.ts`
   - **Why**: Required for M1 ephemeris accuracy validation

6. **Create record script**
   - Create `scripts/record-horizons-fixtures.js`
   - Document usage in script comments
   - **Verify**: `HORIZONS_MODE=record node scripts/record-horizons-fixtures.js`
   - **Why**: Provides controlled way to refresh fixtures

### Phase 3: Metrics Engine
**Estimated Time**: 4-5 hours

7. **Implement BTRMetrics class**
   - Create `src/metrics/BTRMetrics.ts`
   - Implement each metric calculation (M1-M5)
   - Create `tests/unit/metrics/BTRMetrics.test.ts`
   - **Verify**: `npm test tests/unit/metrics/BTRMetrics.test.ts`
   - **Why**: Core metrics engine must work before integration

8. **Create MetricsConfig**
   - Add MetricsConfig class to `src/metrics/BTRMetrics.ts`
   - Define default thresholds
   - Add configuration tests
   - **Verify**: Test passes with default and custom configs
   - **Why**: Configuration must be tested before API integration

### Phase 4: Integration with BTR Service
**Estimated Time**: 2-3 hours

9. **Modify BirthTimeRectificationService**
   - Add optional `metricsCalculator` parameter to constructor
   - Add `calculateMetrics()` method
   - **Verify**: Existing tests still pass
   - **Why**: Minimal integration point to preserve existing functionality

10. **Create metrics API routes**
    - Create `src/api/routes/metrics.js`
    - Implement GET `/api/v1/rectification/metrics/latest`
    - Implement GET `/api/v1/rectification/reports/latest`
    - Register routes in `src/api/routes/index.js`
    - **Verify**: Start server and test endpoints
    - **Why**: Serve generated artifacts to users

### Phase 5: Test Suite Expansion
**Estimated Time**: 4-5 hours

11. **BPHS method validation tests**
    - Create `tests/integration/btr/bphs-methods.test.js`
    - Test Praanapada calculation against BPHS formulas
    - Test Gulika calculation with known examples
    - **Verify**: `npm run test:btr:all`
    - **Why**: SC-1 requires BPHS method validation

12. **Horizons accuracy tests**
    - Create `tests/integration/btr/horizons-accuracy.test.ts`
    - Test M1 against J2000.0 fixtures
    - Verify thresholds (Sun ≤0.01°, Moon ≤0.05°)
    - **Verify**: `npm run test:btr:accuracy`
    - **Why**: SC-2 requires Horizons validation

13. **Golden case test**
    - Create `fixtures/btr/pune_1985-10-24_0230.json`
    - Create `tests/integration/btr/golden-case.test.js`
    - Test full BTR + metrics workflow
    - **Verify**: `npm run test:btr:golden`
    - **Why**: End-to-end validation of all success criteria

14. **Cross-method convergence tests**
    - Create `tests/integration/btr/cross-method.test.js`
    - Test M2 and M3 calculations
    - **Verify**: Tests pass with curated fixtures
    - **Why**: SC-3 and SC-4 validation

### Phase 6: Evidence Generation
**Estimated Time**: 3-4 hours

15. **Create evidence generator**
    - Create `scripts/generate-evidence.js`
    - Implement `generateEvidence()` - creates EVIDENCE.md
    - Implement `generateSources()` - creates SOURCES.md
    - Implement `generateHTMLReport()` - creates HTML reports
    - **Verify**: `npm run evidence:generate`
    - **Why**: SC-6 requires evidence generation

16. **Create EVIDENCE.md template**
    - Document SC-1 through SC-7 results format
    - Include metrics tables structure
    - Add golden case comparison section
    - **Why**: Template ensures consistent evidence format

17. **Create SOURCES.md**
    - List JPL Horizons API documentation
    - List IERS ΔT sources
    - List BPHS references
    - List Swiss Ephemeris documentation
    - **Why**: SC-6 requires source documentation

### Phase 7: CI Integration & Deployment
**Estimated Time**: 2-3 hours

18. **Update package.json**
    - Add `test:btr:accuracy`, `test:btr:golden`, `test:btr:all` scripts
    - Add `evidence:generate` script
    - **Verify**: All scripts run successfully
    - **Why**: CI needs executable test commands

19. **Update environment files**
    - Update `.env.example` with BTR/Horizons vars
    - Update `render.yaml` with env var definitions
    - Update `.gitignore` for metrics/reports
    - **Verify**: No env var errors on startup
    - **Why**: Deployment configuration

20. **Create post-deploy smoke script**
    - Create `scripts/post-deploy-smoke.js`
    - Test golden case against production
    - Document manual execution steps
    - **Verify**: Script runs against localhost
    - **Why**: SC-7 requires post-deploy validation

21. **Document deployment process**
    - Create `DEPLOYMENT.md` with Render steps
    - Document manual deployment workflow
    - Document smoke test execution
    - **Why**: SC-7 requires documented deployment

### Phase 8: Final Validation
**Estimated Time**: 2-3 hours

22. **Run full test suite**
    - Execute `npm run test:btr:all`
    - Verify all tests pass
    - Fix any regressions
    - **Why**: All success criteria must pass

23. **Generate evidence artifacts**
    - Execute `npm run evidence:generate`
    - Review EVIDENCE.md for completeness
    - Review SOURCES.md for accuracy
    - Verify metrics JSON files generated
    - **Why**: SC-6 validation

24. **Commit and document**
    - Create atomic commits for each phase
    - Update main README.md with BTR accuracy section
    - Tag release for deployment
    - **Why**: Version control and traceability

**Total Estimated Time**: 22-30 hours of development work

## Navigation Commands for Reading Plan

Use these commands to read specific sections of the implementation plan:

```bash
# Read Overview section
sed -n '/## \[Overview\]/,/## \[Types\]/p' implementation_plan.md | head -n -1

# Read Types section
sed -n '/## \[Types\]/,/## \[Files\]/p' implementation_plan.md | head -n -1

# Read Files section
sed -n '/## \[Files\]/,/## \[Functions\]/p' implementation_plan.md | head -n -1

# Read Functions section
sed -n '/## \[Functions\]/,/## \[Classes\]/p' implementation_plan.md | head -n -1

# Read Classes section
sed -n '/## \[Classes\]/,/## \[Dependencies\]/p' implementation_plan.md | head -n -1

# Read Dependencies section
sed -n '/## \[Dependencies\]/,/## \[Testing\]/p' implementation_plan.md | head -n -1

# Read Testing section
sed -n '/## \[Testing\]/,/## \[Implementation Order\]/p' implementation_plan.md | head -n -1

# Read Implementation Order section
sed -n '/## \[Implementation Order\]/,$p' implementation_plan.md
```