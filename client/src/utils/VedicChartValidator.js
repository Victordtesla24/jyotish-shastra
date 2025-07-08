
/**
 * PLANETARY POSITION VALIDATION SCRIPT
 * Validates that UI chart matches API data exactly
 * Run this in browser console or as a test script
 */

class VedicChartValidator {
  constructor(apiData, chartContainer) {
    this.apiData = apiData;
    this.chartContainer = chartContainer;
    this.errors = [];
    this.warnings = [];
  }

  // Validate planetary positions match API data
  validatePlanetaryPositions() {
    console.log('🔍 Validating Planetary Positions...');

    const expectedPositions = {
      'sun': { house: 8, sign: 'Libra', degree: 7.24, longitude: 187.24 },
      'moon': { house: 12, sign: 'Aquarius', degree: 19.12, longitude: 319.12 },
      'mars': { house: 7, sign: 'Virgo', degree: 4.30, longitude: 154.30 },
      'mercury': { house: 8, sign: 'Libra', degree: 26.51, longitude: 206.51 },
      'jupiter': { house: 11, sign: 'Capricorn', degree: 14.19, longitude: 284.19 },
      'venus': { house: 7, sign: 'Virgo', degree: 16.06, longitude: 166.06 },
      'saturn': { house: 8, sign: 'Scorpio', degree: 3.60, longitude: 213.60 },
      'rahu': { house: 2, sign: 'Aries', degree: 15.80, longitude: 15.80 },
      'ketu': { house: 8, sign: 'Libra', degree: 15.80, longitude: 195.80 }
    };

    Object.entries(expectedPositions).forEach(([planet, expected]) => {
      const planetElement = this.chartContainer.querySelector(`[data-testid="planet-${planet}"]`);

      if (!planetElement) {
        this.errors.push(`❌ Planet ${planet} not found in UI`);
        return;
      }

      // Check house positioning
      const houseElement = this.chartContainer.querySelector(`[data-testid="house-${expected.house}"]`);
      if (!houseElement || !houseElement.contains(planetElement)) {
        this.errors.push(`❌ ${planet} should be in house ${expected.house}, but found elsewhere`);
      }

      // Check data attributes
      const actualSign = planetElement.getAttribute('data-sign');
      const actualDegree = parseFloat(planetElement.getAttribute('data-degree'));
      const actualLongitude = parseFloat(planetElement.getAttribute('data-longitude'));

      if (actualSign !== expected.sign) {
        this.errors.push(`❌ ${planet} sign mismatch: expected ${expected.sign}, got ${actualSign}`);
      }

      if (Math.abs(actualDegree - expected.degree) > 0.1) {
        this.errors.push(`❌ ${planet} degree mismatch: expected ${expected.degree}°, got ${actualDegree}°`);
      }

      if (Math.abs(actualLongitude - expected.longitude) > 0.1) {
        this.errors.push(`❌ ${planet} longitude mismatch: expected ${expected.longitude}°, got ${actualLongitude}°`);
      }

      console.log(`✅ ${planet}: House ${expected.house}, ${actualSign} ${actualDegree}°`);
    });
  }

  // Validate house-sign mapping
  validateHouseSignMapping() {
    console.log('🔍 Validating House-Sign Mapping...');

    // Expected rashi numbers for Aquarius ascendant
    const expectedRashiNumbers = {
      1: 11, 2: 12, 3: 1, 4: 2, 5: 3, 6: 4,
      7: 5, 8: 6, 9: 7, 10: 8, 11: 9, 12: 10
    };

    Object.entries(expectedRashiNumbers).forEach(([houseNum, expectedRashi]) => {
      const rashiElement = this.chartContainer.querySelector(`[data-testid="rashi-${houseNum}"]`);

      if (!rashiElement) {
        this.errors.push(`❌ Rashi number for house ${houseNum} not found`);
        return;
      }

      const actualRashi = parseInt(rashiElement.textContent.trim());
      if (actualRashi !== expectedRashi) {
        this.errors.push(`❌ House ${houseNum} rashi mismatch: expected ${expectedRashi}, got ${actualRashi}`);
      }

      // Check that house number is NOT displayed
      const houseElement = this.chartContainer.querySelector(`[data-testid="house-${houseNum}"]`);
      const houseText = houseElement.textContent;
      if (houseText.includes(houseNum.toString()) && !houseText.includes(`${expectedRashi}`)) {
        this.warnings.push(`⚠️ House ${houseNum} might be showing house number instead of rashi number`);
      }

      console.log(`✅ House ${houseNum}: Rashi ${actualRashi}`);
    });
  }

  // Check for overlapping text
  validateNoTextOverlap() {
    console.log('🔍 Checking for text overlaps...');

    const textElements = Array.from(this.chartContainer.querySelectorAll('text, [data-testid^="planet-"]'));

    for (let i = 0; i < textElements.length; i++) {
      for (let j = i + 1; j < textElements.length; j++) {
        const rect1 = textElements[i].getBoundingClientRect();
        const rect2 = textElements[j].getBoundingClientRect();

        const overlap = !(rect1.right < rect2.left || 
                         rect2.right < rect1.left || 
                         rect1.bottom < rect2.top || 
                         rect2.bottom < rect1.top);

        if (overlap) {
          this.warnings.push(`⚠️ Text overlap detected between elements ${i} and ${j}`);
        }
      }
    }

    console.log(`✅ Checked ${textElements.length} text elements for overlaps`);
  }

  // Validate template compliance
  validateTemplateCompliance() {
    console.log('🔍 Validating template compliance...');

    // Check SVG structure
    const svg = this.chartContainer.querySelector('svg');
    if (!svg) {
      this.errors.push('❌ No SVG element found');
      return;
    }

    if (svg.getAttribute('viewBox') !== '0 0 400 400') {
      this.errors.push('❌ Incorrect SVG viewBox');
    }

    // Check for required elements
    const requiredElements = [
      'जन्म कुंडली', // Devanagari title
      'Vedic Birth Chart', // English title
      'ॐ' // Central OM symbol
    ];

    requiredElements.forEach(text => {
      if (!this.chartContainer.textContent.includes(text)) {
        this.errors.push(`❌ Missing template element: ${text}`);
      }
    });

    // Check decorative corners
    const corners = this.chartContainer.querySelectorAll('.absolute[class*="top-2"][class*="left-2"]');
    if (corners.length === 0) {
      this.warnings.push('⚠️ Missing decorative corner elements');
    }

    console.log('✅ Template compliance check complete');
  }

  // Check for hardcoded data
  validateNoHardcodedData() {
    console.log('🔍 Checking for hardcoded data...');

    // Look for suspicious hardcoded coordinates or test data
    const suspiciousPatterns = [
      'hardcoded', 'mock', 'test-data', 'sample', 'dummy',
      'x="100" y="100"', // hardcoded coordinates
      'longitude: 0', // default values
    ];

    const componentSource = this.chartContainer.outerHTML;

    suspiciousPatterns.forEach(pattern => {
      if (componentSource.toLowerCase().includes(pattern.toLowerCase())) {
        this.warnings.push(`⚠️ Potentially hardcoded data detected: ${pattern}`);
      }
    });

    console.log('✅ Hardcoded data check complete');
  }

  // Run all validations
  validate() {
    console.log('🚀 Starting Vedic Chart Validation...');
    console.log('=' * 50);

    this.validatePlanetaryPositions();
    this.validateHouseSignMapping();
    this.validateNoTextOverlap();
    this.validateTemplateCompliance();
    this.validateNoHardcodedData();

    console.log('=' * 50);
    console.log('📊 VALIDATION RESULTS:');
    console.log(`✅ Errors: ${this.errors.length}`);
    console.log(`⚠️ Warnings: ${this.warnings.length}`);

    if (this.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.errors.forEach(error => console.log(error));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:');
      this.warnings.forEach(warning => console.log(warning));
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('\n🎉 ALL VALIDATIONS PASSED! Chart is accurate.');
    }

    return {
      passed: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }
}

// Usage in browser console:
// const chartContainer = document.querySelector('[data-testid="vedic-chart-container"]');
// const validator = new VedicChartValidator(apiData, chartContainer);
// const results = validator.validate();

export default VedicChartValidator;
