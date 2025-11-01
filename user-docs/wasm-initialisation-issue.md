# Fix WASM Initialization and Test Production

## Problem Analysis

The `sweph-wasm` library fails to initialize in Node.js with error "fetch failed" because it attempts to load WASM files using `fetch()` API. Research indicates:

1. **Root Cause**: `sweph-wasm` uses `new URL("wasm/swisseph.wasm", import.meta.url).href` which tries to fetch the WASM file. In Node.js <18, `fetch()` isn't natively available.

2. **sweph-wasm API**: The `SwissEPH.init()` method accepts an optional parameter: `static async init(wasmFileUrl?)` that can accept a WASM file path/URL.

3. **Vercel Environment**: Vercel uses Node.js 18+ which has native `fetch()` support, so the issue may only occur locally.

## Solution Strategy

### Option 1: Provide Explicit WASM File Path (Recommended)

Modify initialization code to pass the WASM file path explicitly using filesystem path in Node.js environment.

### Option 2: Ensure Node.js 18+ Locally

Update local development environment to use Node.js 18+ for native `fetch()` support.

### Option 3: Test Production First

Deploy to Vercel and test - production environment may already work with Node.js 18+.

## Implementation Steps

### 1. Check Current Node.js Version

- Verify Node.js version locally: `node --version`
- If < 18, document requirement for Node.js 18+

### 2. Modify sweph-wasm Initialization Wrapper

Update all initialization points to detect environment and provide WASM file path:

**Files to update:**

- `src/utils/swisseph-wrapper.js`
- `src/services/chart/ChartGenerationService.js`
- `src/core/calculations/astronomy/sunrise.js`
- `src/core/calculations/chart-casting/AscendantCalculator.js`
- `src/core/calculations/rectification/gulika.js`
- `src/core/calculations/transits/TransitCalculator.js`

**Pattern to implement:**

```javascript
async function ensureSwissephLoaded() {
  if (swisseph !== null) {
    if (!swissephAvailable) {
      throw new Error('Swiss Ephemeris initialization failed.');
    }
    return { swisseph, available: swissephAvailable };
  }

  if (swissephInitPromise) {
    return swissephInitPromise;
  }

  swissephInitPromise = (async () => {
    try {
      const SwissEPH = await import('sweph-wasm');
      
      // Detect Node.js environment
      const isNode = typeof window === 'undefined' && typeof process !== 'undefined';
      
      let wasmPath = null;
      if (isNode) {
        // Provide explicit WASM file path for Node.js
        const path = await import('path');
        const fs = await import('fs');
        const wasmFilePath = path.default.resolve(
          process.cwd(),
          'node_modules/sweph-wasm/dist/wasm/swisseph.wasm'
        );
        
        // Verify file exists
        if (fs.default.existsSync(wasmFilePath)) {
          // Convert to file:// URL for Node.js
          wasmPath = new URL(`file://${wasmFilePath}`).href;
        }
      }
      
      swisseph = await SwissEPH.default.init(wasmPath);
      swissephAvailable = true;
      return { swisseph, available: swissephAvailable };
    } catch (error) {
      swissephAvailable = false;
      swissephInitPromise = null;
      throw new Error(`Swiss Ephemeris initialization failed: ${error.message}`);
    }
  })();

  return swissephInitPromise;
}
```

### 3. Update package.json Node.js Version Requirement

Add `engines` field to specify Node.js 18+:

```json
"engines": {
  "node": ">=18.0.0"
}
```

### 4. Create WASM Path Helper Utility

Create `src/utils/wasm-loader.js`:

```javascript
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getWasmPath() {
  const isNode = typeof window === 'undefined' && typeof process !== 'undefined';
  
  if (!isNode) {
    return null; // Browser will use default
  }
  
  // Try multiple possible locations
  const possiblePaths = [
    path.resolve(process.cwd(), 'node_modules/sweph-wasm/dist/wasm/swisseph.wasm'),
    path.resolve(__dirname, '../../node_modules/sweph-wasm/dist/wasm/swisseph.wasm'),
    path.resolve(process.cwd(), 'node_modules/sweph-wasm/dist/wasm/swisseph.wasm')
  ];
  
  for (const wasmPath of possiblePaths) {
    if (fs.existsSync(wasmPath)) {
      return new URL(`file://${wasmPath}`).href;
    }
  }
  
  return null; // Fallback to default behavior
}
```

### 5. Update All Initialization Points

Apply the new initialization pattern to all files listed in step 2.

### 6. Test Locally

- Run test script: `node tests/debug-swisseph.js`
- Run diagnostic: `node scripts/diagnose-swisseph.js`
- Verify API endpoints work: test `/api/v1/chart/generate` endpoint

### 7. Deploy to Vercel and Test

- Deploy using: `vercel --prod`
- Test production endpoints
- Monitor Vercel function logs for WASM initialization errors
- Verify chart generation and BTR endpoints work

### 8. Create Fallback Strategy

If WASM loading still fails, implement graceful degradation:

- Catch initialization errors
- Log detailed error information
- Provide user-friendly error messages
- Consider alternative calculation methods for non-critical features

## Files to Modify

1. `src/utils/swisseph-wrapper.js` - Main wrapper initialization
2. `src/services/chart/ChartGenerationService.js` - Service initialization
3. `src/core/calculations/astronomy/sunrise.js` - Sunrise calculation
4. `src/core/calculations/chart-casting/AscendantCalculator.js` - Ascendant calculation
5. `src/core/calculations/rectification/gulika.js` - Gulika calculation
6. `src/core/calculations/transits/TransitCalculator.js` - Transit calculation
7. `src/utils/wasm-loader.js` - NEW utility for WASM path resolution
8. `package.json` - Add Node.js version requirement
9. `tests/debug-swisseph.js` - Update test script
10. `scripts/diagnose-swisseph.js` - Update diagnostic script

## Testing Checklist

- [ ] Local initialization works with Node.js 18+
- [ ] Local initialization works with explicit WASM path (Node.js <18)
- [ ] All API endpoints respond correctly locally
- [ ] Chart generation works locally
- [ ] BTR calculation works locally
- [ ] Vercel deployment succeeds
- [ ] Production API endpoints work
- [ ] Production chart generation works
- [ ] Production BTR calculation works
- [ ] No WASM initialization errors in production logs

## Rollback Plan

If changes cause issues:

1. Revert to previous initialization pattern
2. Document Node.js 18+ requirement for local development
3. Test production environment (may already work with Node.js 18+)