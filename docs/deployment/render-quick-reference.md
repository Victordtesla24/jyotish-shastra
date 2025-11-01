# Render Deployment Quick Reference

## Answers to Your Questions

### 1. Which Render Service to Select?

**Backend (Node.js/Express API):**
- **Service Type:** `Web Service`
- **Why:** Dynamic backend with Swiss Ephemeris WASM requires full Node.js runtime
- **Description:** "Dynamic web app. Ideal for full-stack apps, API servers, and mobile backends."

**Frontend (React Build):**
- **Service Type:** `Static Site`
- **Why:** React builds to static HTML/CSS/JS files
- **Description:** "Static content served over a global CDN. Ideal for frontend, blogs, and content sites."

---

### 2. What's Required for Remote CLI Deployment?

#### Required: Render API Key or Token

**How to Get API Key:**

1. **Via Dashboard:**
   - Go to: https://dashboard.render.com/account/settings
   - Navigate to **"API Keys"** section
   - Click **"New API Key"** or **"Create API Key"**
   - Copy the key immediately (shown only once!)

2. **Authentication Methods:**

   **Option A: Interactive Login (Recommended)**
   ```bash
   render login
   ```
   - Opens browser for authentication
   - Automatically stores token locally
   - No manual key entry needed

   **Option B: API Key Environment Variable (For CI/CD)**
   ```bash
   export RENDER_API_KEY=your_api_key_here
   render whoami  # Verify authentication
   ```

3. **Verify Authentication:**
   ```bash
   render whoami
   # Output: your-email@example.com
   ```

#### Additional Requirements:
- ✅ GitHub repository connected to Render
- ✅ Render CLI installed: `brew install render`
- ✅ OpenCage API key for geocoding service

---

### 3. Build Directory Path

**For Static Site (Frontend):**
- **Publish Directory:** `client/build`
- **Relative Path:** `./client/build` or `client/build`
- **Contains:**
  - `index.html`
  - `static/css/`
  - `static/js/`
  - `asset-manifest.json`

**Verification:**
```bash
# Build locally to verify
cd client && npm run build

# Check output directory
ls -la client/build/
# Should see: index.html, static/, manifest.json
```

**Other Common Build Directories:**
- `./build` (if building from root)
- `./dist` (some frameworks)
- `./client/build` ✅ **YOUR PROJECT USES THIS**

---

## Quick Deployment Commands

### Authenticate (First Time Only)
```bash
render login
```

### Deploy Backend
```bash
render services create web-service \
  --name jjyotish-shastra-backend \
  --repo https://github.com/YOUR_USERNAME/YOUR_REPO.git \
  --branch main \
  --build-command "npm install && npm run copy-wasm" \
  --start-command "node src/index.js"
```

### Deploy Frontend
```bash
render services create static-site \
  --name jjyotish-shastra-frontend \
  --repo https://github.com/YOUR_USERNAME/YOUR_REPO.git \
  --branch main \
  --root-dir client \
  --build-command "npm install && npm run build" \
  --publish-dir build
```

---

## Environment Variables

### Backend Web Service:
- `NODE_ENV=production`
- `GEOCODING_API_KEY=<your_opencage_key>`
- `FRONTEND_URL=<frontend_url_after_deployment>`

### Frontend Static Site:
- `REACT_APP_API_URL=<backend_url>/api`

---

## Summary Table

| Question | Answer |
|---------|--------|
| **Backend Service Type** | Web Service |
| **Frontend Service Type** | Static Site |
| **Authentication Method** | `render login` OR `RENDER_API_KEY` env var |
| **API Key Location** | Dashboard → Account Settings → API Keys |
| **Frontend Build Directory** | `client/build` |
| **Backend Start Command** | `node src/index.js` |
| **Frontend Build Command** | `npm install && npm run build` |

---

**See full guide:** `docs/deployment/render-deployment-guide.md`

