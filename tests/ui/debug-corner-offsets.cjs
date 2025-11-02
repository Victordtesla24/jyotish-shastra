/**
 * Debug script to examine corner offsets text
 */

"use strict";

const fs = require('fs');
const path = require('path');

const componentPath = path.resolve(__dirname, '../../client/src/components/charts/VedicChartDisplay.jsx');
const componentContent = fs.readFileSync(componentPath, 'utf8');

// Find CORNER_OFFSETS section
const startIndex = componentContent.indexOf('const CORNER_OFFSETS = {');
if (startIndex === -1) {
  console.log('CORNER_OFFSETS not found');
  process.exit(1);
}

let braceCount = 1;
let endIndex = startIndex + 'const CORNER_OFFSETS = {'.length;

while (endIndex < componentContent.length && braceCount > 0) {
  if (componentContent[endIndex] === '{') braceCount++;
  else if (componentContent[endIndex] === '}') braceCount--;
  endIndex++;
}

const cornerOffsetsText = componentContent.substring(
  startIndex + 'const CORNER_OFFSETS = {'.length, 
  endIndex - 1
);

console.log('CORNER_OFFSETS section text:');
console.log('---');
console.log(cornerOffsetsText);
console.log('---');

console.log('\nChecking for specific values:');

const testValues = [
  { pattern: 'x: 60', desc: 'x: 60' },
  { pattern: 'x: -60', desc: 'x: -60' },
  { pattern: 'y: 50', desc: 'y: 50' },
  { pattern: 'y: -50', desc: 'y: -50' }
];

testValues.forEach(test => {
  const found = cornerOffsetsText.includes(test.pattern);
  console.log(`"${test.pattern}" found: ${found}`);
});
