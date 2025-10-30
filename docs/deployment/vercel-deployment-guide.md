# Vercel Deployment Guide

## Comprehensive Step-by-Step Guide to Deploy Jyotish Shastra to Vercel

This guide provides detailed instructions for deploying the Jyotish Shastra application to Vercel using the automated deployment script and manual methods.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Step-by-Step Deployment Process](#step-by-step-deployment-process)
4. [Post-Deployment Verification](#post-deployment-verification)
5. [Troubleshooting](#troubleshooting)
6. [Manual Deployment Options](#manual-deployment-options)
7. [Best Practices](#best-practices)

---

## Prerequisites

Before deploying to Vercel, ensure you have the following:

### 1. Required Software

- **Node.js 18+**: Verify installation with `node --version`
- **npm**: Comes with Node.js, verify with `npm --version`
- **Git**: Verify with `git --version`
- **Vercel CLI**: Install globally with `npm i -g vercel`

### 2. Accounts and Setup

- **GitHub Account**: Required for code repository
- **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
- **Git Repository**: Code must be pushed to GitHub

### 3. Vercel Project Setup

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new project or use existing project
3. Note your **Project ID** from project settings
4. Get your **Vercel Token** from [Account Settings > Tokens](https://vercel.com/account/tokens)
5. Get your **User ID** from account settings

---

## Pre-Deployment Checklist

Before running the deployment script, complete the following checklist:

### Environment Variables Configuration

Create or verify `.env` file in project root with the following variables:

```bash
# Vercel Configuration
VERCEL_PROJECT_ID=your_project_id_here
VERCEL_USER_ID=your_user_id_here
VERCEL_TOKEN=your_vercel_token_here
VERCEL_PRODUCTION_LINK=https://your-production-link.vercel.app

# Application Configuration
NODE_ENV=production
PORT=3001

# API Configuration
GEOCODING_API_KEY=your_opencage_api_key
FRONTEND_URL=https://your-production-link.vercel.app

# Database (if applicable)
MONGODB_URI=your_mongodb_connection_string
```

### Project Structure Verification

Ensure the following files and directories exist:

```
project-root/
├── package.json                    # Root package.json
├── client/
│   ├── package.json                # Client package.json
│   └── build/                      # Will be created during build
├── src/
│   └── index.js                    # Express server entry point
├── api/
│   └── [...path].js                # Vercel serverless handler
├── vercel.json                     # Vercel configuration
└── .env                            # Environment variables
```

### Required Files Checklist

- [ ] `package.json` exists in root
- [ ] `client/package.json` exists
- [ ] `vercel.json` exists and is configured
- [ ] `api/[...path].js` exists (serverless handler)
- [ ] `.env` file contains all required variables
- [ ] Project is linked to Git repository
- [ ] Code is committed to Git

### Build Verification

Test local build before deployment:

```bash
# Install dependencies
npm install
cd client && npm install && cd ..

# Build client
cd client && npm run build && cd ..

# Verify build output
ls -la client/build/index.html
```

---

## Step-by-Step Deployment Process

### Automated Deployment (Recommended)

The project includes an automated deployment script that handles all deployment steps.

#### Step 1: Run Deployment Script

```bash
npm run deploy:vercel
```

Or directly:

```bash
node scripts/deploy-vercel.js
```

#### What the Script Does

The deployment script automatically executes these steps:

1. **Validates Requirements**
   - Checks Vercel CLI installation
   - Verifies `.env` file exists
   - Validates required environment variables
   - Checks project structure
   - Verifies `vercel.json` exists

2. **Validates Git Status**
   - Confirms Git repository is initialized
   - Checks current branch (warns if not `main`)
   - Prompts for uncommitted changes
   - Verifies remote origin configuration

3. **Builds Application**
   - Installs root dependencies
   - Installs client dependencies
   - Builds React client application
   - Verifies build output

4. **Deploys to Vercel**
   - Links project to Vercel (if not linked)
   - Deploys to production environment
   - Extracts deployment URL
   - Waits for deployment to be ready

5. **Verifies Deployment**
   - Checks deployment status
   - Tests health endpoint (`/api/v1/health`)
   - Tests root endpoint
   - Tests API base endpoint

6. **Pushes to GitHub**
   - Stages deployment-related files
   - Commits changes (if any)
   - Pushes to `main` branch

---

### Manual Deployment Steps

If you prefer manual deployment, follow these steps:

#### Step 1: Environment Setup

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Verify Installation**:
   ```bash
   vercel --version
   ```

3. **Login to Vercel**:
   ```bash
   vercel login
   ```

#### Step 2: Link Project

```bash
vercel link --project=YOUR_PROJECT_ID
```

When prompted:
- Select existing project
- Confirm project settings

#### Step 3: Build Application

```bash
# Install dependencies
npm install
cd client && npm install && cd ..

# Build client
cd client && npm run build && cd ..
```

#### Step 4: Deploy to Production

```bash
vercel deploy --prod --token=YOUR_VERCEL_TOKEN
```

#### Step 5: Verify Deployment

1. **Check Deployment Status**:
   ```bash
   vercel inspect YOUR_DEPLOYMENT_URL
   ```

2. **Test Health Endpoint**:
   ```bash
   curl https://YOUR_DEPLOYMENT_URL/api/v1/health
   ```

3. **Test Root Endpoint**:
   ```bash
   curl https://YOUR_DEPLOYMENT_URL
   ```

---

## Post-Deployment Verification

After deployment completes, verify the following:

### 1. Health Check

```bash
curl https://YOUR_PRODUCTION_URL/api/v1/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "uptime": 123.456,
  "environment": "production",
  "platform": "serverless",
  "vercel": {
    "env": "production",
    "url": "your-app.vercel.app",
    "deployment": "deployment-id"
  }
}
```

### 2. API Endpoints

Test critical API endpoints:

```bash
# API Base
curl https://YOUR_PRODUCTION_URL/api

# Chart Generation (POST)
curl -X POST https://YOUR_PRODUCTION_URL/api/v1/chart/generate \
  -H "Content-Type: application/json" \
  -d '{"date":"1990-01-01","time":"12:00","latitude":28.6139,"longitude":77.2090,"timezone":"Asia/Kolkata"}'

# Comprehensive Analysis (POST)
curl -X POST https://YOUR_PRODUCTION_URL/api/v1/analysis/comprehensive \
  -H "Content-Type: application/json" \
  -d '{...}'
```

### 3. Frontend Accessibility

1. Open production URL in browser
2. Verify React app loads correctly
3. Test form submission
4. Verify API calls work from frontend

### 4. Environment Variables

Ensure all environment variables are set in Vercel Dashboard:

1. Go to Project Settings > Environment Variables
2. Verify all variables from `.env` are present
3. Check that production environment is selected

---

## Troubleshooting

### Common Errors and Solutions

#### Error: Vercel CLI not found

**Solution**:
```bash
npm i -g vercel
```

Verify installation:
```bash
vercel --version
```

#### Error: Environment variables not set

**Solution**:
1. Verify `.env` file exists in project root
2. Check all required variables are present:
   - `VERCEL_PROJECT_ID`
   - `VERCEL_USER_ID`
   - `VERCEL_TOKEN`
   - `VERCEL_PRODUCTION_LINK`
3. Ensure no typos in variable names

#### Error: Build failed

**Causes and Solutions**:

- **Missing dependencies**: Run `npm install` in root and `client/` directories
- **Client build errors**: Check `client/package.json` and fix dependency issues
- **Syntax errors**: Review error messages and fix code issues
- **Memory issues**: Increase Node.js memory: `NODE_OPTIONS=--max-old-space-size=4096 npm run build`

#### Error: Deployment verification failed

**Solutions**:

1. **Wait longer**: Deployments may take time to become fully available
   ```bash
   # Wait 30 seconds and retry
   sleep 30
   curl https://YOUR_URL/api/v1/health
   ```

2. **Check Vercel Dashboard**: Verify deployment status in dashboard

3. **Check Deployment Logs**:
   ```bash
   vercel logs YOUR_DEPLOYMENT_URL
   ```

4. **Verify Routes**: Check `vercel.json` routing configuration

#### Error: Failed to extract deployment URL

**Solution**:
1. Check Vercel CLI output manually
2. Get URL from Vercel Dashboard
3. Verify `vercel.json` configuration is correct

#### Error: GitHub push failed

**Solutions**:

- **Authentication issues**: Check Git credentials
  ```bash
  git config --global user.name "Your Name"
  git config --global user.email "your.email@example.com"
  ```

- **Remote not configured**: Add remote origin
  ```bash
  git remote add origin https://github.com/username/repo.git
  ```

- **Permission issues**: Verify GitHub access tokens or SSH keys

#### Error: API endpoints not responding

**Causes and Solutions**:

- **Incorrect routing**: Verify `vercel.json` routes match API structure
- **Serverless function errors**: Check function logs in Vercel dashboard
- **CORS issues**: Verify CORS configuration in `src/index.js`
- **Environment variables**: Ensure API keys are set in Vercel dashboard

### Debugging Tips

1. **Enable Verbose Logging**:
   Add `--debug` flag to Vercel commands:
   ```bash
   vercel deploy --prod --debug
   ```

2. **Check Function Logs**:
   ```bash
   vercel logs YOUR_DEPLOYMENT_URL --follow
   ```

3. **Inspect Deployment**:
   ```bash
   vercel inspect YOUR_DEPLOYMENT_URL
   ```

4. **Test Locally with Vercel**:
   ```bash
   vercel dev
   ```

---

## Manual Deployment Options

### Option 1: Using Vercel CLI Directly

```bash
# One-time setup
vercel login
vercel link

# Deploy
vercel deploy --prod
```

### Option 2: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Import your Git repository
3. Configure build settings:
   - **Framework Preset**: Other
   - **Build Command**: `cd client && npm install && npm run build`
   - **Output Directory**: `client/build`
   - **Install Command**: `npm install && cd client && npm install`
4. Add environment variables
5. Deploy

### Option 3: CI/CD Integration

#### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          npm install
          cd client && npm install && cd ..
      
      - name: Build
        run: cd client && npm run build && cd ..
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Best Practices

### Environment Variable Management

1. **Never Commit Secrets**: Ensure `.env` is in `.gitignore`
2. **Use Vercel Dashboard**: Set sensitive variables in Vercel dashboard
3. **Separate Environments**: Use different variables for production, preview, and development
4. **Rotate Keys Regularly**: Update API keys and tokens periodically

### Deployment Workflow

1. **Test Locally First**: Always test builds locally before deployment
2. **Use Preview Deployments**: Test on preview before promoting to production
3. **Monitor Deployments**: Watch deployment logs for errors
4. **Verify After Deployment**: Always test critical endpoints after deployment

### Rollback Procedures

If deployment fails or issues are discovered:

1. **Use Vercel Dashboard**:
   - Go to Deployments
   - Select previous successful deployment
   - Click "Promote to Production"

2. **Using CLI**:
   ```bash
   vercel promote DEPLOYMENT_URL
   ```

3. **Revert Code**:
   ```bash
   git revert HEAD
   git push origin main
   ```

### Monitoring and Logging

1. **View Real-time Logs**:
   ```bash
   vercel logs --follow YOUR_DEPLOYMENT_URL
   ```

2. **Check Function Logs**: Use Vercel dashboard for detailed function execution logs

3. **Set Up Alerts**: Configure alerts in Vercel dashboard for deployment failures

4. **Monitor Performance**: Use Vercel Analytics to track performance metrics

### Security Best Practices

1. **API Keys**: Store all API keys in Vercel environment variables
2. **CORS Configuration**: Limit CORS origins to production domains
3. **Rate Limiting**: Implement rate limiting for API endpoints
4. **HTTPS Only**: Ensure all connections use HTTPS (Vercel provides this by default)

### Performance Optimization

1. **Build Optimization**: Minimize build output size
2. **Serverless Functions**: Optimize function execution time
3. **Caching**: Configure appropriate cache headers
4. **CDN**: Leverage Vercel's CDN for static assets

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Vercel Deployment Guide](https://vercel.com/docs/deployments/overview)
- [Serverless Functions Guide](https://vercel.com/docs/functions)

---

## Support

For deployment issues:

1. Check [Vercel Status Page](https://www.vercel-status.com/)
2. Review deployment logs in Vercel Dashboard
3. Consult [Vercel Community Forum](https://github.com/vercel/vercel/discussions)
4. Review project documentation in `/docs` directory

---

**Last Updated**: January 2025

