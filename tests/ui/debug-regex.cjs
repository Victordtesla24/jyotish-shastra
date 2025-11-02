/**
 * Debug Script - Test Regex Matching
 */

"use strict";

const fs = require('fs');
const path = require('path');

const componentPath = path.resolve(__dirname, '../../client/src/components/charts/VedicChartDisplay.jsx');
const componentContent = fs.readFileSync(componentPath, 'utf8');

// Extract HOUSE_POSITIONS section
const housePositionsMatch = componentContent.match(/const HOUSE_POSITIONS = \{([^}]+)\}/s);

console.log('HOUSE_POSITIONS section found:', !!housePositionsMatch);

if (housePositionsMatch) {
  console.log('HOUSE_POSITIONS text (first 500 chars):');
  console.log(housePositionsMatch[1].substring(0, 500));
  console.log('...');
  console.log('\nTesting regex for house 1:');
  
  const house1Regex = new RegExp(`1:\\s*\\{[^}]*x:\\s*([A-Z_]+|[\\d.]+)[^}]*y:\\s*([A-Z_]+|[\\d.]+)[^}]*\\}`);
  const house1Match = housePositionsMatch[1].match(house1Regex);
  
  console.log('House 1 regex match:', !!house1Match);
  if (house1Match) {
    console.log('Match groups:', house1Match);
    console.log('Group 1 (x):', house1Match[1]);
    console.log('Group 2 (y):', house1Match[2]);
  }
  
  console.log('\nTesting simpler regex:');
  const simpleRegex = /1:\s*\{\s*x:\s*([A-Z_]+|[\d.]+),\s*y:\s*([A-Z_]+|[\d.]+)\s*\}/;
  const simpleMatch = housePositionsMatch[1].match(simpleRegex);
  
  console.log('Simple regex match:', !!simpleMatch);
  if (simpleMatch) {
    console.log('Match groups:', simpleMatch);
    console.log('Group 1 (x):', simpleMatch[1]);
    console.log('Group 2 (y):', simpleMatch[2]);
  }
}

// Test RASI_NUMBER_POSITIONS as well
const rasiPositionsMatch = componentContent.match(/const RASI_NUMBER_POSITIONS = \{([^}]+)\}/s);

console.log('\n\nRASI_NUMBER_POSITIONS section found:', !!rasiPositionsMatch);

if (rasiPositionsMatch) {
  console.log('RASI_NUMBER_POSITIONS text (first 500 chars):');
  console.log(rasiPositionsMatch[1].substring(0, 500));
  console.log('...');
  console.log('\nTesting regex for rasi 1:');
  
  const rasi1Regex = new RegExp(`1:\\s*\\{[^}]*x:\\s*([A-Z_]+|[\\d.]+)[^}]*y:\\s*([A-Z_]+|[\\d.]+)[^}]*\\}`);
  const rasi1Match = rasiPositionsMatch[1].match(rasi1Regex);
  
  console.log('Rasi 1 regex match:', !!rasi1Match);
  if (rasi1Match) {
    console.log('Match groups:', rasi1Match);
    console.log('Group 1 (x):', rasi1Match[1]);
    console.log('Group 2 (y):', rasi1Match[2]);
  }
}
