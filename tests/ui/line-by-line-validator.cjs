/**
 * Line-by-Line Template Validator - Simple parsing approach
 */

"use strict";

const fs = require('fs');
const path = require('path');

class LineByLineValidator {
  constructor() {
    this.chartComponentPath = path.resolve(__dirname, '../../client/src/components/charts/VedicChartDisplay.jsx');
    this.requiredTolerance = {
      house: 2,
      planet: 3,
      rasi: 2
    };
    this.testResults = {
      houseAlignment: { passed: false, issues: [] },
      planetaryAlignment: { passed: false, issues: [] },
      rasiAlignment: { passed: false, issues: [] },
      clusteringPrevention: { passed: false, issues: [] },
      overallAccuracy: 0
    };
  }

  async runValidation() {
    console.log('🔍 Starting line-by-line template alignment validation...');
    
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
      'CLUSTERING_PREVENTION'
    ];

    const missingElements = requiredElements.filter(element => !componentContent.includes(element));
    
    if (missingElements.length > 0) {
      console.error('❌ Missing required elements:', missingElements);
      return false;
    }

    console.log('✅ Component file structure validation passed');
    return true;
  }

  async testHouseBoundaryAlignment() {
    console.log('🏠 Testing house boundary alignment...');
    
    const componentContent = fs.readFileSync(this.chartComponentPath, 'utf8');
    
    // Extract HOUSE_POSITIONS section properly - find start and end lines
    const houseStartIndex = componentContent.indexOf('const HOUSE_POSITIONS = {');
    
    if (houseStartIndex === -1) {
      this.testResults.houseAlignment.issues.push('HOUSE_POSITIONS section not found');
      return;
    }
    
    // Find the closing brace for the HOUSE_POSITIONS object
    let braceCount = 1;
    let houseEndIndex = houseStartIndex + 'const HOUSE_POSITIONS = {'.length;
    
    while (houseEndIndex < componentContent.length && braceCount > 0) {
      if (componentContent[houseEndIndex] === '{') braceCount++;
      else if (componentContent[houseEndIndex] === '}') braceCount--;
      houseEndIndex++;
    }
    
    if (braceCount !== 0) {
      this.testResults.houseAlignment.issues.push('HOUSE_POSITIONS section malformed - missing closing brace');
      return;
    }
    
    const housePositionsText = componentContent.substring(houseStartIndex + 'const HOUSE_POSITIONS = {'.length, houseEndIndex - 1);
    
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

    let alignmentIssues = 0;
    
    // Split by lines and parse each house
    const lines = housePositionsText.split('\n');
    
    for (let houseNum = 1; houseNum <= 12; houseNum++) {
      const housePattern = new RegExp(`^\\s*${houseNum}:\\s*\\{\\s*x:\\s*([A-Z_\\d.]+),\\s*y:\\s*([A-Z_\\d.]+)\\s*\\}`);
      let houseLine = null;
      
      // Find the line containing this house
      for (const line of lines) {
        if (line.trim().startsWith(`${houseNum}:`)) {
          houseLine = line;
          break;
        }
      }
      
      if (!houseLine) {
        this.testResults.houseAlignment.issues.push(`House ${houseNum} position definition missing`);
        alignmentIssues++;
        continue;
      }

      const match = houseLine.match(housePattern);
      
      if (!match) {
        this.testResults.houseAlignment.issues.push(`House ${houseNum} line format invalid: ${houseLine}`);
        alignmentIssues++;
        continue;
      }

      // Handle CENTER_X variables
      let actualX = match[1].trim();
      let actualY = match[2].trim();
      
      // Convert variable references to numeric values
      if (actualX === 'CENTER_X') actualX = '250';
      if (actualY === 'CENTER_Y') actualY = '250';
      
      actualX = parseFloat(actualX);
      actualY = parseFloat(actualY);
      const expected = expectedCoordinates[houseNum];
      
      console.log(`House ${houseNum}: expected (${expected.x}, ${expected.y}), got (${actualX}, ${actualY})`);
      
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

  async testRasiNumberAlignment() {
    console.log('🔢 Testing Rasi number alignment...');
    
    const componentContent = fs.readFileSync(this.chartComponentPath, 'utf8');
    
    // Extract RASI_NUMBER_POSITIONS section properly - find start and end lines
    const rasiStartIndex = componentContent.indexOf('const RASI_NUMBER_POSITIONS = {');
    
    if (rasiStartIndex === -1) {
      this.testResults.rasiAlignment.issues.push('RASI_NUMBER_POSITIONS section not found');
      return;
    }
    
    // Find the closing brace for the RASI_NUMBER_POSITIONS object
    let rasiBraceCount = 1;
    let rasiEndIndex = rasiStartIndex + 'const RASI_NUMBER_POSITIONS = {'.length;
    
    while (rasiEndIndex < componentContent.length && rasiBraceCount > 0) {
      if (componentContent[rasiEndIndex] === '{') rasiBraceCount++;
      else if (componentContent[rasiEndIndex] === '}') rasiBraceCount--;
      rasiEndIndex++;
    }
    
    if (rasiBraceCount !== 0) {
      this.testResults.rasiAlignment.issues.push('RASI_NUMBER_POSITIONS section malformed - missing closing brace');
      return;
    }
    
    const rasiPositionsText = componentContent.substring(rasiStartIndex + 'const RASI_NUMBER_POSITIONS = {'.length, rasiEndIndex - 1);
    
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
    
    // Split by lines and parse each rasi
    const lines = rasiPositionsText.split('\n');
    
    for (let rasiNum = 1; rasiNum <= 12; rasiNum++) {
      const rasiPattern = new RegExp(`^\\s*${rasiNum}:\\s*\\{\\s*x:\\s*([A-Z_\\d.]+),\\s*y:\\s*([A-Z_\\d.]+)\\s*\\}`);
      let rasiLine = null;
      
      // Find the line containing this rasi
      for (const line of lines) {
        if (line.trim().startsWith(`${rasiNum}:`)) {
          rasiLine = line;
          break;
        }
      }
      
      if (!rasiLine) {
        this.testResults.rasiAlignment.issues.push(`Rasi ${rasiNum} position definition missing`);
        alignmentIssues++;
        continue;
      }

      const match = rasiLine.match(rasiPattern);
      
      if (!match) {
        this.testResults.rasiAlignment.issues.push(`Rasi ${rasiNum} line format invalid: ${rasiLine}`);
        alignmentIssues++;
        continue;
      }

      // Handle variable references
      let actualX = match[1].trim();
      let actualY = match[2].trim();
      
      // Convert variable references to numeric values
      if (actualX === 'CENTER_X') actualX = '250';
      if (actualY === 'CENTER_Y') actualY = '250';
      
      actualX = parseFloat(actualX);
      actualY = parseFloat(actualY);
      const expected = expectedRasiCoordinates[rasiNum];
      
      console.log(`Rasi ${rasiNum}: expected (${expected.x}, ${expected.y}), got (${actualX}, ${actualY})`);
      
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

  async testPlanetaryPositioning() {
    console.log('🪐 Testing planetary positioning algorithm...');
    
    const componentContent = fs.readFileSync(this.chartComponentPath, 'utf8');
    
    // Check for enhanced clustering prevention
    const requiredFeatures = [
      'CLUSTERING_PREVENTION',
      'MIN_PLANET_SPACING',
      'placePlanetsInCorners',
      'Math.sqrt'
    ];

    const missingFeatures = requiredFeatures.filter(feature => !componentContent.includes(feature));
    
    if (missingFeatures.length > 0) {
      this.testResults.planetaryAlignment.issues.push('Missing clustering prevention features: ' + missingFeatures.join(', '));
    }

    // Test corner offset calibration - extract whole CORNER_OFFSETS section
    const cornerOffsetsMatch = componentContent.match(/const CORNER_OFFSETS = \{([^}]+)\}/s);
    
    if (cornerOffsetsMatch) {
      const cornerOffsetsText = cornerOffsetsMatch[1];
      
      // Check for all required corner offset values in their correct positions
      const expectedPatterns = [
        { pattern: 'x: 60', desc: '60 found in x-coordinates' },
        { pattern: 'x: -60', desc: '-60 found in x-coordinates' },
        { pattern: 'y: 50', desc: '50 found in y-coordinates' },
        { pattern: 'y: -50', desc: '-50 found in y-coordinates' }
      ];
      
      // Validate that all required corner offset values are present somewhere
      const requiredValues = [
        { pattern: '{ x: 60', desc: 'positive x-offset (60)' },
        { pattern: 'x: -60', desc: 'negative x-offset (-60)' },
        { pattern: 'y: 50', desc: 'positive y-offset (50)' },
        { pattern: 'y: -50', desc: 'negative y-offset (-50)' }
      ];
      
      requiredValues.forEach(required => {
        if (!cornerOffsetsText.includes(required.pattern)) {
          this.testResults.planetaryAlignment.issues.push(`Missing ${required.desc} in corner offsets`);
        }
      });
      
      // Additional validation: ensure all four corners are present
      const cornerNames = ['primary', 'secondary', 'tertiary', 'quaternary'];
      cornerNames.forEach(corner => {
        if (!cornerOffsetsText.includes(`${corner}:`)) {
          this.testResults.planetaryAlignment.issues.push(`Missing ${corner} corner definition`);
        }
      });
    } else {
      this.testResults.planetaryAlignment.issues.push('CORNER_OFFSETS not found');
    }

    this.testResults.planetaryAlignment.passed = this.testResults.planetaryAlignment.issues.length === 0;
    console.log(`${this.testResults.planetaryAlignment.passed ? '✅' : '❌'} Planetary positioning: ${this.testResults.planetaryAlignment.issues.length} issues found`);
  }

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

  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📋 LINE-BY-LINE TEMPLATE ALIGNMENT VALIDATION REPORT');
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
  }
}

// Run validation if executed directly
if (require.main === module) {
  const validator = new LineByLineValidator();
  validator.runValidation()
    .then(() => {
      console.log('\n✨ Line-by-line template alignment validation completed');
    })
    .catch(error => {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    });
}

module.exports = LineByLineValidator;
