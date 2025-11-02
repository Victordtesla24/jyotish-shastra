# Render Deployment Guide

## Complete Guide for Deploying Jyotish Shastra to Render

This guide covers deploying both the Node.js backend and React frontend to Render.com.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [CLI Installation & Authentication](#cli-installation--authentication)
3. [Service Configuration](#service-configuration)
4. [Environment Variables](#environment-variables)
5. [Deployment Steps](#deployment-steps)
6. [Post-Deployment](#post-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts
- **Render Account**: Sign up at [render.com](https://render.com)
- **GitHub Account**: Code repository must be on GitHub
- **OpenCage Account**: For geocoding API (get key from [opencagedata.com](https://opencagedata.com))

### Required Software
- **Node.js 18+**: Verified with `node --version`
- **Git**: Verified with `git --version`
- **Homebrew**: For macOS CLI installation

---

## CLI Installation & Authentication

### Step 1: Install Render CLI

**macOS/Linux:**
```bash
brew install render
```

**Verify Installation:**
```bash
render --version
# Should output: render version 2.5.0 (or similar)
```

### Step 2: Authenticate CLI

**Option A: Interactive Browser Authentication (Recommended)**
```bash
render login
```
This will:
1. Open your default browser
2. Prompt you to authorize the CLI
3. Store authentication token locally

**Option B: API Key Authentication (For CI/CD/Scripts)**
1. Go to [Render Account Settings > API Keys](https://dashboard.render.com/account/settings)
2. Click "New API Key"
3. Copy the API key (shown only once)
4. Set as environment variable:
   ```bash
   export RENDER_API_KEY=your_api_key_here
   ```

**Verify Authentication:**
```bash
render whoami
# Should output your Render account email
```

---

## Service Configuration

### Service 1: Backend (Web Service)

**Service Type:** Web Service  
**Purpose:** Node.js/Express API with Swiss Ephemeris

**Configuration:**
- **Root Directory:** `.` (project root)
- **Build Command:** `npm install && node scripts/validate-ephemeris-files.js`
- **Start Command:** `node src/index.js`
- **Node Version:** 18 or higher
- **Instance Type:** Free tier (spins down after 15 min inactivity)

**Note**: The `render.yaml` uses `validate-ephemeris-files.js` for build validation instead of `copy-wasm`. WASM files are handled automatically or via build process.

### Service 2: Frontend (Static Site)

**Service Type:** Static Site  
**Purpose:** React frontend build

**Configuration:**
- **Root Directory:** `client`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `build`
- **Environment:** Production

---

## Environment Variables

### Backend Web Service Variables

Set these in Render Dashboard under **Environment** tab:

```bash
# Application
NODE_ENV=production
PORT=3001

# Geocoding API
GEOCODING_API_KEY=your_opencage_api_key_here

# Frontend URL (update after frontend deployment)
FRONTEND_URL=https://your-frontend-service.onrender.com
```

### Frontend Static Site Variables

```bash
# Backend API URL (update after backend deployment)
REACT_APP_API_URL=https://your-backend-service.onrender.com/api

# Optional: Disable source maps for smaller build
GENERATE_SOURCEMAP=false
```

**Important:** Update `FRONTEND_URL` and `REACT_APP_API_URL` after deploying each service.

---

## Deployment Steps

### Method 1: Using Render Dashboard (Recommended for First Deployment)

#### Deploy Backend:

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure service:
   - **Name:** `jjyotish-shastra-backend` (or your choice)
   - **Root Directory:** Leave blank (uses root)
   - **Runtime:** Node
   - **Build Command:** `npm install && node scripts/validate-ephemeris-files.js`
   - **Start Command:** `node src/index.js`
5. Add environment variables (see above)
6. Select **Free** plan
7. Click **Create Web Service**

#### Deploy Frontend:

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Static Site**
3. Connect your GitHub repository
4. Configure service:
   - **Name:** `jjyotish-shastra-frontend` (or your choice)
   - **Root Directory:** `client`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build`
5. Add environment variables (see above)
6. Click **Create Static Site**

### Method 2: Using Render CLI

#### Deploy Backend:

```bash
render services create web-service \
  --name jjyotish-shastra-backend \
  --repo https://github.com/your-username/your-repo.git \
  --branch main \
  --root-dir . \
  --build-command "npm install && node scripts/validate-ephemeris-files.js" \
  --start-command "node src/index.js" \
  --env NODE_ENV=production \
  --env GEOCODING_API_KEY=your_opencage_key
```

#### Deploy Frontend:

```bash
render services create static-site \
  --name jjyotish-shastra-frontend \
  --repo https://github.com/your-username/your-repo.git \
  --branch main \
  --root-dir client \
  --build-command "npm install && npm run build" \
  --publish-dir build \
  --env REACT_APP_API_URL=https://your-backend-service.onrender.com/api
```

### Method 3: Using render.yaml (Infrastructure as Code)

The project includes a `render.yaml` file for Infrastructure as Code deployment:

**Backend Service Configuration** (from `render.yaml`):
```yaml
services:
  - type: web
    name: jjyotish-shastra-backend
    runtime: node
    plan: free
    buildCommand: npm install && node scripts/validate-ephemeris-files.js
    startCommand: node src/index.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: GEOCODING_API_KEY
        sync: false  # Will prompt for value during deployment
      - key: FRONTEND_URL
        sync: false  # Set after frontend deployment
```

**Frontend Service Configuration** (from `render.yaml`):
```yaml
  - type: web
    name: jjyotish-shastra-frontend
    runtime: static
    buildCommand: cd client && npm install && npm run build
    staticPublishPath: client/build
    envVars:
      - key: REACT_APP_API_URL
        value: https://jjyotish-shastra-backend.onrender.com
      - key: GENERATE_SOURCEMAP
        value: "false"
```

**Note**: Frontend service type in `render.yaml` is `web` with `runtime: static`, not `static-site` type. Verify this matches Render.com's current service type options.

---

## Build Directory Information

### Frontend Build Output:
- **Publish Directory:** `client/build`
- **Contains:**
  - `index.html`
  - `static/css/`
  - `static/js/`
  - `asset-manifest.json`
  - `manifest.json`

### Backend Requirements:
- **WASM Files:** Handled via build process or automatically (Swiss Ephemeris initialization)
- **Ephemeris Data:** Located in `ephemeris/` directory (seas_18.se1, semo_18.se1, sepl_18.se1)
- **Build Validation:** `validate-ephemeris-files.js` script validates ephemeris files during build

---

## Post-Deployment

### Step 1: Get Service URLs

After deployment, note the URLs:
- Backend: `https://jjyotish-shastra-backend.onrender.com`
- Frontend: `https://jjyotish-shastra-frontend.onrender.com`

### Step 2: Update Environment Variables

**Backend:**
- Update `FRONTEND_URL` to frontend URL

**Frontend:**
- Update `REACT_APP_API_URL` to `https://jjyotish-shastra-backend.onrender.com/api`

### Step 3: Redeploy Services

After updating environment variables, services will auto-redeploy.

### Step 4: Verify Deployment

**Test Backend Health:**
```bash
curl https://your-backend-service.onrender.com/api/v1/health
```

**Test Frontend:**
- Open frontend URL in browser
- Verify React app loads
- Test form submission

**Test Integration:**
- Submit birth data form
- Verify geocoding works
- Verify chart generation works

---

## Troubleshooting

### Issue: Backend returns 500 errors

**Solution:**
1. Check Render logs: Dashboard → Service → Logs
2. Verify `GEOCODING_API_KEY` is set correctly
3. Check Swiss Ephemeris WASM initialization in logs
4. Verify ephemeris data files are accessible

### Issue: Frontend can't connect to backend

**Solution:**
1. Verify `REACT_APP_API_URL` is set correctly
2. Check CORS configuration in backend
3. Ensure backend service is running (may be spinning up from sleep)
4. Check browser console for CORS errors

### Issue: Swiss Ephemeris initialization fails

**Solution:**
1. Verify `node scripts/validate-ephemeris-files.js` runs during build
2. Check build logs for ephemeris file validation
3. Verify ephemeris data files exist in `ephemeris/` directory
4. Ensure ephemeris files (seas_18.se1, semo_18.se1, sepl_18.se1) are committed to repository
5. Check Swiss Ephemeris initialization logs in service logs

### Issue: Free tier services sleeping

**Solution:**
- First request after inactivity takes ~30 seconds to wake
- Consider upgrading to paid tier for always-on services
- Implement "keep-alive" ping endpoint for free tier

### Issue: Build fails

**Common Causes:**
1. **Missing dependencies:** Check `package.json` files
2. **Node version mismatch:** Verify Node 18+ requirement
3. **Memory limits:** Free tier has 512MB RAM limit
4. **Build timeout:** Large builds may exceed timeout

**Solutions:**
- Check build logs in Render dashboard
- Test build locally first: `cd client && npm run build`
- Verify all dependencies are in `package.json`

---

## CLI Commands Reference

### Service Management
```bash
# List all services
render services list

# View service details
render services get <service-name>

# View service logs
render logs <service-name>

# View service logs (follow mode)
render logs <service-name> --follow

# Deploy service
render services deploy <service-name>
```

### Environment Variables
```bash
# Set environment variable
render env set KEY=value --service <service-name>

# Get environment variable
render env get KEY --service <service-name>

# List all environment variables
render env list --service <service-name>
```

### Other Useful Commands
```bash
# Check authentication
render whoami

# View account info
render account

# Get help
render help
```

---

## Best Practices

### 1. Environment Variable Management
- Never commit API keys to Git
- Use Render Dashboard or CLI for sensitive variables
- Use different values for production/preview environments

### 2. Service Configuration
- Keep build commands simple and reliable
- Test builds locally before deploying
- Monitor build times and optimize if needed

### 3. Monitoring
- Set up health check endpoints
- Monitor service logs regularly
- Set up alerts for deployment failures

### 4. Performance
- Understand free tier limitations (sleep after 15 min)
- Consider paid tier for production workloads
- Optimize bundle sizes for faster deploys

---

## Next Steps

1. ✅ Install Render CLI
2. ✅ Authenticate CLI
3. ⏭ Deploy backend service
4. ⏭ Deploy frontend service
5. ⏭ Update environment variables
6. ⏭ Verify end-to-end functionality
7. ⏭ Set up custom domain (optional)
8. ⏭ Configure monitoring and alerts

---

**Last Updated:** January 2025  
**Render CLI Version:** 2.5.0

