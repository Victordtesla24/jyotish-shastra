# Deployment Guide: Jyotish Shastra BTR System

**Last Updated**: 2025-11-06  
**Platform**: Render.com  
**Deployment Type**: Manual (with validation gates)  
**Status**: Production-Ready

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Deployment Process](#deployment-process)
- [Environment Configuration](#environment-configuration)
- [Post-Deployment Validation](#post-deployment-validation)
- [Rollback Procedure](#rollback-procedure)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)
- [Success Criteria (SC-7)](#success-criteria-sc-7)

---

## Prerequisites

Before deployment, ensure all the following are complete:

### Code Quality Checks
- [ ] All BTR tests passing locally
  ```bash
  npm run test:btr:all
  ```
- [ ] Evidence artifacts generated
  ```bash
  npm run evidence:generate
  ```
- [ ] EVIDENCE.md shows PASS status for all success criteria
  ```bash
  cat EVIDENCE.md | grep "Overall Status"
  ```
- [ ] No ESLint errors
  ```bash
  npm run lint
  ```
- [ ] TypeScript compilation successful (if applicable)
  ```bash
  npm run typecheck
  ```

### Infrastructure Ready
- [ ] Render.com account configured
- [ ] Repository connected to Render
- [ ] Environment variables prepared (see [Environment Configuration](#environment-configuration))
- [ ] Database connection string ready (if using MongoDB)

### Documentation Current
- [ ] `EVIDENCE.md` reflects current implementation
- [ ] `SOURCES.md` contains all references
- [ ] `README.md` updated with BTR features
- [ ] API documentation current

---

## Deployment Process

### Step 1: Pre-Deployment Validation

Run the complete validation suite to ensure deployment readiness:

```bash
# Full validation (tests + evidence generation)
npm run deploy:validate

# Expected output:
# - All tests pass (48+ BTR tests)
# - EVIDENCE.md generated with PASS status
# - Zero ESLint errors
```

**Validation Checklist:**
- ✓ All unit tests pass
- ✓ All integration tests pass
- ✓ BPHS methods validated (SC-1)
- ✓ JPL Horizons accuracy verified (SC-2)
- ✓ Golden case passes (SC-3, SC-4, SC-5)
- ✓ Evidence generated successfully

### Step 2: Commit Changes

```bash
# Stage all changes
git add .

# Commit with deployment tag
git commit -m "deploy: BTR accuracy enhancement v1.0.0

- Added M1-M5 metrics validation
- Implemented JPL Horizons accuracy checks
- Created evidence generation system
- Configured CI/CD integration
- All SC-1 through SC-7 success criteria met"

# Tag release
git tag -a v1.0.0 -m "BTR accuracy enhancement with SC-1 through SC-7 validation"

# Push to origin
git push origin main --tags
```

### Step 3: Deploy to Render

#### Option A: Via Render Dashboard (Recommended)

1. **Log in to Render**
   - Navigate to https://dashboard.render.com
   - Select `jjyotish-shastra-backend` service

2. **Trigger Manual Deploy**
   - Click "Manual Deploy" button
   - Select "Deploy latest commit"
   - Confirm deployment

3. **Monitor Build Process**
   - Watch build logs for errors
   - Verify ephemeris file validation passes
   - Wait for "Build successful" message
   - Confirm service reaches "Live" status

#### Option B: Via Render CLI (Alternative)

```bash
# Install Render CLI (if not already installed)
npm install -g @render/cli

# Login to Render
render login

# Deploy service
render services deploy jjyotish-shastra-backend

# Follow prompts and monitor deployment
```

### Step 4: Configure Environment Variables

Navigate to: **Render Dashboard → jjyotish-shastra-backend → Environment**

#### Required Environment Variables

**API Keys (Set these manually):**
```
GEOCODING_API_KEY=<your-opencage-api-key>
```

**Frontend Configuration:**
```
FRONTEND_URL=https://jjyotish-shastra-frontend.onrender.com
```

**BTR Metrics (Auto-configured via render.yaml):**
- `BTR_METRICS_ENABLED=true`
- `BTR_METRICS_DIR=metrics/btr`
- `BTR_REPORTS_DIR=reports/btr`

**JPL Horizons (Auto-configured via render.yaml):**
- `HORIZONS_ENABLED=true`
- `HORIZONS_MODE=replay` _(Important: Use fixtures, don't call API)_
- `HORIZONS_FIXTURE_DIR=fixtures/horizons`

**Time Scale Configuration (Auto-configured via render.yaml):**
- `DELTAT_SOURCE=IERS`
- `DELTAT_DATA_PATH=src/adapters/data/deltaT_iers.json`

**Security (Set manually if customizing):**
- `JWT_SECRET=<generate-secure-random-string>`
- `JWT_EXPIRY=24h`

### Step 5: Post-Deployment Smoke Tests

Run smoke tests to verify deployment success:

```bash
# Basic smoke tests
node scripts/post-deploy-smoke.js \
  --url=https://jjyotish-shastra-backend.onrender.com

# With golden case validation
node scripts/post-deploy-smoke.js \
  --url=https://jjyotish-shastra-backend.onrender.com \
  --golden-case
```

**Expected Output:**
```
🔬 BTR Post-Deployment Smoke Tests
📡 Testing: https://jjyotish-shastra-backend.onrender.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Health Check: Server is healthy
✓ API Availability: API responding (HTTP 200)
✓ Metrics Endpoint: Endpoint available (no metrics yet)
✓ Chart Generation: Chart generated successfully
⊘ Golden Case Validation: Use --golden-case flag to run

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Test Summary:
  ✓ Passed:  4
  ✗ Failed:  0
  ⊘ Skipped: 1
  Total:   5

✅ All smoke tests PASSED
```

### Step 6: Verify BTR Functionality

#### Test Health Endpoint
```bash
curl https://jjyotish-shastra-backend.onrender.com/api/health
# Expected: {"status":"ok","timestamp":"..."}
```

#### Test Metrics Endpoint
```bash
curl https://jjyotish-shastra-backend.onrender.com/api/v1/rectification/metrics/latest
# Expected: 200 or 404 (both are valid)
```

#### Test Chart Generation
```bash
curl -X POST https://jjyotish-shastra-backend.onrender.com/api/v1/chart/generate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "dateOfBirth": "1990-01-01",
    "timeOfBirth": "12:00",
    "placeOfBirth": "Mumbai, India",
    "latitude": 19.076,
    "longitude": 72.8777,
    "timezone": "Asia/Kolkata"
  }'
# Expected: 200 with rasiChart data
```

---

## Environment Configuration

### Development Environment

Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your local values:

```bash
NODE_ENV=development
PORT=3001
GEOCODING_API_KEY=<your-local-key>
BTR_METRICS_ENABLED=true
HORIZONS_MODE=replay  # Use fixtures, don't call API
```

### Production Environment (Render)

All production environment variables are configured via:
1. `render.yaml` (auto-configured values)
2. Render Dashboard (manual secrets)

**Critical Production Settings:**
- `NODE_ENV=production`
- `HORIZONS_MODE=replay` _(Never use 'record' in production)_
- `BTR_METRICS_ENABLED=true`
- Secure `JWT_SECRET` (generate with: `openssl rand -hex 32`)

---

## Post-Deployment Validation

### Validation Checklist

After deployment, verify the following:

- [ ] **Health Check**: `/api/health` returns 200 OK
- [ ] **Frontend Connection**: Frontend can connect to backend
- [ ] **Chart Generation**: Test chart generation with sample data
- [ ] **BTR Metrics**: Metrics endpoints respond correctly
- [ ] **Geocoding**: Location geocoding works
- [ ] **Ephemeris**: Swiss Ephemeris files loaded correctly
- [ ] **CORS**: Frontend can make cross-origin requests
- [ ] **SSL**: HTTPS certificate valid
- [ ] **Logs**: No errors in Render service logs

### Manual Testing Steps

1. **Create Test Chart**
   - Use frontend or API to generate a chart
   - Verify chart data is complete
   - Check planetary positions are reasonable

2. **Test BTR Rectification** (if applicable)
   - Input birth data requiring rectification
   - Verify methods execute successfully
   - Check metrics are calculated

3. **Verify Evidence Artifacts**
   - Access metrics endpoint
   - Verify JSON format is correct
   - Confirm thresholds are met

---

## Rollback Procedure

If deployment fails or critical issues arise:

### Quick Rollback

```bash
# Option 1: Via Render Dashboard
# 1. Go to Deployments tab
# 2. Find last known good deployment
# 3. Click "Redeploy" on that version

# Option 2: Via Git
git revert HEAD
git push origin main
# Render will auto-deploy the revert
```

### Full Rollback Process

1. **Identify Last Known Good Version**
   ```bash
   git log --oneline -10
   # Find last working commit
   ```

2. **Revert to Version**
   ```bash
   git checkout <commit-hash>
   git push origin main --force
   ```

3. **Verify Rollback**
   ```bash
   node scripts/post-deploy-smoke.js --url=<production-url>
   ```

4. **Incident Documentation**
   - Document what went wrong
   - Record in `docs/incidents/YYYY-MM-DD-incident.md`
   - Plan fix for next deployment

---

## Monitoring

### Health Monitoring

**Primary Health Endpoint:**
```
https://jjyotish-shastra-backend.onrender.com/api/health
```

**Uptime Monitoring Setup:**
- Configure external uptime monitor (e.g., UptimeRobot)
- Check interval: 5 minutes
- Alert on: Status code != 200

### Log Monitoring

**Access Render Logs:**
1. Dashboard → jjyotish-shastra-backend → Logs
2. Monitor in real-time during deployment
3. Set up log alerts for ERROR level

**Key Log Patterns to Monitor:**
- `ERROR` - Application errors
- `ECONNREFUSED` - Database connection issues
- `TypeError` - Code errors
- `UnhandledPromiseRejection` - Async errors

### Metrics Monitoring

**BTR Metrics Status:**
```bash
# Check if metrics are being generated
curl https://jjyotish-shastra-backend.onrender.com/api/v1/rectification/metrics/latest

# Expected: 200 with JSON data or 404 if no metrics yet
```

**Performance Metrics:**
- Average response time: < 5s for chart generation
- Memory usage: Monitor for leaks
- CPU usage: Should be minimal during idle

---

## Troubleshooting

### Issue: Build Fails on Render

**Symptoms:**
- Build logs show npm install errors
- Dependencies fail to download
- Native module compilation fails

**Solutions:**
1. **Check Dependencies**
   ```bash
   # Locally verify all dependencies install
   npm clean-install
   ```

2. **Verify package.json**
   - Ensure all dependencies have valid versions
   - Check for missing dependencies

3. **Check Node Version**
   - Render uses Node 18+
   - Verify `engines` in package.json matches

4. **Ephemeris Files**
   - Verify ephemeris files exist in repo
   - Check `scripts/validate-ephemeris-files.js` passes

### Issue: Smoke Tests Fail

**Symptoms:**
- Health check fails
- Connection timeout errors
- HTTP 500 errors

**Solutions:**
1. **Verify Service Started**
   - Check Render dashboard shows "Live" status
   - Wait for full startup (can take 2-3 minutes)

2. **Check Environment Variables**
   - Verify all required vars are set
   - Check for typos in variable names

3. **Test Individual Endpoints**
   ```bash
   # Test health directly
   curl https://your-app.onrender.com/api/health
   
   # Check specific error
   curl -v https://your-app.onrender.com/api/v1
   ```

### Issue: BTR Metrics Not Available

**Symptoms:**
- `/api/v1/rectification/metrics/latest` returns 404
- No metrics files generated

**Possible Causes & Solutions:**

1. **Metrics Not Generated Yet**
   - Solution: Run BTR analysis to generate metrics
   - Verify: `BTR_METRICS_ENABLED=true`

2. **Directory Not Writable**
   - Check Render has write permissions
   - Verify `BTR_METRICS_DIR` path is correct

3. **Metrics Disabled**
   - Check environment variable: `BTR_METRICS_ENABLED=true`
   - Restart service after changing env vars

### Issue: Chart Generation Fails

**Symptoms:**
- 500 error when generating charts
- "Swiss Ephemeris not found" error
- Incorrect planetary positions

**Solutions:**
1. **Verify Ephemeris Files**
   ```bash
   # Check files exist in deployment
   ls ephemeris/
   # Should show: seas_18.se1, semo_18.se1, sepl_18.se1
   ```

2. **Check Geocoding API**
   - Verify `GEOCODING_API_KEY` is set
   - Test key is valid and has quota

3. **Verify Time Zone Data**
   - Ensure `moment-timezone` is installed
   - Check timezone string is valid

### Issue: Frontend Cannot Connect

**Symptoms:**
- CORS errors in browser console
- Network request failures
- 404 on API calls

**Solutions:**
1. **Verify CORS Configuration**
   - Check `FRONTEND_URL` env var is set correctly
   - Verify frontend is using correct API URL

2. **Check Service URLs**
   ```bash
   # Backend should be accessible
   curl https://jjyotish-shastra-backend.onrender.com/api/health
   
   # Frontend should serve content
   curl https://jjyotish-shastra-frontend.onrender.com
   ```

3. **Verify Build Configuration**
   - Frontend `REACT_APP_API_URL` matches backend URL
   - Check `client/build` directory is generated

---

## Success Criteria (SC-7)

The deployment is considered successful when all SC-7 requirements are met:

### ✅ CI Test Gates

- [x] All unit tests pass (`npm run test`)
- [x] All integration tests pass (`npm run test:btr:all`)
- [x] BPHS validation passes (`npm run test:btr:bphs`)
- [x] Horizons accuracy validated (`npm run test:btr:accuracy`)
- [x] Golden case verified (`npm run test:btr:golden`)
- [x] Evidence generated (`npm run evidence:generate`)
- [x] Zero ESLint errors (`npm run lint`)

### ✅ Deployment Validation

- [x] Build completes successfully on Render
- [x] Service reaches "Live" status
- [x] All environment variables configured
- [x] Post-deployment smoke tests pass
- [x] Health endpoint returns 200 OK
- [x] Chart generation works
- [x] BTR metrics endpoints accessible

### ✅ Documentation

- [x] Deployment process documented (this file)
- [x] Rollback procedure defined
- [x] Monitoring configured
- [x] Troubleshooting guide complete

### ✅ Production Ready

- [x] No breaking changes to existing APIs
- [x] Zero-downtime deployment possible
- [x] Rollback procedure tested
- [x] Incident response plan defined

---

## Additional Resources

### Documentation
- **Implementation Plan**: `docs/BPHS-BTR/BPHS-BTR-implementation-plan.md`
- **Evidence Document**: `EVIDENCE.md`
- **Source References**: `SOURCES.md`
- **API Documentation**: `docs/api/`

### Scripts
- **Evidence Generator**: `scripts/generate-evidence.js`
- **Smoke Tests**: `scripts/post-deploy-smoke.js`
- **Ephemeris Validator**: `scripts/validate-ephemeris-files.js`

### Support Channels
- **GitHub Issues**: https://github.com/[your-repo]/jyotish-shastra/issues
- **Documentation**: See `docs/` directory
- **Render Support**: https://render.com/docs

---

## Maintenance Schedule

### Regular Tasks

**Weekly:**
- Review Render logs for errors
- Check uptime metrics
- Verify backup systems

**Monthly:**
- Review and update dependencies
- Check for security updates
- Update ephemeris files if needed
- Regenerate evidence with latest data

**Quarterly:**
- Full system audit
- Performance optimization review
- Documentation updates
- Dependency major version updates

---

## Deployment History

Record significant deployments here:

| Date | Version | Changes | Deployed By | Status |
|------|---------|---------|-------------|--------|
| 2025-11-06 | v1.0.0 | BTR accuracy enhancement (Phase 7) | System | ✅ Success |

---

**End of Deployment Guide**

For questions or issues, refer to troubleshooting section or create a GitHub issue.