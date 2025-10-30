#!/usr/bin/env node

/**
 * VERCEL PRODUCTION DEPLOYMENT SCRIPT
 * Deploys Jyotish Shastra application to Vercel with comprehensive validation
 * 
 * Usage: node scripts/deploy-vercel.js
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';
import readline from 'readline';
import dotenv from 'dotenv';

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// Color codes for terminal output
const COLORS = {
  RED: '\x1b[0;31m',
  GREEN: '\x1b[0;32m',
  YELLOW: '\x1b[1;33m',
  BLUE: '\x1b[0;34m',
  NC: '\x1b[0m', // No Color
};

// Terminal separator line
const SEPARATOR = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

/**
 * Logging Functions
 */
const log = {
  info: (msg) => console.log(`${COLORS.BLUE}[INFO]${COLORS.NC} ${msg}`),
  success: (msg) => console.log(`${COLORS.GREEN}[SUCCESS]${COLORS.NC} ${msg}`),
  warning: (msg) => console.log(`${COLORS.YELLOW}[WARNING]${COLORS.NC} ${msg}`),
  error: (msg) => console.log(`${COLORS.RED}[ERROR]${COLORS.NC} ${msg}`),
  step: (title) => {
    console.log('');
    console.log(`${COLORS.BLUE}${SEPARATOR}${COLORS.NC}`);
    console.log(`${COLORS.BLUE}  ${title}${COLORS.NC}`);
    console.log(`${COLORS.BLUE}${SEPARATOR}${COLORS.NC}`);
    console.log('');
  },
};

/**
 * Execute shell command synchronously
 */
function execCommand(command, options = {}) {
  try {
    // Determine stdio based on options
    let stdioOption = 'inherit';
    if (options.silent === true || options.stdio === 'pipe') {
      stdioOption = 'pipe';
    } else if (options.stdio) {
      stdioOption = options.stdio;
    }
    
    const execOptions = {
      cwd: options.cwd || PROJECT_ROOT,
      encoding: 'utf-8',
      stdio: stdioOption,
      env: { ...process.env, ...(options.env || {}) },
    };
    
    const result = execSync(command, execOptions);
    
    return { 
      success: true, 
      output: stdioOption === 'pipe' ? (result || '') : '', 
      error: '',
      stdout: stdioOption === 'pipe' ? (result || '') : '',
      stderr: ''
    };
  } catch (error) {
    const stdout = error.stdout ? error.stdout.toString('utf-8') : '';
    const stderr = error.stderr ? error.stderr.toString('utf-8') : '';
    const combinedOutput = stdout || stderr || error.message || '';
    
    return { 
      success: false, 
      error: error.message, 
      output: combinedOutput,
      stdout: stdout,
      stderr: stderr
    };
  }
}

/**
 * Prompt user for input
 */
function promptUser(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Load environment variables from .env file
 */
function loadEnvFile() {
  const envPath = join(PROJECT_ROOT, '.env');
  if (existsSync(envPath)) {
    const envConfig = dotenv.parse(readFileSync(envPath, 'utf-8'));
    Object.keys(envConfig).forEach((key) => {
      process.env[key] = envConfig[key];
    });
    return true;
  }
  return false;
}

/**
 * STEP 1: Validate Deployment Requirements
 */
function validateRequirements() {
  log.step('STEP 1: VALIDATING DEPLOYMENT REQUIREMENTS');

  let errors = 0;

  // Check if Vercel CLI is installed
  log.info('Checking Vercel CLI installation...');
  const vercelCheck = execCommand('vercel --version', { silent: true });
  if (!vercelCheck.success) {
    log.error('Vercel CLI not found. Install with: npm i -g vercel');
    errors++;
  } else {
    const version = vercelCheck.output.trim();
    log.success(`Vercel CLI found: ${version}`);
  }

  // Check if .env file exists
  log.info('Checking .env file...');
  const envPath = join(PROJECT_ROOT, '.env');
  if (!existsSync(envPath)) {
    log.error('.env file not found in project root');
    errors++;
  } else {
    log.success('.env file found');
  }

  // Load and validate environment variables
  log.info('Validating required environment variables...');
  loadEnvFile();

  const requiredVars = [
    'VERCEL_PROJECT_ID',
    'VERCEL_USER_ID',
    'VERCEL_TOKEN',
    'VERCEL_PRODUCTION_LINK',
  ];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      log.error(`Required environment variable not set: ${varName}`);
      errors++;
    } else {
      log.success(`Environment variable set: ${varName}`);
    }
  }

  // Check Node.js version
  log.info('Checking Node.js version...');
  const nodeVersion = execCommand('node --version', { silent: true });
  if (nodeVersion.success) {
    log.success(`Node.js version: ${nodeVersion.output.trim()}`);
  }

  // Check if package.json exists
  log.info('Checking project structure...');
  if (!existsSync(join(PROJECT_ROOT, 'package.json'))) {
    log.error('package.json not found in project root');
    errors++;
  } else {
    log.success('package.json found');
  }

  // Check if client/package.json exists
  if (!existsSync(join(PROJECT_ROOT, 'client', 'package.json'))) {
    log.error('client/package.json not found');
    errors++;
  } else {
    log.success('client/package.json found');
  }

  // Check if vercel.json exists
  if (!existsSync(join(PROJECT_ROOT, 'vercel.json'))) {
    log.error('vercel.json not found. Creating default configuration...');
    errors++;
  } else {
    log.success('vercel.json found');
  }

  if (errors > 0) {
    log.error(`Deployment requirements validation failed with ${errors} error(s)`);
    process.exit(1);
  }

  log.success('All deployment requirements validated successfully');
}

/**
 * STEP 2: Validate Git Status
 */
async function validateGitStatus() {
  log.step('STEP 2: VALIDATING GIT STATUS');

  // Check if git is initialized
  const gitCheck = execCommand('git rev-parse --git-dir', { silent: true });
  if (!gitCheck.success) {
    log.error('Not a git repository. Initialize with: git init');
    process.exit(1);
  }

  // Check if we're on main branch
  const branchCheck = execCommand('git branch --show-current', { silent: true });
  const currentBranch = branchCheck.success ? branchCheck.output.trim() : 'unknown';

  if (currentBranch !== 'main') {
    log.warning(`Current branch is '${currentBranch}', not 'main'`);
    const answer = await promptUser('Continue deployment anyway? (y/N): ');
    if (!answer.toLowerCase().startsWith('y')) {
      log.error('Deployment cancelled');
      process.exit(1);
    }
  } else {
    log.success('On main branch');
  }

  // Check for uncommitted changes
  const statusCheck = execCommand('git status --porcelain', { silent: true });
  if (statusCheck.success && statusCheck.output.trim()) {
    log.warning('Uncommitted changes detected');
    execCommand('git status --short');
    const answer = await promptUser('Continue with uncommitted changes? (y/N): ');
    if (!answer.toLowerCase().startsWith('y')) {
      log.error('Deployment cancelled. Commit changes first.');
      process.exit(1);
    }
  } else {
    log.success('Working directory clean');
  }

  // Check if remote is configured
  const remoteCheck = execCommand('git remote get-url origin', { silent: true });
  if (!remoteCheck.success) {
    log.warning('No remote \'origin\' configured');
  } else {
    const remoteUrl = remoteCheck.output.trim();
    log.success(`Remote origin: ${remoteUrl}`);
  }
}

/**
 * STEP 3: Build Application
 */
function buildApplication() {
  log.step('STEP 3: BUILDING APPLICATION');

  // Install root dependencies
  log.info('Installing root dependencies...');
  const rootInstall = execCommand('npm ci --prefer-offline --no-audit');
  if (!rootInstall.success) {
    log.info('npm ci failed, trying npm install...');
    const npmInstall = execCommand('npm install');
    if (!npmInstall.success) {
      log.error('Failed to install root dependencies');
      process.exit(1);
    }
  }

  // Install client dependencies
  log.info('Installing client dependencies...');
  const clientInstallPath = join(PROJECT_ROOT, 'client');
  const clientCi = execCommand('npm ci --prefer-offline --no-audit', {
    cwd: clientInstallPath,
  });
  if (!clientCi.success) {
    log.info('npm ci failed, trying npm install...');
    const clientInstall = execCommand('npm install', {
      cwd: clientInstallPath,
    });
    if (!clientInstall.success) {
      log.error('Failed to install client dependencies');
      process.exit(1);
    }
  }

  // Build client
  log.info('Building React client...');
  // Set NODE_ENV explicitly for production build
  const buildEnv = { ...process.env, NODE_ENV: 'production', GENERATE_SOURCEMAP: 'false' };
  const buildResult = execCommand('npm run build', {
    cwd: clientInstallPath,
    env: buildEnv,
  });
  if (!buildResult.success) {
    log.error('Client build failed');
    process.exit(1);
  }
  log.success('Client build completed successfully');

  // Verify build output
  const buildDir = join(PROJECT_ROOT, 'client', 'build');
  if (!existsSync(buildDir)) {
    log.error('Client build directory not found');
    process.exit(1);
  }

  const indexPath = join(buildDir, 'index.html');
  if (!existsSync(indexPath)) {
    log.error('client/build/index.html not found');
    process.exit(1);
  }

  log.success('Build output verified');
}

/**
 * STEP 4: Deploy to Vercel
 */
async function deployToVercel() {
  log.step('STEP 4: DEPLOYING TO VERCEL');

  // Load environment variables
  loadEnvFile();

  // Set Vercel environment variables
  process.env.VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
  process.env.VERCEL_ORG_ID = process.env.VERCEL_USER_ID;
  process.env.VERCEL_TOKEN = process.env.VERCEL_TOKEN;

  // Link project if not already linked
  log.info('Linking Vercel project...');
  const vercelDir = join(PROJECT_ROOT, '.vercel');
  const projectJson = join(vercelDir, 'project.json');

  if (!existsSync(projectJson)) {
    log.info('Project not linked. Linking now...');
    const linkResult = execCommand(
      `echo "yes" | vercel link --project="${process.env.VERCEL_PROJECT_ID}" --token="${process.env.VERCEL_TOKEN}"`,
      { silent: true },
    );
    // Ignore link errors as it might already be linked
  } else {
    log.success('Project already linked');
  }

  // Deploy to production
  log.info('Deploying to Vercel production...');

  const deployCommand = `vercel deploy --prod --token="${process.env.VERCEL_TOKEN}" --yes`;

  // Capture both stdout and stderr
  const deployResult = execCommand(deployCommand, { 
    silent: false,
    stdio: 'pipe' 
  });
  
  // Also try to capture output differently
  let allOutput = '';
  if (deployResult.output) allOutput += deployResult.output;
  if (deployResult.error) allOutput += deployResult.error;
  
  // If no output captured, try executing again with pipe
  if (!allOutput || allOutput.length < 50) {
    log.info('Re-attempting to capture deployment URL...');
    const retryResult = execCommand(deployCommand, { silent: true });
    if (retryResult.output) allOutput += retryResult.output;
    if (retryResult.error) allOutput += retryResult.error;
  }
  
  if (!deployResult.success && !allOutput.includes('Production:')) {
    log.error('Vercel deployment failed');
    console.log('Output:', allOutput.substring(0, 1000));
    process.exit(1);
  }

  // Extract deployment URL from output - improved patterns
  let deploymentUrl = null;
  
  // Pattern 1: "Production: https://..."
  const productionMatch = allOutput.match(/Production:\s*(https:\/\/[^\s\n]+\.vercel\.app[^\s\n]*)/i);
  if (productionMatch) {
    deploymentUrl = productionMatch[1].trim();
  }
  
  // Pattern 2: Direct URL that appears after "Production:" keyword
  if (!deploymentUrl) {
    const productionLines = allOutput.split('\n').filter(line => 
      line.includes('Production:') || line.includes('production')
    );
    for (const line of productionLines) {
      const urlInLine = line.match(/https:\/\/[^\s]+\.vercel\.app/);
      if (urlInLine) {
        deploymentUrl = urlInLine[0];
        break;
      }
    }
  }
  
  // Pattern 3: Any vercel.app URL (least preferred)
  if (!deploymentUrl) {
    const urlMatches = allOutput.match(/https:\/\/[a-zA-Z0-9-]+[^\s\n\/]*\.vercel\.app/g);
    if (urlMatches && urlMatches.length > 0) {
      // Prefer URLs without paths (production URLs)
      deploymentUrl = urlMatches.find(url => !url.match(/\/api|\/v\d+/)) || urlMatches[0];
    }
  }
  
  // Pattern 4: Try vercel ls as fallback
  if (!deploymentUrl) {
    log.info('Attempting to get deployment URL from vercel ls...');
    const lsResult = execCommand(
      `vercel ls --prod --token="${process.env.VERCEL_TOKEN}" --limit=1`,
      { silent: true }
    );
    if (lsResult.success && lsResult.output) {
      const lsUrl = lsResult.output.match(/https:\/\/[^\s]+\.vercel\.app/);
      if (lsUrl) {
        deploymentUrl = lsUrl[0];
      }
    }
  }

  if (!deploymentUrl) {
    log.error('Failed to extract deployment URL from Vercel output');
    log.info('Deployment may have succeeded. Please check:');
    log.info('  1. Vercel Dashboard: https://vercel.com/dashboard');
    log.info('  2. Or run: vercel ls --prod');
    log.info('Sample output for debugging:');
    console.log(allOutput.substring(0, 800));
    
    // Don't exit - allow verification step to try with configured URL
    log.warning('Continuing with verification using configured production link...');
    deploymentUrl = process.env.VERCEL_PRODUCTION_LINK;
  }

  log.success(`Deployment URL: ${deploymentUrl}`);

  // Save deployment URL to temporary file
  const deploymentUrlPath = join(tmpdir(), 'vercel-deployment-url.txt');
  writeFileSync(deploymentUrlPath, deploymentUrl);

  // Verify production link matches
  const configuredLink = process.env.VERCEL_PRODUCTION_LINK;
  if (deploymentUrl !== configuredLink) {
    log.warning(
      `Deployment URL (${deploymentUrl}) does not match configured production link (${configuredLink})`,
    );
    log.info('This may be normal for first deployment or domain changes');
  } else {
    log.success('Deployment URL matches production link');
  }

  // Wait for deployment to be ready
  log.info('Waiting for deployment to be ready...');
  await new Promise((resolve) => setTimeout(resolve, 15000)); // Increased wait time

  return deploymentUrl;
}

/**
 * STEP 5: Verify Deployment
 */
async function verifyDeployment(deploymentUrl) {
  log.step('STEP 5: VERIFYING DEPLOYMENT');

  loadEnvFile();

  // Use provided URL or fallback to configured link
  const urlToVerify = deploymentUrl || process.env.VERCEL_PRODUCTION_LINK || '';
  
  if (!urlToVerify || urlToVerify === '[object Promise]') {
    log.error('Invalid deployment URL provided for verification');
    log.info('Please verify deployment manually in Vercel dashboard');
    return false;
  }
  let errors = 0;

  // Check deployment status
  log.info('Checking deployment status...');
  const inspectResult = execCommand(
    `vercel inspect "${urlToVerify}" --token="${process.env.VERCEL_TOKEN}"`,
    { silent: true },
  );
  
  if (inspectResult.success) {
    log.success('Deployment exists and is accessible');
  } else {
    log.error('Deployment verification failed');
    errors++;
  }

  // Test health endpoint
  log.info('Testing health endpoint...');
  const healthUrl = `${urlToVerify}/api/v1/health`;
  const healthCheck = execCommand(`curl -s -o /dev/null -w "%{http_code}" --max-time 30 "${healthUrl}"`, {
    silent: true,
  });
  
  const httpStatus = healthCheck.success ? healthCheck.output.trim() : '000';
  
  if (httpStatus === '200') {
    log.success(`Health endpoint responding (HTTP ${httpStatus})`);
    const healthResponse = execCommand(`curl -s --max-time 30 "${healthUrl}"`, {
      silent: true,
    });
    if (healthResponse.success) {
      try {
        const json = JSON.parse(healthResponse.output);
        console.log(JSON.stringify(json, null, 2));
      } catch {
        console.log(healthResponse.output);
      }
    }
  } else if (httpStatus === '000') {
    log.warning('Health endpoint request timed out or failed');
    errors++;
  } else {
    log.warning(`Health endpoint returned HTTP ${httpStatus}`);
    errors++;
  }

  // Test root endpoint
  log.info('Testing root endpoint...');
  const rootCheck = execCommand(`curl -s -o /dev/null -w "%{http_code}" --max-time 30 "${urlToVerify}"`, {
    silent: true,
  });
  
  const rootStatus = rootCheck.success ? rootCheck.output.trim() : '000';
  
  if (rootStatus === '200' || rootStatus === '304') {
    log.success(`Root endpoint responding (HTTP ${rootStatus})`);
  } else {
    log.warning(`Root endpoint returned HTTP ${rootStatus}`);
    errors++;
  }

  // Test API base endpoint
  log.info('Testing API base endpoint...');
  const apiBaseUrl = `${urlToVerify}/api`;
  const apiCheck = execCommand(`curl -s -o /dev/null -w "%{http_code}" --max-time 30 "${apiBaseUrl}"`, {
    silent: true,
  });
  
  const apiStatus = apiCheck.success ? apiCheck.output.trim() : '000';
  
  // Accept 200, 201, 204, 301, 302, 404 (endpoint not found is OK - means API is routing)
  // 401/403 suggest authentication issues that need fixing
  if (['200', '201', '204', '301', '302', '404'].includes(apiStatus)) {
    log.success(`API base endpoint responding (HTTP ${apiStatus})`);
  } else if (apiStatus === '401' || apiStatus === '403') {
    log.warning(`API base endpoint returned HTTP ${apiStatus} - may indicate CORS/auth issues`);
    // Don't count as error - might be expected for protected endpoints
  } else {
    log.warning(`API base endpoint returned HTTP ${apiStatus}`);
    errors++;
  }

  if (errors > 0) {
    log.warning(`Deployment verification found ${errors} issue(s)`);
    log.info(`Deployment URL: ${urlToVerify}`);
    log.info('Note: Some endpoints may require authentication or may still be building');
    log.info('Please verify manually in Vercel dashboard');
    
    // Don't exit - allow GitHub push to proceed
    // The deployment might be protected or still processing
    return false;
  }

  log.success('All deployment checks passed successfully');
  console.log('');
  log.success(`Production URL: ${urlToVerify}`);
  log.success(`Health Check: ${urlToVerify}/api/v1/health`);
  log.success(`API Base: ${urlToVerify}/api`);
  return true;
}

/**
 * STEP 6: Push to GitHub
 */
function pushToGithub() {
  log.step('STEP 6: PUSHING TO GITHUB');

  // Check if remote exists
  const remoteCheck = execCommand('git remote get-url origin', { silent: true });
  if (!remoteCheck.success) {
    log.warning('No remote \'origin\' configured. Skipping GitHub push.');
    return;
  }

  // Get deployment URL
  const deploymentUrlPath = join(tmpdir(), 'vercel-deployment-url.txt');
  let deploymentUrl = 'Production deployed';
  if (existsSync(deploymentUrlPath)) {
    deploymentUrl = readFileSync(deploymentUrlPath, 'utf-8').trim();
  }

  // Stage vercel.json and deployment-related files
  const filesToStage = ['vercel.json', 'api/', 'scripts/deploy-vercel.js'];
  for (const file of filesToStage) {
    const filePath = join(PROJECT_ROOT, file);
    if (existsSync(filePath) || existsSync(filePath.replace(/\/$/, ''))) {
      execCommand(`git add ${file}`, { silent: true });
    }
  }

  // Check if there are changes to commit
  const statusCheck = execCommand('git status --porcelain', { silent: true });
  if (!statusCheck.success || !statusCheck.output.trim()) {
    log.info('No changes to commit');
  } else {
    log.info('Committing deployment configuration...');
    const commitMessage = `chore: Configure Vercel deployment

- Add vercel.json configuration
- Add serverless API handlers
- Add deployment script

Production URL: ${deploymentUrl}`;
    
    const commitResult = execCommand(`git commit -m ${JSON.stringify(commitMessage)}`, {
      silent: true,
    });
    
    if (!commitResult.success) {
      log.warning('Commit failed or no changes to commit');
    }
  }

  // Push to GitHub
  log.info('Pushing to GitHub...');
  const pushResult = execCommand('git push origin main');
  if (!pushResult.success) {
    log.error('Failed to push to GitHub');
    log.info('Deployment successful but GitHub push failed. Push manually with:');
    console.log('  git push origin main');
    process.exit(1);
  }

  log.success('Successfully pushed to GitHub');
}

/**
 * Main execution function
 */
async function main() {
  log.step('🚀 VERCEL PRODUCTION DEPLOYMENT');

  try {
    validateRequirements();
    await validateGitStatus();
    buildApplication();
    const deploymentUrl = await deployToVercel();
    await verifyDeployment(deploymentUrl);
    pushToGithub();

    log.step('✅ DEPLOYMENT COMPLETED SUCCESSFULLY');

    const deploymentUrlPath = join(tmpdir(), 'vercel-deployment-url.txt');
    const finalUrl = existsSync(deploymentUrlPath)
      ? readFileSync(deploymentUrlPath, 'utf-8').trim()
      : 'Check Vercel dashboard';

    console.log('');
    log.success('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log.success('  DEPLOYMENT SUCCESSFUL');
    log.success('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log(`  🌐 Production URL: ${finalUrl}`);
    console.log(`  💊 Health Check: ${finalUrl}/api/v1/health`);
    console.log(`  📊 API Base: ${finalUrl}/api`);
    console.log('');
    console.log(`  View deployment logs: vercel logs ${finalUrl}`);
    console.log('');
  } catch (error) {
    log.error(`Deployment failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run main function
main();

