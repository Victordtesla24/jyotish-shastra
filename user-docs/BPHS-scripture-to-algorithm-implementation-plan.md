# BPHS Scripture-to-Algorithm Translation & Verification Plan

## Phase 1: Scripture Evidence Extraction & Documentation

### 1.1 Enhance BPHS_EXEC_SPEC.md with Exact Citations

- **File**: `docs/BPHS-BTR/BPHS_EXEC_SPEC.md`
- **Tasks**:
  - Add exact PDF page numbers from text extract (found: Gulika p.45, Nisheka p.53-54, Praanapada p.45)
  - Extract ≤25-word quotes for each śloka:
    - **Gulika (Ch.3, Śloka 70, p.45)**: "The degree ascending at the time of start of Gulika's portion will be the longitude of Gulika at a given place."
    - **Nisheka (Ch.4, Ślokas 25-30, p.53-54)**: "Adhana lagna: Date of birth and time minus 'x' where 'X' = A+B+C. A = angular distance between Saturn and Gulika. B = distance between ascendant and 9th house cusp. C = Moon's degrees if ascendant lord in invisible half."
    - **Praanapada (Ch.3, Ślokas 71-74, p.45)**: "Convert the given time into vighatikas and divide the same by 15. The resultant Rasi, degrees etc. be added to the Sun if he is in a movable sign..."
  - Add editor's note citations: "Gulika's position should be found out for the beginning of Saturn's Muhurta only" (p.45, note 2)
  - Add "Mandi and Gulika are one and the same" citation (p.45, note)
  - Document Sripati Paddhati MC and Lahiri ayanāṁśa references

### 1.2 Verify Praanapada Constant Against Scripture

- **Current Code**: `PALA_PER_HOUR = 2.5` in `src/core/calculations/rectification/praanapada.js:3`
- **Scripture Reference**: BPHS Ch.3 Ślokas 71-74 uses vighatikas/15, not palas/hour
- **Action**: Document discrepancy - verify if 2.5 constant is from alternative source or needs correction
- **Update**: Add verification status and alternative source if found

## Phase 2: Code Compliance Verification

### 2.1 Gulika Implementation Verification

- **File**: `src/core/calculations/rectification/gulika.js`
- **Scripture Rule**: Gulika = ascendant at START of Saturn's Muhurta (not end)
- **Verification**:
  - Check `gulika.js:139` - confirms `gulikaLocal = startLocal + segmentIndex * kalaMs` (start, not end) ✅
  - Verify Mandi ≡ Gulika handling (editor's note p.45)
  - Add JSDoc with BPHS Ch.3 Śloka 70 citation (p.45, ≤25-word quote)

### 2.2 Praanapada Implementation Verification

- **File**: `src/core/calculations/rectification/praanapada.js`
- **Scripture Rule**: Convert time to vighatikas, divide by 15, add to Sun (with sign-based corrections)
- **Verification**:
  - Current implementation uses `PALA_PER_HOUR = 2.5` (line 3) - needs scripture verification
  - BPHS text uses "vighatikas divided by 15" method, not "palas per hour"
  - Mark as GAP-003 (PALA_PER_HOUR constant needs verification/correction)
  - Add JSDoc with BPHS Ch.3 Ślokas 71-74 citation

### 2.3 Nisheka Implementation - Missing

- **File**: `src/core/calculations/rectification/nisheka.js` - ❌ DOES NOT EXIST
- **Scripture Rule**: BPHS Ch.4 Ślokas 25-30 - Adhana Lagna = Birth - (A+B+C) where:
  - A = angular distance (Saturn-Gulika)
  - B = angular distance (Ascendant-9th cusp via 4th,7th)
  - C = Moon's degrees if ascendant lord in invisible half (else 0)
  - 1 degree = 1 Savanamana day, convert to Sauramana (Gregorian)
- **Status**: GAP-001 (HIGH PRIORITY) - Implementation required

### 2.4 Service Integration Verification

- **File**: `src/services/analysis/BirthTimeRectificationService.js`
- **Tasks**:
  - Verify Gulika method integration (lines 894-990) - ✅ Uses `computeGulikaLongitude`
  - Verify Praanapada method integration (lines 706-805) - ✅ Uses `computePraanapadaLongitude`
  - Verify Nisheka integration - ❌ Missing (needs Phase 3 implementation)
  - Add BPHS citations to service-level JSDoc

## Phase 3: Gap Analysis & Documentation

### 3.1 Update BPHS_BTR_GAPS.md

- **File**: `docs/BPHS-BTR/BPHS_BTR_GAPS.md`
- **Updates**:
  - GAP-001: Add exact scripture citation (Ch.4 Ślokas 25-30, p.53-54) with ≤25-word quote
  - GAP-003: Update with scripture evidence (BPHS uses vighatikas/15, not PALA_PER_HOUR)
  - Add code pointer evidence (file:line) for each gap
  - Add impact assessment (accuracy, convergence metrics)
  - Add precise fix specifications with algorithm pseudocode

### 3.2 Create Gap Fix Specifications

- **GAP-001 (Nisheka)**:
  - Algorithm: Implement `calculateNishekaLagna()` per BPHS Ch.4 Ślokas 25-30
  - Helper functions: `angularDistance()`, `isInInvisibleHalf()`, `convertSavanamanaToSauramana()`
  - File: Create `src/core/calculations/rectification/nisheka.js`
  - Integration: Add to `BirthTimeRectificationService.js` with 25% weight
- **GAP-003 (Praanapada Constant)**:
  - Verify if 2.5 constant is from alternative source (Jataka Parijatha, Prasna Marga)
  - If verified: Document alternative source in JSDoc
  - If not verified: Update to BPHS vighatikas/15 method OR flag as @todo with justification

## Phase 4: Implementation

### 4.1 Implement Nisheka Algorithm

- **File**: Create `src/core/calculations/rectification/nisheka.js`
- **Function**: `calculateNishekaLagna(birthChart, birthData)`
- **Algorithm**:
  ```javascript
  // BPHS Ch.4 Ślokas 25-30, p.53-54
  // A = angular distance (Saturn - Gulika)
  // B = angular distance (Ascendant - 9th cusp via 4th,7th)
  // C = Moon's degrees if ascendant lord in invisible half (else 0)
  // X = A + B + C (in degrees = Savanamana days)
  // Convert Savanamana → Sauramana (Gregorian)
  // Nisheka DateTime = Birth DateTime - X_days_gregorian
  ```

- **Dependencies**: Uses Gulika from `gulika.js`, Saturn from Swiss Ephemeris, ascendant from chart
- **JSDoc**: Include BPHS Ch.4 Ślokas 25-30 citation with ≤25-word quote and PDF page

### 4.2 Integrate Nisheka into BTR Service

- **File**: `src/services/analysis/BirthTimeRectificationService.js`
- **Changes**:
  - Add `performNishekaAnalysis()` method (similar to `performPraanapadaAnalysis()`)
  - Update weighting: `{ nisheka: 0.25, praanapada: 0.30, moon: 0.25, gulika: 0.15, events: 0.05 }`
  - Add Nisheka to `performBirthTimeRectification()` pipeline
  - Add configuration flag for optional Nisheka use

### 4.3 Add Scripture Citations to Existing Code

- **Files**: 
  - `src/core/calculations/rectification/gulika.js`
  - `src/core/calculations/rectification/praanapada.js`
  - `src/services/analysis/BirthTimeRectificationService.js`
- **Format**: JSDoc with `@see BPHS Chapter X, Śloka Y (pages Z-Z)` and ≤25-word quote

## Phase 5: Testing & Validation

### 5.1 Unit Tests for Nisheka

- **File**: Create `tests/unit/rectification/nisheka.test.js`
- **Coverage**: ≥70%
- **Test Cases**:
  - Basic Nisheka calculation (A+B+C)
  - Invisible half detection (ascendant lord in houses 1-6)
  - Savanamana → Sauramana conversion
  - Edge cases (polar latitudes, date line, historical dates)

### 5.2 Integration Tests

- **File**: `tests/integration/btr/bphs-methods.test.js`
- **Updates**:
  - Remove `.skip` from Nisheka test suite (line 209)
  - Add real test data from Horizons fixtures
  - Verify against golden case (Pune 1985-10-24)
  - Test scripture conformance (compare results to BPHS example p.53-54)

### 5.3 Golden Case Validation

- **File**: `tests/integration/btr/golden-case.test.js`
- **Updates**:
  - Add Nisheka method validation
  - Verify Nisheka contributes to ensemble convergence
  - Validate M1-M5 metrics with Nisheka included

## Phase 6: Documentation & Evidence

### 6.1 Update SOURCES.md

- **File**: `SOURCES.md`
- **Add Citations**:
  - NASA/JPL Horizons API (for M1 ephemeris validation)
  - Swiss Ephemeris official docs (JPL alignment, programmer interface)
  - IANA TZ database (canonical timezone rules)
  - Positional Astronomy Centre (Govt. of India) - if used
- **Format**: URL + purpose + usage notes

### 6.2 Create Evidence Document

- **File**: `reports/btr/EVIDENCE.md`
- **Content**:
  - Scripture quotes with PDF page labels
  - Code before/after snippets (file:line references)
  - Test logs showing scripture conformance
  - Metrics JSON summaries (M1-M5)
  - Screenshots of PDF pages with ślokas highlighted (if possible)

### 6.3 Update Configuration Documentation

- **Files**: `.env.example`, `docs/architecture/`
- **Add Environment Variables**:
  ```
  HORIZONS_ENABLED=true
  HORIZONS_MODE=replay  # replay | record
  HORIZONS_FIXTURE_DIR=fixtures/horizons
  BTR_METRICS_PERSIST=json
  BTR_METRICS_DIR=metrics/btr
  BTR_REPORTS_DIR=reports/btr
  ```


## Phase 7: Metrics & Validation

### 7.1 Re-run BTR Metrics Suite

- **Command**: Run full BTR test suite
- **Output**: Artifacts to `/metrics/btr` and `/reports/btr`
- **Validation**:
  - M1 (Ephemeris accuracy): ≤0.01° for Sun, ≤0.05° for Moon
  - M2 (Cross-method convergence): ≤3 minutes spread
  - M3 (Ensemble confidence): ≥0.7 (70%)
  - M4 (Event-fit): ≥75% alignment
  - M5 (Geocoding precision): ≤1000m bbox diagonal

### 7.2 Scripture Conformance Verification

- **Validation**: All algorithmic rules match BPHS pseudocode in BPHS_EXEC_SPEC.md
- **Evidence**: Test logs showing compliance with scripture rules
- **Documentation**: Update BPHS_EXEC_SPEC.md with "COMPLIANT" status for each rule

## Acceptance Criteria Checklist

- [ ] Every algorithmic rule in BPHS_EXEC_SPEC.md has (Chapter, Śloka) + ≤25-word quote + PDF page label
- [ ] Gulika computed from START of Saturn's Muhurta (verified in code)
- [ ] Mandi ≡ Gulika handled consistently (editor's note citation)
- [ ] Nisheka-Lagna back-solve matches Ch.4 Ślokas 25-30 (implemented and tested)
- [ ] Praanapada constants verified or flagged for review
- [ ] Ephemeris/timezone handling uses authoritative sources (JPL/Swiss-Ephem, IANA tz)
- [ ] All new/updated tests pass (no regressions)
- [ ] No mocks/placeholder data in production files
- [ ] Artifacts present under `/metrics/btr` and `/reports/btr`
- [ ] SOURCES.md updated with all authoritative web links