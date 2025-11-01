# Render Migration Summary

## Completed Changes

### 1. Removed Vercel-Specific Files
- ✅ Deleted `vercel.json`
- ✅ Deleted `scripts/deploy-vercel.js`
- ✅ Deleted `api/[...path].js` (Vercel serverless handler)
- ✅ Deleted `api/index.js` (Vercel serverless entry)
- ✅ Deleted `src/index.serverless.js` (Vercel serverless version)

### 2. Updated Backend Code for Render
- ✅ `src/index.js`: Removed Vercel-specific code, added Render platform detection
- ✅ `src/utils/wasm-loader.js`: Updated for Render environment instead of Vercel
- ✅ `package.json`: Removed Vercel scripts, added Render deployment script
- ✅ `render.yaml`: Created configuration for both backend and frontend services

### 3. Updated Frontend Code for Render
- ✅ `client/src/utils/apiConfig.js`: Created utility for API URL configuration
- ✅ `client/src/pages/HomePage.jsx`: Updated to use `getApiUrl()` utility
- ✅ `client/src/pages/ComprehensiveAnalysisPage.jsx`: Updated to use `getApiUrl()` utility
- ✅ `client/src/components/analysis/ResponseDataToUIDisplayAnalyser.js`: Updated to use `getApiUrl()` utility

### 4. Configuration Files
- ✅ `render.yaml`: Complete configuration for both services
- ✅ Updated environment variable handling for Render platform

## Remaining Manual Updates Required

### Frontend Files Still Using Hardcoded API Paths

The following files still use hardcoded `/api/v1/...` paths and should be updated to use `getApiUrl()` from `apiConfig.js`:

1. **`client/src/pages/AnalysisPage.jsx`**
   - Update `analysisEndpoints` object to use `getApiUrl()`
   - Update fetch calls to use configured API URL

2. **`client/src/pages/BirthTimeRectificationPage.jsx`**
   - Update API calls: `/api/v1/health`, `/api/v1/rectification/quick`, `/api/v1/rectification/with-events`

3. **`client/src/pages/ReportPage.jsx`**
   - Update `/api/v1/analysis/comprehensive` fetch call

4. **`client/src/services/chartService.js`**
   - Update `/api/v1/chart/generate` endpoint

5. **`client/src/services/geocodingService.js`**
   - Update `/api/v1/geocoding/location` endpoint

6. **`client/src/components/BirthTimeRectification.jsx`**
   - Update API URL constant if present

## Environment Variables Required

### Backend (Web Service)
Set in Render Dashboard → Environment Variables:
- `NODE_ENV=production`
- `GEOCODING_API_KEY=<your_opencage_key>` (from `.env` file)
- `FRONTEND_URL=https://jjyotish-shastra-frontend.onrender.com` (set after frontend deploys)

### Frontend (Static Site)
Set in Render Dashboard → Environment Variables:
- `REACT_APP_API_URL=https://jjyotish-shastra-backend.onrender.com/api` (set after backend deploys)
- `GENERATE_SOURCEMAP=false` (optional)

## Deployment Steps

1. **Deploy Backend First:**
   ```bash
   render services create web-service --name jjyotish-shastra-backend --repo <your-repo> --build-command "npm install && npm run copy-wasm" --start-command "node src/index.js"
   ```
   Or use `render.yaml`:
   ```bash
   render deploy
   ```

2. **Set Backend Environment Variables:**
   - Go to Render Dashboard → Your Backend Service → Environment
   - Add `GEOCODING_API_KEY` from `.env` file
   - Note the backend URL (e.g., `https://jjyotish-shastra-backend.onrender.com`)

3. **Deploy Frontend:**
   ```bash
   render services create static-site --name jjyotish-shastra-frontend --repo <your-repo> --root-dir client --build-command "npm install && npm run build" --publish-dir build
   ```
   Or use `render.yaml`:
   ```bash
   render deploy
   ```

4. **Set Frontend Environment Variables:**
   - Go to Render Dashboard → Your Frontend Service → Environment
   - Add `REACT_APP_API_URL=https://<your-backend-url>/api`
   - Redeploy frontend after setting environment variable

5. **Update Backend CORS:**
   - Update `FRONTEND_URL` in backend environment variables to frontend URL
   - Restart backend service

## Testing After Deployment

1. **Test Backend Health:**
   ```bash
   curl https://your-backend-url.onrender.com/api/v1/health
   ```

2. **Test Frontend:**
   - Open frontend URL in browser
   - Verify API calls work (check browser console)
   - Test form submission

3. **Verify Swiss Ephemeris:**
   - Test chart generation
   - Verify WASM file loads correctly
   - Check backend logs for WASM initialization

## Notes

- Frontend files still using hardcoded paths will work in development (with proxy) but need updates for Render deployment
- Consider updating remaining files to use `apiConfig.js` utility for consistency
- Free tier services on Render sleep after 15 minutes - first request may take ~30 seconds

