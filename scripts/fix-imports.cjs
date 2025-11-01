#!/usr/bin/env node

/**
 * Auto-Fix Import Path Script
 * Automatically adds .js/.jsx extensions to relative imports in the client codebase
 */

const fs = require('fs');
const path = require('path');

const clientSrcPath = path.resolve(__dirname, '../client/src');
let filesFixed = 0;
let importsFixed = 0;

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
 * Fix imports in a file
 */
function fixImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  let modified = false;
  
  const fixedLines = lines.map((line) => {
    // Match import statements with relative paths
    const importMatch = line.match(/^(\s*import\s+.*\s+from\s+['"])(\.[^'"]+)(['"];?)$/);
    
    if (importMatch) {
      const prefix = importMatch[1];
      const importPath = importMatch[2];
      const suffix = importMatch[3];
      
      // Check if path is relative and doesn't have extension
      if (importPath.startsWith('.') && !importPath.match(/\.(js|jsx|json|css|scss)$/)) {
        // Check if the file being imported exists
        const resolvedPath = path.resolve(path.dirname(filePath), importPath);
        const withJsExt = resolvedPath + '.js';
        const withJsxExt = resolvedPath + '.jsx';
        
        if (fs.existsSync(withJsExt)) {
          modified = true;
          importsFixed++;
          return `${prefix}${importPath}.js${suffix}`;
        } else if (fs.existsSync(withJsxExt)) {
          modified = true;
          importsFixed++;
          return `${prefix}${importPath}.jsx${suffix}`;
        }
      }
    }
    
    return line;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, fixedLines.join('\n'), 'utf-8');
    filesFixed++;
    return true;
  }
  
  return false;
}

/**
 * Main execution
 */
console.log('🔧 Auto-fixing import paths in client/src...\n');

try {
  const allFiles = getAllFiles(clientSrcPath);
  
  allFiles.forEach((file) => {
    fixImports(file);
  });
  
  console.log(`✅ Fixed ${importsFixed} imports in ${filesFixed} files\n`);
  
  if (filesFixed > 0) {
    console.log('✅ All import paths have been updated with proper extensions!\n');
    console.log('Next steps:');
    console.log('1. Run: node scripts/verify-imports.cjs (to verify fixes)');
    console.log('2. Run: cd client && npm run build (to test production build)');
    console.log('3. Commit and push changes\n');
  } else {
    console.log('ℹ️  No imports needed fixing.\n');
  }
  
  process.exit(0);
} catch (error) {
  console.error('❌ Error during import fixing:', error.message);
  process.exit(1);
}
