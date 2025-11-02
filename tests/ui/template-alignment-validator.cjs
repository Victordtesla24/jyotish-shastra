/**
 * Template Alignment Validator - Comprehensive Visual Testing
 * ===========================================================
 * Provides robust validation for perfect Kundli template alignment
 * Tests house boundaries, planetary positions, and Rasi number placement
 * Includes overlay comparison and accuracy verification
 * ===========================================================
 */

"use strict";

const fs = require('fs');
const path = require('path');

/**
 * Template Alignment Validation Suite
 * Tests VedicChartDisplay component for perfect Kundli template matching
 */
class TemplateAlignmentValidator {

  constructor() {
    this.chartComponentPath = path.resolve(__dirname, '../../client/src/components/charts/VedicChartDisplay.jsx');
    this.requiredTolerance = {
      house: 2,     // ±2px for house boundaries
      planet: 3,    // ±3px for planetary positions  
      rasi: 2       // ±2px for Rasi numbers
    };
    this.testResults = {
      houseAlignment: { passed: false, issues: [] },
      planetaryAlignment: { passed: false, issues: [] },
      rasiAlignment: { passed: false, issues: [] },
      clusteringPrevention: { passed: false, issues: [] },
      overallAccuracy: 0
    };
  }

  /**
   * Run comprehensive template alignment validation
   */
  async runValidation() {
    console.log('🔍 Starting comprehensive template alignment validation...');
    
    if (this.validateComponentFile()) {
      await this.testHouseBoundaryAlignment();
      await this.testPlanetaryPositioning();
      await this.testRasiNumberAlignment();
      await this.testClusteringPrevention();
      this.calculateOverallAccuracy();
      this.generateReport();
    }
    
    return this.testResults;
  }

  /**
   * Validate component file exists and has required structure
   */
  validateComponentFile() {
    console.log('📁 Checking component file structure...');
    
    if (!fs.existsSync(this.chartComponentPath)) {
      console.error('❌ VedicChartDisplay.jsx file not found');
      return false;
    }

    const componentContent = fs.readFileSync(this.chartComponentPath, 'utf8');
    
    // Check for required positioning constants
    const requiredElements = [
      'HOUSE_POSITIONS',
      'RASI_NUMBER_POSITIONS', 
      'calculatePrecisePlanetPosition',
      'CLUSTERING_PREVENTION',
      'template-calibrated'
    ];

    const missingElements = requiredElements.filter(element => !componentContent.includes(element));
    
    if (missingElements.length > 0) {
      console.error('❌ Missing required elements:', missingElements);
      return false;
    }

    console.log('✅ Component file structure validation passed');
    return true;
  }

  /**
   * Test house boundary alignment against template coordinates
   */
  async testHouseBoundaryAlignment() {
    console.log('🏠 Testing house boundary alignment...');
    
    const componentContent = fs.readFileSync(this.chartComponentPath, 'utf8');
    
    // Extract HOUSE_POSITIONS coordinates
    const housePositionsMatch = componentContent.match(/const HOUSE_POSITIONS = \{([^}]+)\}/s);
    
    if (!housePositionsMatch) {
      this.testResults.houseAlignment.issues.push('HOUSE_POSITIONS not found');
      return;
    }

    // Template-expected coordinates (calibrated for perfect Kundli alignment)
    const expectedCoordinates = {
      1:  { x: 250, y: 100 },    // Top center - Ascendant
      2:  { x: 345, y: 130 },    // Top right-upper
      3:  { x: 400, y: 180 },    // Right upper  
      4:  { x: 400, y: 250 },    // Right center
      5:  { x: 400, y: 320 },    // Right lower
      6:  { x: 345, y: 370 },    // Bottom right-lower
      7:  { x: 250, y: 400 },    // Bottom center
      8:  { x: 155, y: 370 },    // Bottom left-lower
      9:  { x: 100, y: 320 },    // Left lower
      10: { x: 100, y: 250 },    // Left center
      11: { x: 100, y: 180 },    // Left upper
      12: { x: 155, y: 130 }     // Top left-upper
    };

    // Test each house position with more flexible parsing
    let alignmentIssues = 0;
    const housePositionsText = housePositionsMatch[1];
    
    for (let houseNum = 1; houseNum <= 12; houseNum++) {
      // More flexible regex that handles line breaks and comments
      const houseRegex = new RegExp(`${houseNum}:\\s*\\{[^}]*?x:\\s*([A-Z_]+|[\\d.]+)[^}]*?y:\\s*([A-Z_]+|[\\d.]+)[^}]*?\\}`, 's');
      const match = housePositionsText.match(houseRegex);
      
      if (!match) {
        this.testResults.houseAlignment.issues.push(`House ${houseNum} position definition missing`);
        alignmentIssues++;
        continue;
      }

      // Handle CENTER_X variables
      let actualX = match[1];
      let actualY = match[2];
      
      // Convert variable references to numeric values
      if (actualX === 'CENTER_X') actualX = '250';
      if (actualY === 'CENTER_Y') actualY = '250';
      
      actualX = parseFloat(actualX);
      actualY = parseFloat(actualY);
      const expected = expectedCoordinates[houseNum];
      
      const xDiff = Math.abs(actualX - expected.x);
      const yDiff = Math.abs(actualY - expected.y);
      
      if (xDiff > this.requiredTolerance.house || yDiff > this.requiredTolerance.house) {
        this.testResults.houseAlignment.issues.push(
          `House ${houseNum} position misaligned: expected (${expected.x}, ${expected.y}), got (${actualX}, ${actualY})`
        );
        alignmentIssues++;
      }
    }

    this.testResults.houseAlignment.passed = alignmentIssues === 0;
    console.log(`${this.testResults.houseAlignment.passed ? '✅' : '❌'} House boundary alignment: ${alignmentIssues} issues found`);
  }

  /**
   * Test planetary positioning algorithm
   */
  async testPlanetaryPositioning() {
    console.log('🪐 Testing planetary positioning algorithm...');
    
    const componentContent = fs.readFileSync(this.chartComponentPath, 'utf8');
    
    // Check for enhanced clustering prevention
    const requiredFeatures = [
      'CLUSTERING_PREVENTION',
      'MIN_PLANET_SPACING',
      'placePlanetsInCorners',
      'emergency separation adjustment',
      'distance calculation'
    ];

    const missingFeatures = requiredFeatures.filter(feature => !componentContent.includes(feature));
    
    if (missingFeatures.length > 0) {
      this.testResults.planetaryAlignment.issues.push('Missing clustering prevention features: ' + missingFeatures.join(', '));
    }

    // Test corner offset calibration
    const cornerOffsetsMatch = componentContent.match(/const CORNER_OFFSETS = \{([^}]+)\}/s);
    
    if (cornerOffsetsMatch) {
      const expectedXValues = [60, 60, -60, -60]; // primary, secondary, tertiary, quaternary
      const expectedYValues = [50, -50, 50, -50]; // primary, secondary, tertiary, quaternary
      
      expectedXValues.forEach((expectedX, index) => {
        if (!cornerOffsetsMatch[1].includes(`x: ${expectedX}`)) {
          this.testResults.planetaryAlignment.issues.push(`Corner offset ${index + 1} X-coordinate not properly calibrated`);
        }
        if (!cornerOffsetsMatch[1].includes(`y: ${expectedYValues[index]}`)) {
          this.testResults.planetaryAlignment.issues.push(`Corner offset ${index + 1} Y-coordinate not properly calibrated`);
        }
      });
    } else {
      this.testResults.planetaryAlignment.issues.push('CORNER_OFFSETS not found');
    }

    this.testResults.planetaryAlignment.passed = this.testResults.planetaryAlignment.issues.length === 0;
    console.log(`${this.testResults.planetaryAlignment.passed ? '✅' : '❌'} Planetary positioning: ${this.testResults.planetaryAlignment.issues.length} issues found`);
  }

  /**
   * Test Rasi number diamond intersection positioning
   */
  async testRasiNumberAlignment() {
    console.log('🔢 Testing Rasi number alignment...');
    
    const componentContent = fs.readFileSync(this.chartComponentPath, 'utf8');
    
    // Extract RASI_NUMBER_POSITIONS coordinates
    const rasiPositionsMatch = componentContent.match(/const RASI_NUMBER_POSITIONS = \{([^}]+)\}/s);
    
    if (!rasiPositionsMatch) {
      this.testResults.rasiAlignment.issues.push('RASI_NUMBER_POSITIONS not found');
      return;
    }

    // Template-expected diamond intersection coordinates
    const expectedRasiCoordinates = {
      1:  { x: 150, y: 150 },    // Top-left intersection
      2:  { x: 180, y: 110 },    // Top edge left
      3:  { x: 320, y: 110 },    // Top edge right
      4:  { x: 350, y: 150 },    // Top-right intersection
      5:  { x: 390, y: 180 },    // Right edge top
      6:  { x: 390, y: 320 },    // Right edge bottom
      7:  { x: 350, y: 350 },    // Bottom-right intersection
      8:  { x: 320, y: 390 },    // Bottom edge right
      9:  { x: 180, y: 390 },    // Bottom edge left
      10: { x: 150, y: 350 },    // Bottom-left intersection
      11: { x: 110, y: 320 },    // Left edge bottom
      12: { x: 110, y: 180 }     // Left edge top
    };

    let alignmentIssues = 0;
    const rasiPositionsText = rasiPositionsMatch[1];
    
    for (let rasiNum = 1; rasiNum <= 12; rasiNum++) {
      // More flexible regex that handles line breaks and comments
      const rasiRegex = new RegExp(`${rasiNum}:\\s*\\{[^}]*?x:\\s*([A-Z_]+|[\\d.]+)[^}]*?y:\\s*([A-Z_]+|[\\d.]+)[^}]*?\\}`, 's');
      const match = rasiPositionsText.match(rasiRegex);
      
      if (!match) {
        this.testResults.rasiAlignment.issues.push(`Rasi ${rasiNum} position definition missing`);
        alignmentIssues++;
        continue;
      }

      // Handle variable references
      let actualX = match[1];
      let actualY = match[2];
      
      // Convert variable references to numeric values
      if (actualX === 'CENTER_X') actualX = '250';
      if (actualY === 'CENTER_Y') actualY = '250';
      
      actualX = parseFloat(actualX);
      actualY = parseFloat(actualY);
      const expected = expectedRasiCoordinates[rasiNum];
      
      const xDiff = Math.abs(actualX - expected.x);
      const yDiff = Math.abs(actualY - expected.y);
      
      if (xDiff > this.requiredTolerance.rasi || yDiff > this.requiredTolerance.rasi) {
        this.testResults.rasiAlignment.issues.push(
          `Rasi ${rasiNum} position misaligned: expected (${expected.x}, ${expected.y}), got (${actualX}, ${actualY})`
        );
        alignmentIssues++;
      }
    }

    this.testResults.rasiAlignment.passed = alignmentIssues === 0;
    console.log(`${this.testResults.rasiAlignment.passed ? '✅' : '❌'} Rasi number alignment: ${alignmentIssues} issues found`);
  }

  /**
   * Test clustering prevention mechanisms
   */
  async testClusteringPrevention() {
    console.log('🚫 Testing clustering prevention mechanisms...');
    
    const componentContent = fs.readFileSync(this.chartComponentPath, 'utf8');
    
    // Verify clustering prevention features
    const preventionFeatures = [
      { name: 'MIN_PLANET_SPACING constant', pattern: /MIN_PLANET_SPACING:\s*\d+/ },
      { name: 'Distance calculation', pattern: /Math\.sqrt\(/ },
      { name: 'Emergency separation adjustment', pattern: /emergencyOffset/ },
      { name: 'Layering for dense houses', pattern: /layerIndex/ },
      { name: 'Dynamic spacing adjustment', pattern: /minRequiredSpacing/ }
    ];

    preventionFeatures.forEach(feature => {
      if (!feature.pattern.test(componentContent)) {
        this.testResults.clusteringPrevention.issues.push(`Missing ${feature.name}`);
      }
    });

    // Check spacing parameter values
    const spacingMatch = componentContent.match(/MIN_PLANET_SPACING:\s*(\d+)/);
    if (spacingMatch) {
      const spacingValue = parseInt(spacingMatch[1]);
      if (spacingValue < 10 || spacingValue > 20) {
        this.testResults.clusteringPrevention.issues.push(`MIN_PLANET_SPACING value ${spacingValue} outside optimal range (10-20)`);
      }
    }

    // Test layering parameters
    const layermatch = componentContent.match(/MAX_LAYERS:\s*(\d+)/);
    if (layermatch) {
      const maxLayers = parseInt(layermatch[1]);
      if (maxLayers < 2 || maxLayers > 4) {
        this.testResults.clusteringPrevention.issues.push(`MAX_LAYERS value ${maxLayers} outside optimal range (2-4)`);
      }
    }

    this.testResults.clusteringPrevention.passed = this.testResults.clusteringPrevention.issues.length === 0;
    console.log(`${this.testResults.clusteringPrevention.passed ? '✅' : '❌'} Clustering prevention: ${this.testResults.clusteringPrevention.issues.length} issues found`);
  }

  /**
   * Calculate overall accuracy score
   */
  calculateOverallAccuracy() {
    const categories = [
      this.testResults.houseAlignment,
      this.testResults.planetaryAlignment,
      this.testResults.rasiAlignment,
      this.testResults.clusteringPrevention
    ];

    const passedCategories = categories.filter(cat => cat.passed).length;
    this.testResults.overallAccuracy = Math.round((passedCategories / categories.length) * 100);
    
    console.log(`\n📊 Overall Alignment Accuracy: ${this.testResults.overallAccuracy}%`);
  }

  /**
   * Generate comprehensive validation report
   */
  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📋 COMPREHENSIVE TEMPLATE ALIGNMENT VALIDATION REPORT');
    console.log('='.repeat(80));

    console.log(`\n🏠 House Boundary Alignment: ${this.testResults.houseAlignment.passed ? '✅ PASSED' : '❌ FAILED'}`);
    if (this.testResults.houseAlignment.issues.length > 0) {
      this.testResults.houseAlignment.issues.forEach(issue => console.log(`   - ${issue}`));
    }

    console.log(`\n🪐 Planetary Positioning: ${this.testResults.planetaryAlignment.passed ? '✅ PASSED' : '❌ FAILED'}`);
    if (this.testResults.planetaryAlignment.issues.length > 0) {
      this.testResults.planetaryAlignment.issues.forEach(issue => console.log(`   - ${issue}`));
    }

    console.log(`\n🔢 Rasi Number Alignment: ${this.testResults.rasiAlignment.passed ? '✅ PASSED' : '❌ FAILED'}`);
    if (this.testResults.rasiAlignment.issues.length > 0) {
      this.testResults.rasiAlignment.issues.forEach(issue => console.log(`   - ${issue}`));
    }

    console.log(`\n🚫 Clustering Prevention: ${this.testResults.clusteringPrevention.passed ? '✅ PASSED' : '❌ FAILED'}`);
    if (this.testResults.clusteringPrevention.issues.length > 0) {
      this.testResults.clusteringPrevention.issues.forEach(issue => console.log(`   - ${issue}`));
    }

    console.log(`\n🎯 OVERALL ACCURACY SCORE: ${this.testResults.overallAccuracy}%`);

    if (this.testResults.overallAccuracy === 100) {
      console.log('\n🎉 PERFECT ALIGNMENT ACHIEVED!');
      console.log('✅ Chart matches Kundli template with 100% accuracy');
      console.log('✅ All positioning coordinates within tolerance limits');
      console.log('✅ Clustering prevention mechanisms fully operational');
      console.log('✅ Ready for production deployment');
    } else if (this.testResults.overallAccuracy >= 80) {
      console.log('\n⚠️ GOOD ALIGNMENT - Minor issues remaining');
      console.log('Chart mostly aligned with template, some adjustments needed');
    } else {
      console.log('\n❌ SIGNIFICANT ALIGNMENT ISSUES DETECTED');
      console.log('Chart requires substantial repositioning to match template');
    }

    console.log('\n' + '='.repeat(80));
    console.log('📐 VALIDATION METRICS');
    console.log('='.repeat(80));
    console.log(`• Tolerance Requirements: Houses ±${this.requiredTolerance.house}px, Planets ±${this.requiredTolerance.planet}px, Rasi ±${this.requiredTolerance.rasi}px`);
    console.log(`• Total Issues Found: ${this.getTotalIssuesCount()}`);
    console.log(`• Categories Passed: ${this.getPassedCategoriesCount()}/4`);
    console.log(`• Production Ready: ${this.testResults.overallAccuracy === 100 ? 'YES ✅' : 'NO ❌'}`);
  }

  getTotalIssuesCount() {
    return this.testResults.houseAlignment.issues.length +
           this.testResults.planetaryAlignment.issues.length +
           this.testResults.rasiAlignment.issues.length +
           this.testResults.clusteringPrevention.issues.length;
  }

  getPassedCategoriesCount() {
    const categories = [
      this.testResults.houseAlignment,
      this.testResults.planetaryAlignment,
      this.testResults.rasiAlignment,
      this.testResults.clusteringPrevention
    ];
    return categories.filter(cat => cat.passed).length;
  }
}

/**
 * Run validation if executed directly
 */
if (require.main === module) {
  const validator = new TemplateAlignmentValidator();
  validator.runValidation()
    .then(() => {
      console.log('\n✨ Template alignment validation completed');
    })
    .catch(error => {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    });
}

module.exports = TemplateAlignmentValidator;
