#!/usr/bin/env node

/**
 * Deployment Checklist Script
 * Final verification script before deploying to production
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 JYOTISH SHASTRA - DEPLOYMENT CHECKLIST');
console.log('=' .repeat(60));

const checklist = [
  {
    name: 'Backend server running on port 3001',
    check: async () => {
      try {
        execSync('lsof -i :3001', { stdio: 'pipe' });
        return true;
      } catch {
        return false;
      }
    }
  },
  {
    name: 'Frontend server running on port 3002',
    check: async () => {
      try {
        execSync('lsof -i :3002', { stdio: 'pipe' });
        return true;
      } catch {
        return false;
      }
    }
  },
  {
    name: 'Frontend production build exists',
    check: async () => {
      return fs.existsSync('client/build');
    }
  },
  {
    name: 'Backend API health endpoint working',
    check: async () => {
      try {
        const response = await fetch('http://localhost:3001/health');
        return response.status === 200;
      } catch {
        return false;
      }
    }
  },
  {
    name: 'Chart generation endpoint working',
    check: async () => {
      try {
        const response = await fetch('http://localhost:3001/api/v1/chart/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: "Test User",
            dateOfBirth: "1990-01-01",
            timeOfBirth: "12:00",
            placeOfBirth: "Mumbai, Maharashtra, India",
            latitude: 19.076,
            longitude: 72.8777,
            timezone: "Asia/Kolkata"
          })
        });
        const data = await response.json();
        return response.status === 200 && data.success;
      } catch {
        return false;
      }
    }
  },
  {
    name: 'Geocoding endpoint working',
    check: async () => {
      try {
        const response = await fetch('http://localhost:3001/api/v1/geocoding/location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ placeOfBirth: "New York, NY, USA" })
        });
        const data = await response.json();
        return response.status === 200 && data.success;
      } catch {
        return false;
      }
    }
  },
  {
    name: 'Render deployment config exists',
    check: async () => {
      return fs.existsSync('render.yaml');
    }
  },
  {
    name: 'Environment production example exists',
    check: async () => {
      return fs.existsSync('.env.production.example');
    }
  },
  {
    name: 'Dependencies installed',
    check: async () => {
      return fs.existsSync('node_modules');
    }
  },
  {
    name: 'Client dependencies installed',
    check: async () => {
      return fs.existsSync('client/node_modules');
    }
  },
  {
    name: 'No uncommitted changes (clean git status)',
    check: async () => {
      try {
        const result = execSync('git status --porcelain', { stdio: 'pipe' });
        return result.toString().trim() === '';
      } catch {
        return false;
      }
    }
  }
];

async function runChecklist() {
  let passed = 0;
  let failed = 0;

  for (const item of checklist) {
    try {
      const result = await item.check();
      if (result) {
        console.log(`✅ ${item.name}`);
        passed++;
      } else {
        console.log(`❌ ${item.name}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${item.name} (Error: ${error.message})`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`CHECKLIST RESULTS: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 ALL CHECKS PASSED - READY FOR DEPLOYMENT! 🎉');
    console.log('\n📋 DEPLOYMENT REMINDERS:');
    console.log('• Set GEOCODING_API_KEY in production environment');
    console.log('• Set FRONTEND_URL in production environment');
    console.log('• Configure CORS origins for your domain');
    console.log('• Test with your actual production URLs');
  } else {
    console.log('⚠️  SOME CHECKS FAILED - FIX BEFORE DEPLOYMENT');
  }
  console.log('='.repeat(60));

  return failed === 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runChecklist()
    .then(isReady => process.exit(isReady ? 0 : 1))
    .catch(error => {
      console.error('Checklist failed:', error);
      process.exit(1);
    });
}

export default runChecklist;
