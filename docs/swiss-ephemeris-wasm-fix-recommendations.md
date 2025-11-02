# Swiss Ephemeris WASM Loading Fix Recommendations

## Issue Analysis

**Root Cause**: Swiss Ephemeris WASM loading failed in Node.js development environment due to fetch mechanism not working properly for local WASM files.

**Exact Error**: 
```
wasm streaming compile failed: TypeError: fetch failed
falling back to ArrayBuffer instantiation
failed to asynchronously prepare wasm: both async and sync fetching of the wasm failed
Aborted(both async and sync fetching of the wasm failed)
```

**Status**: ✅ Production (Render) works correctly - issue is development-only

---

## Immediate Fix Implementation

### **File to Fix**: `src/utils/swisseph-wrapper.js`

**Current Problem Line ~95**:
```javascript
const swisseph = await SwissEPH.default.init(wasmPath);
```

**Replace lines 80-110** with:
```javascript
      // Strategy 2: Try WASM buffer approach for Node.js development
      if (wasmPath && wasmPath.startsWith('file://')) {
        try {
          // For Node.js development, read WASM file into buffer first
          const wasmBuffer = getWasmBuffer();
          if (wasmBuffer) {
            swisseph = await SwissEPH.default.init(wasmBuffer);
            swissephAvailable = true;
            console.log('✅ Swiss Ephemeris initialized successfully using WASM buffer (Strategy 2)');
            return { swisseph, available: swissephAvailable };
          }
        } catch (bufferError) {
          initializationErrors.push(`Strategy 2 (WASM buffer): ${bufferError.message}`);
        }
      }
```

### **File to Enhance**: `src/utils/wasm-loader.js`

**Replace `getWasmBuffer()` function (~lines 80-120)** with:
```javascript
export function getWasmBuffer() {
  const isNode = typeof window === 'undefined' && typeof process !== 'undefined';
  
  if (!isNode) {
    return null; // Browser doesn't need this
  }
  
  const possiblePaths = [
    path.resolve(process.cwd(), 'public/swisseph.wasm'),
    path.resolve(process.cwd(), 'client/public/swisseph.wasm')
  ];
  
  for (const wasmPath of possiblePaths) {
    if (fs.existsSync(wasmPath)) {
      try {
        const wasmBuffer = fs.readFileSync(wasmPath);
        console.log(`✅ Loaded WASM buffer from: ${wasmPath}`);
        return wasmBuffer;
      } catch (error) {
        console.warn(`Warning: Failed to read WASM from ${wasmPath}: ${error.message}`);
      }
    }
  }
  
  return null;
}
```

---

## Secondary Options (if primary fix fails)

### **Option 2: Development Environment Detection**

Add to `src/utils/swisseph-wrapper.js`:
```javascript
const isDevelopment = process.env.NODE_ENV !== 'production' && !process.env.RENDER;

// In development, provide a graceful fallback
if (isDevelopment && swissephAvailable === false) {
  console.warn('⚠️ Development Mode: Swiss Ephemeris not available. Using mock calculations.');
  // Return structured mock data for development
  return {
    swisseph: createMockSwisseph(), 
    available: false,
    isDevelopment: true
  };
}
```

### **Option 3: Node.js Fetch Workaround**

Add to `src/utils/wasm-loader.js`:
```javascript
export function createFileProtocolUrl(wasmPath) {
  // Node.js fetch sometimes fails with file:// URLs
  // Convert to absolute path for Node.js 18+
  if (typeof process !== 'undefined') {
    return `file://${path.resolve(wasmPath)}`;
  }
  return wasmPath;
}
```

---

## Production Validation

### **Verification Steps**

1. **Test Local Fix**:
```bash
cd /Users/Shared/cursor/jjyotish-shastra
node -e "
import('./src/utils/swisseph-wrapper.js').then(async ({ setupSwissephWithEphemeris }) => {
  try {
    const result = await setupSwissephWithEphemeris();
    console.log('✅ Fixed wrapper works:', result.available);
  } catch (error) {
    console.error('❌ Fixed wrapper failed:', error.message);
  }
});
"
```

2. **Test API Endpoint**:
```bash
curl -s -X POST "http://localhost:3001/api/v1/chart/generate" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","dateOfBirth":"1997-12-18","timeOfBirth":"02:30","latitude":32.4935378,"longitude":74.5411575,"timezone":"Asia/Karachi","gender":"male"}' | jq '.success'
```

3. **Verify Production Still Works**:
```bash
curl -s -X POST "https://jjyotish-shastra-backend.onrender.com/api/v1/chart/generate" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","dateOfBirth":"1997-12-18","timeOfBirth":"02:30","latitude":32.4935378,"longitude":74.5411575,"timezone":"Asia/Karachi","gender":"male"}' | jq '.success'
```

---

## Testing Strategy

### **Before Fix** (Current Status):
- ✅ Production: All chart endpoints working
- ❌ Development: Chart endpoints failing with WASM error
- ✅ Non-chart endpoints: Working in both environments

### **After Fix** (Expected Status):
- ✅ Production: All chart endpoints working (unchanged)
- ✅ Development: Chart endpoints should work with WASM buffer approach
- ✅ Non-chart endpoints: Continue working

### **Fallback Plan**: 
If WASM buffer approach fails, implement development mock mode that:
- Allows UI development to continue
- Returns structured mock chart data
- Requires minimal code changes
- Preserves production functionality

---

## Implementation Priority

1. **HIGH PRIORITY**: Implement WASM buffer loading approach (detailed above)
2. **MEDIUM PRIORITY**: Add development fallback for seamless development
3. **LOW PRIORITY**: Enhance error messages and debugging information

---

## Notes

- **WASM Files Verified**: Both `/public/swisseph.wasm` and `/node_modules/sweph-wasm/dist/wasm/swisseph.wasm` exist
- **Node.js Version**: v24.10.0 (supports WASM)
- **Issue Environment-Specific**: Only affects local development
- **Production Status**: Fully functional on Render deployment

This fix will enable local development while maintaining production deployment functionality.
