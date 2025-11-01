# Module Resolution Guide - Jyotish Shastra

## Overview

This guide documents the module resolution patterns and best practices for the Jyotish Shastra application to ensure production-ready builds across all deployment environments.

## Problem Statement

**Issue**: Webpack in production builds requires explicit file extensions for ES module imports, while local development environments are more lenient.

**Impact**: Build failures in production (Render) even when local builds succeed.

## Solution: Explicit File Extensions

All relative imports MUST include explicit `.js` or `.jsx` file extensions.

### ✅ Correct Import Pattern

```javascript
// Good - Explicit .js extension
import { cn } from '../../../lib/utils.js';

// Good - Explicit .jsx extension
import Header from './components/Header.jsx';

// Good - CSS/SCSS always has extension
import './styles/App.css';
```

### ❌ Incorrect Import Pattern

```javascript
// Bad - Missing extension
import { cn } from '../../../lib/utils';

// Bad - Missing extension
import Header from './components/Header';
```

## File Extension Rules

| File Type | Extension Required | Example |
|-----------|-------------------|---------|
| JavaScript utilities | `.js` | `import { utils } from './utils.js'` |
| React components | `.jsx` | `import Button from './Button.jsx'` |
| TypeScript files | `.ts` or `.tsx` | `import { Type } from './types.ts'` |
| CSS/SCSS | `.css` or `.scss` | `import './styles.css'` |
| JSON | `.json` | `import config from './config.json'` |
| Node modules | No extension | `import React from 'react'` |

## Webpack Configuration

### CRACO Configuration (`client/craco.config.js`)

```javascript
webpack: {
  configure: (webpackConfig) => {
    // Ensure proper file extensions are resolved
    webpackConfig.resolve.extensions = ['.js', '.jsx', '.json'];
    
    // Disable fullySpecified for backward compatibility
    webpackConfig.resolve.fullySpecified = false;
    
    return webpackConfig;
  }
}
```

## Automated Tools

### 1. Import Verification Script

**Purpose**: Detect imports missing file extensions

**Usage**:
```bash
node scripts/verify-imports.cjs
```

**Output**:
- ✅ Success: All imports are production-ready
- ⚠️ Warning: Lists files and line numbers with missing extensions

### 2. Auto-Fix Import Script

**Purpose**: Automatically add `.js`/`.jsx` extensions to all relative imports

**Usage**:
```bash
node scripts/fix-imports.cjs
```

**What it does**:
- Scans all `.js` and `.jsx` files in `client/src`
- Detects relative imports without extensions
- Determines correct extension (`.js` or `.jsx`) by checking file system
- Updates imports in-place
- Reports number of files and imports fixed

### 3. Pre-Build Verification

Add to `package.json` scripts:

```json
{
  "scripts": {
    "prebuild": "node ../scripts/verify-imports.cjs",
    "build": "NODE_ENV=production GENERATE_SOURCEMAP=false craco build"
  }
}
```

## Development Workflow

### Daily Development
1. Write code with explicit file extensions from the start
2. ESLint will catch missing extensions (if configured)
3. Local dev server will work with or without extensions

### Before Committing
```bash
# Verify all imports
node scripts/verify-imports.cjs

# If issues found, auto-fix
node scripts/fix-imports.cjs

# Verify again
node scripts/verify-imports.cjs
```

### Before Deployment
```bash
# Clear cache
rm -rf client/node_modules/.cache client/build

# Test production build
cd client && npm run build

# Verify build succeeded
ls -la build/static/js/
```

## Deployment Checklist

- [ ] All imports have explicit file extensions
- [ ] Verification script passes (`verify-imports.cjs`)
- [ ] Local production build succeeds
- [ ] No module resolution errors in build output
- [ ] Build artifacts generated in `client/build/`

## Common Issues and Solutions

### Issue: "Module not found" in Production

**Cause**: Missing file extension in import statement

**Solution**:
```bash
node scripts/fix-imports.cjs
```

### Issue: Build Works Locally But Fails on Render

**Cause**: Different webpack configurations or Node.js versions

**Solution**:
1. Ensure all imports have explicit extensions
2. Check `render.yaml` for correct Node.js version
3. Clear Render build cache

### Issue: "Cannot find module" After Fixing Imports

**Cause**: File actually doesn't exist or wrong path

**Solution**:
1. Verify file exists at the path
2. Check for typos in path
3. Ensure correct relative path (`../` vs `../../`)

## Best Practices

### 1. Always Use Explicit Extensions
Write imports with extensions from the start - don't rely on tooling to add them later.

### 2. Use Verification Scripts Regularly
Run `verify-imports.cjs` before every commit and deployment.

### 3. Configure Pre-commit Hooks
```bash
# .husky/pre-commit
#!/bin/sh
node scripts/verify-imports.cjs || exit 1
```

### 4. Document Import Patterns in Code Reviews
Include import pattern checks in code review checklist.

### 5. Keep Dependencies Updated
Ensure webpack, CRACO, and React Scripts are on compatible versions.

## Technical Details

### Why This Matters

1. **ES Module Specification**: ES6 modules technically require explicit extensions
2. **Production Webpack**: Stricter module resolution in production mode
3. **Cross-Platform Compatibility**: Ensures builds work across different environments
4. **Future-Proofing**: Aligns with modern JavaScript standards

### Webpack Module Resolution Order

1. Check if import has explicit extension → use it
2. Check `resolve.extensions` array → try each extension
3. Check if path is a directory → look for `index.js`
4. Fail with "Module not found" error

With explicit extensions, step 1 succeeds immediately, avoiding potential resolution issues.

## Migration Guide

### For Existing Codebases

1. **Run diagnostic**:
   ```bash
   node scripts/verify-imports.cjs
   ```

2. **Review output** - note how many files need updating

3. **Backup code**:
   ```bash
   git checkout -b fix/import-extensions
   ```

4. **Auto-fix imports**:
   ```bash
   node scripts/fix-imports.cjs
   ```

5. **Verify fixes**:
   ```bash
   node scripts/verify-imports.cjs
   ```

6. **Test build**:
   ```bash
   cd client && npm run build
   ```

7. **Commit changes**:
   ```bash
   git add .
   git commit -m "fix: Add explicit file extensions to all imports for production compatibility"
   ```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Build Validation

on: [push, pull_request]

jobs:
  verify-imports:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: node scripts/verify-imports.cjs
      - run: cd client && npm install
      - run: cd client && npm run build
```

## References

- [ES Modules Specification](https://tc39.es/ecma262/#sec-modules)
- [Webpack Module Resolution](https://webpack.js.org/concepts/module-resolution/)
- [Create React App - Importing a Component](https://create-react-app.dev/docs/importing-a-component/)
- [Node.js ES Modules](https://nodejs.org/api/esm.html)

## Changelog

### 2025-01-11
- ✅ Fixed Card.jsx import path (already had `.js` extension)
- ✅ Identified 54 additional imports missing extensions
- ✅ Created automated verification script
- ✅ Created automated fix script
- ✅ Fixed all 54 imports across 16 files
- ✅ Verified production build succeeds
- ✅ Documented module resolution patterns

---

**Status**: ✅ All imports production-ready | Last Updated: 2025-01-11
