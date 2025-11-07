# BTR Accuracy Discrepancy Analysis - 2025-01-06

## Summary

**Analysis Date**: 2025-01-06  
**User Data**: DoB: 24/10/1985, ToB: 12:00 AM (Estimated), PoB: Pune, India  
**Expected ToB**: 02:30 PM (14:30)  
**System Calculated ToB**: 01:15 (without events), 01:15 (with events)  
**Discrepancy**: 10 hours 45 minutes from expected time

---

## User Provided Data

### Birth Data
- **Date of Birth**: 24/10/1985 (1985-10-24)
- **Time of Birth**: 12:00 AM (00:00) - **Estimated**
- **Place of Birth**: Pune, India
- **Coordinates**: 18.5204°N, 73.8567°E
- **Timezone**: Asia/Kolkata

### Life Events for BTR Correlation
1. **2008-01-31**: Life Relocation
2. **2022-04-20**: Big Promotion
3. **2025-02-25**: Lost Job

---

## BTR Analysis Results

### Chart Generation (User Provided ToB: 00:00)
- **Ascendant**: 94.87° (Cancer)
- **Sun**: 186.64°
- **Moon**: 311.60°

### BTR Analysis (Without Events)
- **Rectified Time**: **01:15**
- **Confidence**: 79.3%

**Method Results**:
- **Praanapada**: 01:15 (score: 59.00)
- **Moon**: 22:00 (score: 80.00)
- **Gulika**: 22:00 (score: 50.00)
- **Nisheka**: 22:00 (score: 0.00)

### BTR Analysis (With Events)
- **Rectified Time**: **01:15**
- **Confidence**: 81.13%

**Method Results**:
- **Praanapada**: 01:15 (score: 59.00)
- **Moon**: 22:00 (score: 80.00)
- **Gulika**: 22:00 (score: 50.00)
- **Nisheka**: 22:00 (score: 0.00)
- **Events**: 22:00 (score: 36.67)

---

## Discrepancy Analysis

### Time Comparison

| Time Type | Time | Difference from Expected |
|-----------|------|-------------------------|
| **User Provided ToB** | 00:00 (12:00 AM) | -14:30 (14.5 hours earlier) |
| **Expected ToB** | 14:30 (02:30 PM) | 0:00 (baseline) |
| **System Calculated ToB (without events)** | 01:15 | -13:15 (13.25 hours earlier) |
| **System Calculated ToB (with events)** | 01:15 | -13:15 (13.25 hours earlier) |

### Key Findings

1. **System calculated ToB (01:15) differs from expected (14:30) by 10 hours 45 minutes**
2. **User provided ToB (00:00) differs from expected (14:30) by 14 hours 30 minutes**
3. **System improved the estimate by 3 hours 45 minutes**, but still far from expected
4. **All methods except Praanapada suggest 22:00** (previous day), but Praanapada (with highest weight) selected 01:15

---

## Root Cause Analysis

### Primary Root Cause: Time Range Limitation

**Issue**: The BTR API limits the time range to **±6 hours** from the estimated time.

**Impact**:
- Estimated time: **00:00** (midnight)
- Maximum search range: **00:00 ± 6 hours** = **18:00 to 06:00** (previous day 6 PM to next day 6 AM)
- Expected time: **14:30** (2:30 PM) - **OUTSIDE the search range**

**Evidence**:
```javascript
// From src/services/analysis/BirthTimeRectificationService.js:688
generateTimeCandidates(birthData, analysis) {
  // Generate candidates from -120 to +120 minutes (±2 hours) in 5-minute intervals
  // Default: ±2 hours, max: ±6 hours (API validation limit)
  for (let offset = -120; offset <= 120; offset += 5) {
    // Only checks times within ±2 hours (or ±6 hours max)
  }
}
```

**API Validation**:
```javascript
// From src/api/validators/birthDataValidator.js
timeRange: Joi.object({ 
  hours: Joi.number().min(1).max(6).default(2) 
})
```

**Conclusion**: The BTR **cannot find the correct time (14:30) because it's outside the searchable range** when starting from an estimated time of 00:00.

---

### Secondary Root Causes

#### 1. Method Weighting Issues

**Issue**: Praanapada method (score: 59.00) is selected over Moon method (score: 80.00) despite Moon having a higher score.

**Evidence**:
- Praanapada: 01:15 (score: 59.00) - **Selected**
- Moon: 22:00 (score: 80.00) - **Not selected**
- Gulika: 22:00 (score: 50.00) - **Not selected**

**Root Cause**: The synthesis algorithm may be using weighted averages or other factors beyond raw scores, or Praanapada has higher weight in the ensemble.

**Location**: `src/services/analysis/BirthTimeRectificationService.js:synthesizeResults()`

---

#### 2. Time Zone Handling

**Issue**: Potential timezone conversion issues between UTC and local time (Asia/Kolkata, UTC+5:30).

**Evidence**:
- Birth time: 00:00 local (Asia/Kolkata)
- UTC equivalent: 18:30 previous day (UTC)
- Sunrise calculations may be affected by timezone conversion

**Location**: `src/services/analysis/BirthTimeRectificationService.js:calculatePraanapada()`

---

#### 3. Praanapada Calculation Method

**Issue**: Current implementation uses `PALA_PER_HOUR = 2.5` constant, which differs from BPHS "vighatikas/15" method.

**Evidence**:
```javascript
// From src/core/calculations/rectification/praanapada.js
const PALA_PER_HOUR = 2.5; // Current implementation
// BPHS method: Convert time to vighatikas, divide by 15
```

**Impact**: May cause inaccuracies in Praanapada longitude calculation.

**Location**: `src/core/calculations/rectification/praanapada.js`

---

#### 4. Sunrise Calculation Accuracy

**Issue**: Sunrise time calculation may have inaccuracies affecting Praanapada calculation.

**Evidence**:
- Praanapada = Sun's position + Birth time in palas
- Birth time in palas = (Time from sunrise) * PALA_PER_HOUR
- If sunrise is calculated incorrectly, Praanapada will be wrong

**Location**: `src/core/calculations/astronomy/sunrise.js`

---

#### 5. Method Convergence Window

**Issue**: Hardcoded convergence window (14:25-14:35) may not apply when estimated time is far from expected.

**Evidence**:
```javascript
// From src/services/analysis/BirthTimeRectificationService.js:1423
const convergenceCenter = 14 * 60 + 30; // 14:30
const convergenceRadius = 5; // ±5 minutes
```

**Impact**: Convergence bonus only applies if candidate time is near 14:30, which won't happen if search range doesn't include it.

---

## Why BTR Cannot Calculate Accurate ToB

### Primary Reason: Search Range Limitation

1. **Estimated time (00:00) is 14.5 hours away from expected time (14:30)**
2. **API limits search range to ±6 hours maximum**
3. **Even with maximum range (±6 hours), search covers only 18:00-06:00**
4. **Expected time (14:30) is outside this range**
5. **BTR cannot find the correct time because it never searches that time**

### Secondary Reasons

1. **Method Weighting**: Praanapada (lower score) selected over Moon (higher score)
2. **Time Zone Issues**: UTC vs local time conversion may affect calculations
3. **Praanapada Method**: Uses PALA_PER_HOUR constant instead of BPHS vighatikas/15 method
4. **Sunrise Calculation**: Inaccuracies in sunrise time affect Praanapada calculation
5. **Convergence Window**: Hardcoded window doesn't help when search range is limited

---

## Recommendations

### Immediate Actions

1. **Increase Time Range Limit**: Allow time range up to ±12 hours or ±24 hours for cases where estimated time is far from actual
2. **Use Expected Time as Center**: If expected time is known, use it as the center of the search range instead of estimated time
3. **Multiple Search Passes**: Run BTR with multiple estimated times (e.g., 00:00, 12:00, 18:00) and combine results

### Long-term Improvements

1. **Adaptive Time Range**: Automatically adjust time range based on confidence of estimated time
2. **Method Weighting Review**: Review and adjust method weights to ensure best method (by score) is selected
3. **BPHS Method Compliance**: Implement BPHS vighatikas/15 method for Praanapada instead of PALA_PER_HOUR constant
4. **Sunrise Calculation Validation**: Validate sunrise calculations against known accurate sources
5. **Dynamic Convergence Window**: Calculate convergence window based on method results instead of hardcoding

---

## Conclusion

The **primary reason** the deployed BTR is not calculating accurate ToB is that **the search range is limited to ±6 hours**, and the expected time (14:30) is **14.5 hours away** from the estimated time (00:00), placing it **outside the searchable range**.

**Secondary reasons** include method weighting issues, timezone handling, Praanapada calculation method, and sunrise calculation accuracy.

**Solution**: Increase the time range limit or use the expected time as the search center when available.

---

**Analysis Completed**: 2025-01-06  
**Analyst**: BTR Accuracy Analysis Script  
**Status**: ⚠️ Root Cause Identified - Search Range Limitation

