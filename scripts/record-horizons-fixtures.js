#!/usr/bin/env node
/**
 * Record Horizons Fixtures Script
 * 
 * Controlled script for refreshing JPL Horizons fixtures when needed.
 * Run this manually when:
 * 1. Adding new test cases requiring different Julian Days
 * 2. Fixtures have expired (check validUntil date)
 * 3. JPL Horizons API has been updated
 * 
 * Usage:
 *   HORIZONS_MODE=record node scripts/record-horizons-fixtures.js
 * 
 * WARNING: Requires live JPL Horizons API access. Do not run in CI.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const FIXTURES_DIR = path.join(__dirname, '../fixtures/horizons');
const HORIZONS_MODE = process.env.HORIZONS_MODE || 'replay';

// Fixture definitions
const FIXTURES_TO_RECORD = [
  {
    name: 'Sun at J2000.0',
    body: 'Sun',
    julianDay: 2451545.0,
    filename: 'sun_2451545.0.json'
  },
  {
    name: 'Moon at J2000.0',
    body: 'Moon',
    julianDay: 2451545.0,
    filename: 'moon_2451545.0.json'
  },
  {
    name: 'Mars at J2000.0',
    body: 'Mars',
    julianDay: 2451545.0,
    filename: 'mars_2451545.0.json'
  }
];

/**
 * Main execution
 */
async function main() {
  console.log('='.repeat(60));
  console.log('JPL Horizons Fixture Recording Script');
  console.log('='.repeat(60));
  console.log();

  // Safety check
  if (HORIZONS_MODE !== 'record') {
    console.error('ERROR: HORIZONS_MODE must be set to "record"');
    console.error('Run with: HORIZONS_MODE=record node scripts/record-horizons-fixtures.js');
    process.exit(1);
  }

  // Check if fixtures directory exists
  if (!fs.existsSync(FIXTURES_DIR)) {
    console.log(`Creating fixtures directory: ${FIXTURES_DIR}`);
    fs.mkdirSync(FIXTURES_DIR, { recursive: true });
  }

  console.log(`Mode: ${HORIZONS_MODE}`);
  console.log(`Fixtures directory: ${FIXTURES_DIR}`);
  console.log(`Fixtures to record: ${FIXTURES_TO_RECORD.length}`);
  console.log();

  // List fixtures to be recorded
  console.log('Fixtures to record:');
  FIXTURES_TO_RECORD.forEach((fixture, index) => {
    console.log(`  ${index + 1}. ${fixture.name} (JD ${fixture.julianDay})`);
  });
  console.log();

  // Confirmation prompt
  console.log('WARNING: This will call the live JPL Horizons API and overwrite existing fixtures.');
  console.log('NOTE: Live API is not implemented yet - fixtures are pre-generated.'.toUpperCase());
  console.log();

  console.log('Current implementation status:');
  console.log('  ✓ Fixture format validated');
  console.log('  ✓ Replay mode fully functional');
  console.log('  ✗ Live API client not yet implemented');
  console.log();

  console.log('To implement live API recording:');
  console.log('  1. Add axios or fetch to dependencies');
  console.log('  2. Implement fetchFromAPI() in horizonsClient.ts');
  console.log('  3. Handle JPL Horizons API response parsing');
  console.log('  4. Re-run this script with HORIZONS_MODE=record');
  console.log();

  // Validate existing fixtures
  console.log('Validating existing fixtures:');
  let validCount = 0;
  let warningCount = 0;
  let errorCount = 0;

  for (const fixture of FIXTURES_TO_RECORD) {
    const filepath = path.join(FIXTURES_DIR, fixture.filename);
    
    if (!fs.existsSync(filepath)) {
      console.log(`  ✗ ${fixture.filename}: NOT FOUND`);
      errorCount++;
      continue;
    }

    try {
      const fixtureData = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
      
      // Basic validation
      const hasQuery = !!fixtureData.query;
      const hasResponse = !!fixtureData.response;
      const hasResults = fixtureData.response?.results?.length > 0;
      const hasProvenance = !!fixtureData.response?.provenance;

      if (hasQuery && hasResponse && hasResults) {
        // Check expiration
        if (fixtureData.validUntil) {
          const expiryDate = new Date(fixtureData.validUntil);
          const now = new Date();
          
          if (expiryDate < now) {
            console.log(`  ⚠ ${fixture.filename}: EXPIRED (valid until ${expiryDate.toISOString().split('T')[0]})`);
            warningCount++;
          } else {
            const daysRemaining = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));
            console.log(`  ✓ ${fixture.filename}: VALID (expires in ${daysRemaining} days)`);
            validCount++;
          }
        } else {
          console.log(`  ✓ ${fixture.filename}: VALID (no expiration)`);
          validCount++;
        }

        // Check provenance
        if (!hasProvenance) {
          console.log(`    Note: Missing provenance information`);
        }
      } else {
        console.log(`  ✗ ${fixture.filename}: INVALID STRUCTURE`);
        errorCount++;
      }
    } catch (error) {
      console.log(`  ✗ ${fixture.filename}: PARSE ERROR - ${error.message}`);
      errorCount++;
    }
  }

  console.log();
  console.log('Validation Summary:');
  console.log(`  Valid fixtures: ${validCount}`);
  console.log(`  Warnings: ${warningCount}`);
  console.log(`  Errors: ${errorCount}`);
  console.log();

  if (errorCount === 0 && warningCount === 0) {
    console.log('✓ All fixtures are valid and current. No recording needed.');
  } else if (errorCount > 0) {
    console.log('✗ Some fixtures have errors. Recording would be needed if API was implemented.');
  } else {
    console.log('⚠ Some fixtures have warnings. Consider refreshing when convenient.');
  }

  console.log();
  console.log('='.repeat(60));
  console.log('Script completed.');
  console.log('='.repeat(60));
}

// Run main function
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
