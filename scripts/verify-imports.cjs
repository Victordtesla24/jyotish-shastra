#!/usr/bin/env node

/**
 * Import Path Verification Script
 * Validates all imports in the client codebase for production compatibility
 */

const fs = require('fs');
const path = require('path');

const clientSrcPath = path.resolve(__dirname, '../client/src');
const issues = [];
let filesChecked = 0;

/**
 * Recursively get all JS/JSX files
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    
    if (fs.statSync(fullPath).isDirectory()) {
      // Skip node_modules and build directories
      if (!file.includes('node_modules') && !file.includes('build')) {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      }
    } else if (file.match(/\.(js|jsx)$/)) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

/**
 * Check for relative imports without extensions
 */
function checkImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Match import statements with relative paths
    const importMatch = line.match(/import\s+.*\s+from\s+['"](\.[^'"]+)['"]/);
    
    if (importMatch) {
      const importPath = importMatch[1];
      
      // Check if path is relative and doesn't have extension
      if (importPath.startsWith('.') && !importPath.match(/\.(js|jsx|json|css|scss)$/)) {
        // Check if the file being imported exists
        const resolvedPath = path.resolve(path.dirname(filePath), importPath);
        const withJsExt = resolvedPath + '.js';
        const withJsxExt = resolvedPath + '.jsx';
        
        if (fs.existsSync(withJsExt) || fs.existsSync(withJsxExt)) {
          issues.push({
            file: path.relative(clientSrcPath, filePath),
            line: index + 1,
            import: importPath,
            issue: 'Missing file extension (.js or .jsx)',
            suggestion: fs.existsSync(withJsExt) 
              ? `${importPath}.js` 
              : `${importPath}.jsx`
          });
        }
      }
    }
  });
}

/**
 * Main execution
 */
console.log('🔍 Verifying import paths in client/src...\n');

try {
  const allFiles = getAllFiles(clientSrcPath);
  
  allFiles.forEach((file) => {
    filesChecked++;
    checkImports(file);
  });
  
  console.log(`✅ Checked ${filesChecked} files\n`);
  
  if (issues.length === 0) {
    console.log('✅ All imports are production-ready!\n');
    process.exit(0);
  } else {
    console.log(`⚠️  Found ${issues.length} import issue(s):\n`);
    
    issues.forEach((issue, idx) => {
      console.log(`${idx + 1}. ${issue.file}:${issue.line}`);
      console.log(`   Import: ${issue.import}`);
      console.log(`   Issue: ${issue.issue}`);
      console.log(`   Suggestion: ${issue.suggestion}\n`);
    });
    
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error during import verification:', error.message);
  process.exit(1);
}
