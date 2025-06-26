# Duplicate Detection & Removal Tool

## Overview

The Jyotish Shastra Duplicate Detector is a comprehensive Node.js tool designed to scan both `/src` (backend) and `/client/src` (frontend) directories to identify, analyze, and remove duplicate files and functionality while maintaining code safety and integrity.

## Features

### 🔍 **Three-Phase Detection System**

1. **Exact Duplicates** - Files with identical content (SHA-256 hash comparison)
2. **Functional Duplicates** - Files with similar functionality (code signature analysis)
3. **Similar Files** - Files with similar naming patterns and structure

### 🛡️ **Safety Features**

- **Protected Files**: Never touches critical files (`package.json`, `index.js`, etc.)
- **Smart Logic**: Preferentially keeps files in critical directories
- **Backup Recommendations**: Suggests version control checkpoints
- **Dry Run Mode**: Shows what would be removed before actual deletion

### 📊 **Advanced Analysis**

- **Code Signature Extraction**: Analyzes imports, exports, functions, classes
- **Pattern Recognition**: Identifies naming conventions and architectural patterns
- **Similarity Verification**: Uses multiple algorithms to verify duplicates
- **Statistical Reporting**: Provides comprehensive analysis reports

## Installation & Setup

The tool is already integrated into your project. No additional dependencies required.

## Usage

### Quick Commands

```bash
# Scan for duplicates (default)
npm run detect-duplicates

# Scan only - show report
npm run detect-duplicates:scan

# Auto-remove exact duplicates
npm run detect-duplicates:remove

# Detailed code similarity analysis
npm run detect-duplicates:analyze

# Interactive mode (future feature)
npm run detect-duplicates:interactive

# Alias commands
npm run check-duplicates    # Same as scan
npm run clean-duplicates    # Same as remove
```

### Command Details

#### **Scan Mode** (Default)
```bash
npm run detect-duplicates
# or
npm run detect-duplicates:scan
```

**Output:**
- Complete analysis report
- Statistics summary
- List of exact duplicates with hash verification
- Functional duplicates with similarity scores
- Similar files by naming patterns
- Actionable recommendations

#### **Remove Mode**
```bash
npm run detect-duplicates:remove
```

**Actions:**
- Scans for all duplicate types
- **Automatically removes exact duplicates only**
- Preserves the first file in each duplicate group
- Shows space recovered and files removed
- Provides post-removal recommendations

#### **Analyze Mode**
```bash
npm run detect-duplicates:analyze
```

**Deep Analysis:**
- Detailed code signature comparison
- Function-by-function analysis
- Import/export pattern analysis
- Refactoring suggestions
- Architectural improvement recommendations

## Understanding the Report

### 📊 Statistics Section
```
📈 Statistics:
   Files Scanned: 450
   Exact Duplicates: 3
   Functional Duplicates: 7
   Similar Files: 12
```

### 🔴 Exact Duplicates
Files with identical content (100% match):
```
Hash: a1b2c3d4...
Size: 2.5 KB
📁 KEEP   src/services/chartService.js
🗑️  REMOVE client/src/services/chartService.js
```

### 🟡 Functional Duplicates
Files with similar functionality (requires manual review):
```
Signature: e5f6g7h8...
📁 KEEP   src/core/analysis/AspectAnalyzer.js
⚠️  REVIEW src/core/calculations/AspectCalculator.js
```

### 🟠 Similar Files
Files with similar naming patterns:
```
Pattern: *Service
📄 src/services/chartService.js
📄 src/services/analysisService.js
📄 client/src/services/chartService.js
```

## Configuration

### Scan Directories
```javascript
this.scanDirectories = ['src', 'client/src'];
```

### File Extensions
```javascript
this.allowedExtensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.css'];
```

### Protected Files
```javascript
this.protectedFiles = new Set([
  'package.json',
  'package-lock.json',
  'index.js',
  'index.html',
  'App.js',
  'setupTests.js'
]);
```

### Minimum File Size
```javascript
this.minFileSize = 50; // bytes
```

## Safety Guidelines

### ✅ **Safe Operations**
- Scanning is always safe (read-only)
- Exact duplicate removal (verified by hash)
- Files in non-critical directories

### ⚠️ **Requires Caution**
- Functional duplicates (manual review needed)
- Files in critical directories (`src/api`, `src/core`, `client/src/components`)
- Files with important side effects

### 🚫 **Never Removed**
- Protected files (package.json, index files, etc.)
- Files starting with '.' (hidden files)
- Files in node_modules, .git, build directories
- Files under minimum size threshold

## Integration with Development Workflow

### Pre-Commit Hook
Add to your git pre-commit hook:
```bash
npm run detect-duplicates:scan
if [ $? -ne 0 ]; then
  echo "Duplicates detected. Please review before committing."
  exit 1
fi
```

### CI/CD Integration
Add to your CI pipeline:
```yaml
- name: Check for duplicates
  run: |
    npm run detect-duplicates:scan
    if npm run detect-duplicates:scan | grep -q "Exact Duplicates: [^0]"; then
      echo "::warning::Duplicate files detected"
    fi
```

### Development Best Practices

1. **Before Creating New Files**: Run `npm run detect-duplicates:scan`
2. **After Refactoring**: Run `npm run detect-duplicates:analyze`
3. **Before Releases**: Run `npm run detect-duplicates:remove`
4. **Weekly Maintenance**: Review functional duplicates

## Advanced Features

### Code Signature Analysis

The tool analyzes JavaScript/TypeScript files by extracting:

```javascript
const patterns = {
  imports: extractImports(content),     // import statements
  exports: extractExports(content),     // export statements
  functions: extractFunctionSignatures(content), // function names
  classes: extractClassSignatures(content),     // class names
  constants: extractConstants(content)   // constant declarations
};
```

### Pattern Recognition

Detects common architectural patterns:
- `*Service` - Service layer files
- `*Controller` - API controllers
- `*Component` - React components
- `*Analyzer` - Analysis modules
- `*Calculator` - Calculation utilities

### Similarity Verification

Multiple verification layers:
1. **Hash Comparison** - Exact content match
2. **Signature Comparison** - Functional similarity
3. **Pattern Matching** - Structural similarity
4. **Size Comparison** - File size analysis

## Troubleshooting

### Common Issues

**Issue**: "Could not read file"
**Solution**: Check file permissions, ensure file isn't locked

**Issue**: "No duplicates found" when duplicates exist
**Solution**: Check file extensions and minimum size settings

**Issue**: "Protected file" warning during removal
**Solution**: This is normal - critical files are intentionally protected

### Debug Mode

Add debugging to the script:
```bash
DEBUG=true npm run detect-duplicates
```

### Performance Optimization

For large codebases:
- Increase `minFileSize` to skip tiny files
- Reduce `allowedExtensions` to focus on specific file types
- Use `scanDirectories` to target specific areas

## Future Enhancements

### Planned Features
- **Interactive CLI**: Choose which duplicates to remove
- **Backup Creation**: Automatic backup before removal
- **Config File**: External configuration support
- **Integration APIs**: Programmatic access
- **Watch Mode**: Real-time duplicate detection
- **Similarity Threshold**: Configurable similarity levels

### Advanced Analysis
- **Dependency Analysis**: Check import/export relationships
- **Code Complexity**: Analyze complexity before removal
- **Test Coverage**: Ensure tests exist before removal
- **Git History**: Analyze file history for decision making

## Contributing

To enhance the duplicate detector:

1. **Add New Detection Patterns**: Extend `extractNamePattern()`
2. **Improve Code Analysis**: Enhance `extractCodeSignature()`
3. **Add Safety Checks**: Extend `isSafeToRemove()`
4. **Custom Reporting**: Modify `generateReport()`

## Related Tools

Based on research from:
- [dups](https://github.com/enr/dups) - Go-based duplicate finder
- [periscope](https://github.com/anishathalye/periscope) - File organization tool

## License

Part of the Jyotish Shastra project - MIT License
