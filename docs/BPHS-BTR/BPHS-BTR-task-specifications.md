# BPHS-BTR Implementation Task Specifications

## Overview

This document provides detailed specifications for implementing each identified gap in the BPHS-BTR system. Each task includes technical specifications, code structure, validation requirements, and success criteria.

---

## Phase 1: Critical Gap Resolution

### Task 1.1.1: Hora Chart Module Creation

**File**: `src/core/calculations/charts/horaChart.js`

**Technical Specifications**:
```javascript
/**
 * Hora (D-2) Chart Calculation for BPHS Birth Time Rectification
 * References: BPHS Chapter 5, Divisional Charts
 */

class HoraChartCalculator {
  /**
   * Calculate Hora chart positions
   * @param {Object} birthData - Birth data with time and location
   * @param {Object} rasiChart - Base D-1 chart data
   * @returns {Object} Hora chart data with planetary positions
   */
  calculateHoraChart(birthData, rasiChart) {
    // Implementation per BPHS specifications
    // Each planetary position adjusted for 2-hour divisions
  }
}
```

**Implementation Details**:
- Create Hora calculation based on BPHS Chapter 5
- Implement planetary position mapping for 2-hour segments
- Add validation for extreme time scenarios
- Integration with existing ChartGenerationService

**Validation Requirements**:
- Test against known BPHS examples from classical texts
- Verify Hora transitions at 2-hour boundaries
- Check planetary position accuracy in different latitude conditions

**Success Criteria**:
- Hora chart matches BPHS examples within 1-degree accuracy
- Integration seamless with existing chart generation workflow
- Performance: Calculation under 100ms for standard birth data

---

### Task 1.1.2: Time Division Charts

**File**: `src/core/calculations/charts/timeDivisions.js`

**Technical Specifications**:
```javascript
/**
 * Time-based chart systems for precise birth time rectification
 * Includes Ghati (60-min) and Vighati (2-min) divisions
 */

class TimeDivisionCalculator {
  /**
   * Calculate Ghati chart (24 divisions of 60 minutes each)
   */
  calculateGhatiChart(birthTime, sunrise) {
    // Each Ghati = 60 minutes = 2.5 degrees
    // BPHS Chapter 6: Time measurements
  }

  /**
   * Calculate Vighati chart (60 divisions of 2 minutes each)
   */
  calculateVighatiChart(birthTime, sunrise) {
    // Each Vighati = 2 minutes = 0.0833 degrees
    // Used for fine-tuning birth time
  }
}
```

**Implementation Details**:
- Implement sunrise-based time calculations
- Add support for extreme latitudes (polar conditions)
- Create alignment scoring with ascendant positions
- Integration with Praanapada calculations

**Validation Requirements**:
- Verify time division accuracy across different latitudes
- Test polar region scenarios (within 66.5° of poles)
- Validate sunrise-based calculations

**Success Criteria**:
- Time accuracy within 2 minutes for any latitude
- Proper handling of polar day/night conditions
- Seamless integration with existing rectification workflow

---

### Task 1.2.1: Conditional Dasha Implementation

**File**: `src/services/analysis/dasha/ConditionalDashaService.js`

**Technical Specifications**:
```javascript
/**
 * Conditional Dasha Systems for BPHS Birth Time Rectification
 * Implements Yogini, Shatabdika, and other conditional dashas
 * References: BPHS Chapter 36-42, Dasha Systems
 */

class ConditionalDashaCalculator {
  /**
   * Calculate Yogini Dasha
   * Used when specific planetary conditions are met
   */
  calculateYoginiDasha(chart, birthData) {
    // 8 Yoginis with periods of 1, 2, 3, 4, 5, 6, 7, 8 years
    // Total cycle: 36 years
  }

  /**
   * Calculate Shatabdika Dasha
   * Used for fine-tuning birth time with major events
   */
  calculateShatabdikaDasha(chart, birthData) {
    // 100-year dasha system for detailed analysis
  }

  /**
   * Determine applicable conditional dashas
   * Based on planetary positions and combinations
   */
  getApplicableConditionalDashas(chart, birthData) {
    // Logic to select appropriate conditional dashas
  }
}
```

**Implementation Details**:
- Implement multiple conditional dasha systems per BPHS
- Add condition-checking algorithms for dasha applicability
- Create scoring system for dasha-event correlation
- Integration with existing DetailedDashaAnalysisService

**Validation Requirements**:
- Test against known examples from BPHS classical texts
- Verify conditional dasha selection logic
- Validate period calculations for different birth times

**Success Criteria**:
- Conditional dasha calculations accurate within 1 day
- Proper selection of dashas based on planetary conditions
- Enhanced event correlation scoring 20% improvement

---

### Task 1.3.1: Enhanced Event Classification

**File**: `src/services/analysis/eventClassification/BPHSEventClassifier.js`

**Technical Specifications**:
```javascript
/**
 * BPHS-specific event classification system
 * Detailed categorization for precise event correlation
 * References: BPHS various chapters on event timing
 */

class BPHSEventClassifier {
  constructor() {
    this.eventCategories = {
      MARRIAGE: {
        COURTSHIP: { keywords: [], weight: 0.3 },
        ENGAGEMENT: { keywords: [], weight: 0.5 },
        MARRIAGE_CEREMONY: { keywords: [], weight: 0.8 },
        RECEPTION: { keywords: [], weight: 0.2 }
      },
      CAREER: {
        JOB_CHANGE: { keywords: [], weight: 0.6 },
        PROMOTION: { keywords: [], weight: 0.4 },
        BUSINESS_START: { keywords: [], weight: 0.7 },
        RETIREMENT: { keywords: [], weight: 0.5 }
      },
      EDUCATION: {
        EXAM_RESULTS: { keywords: [], weight: 0.6 },
        GRADUATION: { keywords: [], weight: 0.8 },
        HIGHER_EDU: { keywords: [], weight: 0.7 }
      },
      HEALTH: {
        MAJOR_ILLNESS: { keywords: [], weight: 0.7 },
        SURGERY: { keywords: [], weight: 0.6 },
        RECOVERY: { keywords: [], weight: 0.4 },
        ACCIDENT: { keywords: [], weight: 0.5 }
      },
      FINANCIAL: {
        INCOME_INCREASE: { keywords: [], weight: 0.5 },
        PROPERTY_PURCHASE: { keywords: [], weight: 0.6 },
        INVESTMENT: { keywords: [], weight: 0.4 },
        FINANCIAL_LOSS: { keywords: [], weight: 0.5 }
      }
    };
  }

  /**
   * Classify event with detailed BPHS categorization
   */
  classifyEvent(eventDescription, eventDate) {
    // NLP-based classification with BPHS-specific categories
    // Returns { category, subcategory, weight, confidence }
  }

  /**
   * Calculate event temporal importance
   * Recent events have higher weight for rectification
   */
  calculateTemporalWeight(eventDate, birthDate) {
    // Recent events (last 5 years) get higher weighting
    // Life-long events (marriage, education) maintain importance
  }
}
```

**Implementation Details**:
- Create comprehensive keyword database for each category
- Implement weighted scoring system
- Add temporal weighting for event importance
- Integration with event correlation system

**Validation Requirements**:
- Test classification accuracy with real user events
- Verify weighting system effectiveness
- Validate temporal importance calculations

**Success Criteria**:
- Event classification accuracy > 90%
- Improved correlation scores for classified events
- User-friendly event categorization

---

## Phase 2: Feature Enhancement

### Task 2.1.1: Hora Analysis Endpoint

**File**: `src/api/routes/birthTimeRectification.js` (add new endpoint)

**Technical Specifications**:
```javascript
/**
 * POST /api/v1/rectification/hora-analysis
 * Specialized Hora chart-based birth time rectification
 */

router.post('/hora-analysis', validation(horaAnalysisRequestSchema), async (req, res) => {
  try {
    const { birthData, options } = req.body;
    
    // Generate base rasi chart
    const rasiChart = await btrService.chartService.generateRasiChart(birthData);
    
    // Calculate Hora charts for time candidates
    const horaAnalysis = await btrService.performHoraRectification(birthData, rasiChart, options);
    
    res.json({
      success: true,
      horaAnalysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Error handling with BPHS-specific guidance
  }
});
```

**Implementation Details**:
- Add Hora-specific validation schema
- Implement Hora-based rectification workflow
- Create Hora-specific confidence scoring
- Add detailed Hora analysis reporting

**Validation Requirements**:
- Test endpoint functionality with various birth data
- Verify Hora-specific validation rules
- Validate error handling and response formats

**Success Criteria**:
- Endpoint responds under 2 seconds
- Proper Hora analysis integration
- Clear reporting of Hora-based findings

---

### Task 2.2.1: Method Weighting System

**File**: `src/services/analysis/config/BTRConfigurationManager.js`

**Technical Specifications**:
```javascript
/**
 * BTR Configuration and Method Weighting System
 * Flexible configuration for different rectification needs
 */

class BTRConfigurationManager {
  constructor() {
    this.defaultWeights = {
      praanapada: 0.4,
      moon: 0.3,
      gulika: 0.2,
      events: 0.1
    };
    
    this.defaultThresholds = {
      confidence: 60,
      alignmentScore: 50,
      correlationScore: 40
    };
  }

  /**
   * Create custom BTR configuration
   */
  createConfiguration(userOptions = {}) {
    // Merge user options with defaults
    // Validate configuration parameters
    // Return validated configuration
  }

  /**
   * Calculate confidence based on weighted scores
   */
  calculateWeightedConfidence(scores, weights) {
    // Weighted confidence calculation
    // Return final confidence score
  }

  /**
   * Validate configuration parameters
   */
  validateConfiguration(config) {
    // Check weight sums = 1.0
    // Validate threshold ranges
    // Return validation result
  }
}
```

**Implementation Details**:
- Implement flexible configuration system
- Add weight normalization and validation
- Create configuration presets for different use cases
- Integration with all rectification methods

**Validation Requirements**:
- Test various configuration combinations
- Validate weight normalization
- Verify configuration persistence

**Success Criteria**:
- Configuration validated before processing
- Smooth weight-based confidence calculation
- User-friendly configuration interface

---

### Task 2.3.1: Enhanced Sunrise Calculations

**File**: `src/core/calculations/astronomy/sunrise.js` (enhancement)

**Technical Specifications**:
```javascript
/**
 * Enhanced Sunrise/Sunset Calculation with BPHS Accuracy
 * Includes atmospheric corrections and polar support
 */

class EnhancedSunriseCalculator {
  /**
   * Calculate sunrise with atmospheric refraction
   */
  calculateSunriseWithRefraction(date, latitude, longitude, timezone) {
    // Apply atmospheric refraction corrections
    // Account for elevation above sea level
    // Include seasonal variations
  }

  /**
   * Handle polar region calculations
   */
  calculatePolarSunrise(date, latitude, longitude, timezone) {
    // Special calculations for latitudes > 66.5°
    // Handle midnight sun and polar night conditions
    // Provide appropriate fallback methods
  }

  /**
   * Enhanced fallback with seasonal corrections
   */
  calculateEnhancedFallback(date, latitude, longitude, timezone) {
    // Improved fallback algorithm
    // Seasonal altitude corrections
    // Longitude-based time adjustments
  }
}
```

**Implementation Details**:
- Implement atmospheric refraction corrections
- Add elevation-based adjustments
- Create polar region support
- Enhance fallback accuracy

**Validation Requirements**:
- Test sunrise accuracy across different latitudes
- Verify polar region calculations
- Validate atmospheric corrections

**Success Criteria**:
- Sunrise accuracy within 30 seconds globally
- Proper polar region handling
- Enhanced fallback for all conditions

---

## Phase 3: Integration and Quality Assurance

### Task 3.1.1: D2-Hora Integration

**File**: `src/services/analysis/BirthTimeRectificationService.js` (enhancement)

**Technical Specifications**:
```javascript
/**
 * Enhanced BirthTimeRectificationService with Divisional Chart Integration
 */

class EnhancedBirthTimeRectificationService extends BirthTimeRectificationService {
  /**
   * Perform divisional chart-based verification
   */
  async performDivisionalChartAnalysis(birthData, timeCandidates) {
    // D2-Hora analysis
    // D24-Chaturthamsa analysis
    // Composite scoring system
  }

  /**
   * Calculate Hora-ascendant alignment
   */
  calculateHoraAlignment(horaChart, candidateTime) {
    // BPHS-specific Hora alignment calculations
    // Return alignment score and analysis
  }

  /**
   * Create composite scoring from multiple divisional charts
   */
  calculateCompositeDivisionalScore(divisionalResults) {
    // Weighted scoring from multiple charts
    // Return composite confidence score
  }
}
```

**Implementation Details**:
- Integrate Hora chart analysis into rectification workflow
- Add Chaturthamsa chart for specific event types
- Create composite scoring system
- Enhance overall confidence calculation

**Validation Requirements**:
- Test divisional chart integration effectiveness
- Verify composite scoring accuracy
- Validate workflow integration

**Success Criteria**:
- 15% improvement in rectification confidence
- Seamless divisional chart integration
- Enhanced event correlation accuracy

---

## Phase 4: Documentation and Refinement

### Task 4.1.1: BPHS Documentation Enhancement

**File**: Multiple implementation files (documentation enhancement)

**Technical Specifications**:
```javascript
/**
 * Example of enhanced documentation in calculation modules
 */

/**
 * Praanapada Calculation per BPHS
 * 
 * References:
 * - Brihat Parashara Hora Shastra, Chapter 5, Verse 12
 * - Traditional calculation: Praanapada = Sun's position + Birth time in palas
 * 
 * Calculation Method:
 * 1. Convert birth time to palas (1 hour = 2.5 palas)
 * 2. Add palas to Sun's longitude
 * 3. Normalize result to 0-360 degrees
 * 
 * Applications:
 * - Birth time rectification
 * - Ascendant verification
 * - Praana (breath) analysis
 */
async calculatePraanapada(candidate, chart, birthData) {
  // Implementation with detailed comments
}
```

**Implementation Details**:
- Add BPHS references to all calculation methods
- Include chapter and verse citations where applicable
- Create methodology explanation in code comments
- Add user-facing documentation for API endpoints

**Validation Requirements**:
- Verify reference accuracy
- Ensure documentation matches implementation
- Test clarity of explanations

**Success Criteria**:
- Comprehensive BPHS references throughout code
- Clear methodology explanations
- User-friendly documentation

---

## Testing Strategy

### Unit Test Specifications

**File**: `tests/unit/rectification/horaChart.test.js`
```javascript
describe('HoraChartCalculator', () => {
  test('should calculate Hora chart positions accurately', () => {
    // Test against BPHS examples
  });
  
  test('should handle extreme birth times correctly', () => {
    // Edge case testing
  });
  
  test('should integrate with existing chart system', () => {
    // Integration validation
  });
});
```

### Integration Test Specifications

**File**: `tests/integration/api/btr_enhanced.test.js`
```javascript
describe('Enhanced BTR API', () => {
  test('should perform comprehensive rectification with new features', () => {
    // End-to-end testing
  });
  
  test('should handle configuration options correctly', () => {
    // Configuration testing
  });
  
  test('should maintain performance with enhancements', () => {
    // Performance validation
  });
});
```

### Performance Test Specifications

**File**: `tests/performance/btr_load.test.js`
```javascript
describe('BTR Performance Tests', () => {
  test('should handle concurrent BTR requests', () => {
    // Load testing for API endpoints
  });
  
  test('should maintain calculation speed accuracy', () => {
    // Performance benchmarks
  });
  
  test('should optimize memory usage for complex calculations', () => {
    // Memory usage testing
  });
});
```

---

## Success Criteria Summary

### Quantitative Metrics
- **Implementation Completeness**: 95%+ of identified gaps resolved
- **Test Coverage**: 90%+ for all new functionality
- **API Performance**: <2 seconds for standard rectification, <5 seconds for enhanced
- **Accuracy Improvement**: 15-20% improvement in rectification confidence scores
- **Code Quality**: BPHS references in 90%+ of calculation methods

### Qualitative Metrics
- **Maintainability**: Well-documented code with clear BPHS methodology
- **Extensibility**: Modular design supporting future enhancements
- **User Experience**: Clear error messages and comprehensive reporting
- **Compliance**: Adherence to BPHS principles and calculations

---

## Implementation Checklist

### Phase 1 Checkpoints
- [ ] Hora chart module created and tested
- [ ] Time division charts implemented
- [ ] Conditional dashas calculated correctly
- [ ] Enhanced event classification active
- [ ] Integration tests passing

### Phase 2 Checkpoints
- [ ] Specialized API endpoints functional
- [ ] Configuration system operational
- [ ] Sunrise calculations enhanced
- [ ] Performance benchmarks met
- [ ] Error handling improved

### Phase 3 Checkpoints
- [ ] Divisional chart integration complete
- [ ] Input validation enhanced
- [ ] Comprehensive test suite created
- [ ] Load testing completed
- [ ] Memory optimization implemented

### Phase 4 Checkpoints
- [ ] BPHS documentation complete
- [ ] Reporting system enhanced
- [ ] Final quality assurance passed
- [ ] Release documentation prepared
- [ ] User guides created

---

This detailed task specification provides the technical foundation for implementing all identified gaps in the BPHS-BTR system. Each task includes clear technical specifications, validation requirements, and success criteria to ensure successful implementation.
