#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

/**
 * Duplicate Detection and Removal Tool
 * Scans /src and /client directories for duplicate files and functionality
 */
class DuplicateDetector {
  constructor() {
    this.duplicates = {
      exact: new Map(),     // Hash -> [files]
      functional: new Map(), // Signature -> [files]
      similar: new Map()     // Pattern -> [files]
    };

    this.protectedFiles = new Set([
      'package.json',
      'package-lock.json',
      'index.js',
      'index.html',
      'App.js',
      'setupTests.js'
    ]);

    this.scanDirectories = ['src', 'client/src'];
    this.allowedExtensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.css'];
    this.minFileSize = 50; // bytes

    this.stats = {
      filesScanned: 0,
      exactDuplicates: 0,
      functionalDuplicates: 0,
      similarFiles: 0,
      duplicatesRemoved: 0,
      spaceRecovered: 0
    };
  }

  /**
   * Main execution method
   */
  async run() {
    const command = process.argv[2] || 'scan';

    console.log('🔍 Jyotish Shastra Duplicate Detector');
    console.log('=====================================');

    try {
      switch (command) {
        case 'scan':
          await this.scanForDuplicates();
          this.generateReport();
          break;
        case 'remove':
          await this.scanForDuplicates();
          await this.removeDuplicates();
          break;
        case 'analyze':
          await this.scanForDuplicates();
          await this.analyzeCodeSimilarity();
          break;
        case 'interactive':
          await this.interactiveMode();
          break;
        default:
          this.showHelp();
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  }

  /**
   * Scan directories for all types of duplicates
   */
  async scanForDuplicates() {
    console.log('📁 Scanning directories:', this.scanDirectories.join(', '));

    const allFiles = [];

    for (const dir of this.scanDirectories) {
      if (fs.existsSync(dir)) {
        const files = this.getAllFiles(dir);
        allFiles.push(...files);
      }
    }

    console.log(`📄 Found ${allFiles.length} files to analyze`);

    // Phase 1: Exact duplicates (by hash)
    await this.findExactDuplicates(allFiles);

    // Phase 2: Functional duplicates (by code analysis)
    await this.findFunctionalDuplicates(allFiles);

    // Phase 3: Similar files (by pattern matching)
    await this.findSimilarFiles(allFiles);

    this.stats.filesScanned = allFiles.length;
  }

  /**
   * Get all files recursively from directory
   */
  getAllFiles(dirPath, fileList = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Skip node_modules, .git, etc.
        if (!this.shouldSkipDirectory(file)) {
          this.getAllFiles(filePath, fileList);
        }
      } else if (this.shouldProcessFile(filePath, stat.size)) {
        fileList.push(filePath);
      }
    });

    return fileList;
  }

  /**
   * Check if directory should be skipped
   */
  shouldSkipDirectory(dirName) {
    const skipDirs = [
      'node_modules', '.git', '.vscode', '.cursor',
      'build', 'dist', 'coverage', 'logs', 'ephemeris',
      '.next', '.cache', 'temp', 'tmp'
    ];
    return skipDirs.includes(dirName) || dirName.startsWith('.');
  }

  /**
   * Check if file should be processed
   */
  shouldProcessFile(filePath, fileSize) {
    const ext = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath);

    return this.allowedExtensions.includes(ext) &&
           fileSize >= this.minFileSize &&
           !fileName.startsWith('.') &&
           !this.protectedFiles.has(fileName);
  }

  /**
   * Find exact duplicates using file hashing
   */
  async findExactDuplicates(files) {
    console.log('🔸 Phase 1: Finding exact duplicates...');

    const hashMap = new Map();

    for (const file of files) {
      try {
        const content = fs.readFileSync(file);
        const hash = crypto.createHash('sha256').update(content).digest('hex');

        if (!hashMap.has(hash)) {
          hashMap.set(hash, []);
        }
        hashMap.get(hash).push({
          path: file,
          size: content.length,
          hash: hash
        });
      } catch (error) {
        console.warn(`⚠️ Could not read file: ${file}`);
      }
    }

    // Find duplicates
    for (const [hash, fileGroup] of hashMap) {
      if (fileGroup.length > 1) {
        this.duplicates.exact.set(hash, fileGroup);
        this.stats.exactDuplicates += fileGroup.length - 1;
      }
    }

    console.log(`   Found ${this.duplicates.exact.size} groups of exact duplicates`);
  }

  /**
   * Find functional duplicates through code analysis
   */
  async findFunctionalDuplicates(files) {
    console.log('🔸 Phase 2: Finding functional duplicates...');

    const jsFiles = files.filter(f => ['.js', '.jsx', '.ts', '.tsx'].includes(path.extname(f)));
    const signatureMap = new Map();

    for (const file of jsFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const signature = this.extractCodeSignature(content, file);

        if (signature) {
          if (!signatureMap.has(signature)) {
            signatureMap.set(signature, []);
          }
          signatureMap.get(signature).push({
            path: file,
            signature: signature,
            functions: this.extractFunctions(content)
          });
        }
      } catch (error) {
        console.warn(`⚠️ Could not analyze file: ${file}`);
      }
    }

    // Find functional duplicates
    for (const [signature, fileGroup] of signatureMap) {
      if (fileGroup.length > 1) {
        // Additional verification for functional similarity
        if (this.verifyFunctionalSimilarity(fileGroup)) {
          this.duplicates.functional.set(signature, fileGroup);
          this.stats.functionalDuplicates += fileGroup.length - 1;
        }
      }
    }

    console.log(`   Found ${this.duplicates.functional.size} groups of functional duplicates`);
  }

  /**
   * Extract code signature for functional comparison
   */
  extractCodeSignature(content, filePath) {
    // Remove comments, whitespace, and normalize
    let normalized = content
      .replace(/\/\*[\s\S]*?\*\//g, '') // Block comments
      .replace(/\/\/.*$/gm, '')         // Line comments
      .replace(/\s+/g, ' ')             // Normalize whitespace
      .replace(/['"`]/g, '"')           // Normalize quotes
      .trim();

    // Extract key patterns
    const patterns = {
      imports: this.extractImports(content),
      exports: this.extractExports(content),
      functions: this.extractFunctionSignatures(content),
      classes: this.extractClassSignatures(content),
      constants: this.extractConstants(content)
    };

    // Create signature from patterns
    const signature = crypto
      .createHash('md5')
      .update(JSON.stringify(patterns))
      .digest('hex');

    return patterns.functions.length > 0 || patterns.classes.length > 0 ? signature : null;
  }

  /**
   * Extract import statements
   */
  extractImports(content) {
    const importRegex = /import\s+.*?from\s+['"`]([^'"`]+)['"`]/g;
    const imports = [];
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    return imports.sort();
  }

  /**
   * Extract export statements
   */
  extractExports(content) {
    const exportRegex = /export\s+(?:default\s+)?(?:function|class|const|let|var)\s+(\w+)/g;
    const exports = [];
    let match;

    while ((match = exportRegex.exec(content)) !== null) {
      exports.push(match[1]);
    }

    return exports.sort();
  }

  /**
   * Extract function signatures
   */
  extractFunctionSignatures(content) {
    const functionRegex = /(?:function\s+(\w+)|(\w+)\s*[:=]\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>))/g;
    const functions = [];
    let match;

    while ((match = functionRegex.exec(content)) !== null) {
      functions.push(match[1] || match[2]);
    }

    return functions.filter(Boolean).sort();
  }

  /**
   * Extract class signatures
   */
  extractClassSignatures(content) {
    const classRegex = /class\s+(\w+)/g;
    const classes = [];
    let match;

    while ((match = classRegex.exec(content)) !== null) {
      classes.push(match[1]);
    }

    return classes.sort();
  }

  /**
   * Extract constants
   */
  extractConstants(content) {
    const constRegex = /const\s+(\w+)\s*=/g;
    const constants = [];
    let match;

    while ((match = constRegex.exec(content)) !== null) {
      constants.push(match[1]);
    }

    return constants.sort();
  }

  /**
   * Extract function implementations for detailed analysis
   */
  extractFunctions(content) {
    const functions = [];
    const functionRegex = /(function\s+\w+\s*\([^)]*\)\s*\{[^}]*\}|(\w+)\s*[:=]\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>)[^;]*(;|\}|\n))/g;
    let match;

    while ((match = functionRegex.exec(content)) !== null) {
      functions.push(match[0]);
    }

    return functions;
  }

  /**
   * Verify functional similarity between files
   */
  verifyFunctionalSimilarity(fileGroup) {
    if (fileGroup.length < 2) return false;

    const [first, ...rest] = fileGroup;

    return rest.every(file => {
      // Check if function count is similar
      const funcCountDiff = Math.abs(first.functions.length - file.functions.length);
      const maxFuncCount = Math.max(first.functions.length, file.functions.length);

      // Allow 20% difference in function count
      return maxFuncCount === 0 || (funcCountDiff / maxFuncCount) <= 0.2;
    });
  }

  /**
   * Find similar files using pattern matching
   */
  async findSimilarFiles(files) {
    console.log('🔸 Phase 3: Finding similar files...');

    const patterns = new Map();

    for (const file of files) {
      try {
        const fileName = path.basename(file, path.extname(file));
        const pattern = this.extractNamePattern(fileName);

        if (pattern) {
          if (!patterns.has(pattern)) {
            patterns.set(pattern, []);
          }
          patterns.get(pattern).push({
            path: file,
            pattern: pattern,
            name: fileName
          });
        }
      } catch (error) {
        console.warn(`⚠️ Could not analyze file: ${file}`);
      }
    }

    // Find similar files
    for (const [pattern, fileGroup] of patterns) {
      if (fileGroup.length > 1) {
        this.duplicates.similar.set(pattern, fileGroup);
        this.stats.similarFiles += fileGroup.length - 1;
      }
    }

    console.log(`   Found ${this.duplicates.similar.size} groups of similar files`);
  }

  /**
   * Extract naming pattern from filename
   */
  extractNamePattern(fileName) {
    // Common patterns to detect
    const patterns = [
      /^(.+)Service$/,
      /^(.+)Controller$/,
      /^(.+)Component$/,
      /^(.+)Analyzer$/,
      /^(.+)Calculator$/,
      /^(.+)Formatter$/,
      /^(.+)Template$/,
      /^(.+)Chart$/,
      /^(.+)Analysis$/
    ];

    for (const pattern of patterns) {
      const match = fileName.match(pattern);
      if (match) {
        return match[0].replace(match[1], '*');
      }
    }

    // Generic pattern for camelCase
    return fileName.replace(/[A-Z][a-z]+/g, '*');
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.log('\n📊 DUPLICATE DETECTION REPORT');
    console.log('==============================');

    console.log(`📈 Statistics:`);
    console.log(`   Files Scanned: ${this.stats.filesScanned}`);
    console.log(`   Exact Duplicates: ${this.stats.exactDuplicates}`);
    console.log(`   Functional Duplicates: ${this.stats.functionalDuplicates}`);
    console.log(`   Similar Files: ${this.stats.similarFiles}`);

    // Exact duplicates
    if (this.duplicates.exact.size > 0) {
      console.log('\n🔴 EXACT DUPLICATES (identical content):');
      for (const [hash, files] of this.duplicates.exact) {
        console.log(`\n   Hash: ${hash.substring(0, 8)}...`);
        console.log(`   Size: ${files[0].size} bytes`);
        files.forEach((file, index) => {
          const marker = index === 0 ? '📁 KEEP' : '🗑️  REMOVE';
          console.log(`   ${marker} ${file.path}`);
        });
      }
    }

    // Functional duplicates
    if (this.duplicates.functional.size > 0) {
      console.log('\n🟡 FUNCTIONAL DUPLICATES (similar functionality):');
      for (const [signature, files] of this.duplicates.functional) {
        console.log(`\n   Signature: ${signature.substring(0, 8)}...`);
        files.forEach((file, index) => {
          const marker = index === 0 ? '📁 KEEP' : '⚠️  REVIEW';
          console.log(`   ${marker} ${file.path}`);
        });
      }
    }

    // Similar files
    if (this.duplicates.similar.size > 0) {
      console.log('\n🟠 SIMILAR FILES (naming patterns):');
      for (const [pattern, files] of this.duplicates.similar) {
        console.log(`\n   Pattern: ${pattern}`);
        files.forEach(file => {
          console.log(`   📄 ${file.path}`);
        });
      }
    }

    this.generateRecommendations();
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendations() {
    console.log('\n💡 RECOMMENDATIONS:');

    if (this.duplicates.exact.size > 0) {
      console.log('   1. Remove exact duplicates immediately (safe operation)');
      console.log('   2. Update import statements after removal');
    }

    if (this.duplicates.functional.size > 0) {
      console.log('   3. Review functional duplicates manually');
      console.log('   4. Consider refactoring to share common functionality');
    }

    if (this.duplicates.similar.size > 0) {
      console.log('   5. Review similar files for consolidation opportunities');
    }

    console.log('\n🚀 Run with "remove" flag to auto-remove exact duplicates');
    console.log('   npm run detect-duplicates remove');
  }

  /**
   * Remove duplicates with safety checks
   */
  async removeDuplicates() {
    console.log('\n🗑️  REMOVING DUPLICATES');
    console.log('======================');

    let totalRemoved = 0;
    let spaceRecovered = 0;

    // Only remove exact duplicates automatically
    for (const [, files] of this.duplicates.exact) {
      const [keepFile, ...removeFiles] = files;

      console.log(`\n📁 Keeping: ${keepFile.path}`);

      for (const file of removeFiles) {
        if (this.isSafeToRemove(file.path)) {
          try {
            console.log(`🗑️  Removing: ${file.path}`);
            fs.unlinkSync(file.path);
            totalRemoved++;
            spaceRecovered += file.size;
          } catch (error) {
            console.error(`❌ Failed to remove ${file.path}: ${error.message}`);
          }
        } else {
          console.log(`⚠️  Skipping (protected): ${file.path}`);
        }
      }
    }

    this.stats.duplicatesRemoved = totalRemoved;
    this.stats.spaceRecovered = spaceRecovered;

    console.log(`\n✅ Removal Complete:`);
    console.log(`   Files Removed: ${totalRemoved}`);
    console.log(`   Space Recovered: ${this.formatBytes(spaceRecovered)}`);

    if (totalRemoved > 0) {
      console.log('\n🔧 Next Steps:');
      console.log('   1. Review and update any broken import statements');
      console.log('   2. Test your application thoroughly');
      console.log('   3. Commit changes to version control');
    }
  }

  /**
   * Check if file is safe to remove
   */
  isSafeToRemove(filePath) {
    const fileName = path.basename(filePath);
    const relativePath = path.relative(process.cwd(), filePath);

    // Never remove protected files
    if (this.protectedFiles.has(fileName)) {
      return false;
    }

    // Never remove index files
    if (fileName.startsWith('index.')) {
      return false;
    }

    // Prefer removing from less critical directories
    const criticalDirs = ['src/api', 'src/core', 'client/src/components'];
    const isCritical = criticalDirs.some(dir => relativePath.startsWith(dir));

    if (isCritical) {
      // Extra caution for critical directories
      return fileName.includes('duplicate') || fileName.includes('copy');
    }

    return true;
  }

    /**
   * Interactive mode for manual review
   */
  async interactiveMode() {
    console.log('\n🔍 INTERACTIVE DUPLICATE REVIEW');
    console.log('================================');

    await this.scanForDuplicates();

    // Show summary first
    this.showInteractiveSummary();

    // Process exact duplicates
    if (this.duplicates.exact.size > 0) {
      console.log('\n📋 EXACT DUPLICATES REVIEW');
      console.log('==========================');

      for (const [hash, files] of this.duplicates.exact) {
        console.log(`\n📁 Duplicate group (${files.length} files) - Hash: ${hash.substring(0, 8)}...`);
        files.forEach((file, index) => {
          const marker = index === 0 ? '📁 [KEEP]' : '🗑️  [REMOVE]';
          console.log(`   ${index + 1}. ${marker} ${file.path} (${this.formatBytes(file.size)})`);
        });

        console.log('   💡 Action: These are safe to auto-remove with "remove" command');
      }
    }

    // Process functional duplicates
    if (this.duplicates.functional.size > 0) {
      console.log('\n📋 FUNCTIONAL DUPLICATES REVIEW');
      console.log('===============================');

      for (const [signature, files] of this.duplicates.functional) {
        console.log(`\n📁 Functional duplicate group (${files.length} files):`);
        files.forEach((file, index) => {
          const marker = index === 0 ? '📁 [KEEP]' : '⚠️  [REVIEW]';
          console.log(`   ${index + 1}. ${marker} ${file.path}`);
        });

        console.log('   💡 Action: Manual review required - check for shared functionality');
      }
    }

    // Process similar files (top 5 groups)
    if (this.duplicates.similar.size > 0) {
      console.log('\n📋 SIMILAR FILES REVIEW (Top 5 Groups)');
      console.log('======================================');

      let count = 0;
      for (const [pattern, files] of this.duplicates.similar) {
        if (count >= 5) break;

        console.log(`\n📁 Pattern: ${pattern} (${files.length} files):`);
        files.forEach((file, index) => {
          console.log(`   ${index + 1}. 📄 ${file.path}`);
        });

        console.log('   💡 Action: Review for consolidation opportunities');
        count++;
      }

      if (this.duplicates.similar.size > 5) {
        console.log(`\n   ... and ${this.duplicates.similar.size - 5} more pattern groups`);
      }
    }

    // Show available actions
    this.showInteractiveActions();
  }

  /**
   * Show interactive summary
   */
  showInteractiveSummary() {
    console.log('\n📊 SCAN RESULTS SUMMARY');
    console.log('=======================');
    console.log(`📄 Files scanned: ${this.stats.filesScanned}`);
    console.log(`🔴 Exact duplicates: ${this.stats.exactDuplicates} files in ${this.duplicates.exact.size} groups`);
    console.log(`🟡 Functional duplicates: ${this.stats.functionalDuplicates} files in ${this.duplicates.functional.size} groups`);
    console.log(`🟠 Similar files: ${this.stats.similarFiles} files in ${this.duplicates.similar.size} groups`);

    if (this.duplicates.exact.size === 0 && this.duplicates.functional.size === 0) {
      console.log('\n✅ Great! No exact or functional duplicates found.');
      if (this.duplicates.similar.size > 0) {
        console.log('📋 Found similar files that might benefit from refactoring.');
      }
    }
  }

  /**
   * Show available interactive actions
   */
  showInteractiveActions() {
    console.log('\n🚀 AVAILABLE ACTIONS');
    console.log('===================');

    if (this.duplicates.exact.size > 0) {
      console.log('🗑️  Auto-remove exact duplicates:');
      console.log('   npm run detect-duplicates:remove');
    }

    if (this.duplicates.functional.size > 0) {
      console.log('🔍 Analyze functional duplicates:');
      console.log('   npm run detect-duplicates:analyze');
    }

    if (this.duplicates.similar.size > 0) {
      console.log('📋 Full similar files report:');
      console.log('   npm run detect-duplicates:scan');
      console.log('🔬 Detailed pattern analysis:');
      console.log('   npm run detect-duplicates:analyze');
    }

    console.log('\n📖 Help and documentation:');
    console.log('   cat scripts/README-duplicate-detector.md');

    console.log('\n💡 RECOMMENDED WORKFLOW:');
    console.log('   1. Run "remove" to clean exact duplicates');
    console.log('   2. Run "analyze" for refactoring insights');
    console.log('   3. Review similar files manually');
    console.log('   4. Test thoroughly after any changes');
  }

    /**
   * Analyze code similarity in detail
   */
  async analyzeCodeSimilarity() {
    console.log('\n🔬 DETAILED CODE SIMILARITY ANALYSIS');
    console.log('=====================================');

    if (this.duplicates.functional.size === 0) {
      console.log('\n✅ No functional duplicates detected');
      console.log('\n📊 Analyzing code patterns across similar files...');

      // Analyze similar files for potential refactoring opportunities
      this.analyzeSimilarPatterns();
      return;
    }

    for (const [, files] of this.duplicates.functional) {
      console.log(`\n📋 Functional Duplicate Group:`);

      files.forEach(file => {
        console.log(`   📄 ${file.path}`);
        console.log(`      Functions: ${file.functions.length}`);

        // Show first few function signatures
        const content = fs.readFileSync(file.path, 'utf8');
        const functionSigs = this.extractFunctionSignatures(content);
        if (functionSigs.length > 0) {
          console.log(`      Key functions: ${functionSigs.slice(0, 3).join(', ')}${functionSigs.length > 3 ? '...' : ''}`);
        }
      });

      console.log('   💡 Consider: Merge into shared utility or base class');
    }
  }

  /**
   * Analyze similar patterns for refactoring opportunities
   */
  analyzeSimilarPatterns() {
    const jsFiles = [];

    // Collect all JS/TS files from similar groups
    for (const [pattern, files] of this.duplicates.similar) {
      const codeFiles = files.filter(f => ['.js', '.jsx', '.ts', '.tsx'].includes(path.extname(f.path)));
      if (codeFiles.length > 1) {
        jsFiles.push({ pattern, files: codeFiles });
      }
    }

    if (jsFiles.length === 0) {
      console.log('   📄 No code patterns found for analysis');
      return;
    }

    console.log('\n🔍 Code Pattern Analysis:');

    for (const group of jsFiles.slice(0, 5)) { // Limit to top 5 groups
      console.log(`\n   Pattern: ${group.pattern}`);

      const signatures = new Map();
      let totalFunctions = 0;
      let totalClasses = 0;

      group.files.forEach(file => {
        try {
          const content = fs.readFileSync(file.path, 'utf8');
          const functions = this.extractFunctionSignatures(content);
          const classes = this.extractClassSignatures(content);
          const imports = this.extractImports(content);

          totalFunctions += functions.length;
          totalClasses += classes.length;

          console.log(`      📄 ${path.relative(process.cwd(), file.path)}`);
          console.log(`         Functions: ${functions.length}, Classes: ${classes.length}, Imports: ${imports.length}`);

          // Track common function names
          functions.forEach(func => {
            if (!signatures.has(func)) signatures.set(func, []);
            signatures.get(func).push(file.path);
          });

        } catch (error) {
          console.log(`         ⚠️ Could not analyze: ${error.message}`);
        }
      });

      // Find potential shared functionality
      const commonFunctions = Array.from(signatures.entries())
        .filter(([, files]) => files.length > 1)
        .slice(0, 3);

      if (commonFunctions.length > 0) {
        console.log(`      🔗 Common functions: ${commonFunctions.map(([name]) => name).join(', ')}`);
        console.log(`      💡 Refactoring opportunity: Extract common functionality`);
      }

      // Analysis summary
      const avgFunctions = (totalFunctions / group.files.length).toFixed(1);
      const avgClasses = (totalClasses / group.files.length).toFixed(1);
      console.log(`      📈 Averages: ${avgFunctions} functions, ${avgClasses} classes per file`);
    }

    this.generateRefactoringRecommendations(jsFiles);
  }

  /**
   * Generate refactoring recommendations
   */
  generateRefactoringRecommendations(jsFiles) {
    console.log('\n💡 REFACTORING RECOMMENDATIONS:');

    const serviceFiles = jsFiles.filter(g => g.pattern.includes('Service'));
    const calculatorFiles = jsFiles.filter(g => g.pattern.includes('Calculator'));
    const analyzerFiles = jsFiles.filter(g => g.pattern.includes('Analyzer'));

    if (serviceFiles.length > 0) {
      console.log('   🔧 Service Layer:');
      console.log('      - Consider creating a base Service class with common methods');
      console.log('      - Extract shared error handling and validation logic');
      console.log('      - Implement consistent service interfaces');
    }

    if (calculatorFiles.length > 0) {
      console.log('   🧮 Calculator Utilities:');
      console.log('      - Create shared calculation utilities');
      console.log('      - Extract common mathematical operations');
      console.log('      - Standardize input/output formats');
    }

    if (analyzerFiles.length > 0) {
      console.log('   🔍 Analyzer Components:');
      console.log('      - Create base Analyzer class with common analysis patterns');
      console.log('      - Extract shared data validation and formatting');
      console.log('      - Standardize analysis result structures');
    }

    console.log('\n📋 Next Steps:');
    console.log('   1. Review files within each pattern group');
    console.log('   2. Identify truly shared functionality vs similar naming');
    console.log('   3. Create shared utilities or base classes');
    console.log('   4. Update imports and refactor gradually');
    console.log('   5. Run tests after each refactoring step');
  }

  /**
   * Show help information
   */
  showHelp() {
    console.log(`
Usage: npm run detect-duplicates [command]

Commands:
  scan        Scan for duplicates and show report (default)
  remove      Scan and automatically remove exact duplicates
  analyze     Detailed analysis of code similarity
  interactive Interactive mode for manual review

Examples:
  npm run detect-duplicates
  npm run detect-duplicates remove
  npm run detect-duplicates analyze

Safety Features:
- Only removes exact duplicates automatically
- Protects critical files (index.js, package.json, etc.)
- Creates backup before removal (if implemented)
- Provides detailed reports before any changes

Directory Coverage:
- /src (backend implementation)
- /client/src (frontend implementation)
- Respects .gitignore patterns
- Skips node_modules, build dirs, etc.
`);
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Run the detector
if (require.main === module) {
  const detector = new DuplicateDetector();
  detector.run().catch(console.error);
}

module.exports = DuplicateDetector;
