#!/usr/bin/env node
/**
 * Remove console.log statements from production files
 * Keeps console.error for error handling
 */

const fs = require('fs');
const path = require('path');

const FILES_TO_FIX = [
  'client/src/pages/AnalysisPage.jsx',
  'client/src/pages/ComprehensiveAnalysisPage.jsx',
  'client/src/components/reports/ComprehensiveAnalysisDisplay.js',
  'client/src/components/analysis/ResponseDataToUIDisplayAnalyser.js',
  'client/src/components/forms/UIDataSaver.js'
];

function removeConsoleLogs(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return { removed: 0 };
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const originalLines = content.split('\n');
  
  // Remove console.log statements (but keep console.error, console.warn)
  // Pattern: lines with console.log(...) followed by semicolon or nothing
  const lines = originalLines.filter(line => {
    const trimmed = line.trim();
    // Keep console.error, console.warn, console.info
    if (trimmed.includes('console.error') || 
        trimmed.includes('console.warn') || 
        trimmed.includes('console.info')) {
      return true;
    }
    // Remove console.log statements
    if (trimmed.includes('console.log')) {
      return false;
    }
    return true;
  });

  const removed = originalLines.length - lines.length;
  const newContent = lines.join('\n');

  // Backup original
  fs.writeFileSync(`${fullPath}.backup`, fs.readFileSync(fullPath, 'utf8'));

  // Write fixed content
  fs.writeFileSync(fullPath, newContent);

  return { removed, original: originalLines.length, final: lines.length };
}

function fixAllFiles() {
  console.log('🔧 Removing console.log statements from production files...\n');

  let totalRemoved = 0;

  for (const filePath of FILES_TO_FIX) {
    console.log(`📄 Processing: ${filePath}...`);
    const result = removeConsoleLogs(filePath);
    totalRemoved += result.removed;
    console.log(`  ✅ Removed ${result.removed} console.log statements\n`);
  }

  console.log(`📊 Total console.log statements removed: ${totalRemoved}`);
  return totalRemoved;
}

if (require.main === module) {
  fixAllFiles();
}

module.exports = { removeConsoleLogs, fixAllFiles };
