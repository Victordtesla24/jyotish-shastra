#!/usr/bin/env node

/**
 * Chart Accuracy Comparison Script
 * Compares generated chart data against reference images
 * 
 * Reference Data from Images:
 * - Farhan: DoB 18-12-1997, 12:00 AM, Sialkot, Pakistan
 * - Abhi: DoB 28-05-1982, 4:30 PM, Pune, India
 * - Vrushali: DoB 25-03-1982, 7:30 PM, Pune, India
 * - Vikram: DoB 24-10-1985, 02:30 PM, Pune, India
 */

const fs = require('fs');
const path = require('path');

// Reference data from images
const referenceData = {
  Farhan: {
    ascendant: { sign: 'Virgo', degree: null }, // Estimated from image
    planets: {
      Sun: { sign: 'Sagittarius', degree: 2, house: 4 },
      Moon: { sign: 'Cancer', degree: null, house: 12 },
      Mars: { sign: 'Capricorn', degree: 5, house: 5, dignity: 'exalted' },
      Mercury: { sign: 'Sagittarius', degree: 0, house: 4, combust: true },
      Jupiter: { sign: 'Capricorn', degree: 25, house: 5, retrograde: false },
      Venus: { sign: 'Scorpio', degree: 8, house: 3 },
      Saturn: { sign: 'Pisces', degree: 19, house: 7 },
      Rahu: { sign: 'Virgo', degree: 20, house: 1 },
      Ketu: { sign: 'Pisces', degree: 20, house: 7 }
    }
  },
  Vikram: {
    ascendant: { sign: 'Aquarius', degree: 1, house: 1 },
    planets: {
      Sun: { sign: 'Libra', degree: 7, house: 9, dignity: 'debilitated' },
      Moon: { sign: 'Aquarius', degree: 19, house: 1 },
      Mars: { sign: 'Virgo', degree: 4, house: 8 },
      Mercury: { sign: 'Libra', degree: 26, house: 9 },
      Jupiter: { sign: 'Capricorn', degree: 14, house: 12, retrograde: true },
      Venus: { sign: 'Virgo', degree: 16, house: 8, dignity: 'debilitated' },
      Saturn: { sign: 'Scorpio', degree: 3, house: 10 },
      Rahu: { sign: 'Aries', degree: 15, house: 3 },
      Ketu: { sign: 'Libra', degree: 15, house: 9 }
    }
  },
  Abhi: {
    ascendant: { sign: 'Aries', degree: 1, house: 12 },
    planets: {
      Sun: { sign: 'Gemini', degree: 7, house: 3, retrograde: true },
      Moon: { sign: 'Pisces', degree: 19, house: 12 },
      Mars: { sign: 'Taurus', degree: 4, house: 2 },
      Mercury: { sign: 'Gemini', degree: 26, house: 3 },
      Jupiter: { sign: 'Libra', degree: 15, house: 7, retrograde: false },
      Venus: { sign: 'Taurus', degree: 16, house: 2, retrograde: true },
      Saturn: { sign: 'Virgo', degree: 3, house: 6 },
      Rahu: { sign: 'Cancer', degree: 15, house: 4 },
      Ketu: { sign: 'Capricorn', degree: 15, house: 10 }
    }
  },
  Vrushali: {
    ascendant: { sign: 'Virgo', degree: 26, house: 7 },
    planets: {
      Sun: { sign: 'Pisces', degree: 10, house: 6 },
      Moon: { sign: 'Scorpio', degree: 12, house: 2 },
      Mars: { sign: 'Aquarius', degree: 18, house: 5 },
      Mercury: { sign: 'Aquarius', degree: 25, house: 5 },
      Jupiter: { sign: 'Libra', degree: 15, house: 1, retrograde: false },
      Venus: { sign: 'Pisces', degree: 24, house: 6 },
      Saturn: { sign: 'Virgo', degree: 26, house: 12, retrograde: false },
      Rahu: { sign: 'Cancer', degree: 25, house: 10 },
      Ketu: { sign: 'Capricorn', degree: 25, house: 4 }
    }
  }
};

// Planet name mapping
const planetNameMap = {
  'Sun': 'Sun',
  'Moon': 'Moon',
  'Mars': 'Mars',
  'Mercury': 'Mercury',
  'Jupiter': 'Jupiter',
  'Venus': 'Venus',
  'Saturn': 'Saturn',
  'Rahu': 'Rahu',
  'Ketu': 'Ketu'
};

function loadChartData(person) {
  const filename = path.join(__dirname, '../temp-data', `${person.toLowerCase()}-chart-generated.json`);
  if (!fs.existsSync(filename)) {
    console.error(`❌ Chart file not found: ${filename}`);
    return null;
  }
  
  const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
  return data.success ? data.data : null;
}

function comparePositions(reference, generated, tolerance = 2) {
  if (!reference.degree || reference.degree === null) {
    return { match: 'unknown', diff: null, note: 'No reference degree available' };
  }
  
  const diff = Math.abs(reference.degree - generated.degree);
  
  if (diff <= tolerance) {
    return { match: 'exact', diff, note: `Within ${tolerance}° tolerance` };
  } else if (diff <= tolerance * 2) {
    return { match: 'close', diff, note: `Within ${tolerance * 2}° tolerance (acceptable)` };
  } else {
    return { match: 'error', diff, note: `Exceeds tolerance by ${(diff - tolerance).toFixed(2)}°` };
  }
}

function comparePlanet(planetName, reference, generated) {
  const result = {
    planet: planetName,
    status: '✅',
    issues: []
  };
  
  // Check sign
  if (reference.sign !== generated.sign) {
    result.status = '❌';
    result.issues.push(`Sign mismatch: Expected ${reference.sign}, got ${generated.sign}`);
  }
  
  // Check degree
  if (reference.degree !== null) {
    const posCompare = comparePositions(reference, generated);
    if (posCompare.match === 'error') {
      result.status = '⚠️';
      result.issues.push(`Degree error: Expected ${reference.degree}°, got ${generated.degree.toFixed(2)}° (diff: ${posCompare.diff.toFixed(2)}°)`);
    } else if (posCompare.match === 'close') {
      result.status = result.status === '✅' ? '⚠️' : result.status;
      result.issues.push(`Degree close: Expected ${reference.degree}°, got ${generated.degree.toFixed(2)}° (diff: ${posCompare.diff.toFixed(2)}°)`);
    }
  }
  
  // Check house
  if (reference.house && reference.house !== generated.house) {
    result.status = '❌';
    result.issues.push(`House mismatch: Expected ${reference.house}, got ${generated.house}`);
  }
  
  // Check dignity
  if (reference.dignity && reference.dignity !== generated.dignity) {
    result.status = '⚠️';
    result.issues.push(`Dignity mismatch: Expected ${reference.dignity}, got ${generated.dignity}`);
  }
  
  // Check retrograde
  if (reference.retrograde !== undefined && reference.retrograde !== generated.isRetrograde) {
    result.status = '⚠️';
    result.issues.push(`Retrograde mismatch: Expected ${reference.retrograde}, got ${generated.isRetrograde}`);
  }
  
  // Check combust
  if (reference.combust !== undefined && reference.combust !== generated.isCombust) {
    result.status = '⚠️';
    result.issues.push(`Combust mismatch: Expected ${reference.combust}, got ${generated.isCombust}`);
  }
  
  return result;
}

function compareChart(personName) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📊 COMPARING CHART: ${personName.toUpperCase()}`);
  console.log('='.repeat(80));
  
  const reference = referenceData[personName];
  const chartData = loadChartData(personName);
  
  if (!chartData) {
    console.log(`❌ Failed to load chart data for ${personName}`);
    return { person: personName, success: false, errors: ['Chart data not found'] };
  }
  
  const rasiChart = chartData.rasiChart;
  const results = {
    person: personName,
    success: true,
    ascendant: null,
    planets: {},
    summary: { exact: 0, close: 0, errors: 0 }
  };
  
  // Compare Ascendant
  console.log(`\n🌅 ASCENDANT (Lagna)`);
  console.log(`   Reference: ${reference.ascendant.sign}${reference.ascendant.degree ? ' ' + reference.ascendant.degree + '°' : ''}`);
  console.log(`   Generated: ${rasiChart.ascendant.sign} ${rasiChart.ascendant.degree.toFixed(2)}°`);
  
  if (reference.ascendant.sign === rasiChart.ascendant.sign) {
    console.log(`   ✅ Ascendant sign matches`);
    if (reference.ascendant.degree !== null) {
      const diff = Math.abs(reference.ascendant.degree - rasiChart.ascendant.degree);
      if (diff <= 2) {
        console.log(`   ✅ Ascendant degree matches (diff: ${diff.toFixed(2)}°)`);
      } else {
        console.log(`   ⚠️ Ascendant degree differs by ${diff.toFixed(2)}°`);
      }
    }
  } else {
    console.log(`   ❌ Ascendant sign mismatch!`);
    results.summary.errors++;
  }
  
  // Compare Planets
  console.log(`\n🪐 PLANETARY POSITIONS`);
  console.log(`${'─'.repeat(80)}`);
  
  for (const [planetName, refPlanet] of Object.entries(reference.planets)) {
    const generatedPlanet = rasiChart.planets.find(p => p.name === planetName);
    
    if (!generatedPlanet) {
      console.log(`\n❌ ${planetName}: NOT FOUND in generated chart`);
      results.summary.errors++;
      continue;
    }
    
    const comparison = comparePlanet(planetName, refPlanet, generatedPlanet);
    results.planets[planetName] = comparison;
    
    console.log(`\n${comparison.status} ${planetName}:`);
    console.log(`   Reference: ${refPlanet.sign}${refPlanet.degree ? ' ' + refPlanet.degree + '°' : ''} (House ${refPlanet.house || '?'})`);
    console.log(`   Generated: ${generatedPlanet.sign} ${generatedPlanet.degree.toFixed(2)}° (House ${generatedPlanet.house})`);
    
    if (comparison.issues.length > 0) {
      comparison.issues.forEach(issue => console.log(`   ⚠️ ${issue}`));
      if (comparison.status === '❌') {
        results.summary.errors++;
      } else if (comparison.status === '⚠️') {
        results.summary.close++;
      }
    } else {
      console.log(`   ✅ All checks passed`);
      results.summary.exact++;
    }
  }
  
  // Summary
  console.log(`\n${'─'.repeat(80)}`);
  console.log(`📈 SUMMARY FOR ${personName.toUpperCase()}`);
  console.log(`   ✅ Exact matches: ${results.summary.exact}`);
  console.log(`   ⚠️ Close matches: ${results.summary.close}`);
  console.log(`   ❌ Errors: ${results.summary.errors}`);
  console.log(`   Total planets checked: ${Object.keys(reference.planets).length}`);
  
  return results;
}

function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║              CHART ACCURACY COMPARISON - REFERENCE VALIDATION             ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝');
  
  const people = ['Farhan', 'Vikram', 'Abhi', 'Vrushali'];
  const allResults = {};
  
  for (const person of people) {
    const result = compareChart(person);
    allResults[person] = result;
  }
  
  // Overall Summary
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📊 OVERALL SUMMARY - ALL CHARTS`);
  console.log('='.repeat(80));
  
  let totalExact = 0;
  let totalClose = 0;
  let totalErrors = 0;
  
  for (const [person, result] of Object.entries(allResults)) {
    if (result.success) {
      totalExact += result.summary.exact;
      totalClose += result.summary.close;
      totalErrors += result.summary.errors;
      
      const status = result.summary.errors === 0 ? '✅' : (result.summary.errors <= 2 ? '⚠️' : '❌');
      console.log(`${status} ${person}: ${result.summary.exact} exact, ${result.summary.close} close, ${result.summary.errors} errors`);
    }
  }
  
  console.log(`\n${'─'.repeat(80)}`);
  console.log(`TOTAL ACROSS ALL CHARTS:`);
  console.log(`  ✅ Exact matches: ${totalExact}`);
  console.log(`  ⚠️ Close matches: ${totalClose}`);
  console.log(`  ❌ Errors: ${totalErrors}`);
  
  const accuracy = ((totalExact + totalClose) / (totalExact + totalClose + totalErrors) * 100).toFixed(2);
  console.log(`\n📈 Overall Accuracy: ${accuracy}%`);
  
  if (totalErrors > 0) {
    console.log(`\n⚠️ ACTION REQUIRED: ${totalErrors} errors detected requiring investigation`);
    console.log(`   Next steps: Perform root cause analysis on discrepancies`);
  } else if (totalClose > 0) {
    console.log(`\n✅ ACCEPTABLE: All positions within tolerance (${totalClose} close matches)`);
  } else {
    console.log(`\n✅ PERFECT: All positions match exactly!`);
  }
  
  console.log(`\n${'='.repeat(80)}\n`);
  
  // Save detailed results
  const outputPath = path.join(__dirname, '../temp-data/chart-comparison-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2));
  console.log(`📝 Detailed results saved to: ${outputPath}\n`);
  
  process.exit(totalErrors > 0 ? 1 : 0);
}

main();
