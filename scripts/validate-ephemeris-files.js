#!/usr/bin/env node

/**
 * Validate Ephemeris Files
 * Checks integrity, compatibility, and completeness of Swiss Ephemeris files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EPHEMERIS_DIR = path.resolve(process.cwd(), 'ephemeris');
const REQUIRED_FILES = [
  'seas_18.se1', // Asteroids ephemeris (SE version 2.18)
  'semo_18.se1', // Moon ephemeris (SE version 2.18)
  'sepl_18.se1'  // Planets ephemeris (SE version 2.18)
];

// Expected file sizes (approximate ranges in bytes)
const EXPECTED_SIZES = {
  'seas_18.se1': { min: 200000, max: 250000 },   // ~218KB
  'semo_18.se1': { min: 1200000, max: 1300000 }, // ~1.2MB
  'sepl_18.se1': { min: 450000, max: 500000 }    // ~473KB
};

/**
 * Validate ephemeris files
 */
function validateEphemerisFiles() {
  console.log('🔍 Validating Ephemeris Files...\n');
  console.log(`📁 Ephemeris Directory: ${EPHEMERIS_DIR}\n`);

  const results = {
    valid: [],
    missing: [],
    invalid: [],
    warnings: []
  };

  // Check if ephemeris directory exists
  if (!fs.existsSync(EPHEMERIS_DIR)) {
    console.error(`❌ Ephemeris directory does not exist: ${EPHEMERIS_DIR}`);
    return {
      success: false,
      error: 'Ephemeris directory not found',
      results
    };
  }

  console.log(`✅ Ephemeris directory exists: ${EPHEMERIS_DIR}\n`);

  // Validate each required file
  for (const filename of REQUIRED_FILES) {
    const filePath = path.join(EPHEMERIS_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Missing: ${filename}`);
      results.missing.push(filename);
      continue;
    }

    // Check file size
    const stats = fs.statSync(filePath);
    const size = stats.size;
    const expected = EXPECTED_SIZES[filename];

    if (!expected) {
      console.warn(`⚠️  Unknown file: ${filename} (no size validation)`);
      results.warnings.push({ filename, reason: 'Unknown file' });
    } else if (size < expected.min || size > expected.max) {
      console.warn(`⚠️  Size mismatch: ${filename}`);
      console.warn(`   Expected: ${expected.min}-${expected.max} bytes`);
      console.warn(`   Actual: ${size} bytes`);
      results.warnings.push({
        filename,
        reason: `Size mismatch (expected ${expected.min}-${expected.max}, got ${size})`
      });
    }

    // Check if file is readable
    try {
      const buffer = fs.readFileSync(filePath, { start: 0, end: 100 });
      if (buffer.length === 0) {
        console.error(`❌ Empty file: ${filename}`);
        results.invalid.push({ filename, reason: 'File is empty' });
        continue;
      }

      // Basic validation - check if file has some data
      if (buffer.length < 10) {
        console.error(`❌ Invalid file: ${filename} (too small)`);
        results.invalid.push({ filename, reason: 'File too small' });
        continue;
      }

      console.log(`✅ Valid: ${filename} (${(size / 1024).toFixed(2)} KB)`);
      results.valid.push({ filename, size });
    } catch (error) {
      console.error(`❌ Error reading ${filename}: ${error.message}`);
      results.invalid.push({ filename, reason: error.message });
    }
  }

  // Summary
  console.log('\n========================================');
  console.log('Validation Summary');
  console.log('========================================');
  console.log(`✅ Valid: ${results.valid.length}`);
  console.log(`❌ Missing: ${results.missing.length}`);
  console.log(`⚠️  Invalid: ${results.invalid.length}`);
  console.log(`⚠️  Warnings: ${results.warnings.length}`);
  console.log('');

  const allValid = results.valid.length === REQUIRED_FILES.length && 
                   results.missing.length === 0 && 
                   results.invalid.length === 0;

  if (allValid) {
    console.log('✅ All ephemeris files are valid and present!');
  } else {
    console.log('⚠️  Some ephemeris files need attention.');
    if (results.missing.length > 0) {
      console.log('\nMissing files:');
      results.missing.forEach(filename => {
        console.log(`  - ${filename}`);
      });
    }
    if (results.invalid.length > 0) {
      console.log('\nInvalid files:');
      results.invalid.forEach(item => {
        console.log(`  - ${item.filename}: ${item.reason}`);
      });
    }
  }

  return {
    success: allValid,
    results
  };
}

/**
 * Check if files are accessible for Swiss Ephemeris
 */
function checkSwissEphemerisCompatibility() {
  console.log('\n🔍 Checking Swiss Ephemeris Compatibility...\n');

  // Check if we can read the files
  const compatibilityResults = {
    readable: [],
    errors: []
  };

  for (const filename of REQUIRED_FILES) {
    const filePath = path.join(EPHEMERIS_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
      compatibilityResults.errors.push({
        filename,
        error: 'File not found'
      });
      continue;
    }

    try {
      // Try to read first few bytes to verify file is accessible
      const buffer = fs.readFileSync(filePath, { start: 0, end: 1024 });
      compatibilityResults.readable.push({
        filename,
        accessible: true,
        canRead: buffer.length > 0
      });
      console.log(`✅ ${filename} is readable`);
    } catch (error) {
      compatibilityResults.errors.push({
        filename,
        error: error.message
      });
      console.error(`❌ ${filename} is not readable: ${error.message}`);
    }
  }

  return compatibilityResults;
}

/**
 * Main execution
 */
async function main() {
  const validationResult = validateEphemerisFiles();
  const compatibilityResult = checkSwissEphemerisCompatibility();

  const report = {
    timestamp: new Date().toISOString(),
    ephemerisDirectory: EPHEMERIS_DIR,
    validation: validationResult,
    compatibility: compatibilityResult,
    requiredFiles: REQUIRED_FILES,
    summary: {
      allValid: validationResult.success,
      validCount: validationResult.results.valid.length,
      missingCount: validationResult.results.missing.length,
      invalidCount: validationResult.results.invalid.length,
      warningsCount: validationResult.results.warnings.length
    }
  };

  // Save report
  const reportPath = path.join(process.cwd(), 'docs', 'ephemeris-validation-report.json');
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Report saved to: ${reportPath}`);

  return validationResult.success;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export default validateEphemerisFiles;

